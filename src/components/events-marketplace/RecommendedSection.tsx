import { ArtistCard, ArtistCardData } from './ArtistCard';

interface RecommendedSectionProps {
  artists: ArtistCardData[];
}

export function RecommendedSection({ artists }: RecommendedSectionProps) {
  if (artists.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Recommandé pour vous</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.artist} artist={artist} />
        ))}
      </div>
    </section>
  );
}
