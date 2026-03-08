import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, ArrowRight, Ticket } from 'lucide-react';

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

const PLACEHOLDER_COLORS = [
  { bg: 'bg-blue-50',    text: 'text-blue-300'    },
  { bg: 'bg-emerald-50', text: 'text-emerald-300'  },
  { bg: 'bg-amber-50',   text: 'text-amber-300'    },
  { bg: 'bg-rose-50',    text: 'text-rose-300'      },
  { bg: 'bg-purple-50',  text: 'text-purple-300'   },
  { bg: 'bg-cyan-50',    text: 'text-cyan-300'      },
];

function getPlaceholderColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const firstDate = artist.firstEventDate ? new Date(artist.firstEventDate) : null;
  const lastDate  = artist.lastEventDate  ? new Date(artist.lastEventDate)  : null;
  const colors = getPlaceholderColor(artist.artist);

  const dateLabel = firstDate
    ? lastDate && lastDate.getTime() !== firstDate.getTime()
      ? `${formatDate(firstDate)} – ${formatDate(lastDate)}`
      : formatDate(firstDate)
    : null;

  return (
    <Link href={`/events/artist/${encodeURIComponent(artist.artist)}`}>
      <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5">

        {/* Photo — aspect 16/9 */}
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.artist}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${colors.bg}`}>
              <span className={`text-5xl font-bold ${colors.text}`}>
                {artist.artist.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Badge catégorie */}
          {artist.category && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                {artist.category}
              </span>
            </div>
          )}

          {/* Badge multi-dates */}
          {artist.eventsCount > 1 && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-600 text-white">
                <Ticket className="h-3 w-3" />
                {artist.eventsCount} dates
              </span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate mb-2 text-base group-hover:text-blue-600 transition-colors">
            {artist.artist}
          </h3>

          <div className="space-y-1.5">
            {dateLabel && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span>{dateLabel}</span>
              </div>
            )}
            {artist.city && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span>{artist.city}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {artist.eventsCount} événement{artist.eventsCount > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Voir les billets
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
