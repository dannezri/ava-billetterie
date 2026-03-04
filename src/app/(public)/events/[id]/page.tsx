/**
 * Page Détail Événement
 * Route: /events/[id]
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EventHeader } from '@/components/events/EventHeader';
import { EventDetails } from '@/components/events/EventDetails';
import { TicketsList } from '@/components/events/TicketsList';
import { VenueMap } from '@/components/events/VenueMap';
import { PriceStats } from '@/components/events/PriceStats';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Fetch event data (Server Component)
 */
async function getEventData(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/events/${id}`, {
      cache: 'no-store', // Toujours récupérer les données fraîches
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

/**
 * Generate metadata dynamically
 */
export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const data = await getEventData(params.id);

  if (!data || !data.event) {
    return {
      title: 'Événement introuvable',
    };
  }

  const { event } = data;

  return {
    title: `${event.title} - ${event.artist || 'Concert'}`,
    description: event.description || `Achetez vos billets pour ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description || undefined,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const data = await getEventData(params.id);

  if (!data || !data.event) {
    notFound();
  }

  const { event, tickets, stats } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <EventHeader event={event} />

      {/* Navigation breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux événements
            </Link>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar gauche (30%) */}
          <aside className="w-full space-y-6 lg:w-80 lg:shrink-0">
            <EventDetails event={event} />
            <VenueMap venue={event.venue} city={event.city} address={event.venueAddress} />
            <PriceStats stats={stats} />
          </aside>

          {/* Contenu principal (70%) */}
          <main className="flex-1">
            <TicketsList tickets={tickets} eventId={event.id} isLoading={false} />
          </main>
        </div>
      </div>
    </div>
  );
}
