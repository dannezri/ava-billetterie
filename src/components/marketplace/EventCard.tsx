/**
 * EventCard Component
 * Carte événement pour le catalogue marketplace
 */

import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, CheckCircle2, Ticket, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface IEventCardProps {
  event: {
    id: string;
    title: string;
    artist: string | null;
    category: string | null;
    venue: string;
    city: string;
    eventDate: Date;
    imageUrl: string | null;
    ticketsAvailable: number;
    isSoldOut?: boolean;
    minPrice: number | null;
    maxPrice: number | null;
    isVerified: boolean;
  };
}

export function EventCard({ event }: IEventCardProps) {
  const soldOut = event.isSoldOut ?? event.ticketsAvailable === 0;

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const priceDisplay = soldOut
    ? 'Liste d\'attente bientôt'
    : event.minPrice && event.maxPrice
    ? event.minPrice === event.maxPrice
      ? `${event.minPrice}€`
      : `${event.minPrice}€ - ${event.maxPrice}€`
    : event.minPrice
    ? `À partir de ${event.minPrice}€`
    : 'Prix non disponible';

  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className={cn(
          'group overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
          soldOut && 'opacity-80',
        )}
      >
        {/* Image événement */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className={cn(
                'object-cover transition-transform duration-200 group-hover:scale-105',
                soldOut && 'grayscale-[30%]',
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <Ticket className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {/* Badge complet */}
          {soldOut ? (
            <div className="absolute right-2 top-2">
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-800 text-white">
                Complet
              </span>
            </div>
          ) : event.isVerified ? (
            <div className="absolute right-2 top-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white">
                <CheckCircle2 className="h-3 w-3" />
                Vérifié
              </span>
            </div>
          ) : null}

          {/* Badge catégorie */}
          {event.category && (
            <div className="absolute left-2 top-2">
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                {event.category}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Nom événement + Artiste */}
          <div className="mb-3">
            <h3 className="mb-1 line-clamp-1 text-base font-semibold text-gray-900">
              {event.title}
            </h3>
            {event.artist && (
              <p className="line-clamp-1 text-sm text-gray-500">{event.artist}</p>
            )}
          </div>

          {/* Date */}
          <div className="mb-2 flex items-center text-sm text-gray-600">
            <CalendarDays className="mr-2 h-3.5 w-3.5 text-gray-400" />
            <span className="capitalize">
              {formattedDate} · {formattedTime}
            </span>
          </div>

          {/* Lieu */}
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <MapPin className="mr-2 h-3.5 w-3.5 text-gray-400" />
            <span className="line-clamp-1">
              {event.venue} · {event.city}
            </span>
          </div>

          {/* Séparateur */}
          <div className="mb-3 border-t border-gray-100" />

          {/* Prix et disponibilité */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{soldOut ? 'Disponibilité' : 'À partir de'}</p>
              <p className={cn('text-lg font-bold', soldOut ? 'text-gray-400' : 'text-gray-900')}>
                {priceDisplay}
              </p>
            </div>

            {soldOut ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                <Clock className="h-3 w-3" />
                0 billet
              </span>
            ) : (
              <span className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium',
                event.ticketsAvailable < 5
                  ? 'bg-orange-50 text-orange-700'
                  : 'bg-emerald-50 text-emerald-700',
              )}>
                <Ticket className="h-3 w-3" />
                {event.ticketsAvailable} {event.ticketsAvailable === 1 ? 'billet' : 'billets'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
