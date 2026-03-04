/**
 * Service d'intégration API Ticketmaster Discovery
 * Récupère les événements musicaux en France classés par prestige de salle
 */

export interface ITicketmasterEvent {
  ticketmaster_id: string;
  title: string;
  artist: string;
  category: string;
  event_date: string;
  doors_open_time?: string;
  venue: string;
  city: string;
  country: string;
  image_url?: string;
  official_url: string;
}

interface IFetchEventsParams {
  country: string;
  size: number;
  classification: string;
}

// Score de prestige des salles françaises (proxy de capacité/notoriété)
// Les grands concerts se jouent dans des salles identifiables par leur nom.
const VENUE_PRESTIGE: Array<[string, number]> = [
  ['stade de france', 100],
  ['la défense arena', 95],
  ['defense arena', 95],
  ['u arena', 95],
  ['accor arena', 90],
  ['accorhotels arena', 90],
  ['groupama stadium', 88],
  ['vélodrome', 85],
  ['velodrome', 85],
  ['allianz riviera', 80],
  ['stade pierre-mauroy', 78],
  ['orange vélodrome', 85],
  ['park & suites arena', 70],
  ['halle tony garnier', 68],
  ['zénith de paris', 65],
  ['zenith de paris', 65],
  ['zénith arena', 62],
  ['zenith arena', 62],
  ['zénith', 55],
  ['zenith', 55],
  ['olympia', 50],
  ['l\'olympia', 50],
  ['grand rex', 45],
  ['palais des sports', 45],
  ['le palais des sports', 45],
  ['palais omnisports', 45],
  ['grande halle', 40],
  ['arena', 35],
  ['stade', 30],
  ['palais', 15],
];

export class TicketmasterService {
  private static readonly API_URL = 'https://app.ticketmaster.com/discovery/v2';
  private static readonly BATCH_SIZE = 200;

  private static get API_KEY(): string {
    const key = process.env.TICKETMASTER_API_KEY;
    if (!key) throw new Error('TICKETMASTER_API_KEY manquante dans .env');
    return key;
  }

  /**
   * Score de prestige d'une salle (0 = salle inconnue/petite, 100 = Stade de France)
   */
  private static getVenueScore(venueName: string): number {
    const name = venueName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [keyword, score] of VENUE_PRESTIGE) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (name.includes(normalizedKeyword)) return score;
    }
    return 0;
  }

  /**
   * Fetche une tranche temporelle d'événements depuis l'API Ticketmaster
   */
  private static async fetchBatch(
    params: IFetchEventsParams,
    startDate: Date,
    endDate: Date,
    batchLabel: string
  ): Promise<any[]> {
    const url = new URL(`${this.API_URL}/events.json`);
    url.searchParams.set('apikey', this.API_KEY);
    url.searchParams.set('countryCode', params.country);
    url.searchParams.set('segmentName', params.classification);
    url.searchParams.set('size', this.BATCH_SIZE.toString());
    url.searchParams.set('sort', 'date,asc');
    url.searchParams.set('locale', 'fr-fr,en-us');
    url.searchParams.set('startDateTime', `${startDate.toISOString().split('T')[0]}T00:00:00Z`);
    url.searchParams.set('endDateTime', `${endDate.toISOString().split('T')[0]}T23:59:59Z`);

    console.log(`[TicketmasterService] Fetching batch ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`);

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      console.warn(`[TicketmasterService] Batch ${batchLabel} failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data._embedded?.events ?? [];
  }

  /**
   * Mappe un événement brut Ticketmaster vers ITicketmasterEvent
   */
  private static mapEvent(tmEvent: any): ITicketmasterEvent | null {
    const venue = tmEvent._embedded?.venues?.[0];
    const attraction = tmEvent._embedded?.attractions?.[0];
    const classification = tmEvent.classifications?.[0];

    if (!tmEvent.dates?.start?.localDate || !venue) return null;

    const images: Array<{ url: string; width: number; height: number }> = tmEvent.images ?? [];
    const bestImage =
      images.find((img) => img.width >= 1024) ||
      [...images].sort((a, b) => b.width - a.width)[0];

    return {
      ticketmaster_id: tmEvent.id,
      title: tmEvent.name,
      artist: attraction?.name || tmEvent.name,
      category: classification?.genre?.name || classification?.segment?.name || 'Musique',
      event_date: tmEvent.dates.start.localDate,
      doors_open_time: tmEvent.dates.start.localTime ?? undefined,
      venue: venue.name || '',
      city: venue.city?.name || '',
      country: 'France',
      image_url: bestImage?.url,
      official_url: tmEvent.url,
    };
  }

  /**
   * Récupère les plus gros événements musicaux à venir en France.
   *
   * Stratégie :
   *  1. Fetch 2 tranches temporelles en parallèle (today→+4 mois, +4→+12 mois)
   *     → Couvre une année complète (les grands concerts d'été sont planifiés des mois à l'avance)
   *  2. Score chaque événement par prestige de salle (proxy de capacité)
   *  3. Retourne les `params.size` meilleurs scores
   */
  static async fetchTopEvents(params: IFetchEventsParams): Promise<ITicketmasterEvent[]> {
    const today = new Date();
    const in4Months = new Date(today);
    in4Months.setMonth(in4Months.getMonth() + 4);
    const in8Months = new Date(today);
    in8Months.setMonth(in8Months.getMonth() + 8);
    const in18Months = new Date(today);
    in18Months.setMonth(in18Months.getMonth() + 18);

    // Fetch 3 tranches en parallèle pour couvrir 18 mois.
    // Les grands concerts (stades, arenas) sont planifiés jusqu'à 18 mois à l'avance.
    // 3 requêtes parallèles = latence quasi-identique à une seule requête.
    const [rawA, rawB, rawC] = await Promise.all([
      this.fetchBatch(params, today, in4Months, 'A:0-4mo'),
      this.fetchBatch(params, in4Months, in8Months, 'B:4-8mo'),
      this.fetchBatch(params, in8Months, in18Months, 'C:8-18mo'),
    ]);

    console.log(`[TicketmasterService] Batches: A=${rawA.length}, B=${rawB.length}, C=${rawC.length}`);

    // Merger + dédupliquer par ID Ticketmaster
    const seen = new Set<string>();
    const allRaw = [...rawA, ...rawB, ...rawC].filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    // Mapper + scorer par prestige de salle
    const scored = allRaw
      .map((tmEvent) => {
        const mapped = this.mapEvent(tmEvent);
        if (!mapped) return null;
        return { event: mapped, score: this.getVenueScore(mapped.venue) };
      })
      .filter((x): x is { event: ITicketmasterEvent; score: number } => x !== null);

    // Trier par score décroissant (plus grande salle en premier)
    scored.sort((a, b) => b.score - a.score);

    const result = scored.slice(0, params.size).map((s) => s.event);

    console.log(`[TicketmasterService] ${result.length} events returned, top venue: ${result[0]?.venue}`);
    return result;
  }
}
