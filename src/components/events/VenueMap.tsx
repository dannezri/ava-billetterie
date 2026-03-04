/**
 * VenueMap Component
 * Carte Google Maps pour le lieu de l'événement
 */

'use client';

import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface IVenueMapProps {
  venue: string;
  city: string;
  address?: string;
}

export function VenueMap({ venue, city, address }: IVenueMapProps) {
  // Construction de l'URL Google Maps
  const mapQuery = encodeURIComponent(`${venue}, ${city}`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  // Iframe Google Maps embed (nécessite API key en production)
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MapPin className="mr-2 h-5 w-5 text-blue-600" />
          Localisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Adresse */}
        <div>
          <p className="font-medium text-slate-900">{venue}</p>
          {address && <p className="text-sm text-slate-600">{address}</p>}
          <p className="text-sm text-slate-600">{city}</p>
        </div>

        {/* Carte placeholder (à remplacer par vrai embed Google Maps) */}
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-slate-100">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-400" />
              <p className="text-xs text-slate-500">
                Carte interactive (nécessite Google Maps API)
              </p>
            </div>
          </div>
          {/* TODO: Intégrer vraie carte Google Maps avec API key */}
          {/* <iframe
            src={embedUrl}
            className="h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          /> */}
        </div>

        {/* Boutons actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="mr-2 h-4 w-4" />
              Voir sur Maps
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-4 w-4" />
              Itinéraire
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
