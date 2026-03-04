/**
 * Page Catalogue Événements
 * Route: /events
 */

import { Suspense } from 'react';
import { EventsClient } from './events-client';
import { EventGrid } from '@/components/marketplace/EventGrid';

export const metadata = {
  title: 'Événements - Marketplace Billets Éthique',
  description: 'Découvrez tous les événements disponibles et achetez vos billets en toute sécurité',
};

export default function EventsPage() {
  return (
    <Suspense fallback={<EventGrid events={[]} isLoading />}>
      <EventsClient />
    </Suspense>
  );
}
