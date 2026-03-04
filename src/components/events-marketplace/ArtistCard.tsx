import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ArtistCardData {
  artist: string;
  eventsCount: number;
  firstEventDate: Date | null;
  lastEventDate: Date | null;
  imageUrl: string | null;
  city: string | null;
  category: string | null;
}

interface ArtistCardProps {
  artist: ArtistCardData;
  variant?: 'compact' | 'full';
}

const PLACEHOLDER_GRADIENTS = [
  'from-violet-700 to-purple-900',
  'from-rose-700 to-pink-900',
  'from-emerald-700 to-teal-900',
  'from-amber-700 to-orange-900',
  'from-blue-700 to-indigo-900',
  'from-cyan-700 to-blue-900',
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_GRADIENTS[Math.abs(hash) % PLACEHOLDER_GRADIENTS.length];
}

function formatDateRange(first: Date | null, last: Date | null): string {
  if (!first) return '';
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  if (!last || first.getTime() === last.getTime()) return fmt(first);
  return `${fmt(first)} – ${fmt(last)}`;
}

export function ArtistCard({ artist, variant = 'full' }: ArtistCardProps) {
  const dateRange = formatDateRange(
    artist.firstEventDate ? new Date(artist.firstEventDate) : null,
    artist.lastEventDate ? new Date(artist.lastEventDate) : null,
  );

  return (
    <Link href={`/events/artist/${encodeURIComponent(artist.artist)}`}>
      <Card className="group cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image */}
        <div className={`relative overflow-hidden ${variant === 'compact' ? 'aspect-square' : 'aspect-[3/4]'}`}>
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.artist}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradient(artist.artist)}`}
            >
              <span className="text-4xl font-bold text-white/40">
                {artist.artist.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Badge favoris */}
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
            <span>2.9k</span>
          </div>

          {/* Badge multi-dates */}
          {artist.eventsCount > 1 && (
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-emerald-600 text-white text-xs shadow">
                {artist.eventsCount} dates
              </Badge>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-3">
          <h3 className="truncate font-bold text-slate-900">{artist.artist}</h3>
          {dateRange && (
            <p className="mt-0.5 text-xs text-slate-500">{dateRange}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {artist.eventsCount} événement{artist.eventsCount > 1 ? 's' : ''} près de chez vous
          </p>
        </div>
      </Card>
    </Link>
  );
}
