/**
 * EventHeader Component
 * Hero section pour page détail événement
 */

import Image from 'next/image';
import { CalendarDays, MapPin, Share2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate, daysUntil } from '@/lib/utils';

interface IEventHeaderProps {
  event: {
    title: string;
    artist: string | null;
    category: string | null;
    eventDate: Date;
    venue: string;
    city: string;
    imageUrl: string | null;
    isVerified: boolean;
  };
}

export function EventHeader({ event }: IEventHeaderProps) {
  const daysLeft = daysUntil(event.eventDate);
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative h-[400px] w-full overflow-hidden bg-slate-900">
      {/* Image de fond avec overlay */}
      {event.imageUrl && (
        <>
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        </>
      )}

      {/* Contenu */}
      <div className="relative flex h-full items-end">
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {event.category && (
                <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-sm">
                  {event.category}
                </Badge>
              )}
              {event.isVerified && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Vérifié
                </Badge>
              )}
              {daysLeft > 0 && daysLeft <= 7 && (
                <Badge variant="destructive" className="animate-pulse">
                  J-{daysLeft}
                </Badge>
              )}
            </div>

            {/* Titre */}
            <h1 className="mb-2 text-4xl font-bold text-white lg:text-5xl">
              {event.title}
            </h1>

            {/* Artiste */}
            {event.artist && (
              <p className="mb-4 text-xl text-slate-300">{event.artist}</p>
            )}

            {/* Infos date et lieu */}
            <div className="mb-6 flex flex-col gap-2 text-slate-200 sm:flex-row sm:gap-6">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                <span className="capitalize">
                  {formattedDate} à {formattedTime}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                <span>
                  {event.venue} • {event.city}
                </span>
              </div>
            </div>

            {/* Bouton partager */}
            <Button variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
