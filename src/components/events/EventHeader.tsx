/**
 * EventHeader Component
 * Hero section pour page détail événement — Clean Tech
 */

import Image from 'next/image';
import { CalendarDays, MapPin, Share2, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { daysUntil } from '@/lib/utils';

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
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'Europe/Paris',
  });
  const isPlaceholderTime = ['00:00', '01:00', '02:00', '03:00'].includes(formattedTime);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Image */}
          <div className="relative w-full lg:w-72 lg:flex-shrink-0 h-56 lg:h-48 bg-gray-100 rounded-xl overflow-hidden">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 288px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <CalendarDays className="w-12 h-12 text-gray-300" />
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {event.category && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {event.category}
                </span>
              )}
              {event.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle2 className="h-3 w-3" />
                  Vérifié
                </span>
              )}
              {daysLeft > 0 && daysLeft <= 7 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100 animate-pulse">
                  <Clock className="h-3 w-3" />
                  J-{daysLeft}
                </span>
              )}
            </div>

            {/* Titre */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {event.title}
            </h1>

            {/* Artiste */}
            {event.artist && event.artist !== event.title && (
              <p className="text-base text-gray-500 mb-4">{event.artist}</p>
            )}

            {/* Date & lieu */}
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="capitalize font-medium">
                  {formattedDate}{!isPlaceholderTime && ` à ${formattedTime}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="font-medium">{event.venue} · {event.city}</span>
              </div>
            </div>

            {/* Action */}
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300">
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
