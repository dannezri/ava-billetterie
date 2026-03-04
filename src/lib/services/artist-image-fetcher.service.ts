/**
 * Service de récupération automatique d'images artistes depuis APIs externes.
 * Ordre de priorité : Spotify → Last.fm → Google Custom Search
 * Upload final vers Uploadcare (CDN du projet).
 */

interface ImageResult {
  url: string;
  source: 'spotify' | 'lastfm' | 'google';
  width?: number;
  height?: number;
}

export class ArtistImageFetcherService {
  /**
   * Recherche une image officielle pour un artiste, avec fallbacks multiples.
   * Ne lève jamais d'exception — retourne null si toutes les sources échouent.
   */
  static async fetchArtistImage(artistName: string): Promise<ImageResult | null> {
    console.log(`[ArtistImageFetcher] Recherche image pour: "${artistName}"`);

    const sources: Array<() => Promise<ImageResult | null>> = [
      () => this.fetchFromSpotify(artistName),
      () => this.fetchFromLastfm(artistName),
      () => this.fetchFromGoogle(artistName),
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result) {
          console.log(`[ArtistImageFetcher] Image trouvée via ${result.source}`);
          return result;
        }
      } catch (err) {
        // Continuer vers le fallback suivant
        console.warn(`[ArtistImageFetcher] Source failed:`, err);
      }
    }

    console.warn(`[ArtistImageFetcher] Aucune image trouvée pour "${artistName}"`);
    return null;
  }

  // ─── Spotify ──────────────────────────────────────────────────────────────

  private static async fetchFromSpotify(artistName: string): Promise<ImageResult | null> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('[ArtistImageFetcher] Spotify credentials manquantes');
      return null;
    }

    // 1. Obtenir un access token via Client Credentials Flow
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: 'grant_type=client_credentials',
      next: { revalidate: 0 },
    });

    if (!tokenRes.ok) {
      throw new Error(`Spotify auth failed: ${tokenRes.status}`);
    }

    const { access_token } = await tokenRes.json();

    // 2. Rechercher l'artiste
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!searchRes.ok) {
      throw new Error(`Spotify search failed: ${searchRes.status}`);
    }

    const data = await searchRes.json();
    const artist = data.artists?.items?.[0];

    if (!artist?.images?.length) return null;

    // Prendre l'image la plus grande (premier élément = plus haute résolution)
    const image = artist.images[0];

    return {
      url: image.url,
      source: 'spotify',
      width: image.width,
      height: image.height,
    };
  }

  // ─── Last.fm ──────────────────────────────────────────────────────────────

  private static async fetchFromLastfm(artistName: string): Promise<ImageResult | null> {
    const apiKey = process.env.LASTFM_API_KEY;

    if (!apiKey) {
      console.warn('[ArtistImageFetcher] Last.fm API key manquante');
      return null;
    }

    const url =
      `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo` +
      `&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Last.fm request failed: ${res.status}`);

    const data = await res.json();
    const images: Array<{ '#text': string; size: string }> = data.artist?.image ?? [];

    // Préférer extralarge puis large
    const picked =
      images.find((img) => img.size === 'extralarge') ||
      images.find((img) => img.size === 'large');

    if (!picked?.['#text']) return null;

    // Last.fm retourne parfois une image vide
    if (picked['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')) return null;

    return { url: picked['#text'], source: 'lastfm' };
  }

  // ─── Google Custom Search ────────────────────────────────────────────────

  private static async fetchFromGoogle(artistName: string): Promise<ImageResult | null> {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;

    if (!apiKey || !cx) {
      console.warn('[ArtistImageFetcher] Google Custom Search credentials manquantes');
      return null;
    }

    const query = `${artistName} artiste officiel photo`;
    const url =
      `https://www.googleapis.com/customsearch/v1` +
      `?q=${encodeURIComponent(query)}&cx=${cx}&searchType=image&imgSize=large&num=1&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Custom Search failed: ${res.status}`);

    const data = await res.json();
    const item = data.items?.[0];

    if (!item?.link) return null;

    return {
      url: item.link,
      source: 'google',
      width: item.image?.width,
      height: item.image?.height,
    };
  }

  // ─── Upload vers Uploadcare ────────────────────────────────────────────────

  /**
   * Télécharge une image depuis une URL externe et l'uploade vers Uploadcare.
   * Retourne l'URL CDN permanente.
   */
  static async uploadToUploadcare(imageUrl: string, artistName: string): Promise<string> {
    const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
    const secretKey = process.env.UPLOADCARE_SECRET_KEY;

    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY manquante');
    }

    // 1. Télécharger l'image depuis la source externe
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error(`Image download failed: ${imageRes.status}`);

    const buffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    const filename = `${this.sanitizeName(artistName)}.${ext}`;

    // 2. Upload vers Uploadcare via multipart (synchrone, pas de polling)
    const formData = new FormData();
    formData.append('UPLOADCARE_PUB_KEY', publicKey);
    formData.append('UPLOADCARE_STORE', '1');
    formData.append('filename', filename);
    formData.append('file', new Blob([buffer], { type: contentType }), filename);

    const uploadRes = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Uploadcare upload failed: ${uploadRes.status} — ${errText}`);
    }

    const { file: uuid } = await uploadRes.json();

    if (!uuid) throw new Error('Uploadcare ne retourne pas d\'UUID');

    // 3. Récupérer l'URL CDN réelle du projet (peut être un domaine custom)
    if (secretKey) {
      try {
        const infoRes = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
          headers: {
            Authorization: `Uploadcare.Simple ${publicKey}:${secretKey}`,
            Accept: 'application/vnd.uploadcare-v0.7+json',
          },
        });

        if (infoRes.ok) {
          const info = await infoRes.json();
          if (info.original_file_url) return info.original_file_url;
        }
      } catch {
        // Fallback sur l'URL standard si l'info échoue
      }
    }

    return `https://ucarecdn.com/${uuid}/`;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private static sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  }
}
