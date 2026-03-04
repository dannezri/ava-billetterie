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
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
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
            <div
              className={cn(
                'flex h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600',
                soldOut && 'from-slate-400 to-slate-600',
              )}
            >
              <Ticket className="h-16 w-16 text-white opacity-50" />
            </div>
          )}

          {/* Badge complet (prioritaire, en haut à droite) */}
          {soldOut ? (
            <div className="absolute right-2 top-2">
              <Badge className="bg-slate-700 hover:bg-slate-800">
                Complet
              </Badge>
            </div>
          ) : event.isVerified ? (
            <div className="absolute right-2 top-2">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Vérifié
              </Badge>
            </div>
          ) : null}

          {/* Badge catégorie (coin supérieur gauche) */}
          {event.category && (
            <div className="absolute left-2 top-2">
              <Badge variant="secondary" className="bg-slate-900/70 text-white backdrop-blur-sm">
                {event.category}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Nom événement + Artiste */}
          <div className="mb-3">
            <h3 className="mb-1 line-clamp-1 text-lg font-bold text-slate-900">
              {event.title}
            </h3>
            {event.artist && (
              <p className="line-clamp-1 text-sm text-slate-600">{event.artist}</p>
            )}
          </div>

          {/* Date */}
          <div className="mb-2 flex items-center text-sm text-slate-700">
            <CalendarDays className="mr-2 h-4 w-4 text-blue-600" />
            <span className="capitalize">
              {formattedDate} • {formattedTime}
            </span>
          </div>

          {/* Lieu */}
          <div className="mb-3 flex items-center text-sm text-slate-700">
            <MapPin className="mr-2 h-4 w-4 text-blue-600" />
            <span className="line-clamp-1">
              {event.venue} • {event.city}
            </span>
          </div>

          {/* Séparateur */}
          <div className="mb-3 border-t border-slate-200" />

          {/* Prix et disponibilité */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">{soldOut ? 'Disponibilité' : 'Prix'}</p>
              <p
                className={cn(
                  'text-lg font-bold',
                  soldOut ? 'text-slate-500' : 'text-blue-600',
                )}
              >
                {priceDisplay}
              </p>
            </div>

            {soldOut ? (
              <Badge
                variant="outline"
                className="border-slate-300 bg-slate-100 text-slate-600"
              >
                <Clock className="mr-1 h-3 w-3" />
                0 billet
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  'border-blue-200 bg-blue-50 text-blue-700',
                  event.ticketsAvailable < 5 && 'border-orange-200 bg-orange-50 text-orange-700',
                )}
              >
                <Ticket className="mr-1 h-3 w-3" />
                {event.ticketsAvailable} {event.ticketsAvailable === 1 ? 'billet' : 'billets'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
