'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DuplicateEvent {
  id: string;
  title: string;
  artist: string | null;
  venue: string;
  city: string;
  eventDate: string;
  isVerified: boolean;
}

interface DuplicateAlertProps {
  event: DuplicateEvent;
}

export function DuplicateAlert({ event }: DuplicateAlertProps) {
  const date = new Date(event.eventDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Doublon potentiel détecté</AlertTitle>
      <AlertDescription className="text-orange-700">
        Un événement similaire existe déjà :{' '}
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="font-semibold underline hover:text-orange-900"
        >
          {event.title}
        </Link>{' '}
        — {event.venue}, {event.city} le {date}
        {!event.isVerified && (
          <span className="ml-2 rounded-full bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-800">
            Non vérifié
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
