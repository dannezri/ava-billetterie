/**
 * EventDetails Component
 * Détails événement (date, lieu, description)
 */

import { CalendarDays, Clock, MapPin, User, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { daysUntil } from '@/lib/utils';

interface IEventDetailsProps {
  event: {
    eventDate: Date;
    doorsOpenTime: string | null;
    venue: string;
    city: string;
    artist: string | null;
    description: string | null;
    officialUrl: string | null;
  };
}

export function EventDetails({ event }: IEventDetailsProps) {
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

  const daysLeft = daysUntil(event.eventDate);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Détails de l'événement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date */}
        <div>
          <div className="mb-2 flex items-start">
            <CalendarDays className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Date</p>
              <p className="capitalize text-slate-900">{formattedDate}</p>
              {daysLeft > 0 && (
                <p className="mt-1 text-xs text-slate-600">
                  Dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Heure */}
        <div>
          <div className="flex items-start">
            <Clock className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Horaires</p>
              {event.doorsOpenTime && (
                <p className="text-sm text-slate-900">
                  Ouverture des portes : {event.doorsOpenTime}
                </p>
              )}
              <p className="text-sm text-slate-900">Début du concert : {formattedTime}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Lieu */}
        <div>
          <div className="flex items-start">
            <MapPin className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Lieu</p>
              <p className="font-medium text-slate-900">{event.venue}</p>
              <p className="text-sm text-slate-600">{event.city}</p>
            </div>
          </div>
        </div>

        {event.artist && (
          <>
            <Separator />
            {/* Artiste */}
            <div>
              <div className="flex items-start">
                <User className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Artiste</p>
                  <p className="text-slate-900">{event.artist}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {event.description && (
          <>
            <Separator />
            {/* Description */}
            <div>
              <div className="flex items-start">
                <FileText className="mr-3 mt-0.5 h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Description</p>
                  <p className="mt-1 text-sm text-slate-700">{event.description}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {event.officialUrl && (
          <>
            <Separator />
            {/* Lien officiel */}
            <Button variant="outline" className="w-full" asChild>
              <a href={event.officialUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Billetterie officielle
              </a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
