/**
 * Page Détail Événement
 * Route: /events/[id]
 * Supporte ?quantity=N&together=true pour filtrage billets
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventHeader } from '@/components/events/EventHeader';
import { EventDetails } from '@/components/events/EventDetails';
import { TicketsList } from '@/components/events/TicketsList';
import { VenueMap } from '@/components/events/VenueMap';
import { PriceStats } from '@/components/events/PriceStats';
import { TicketSelectionModalTrigger } from '@/components/events/TicketSelectionModalTrigger';

interface EventDetailPageProps {
  params: { id: string };
  searchParams: { quantity?: string; together?: string };
}

/**
 * Fetch event data (Server Component)
 */
async function getEventData(
  id: string,
  filterParams: { quantity: number; together: boolean }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = new URL(`${baseUrl}/api/events/${id}`);
    url.searchParams.set('quantity', String(filterParams.quantity));
    if (filterParams.together) {
      url.searchParams.set('together', 'true');
    }
    const response = await fetch(url.toString(), { cache: 'no-store' });

    if (!response.ok) return null;
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
  const data = await getEventData(params.id, { quantity: 0, together: false });

  if (!data?.event) {
    return { title: 'Événement introuvable' };
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

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  // Parse searchParams
  const quantity = parseInt(searchParams.quantity || '0') || 0;
  const together = searchParams.together === 'true';
  const hasFilter = quantity > 0;

  const data = await getEventData(params.id, { quantity, together });

  if (!data?.event) {
    notFound();
  }

  const { event, tickets, groups, stats } = data;

  // Badge texte décrivant le filtre actif
  const filterBadgeLabel = hasFilter
    ? `${quantity} billet${quantity > 1 ? 's' : ''}${together ? ' côte à côte' : ''}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modal sélection : ouverture auto si pas de filtre */}
      <TicketSelectionModalTrigger
        eventId={event.id}
        eventName={event.title}
        shouldOpenAuto={!hasFilter}
        initialQuantity={quantity || 1}
        initialTogether={together}
      />

      {/* Hero Header */}
      <EventHeader event={event} />

      {/* Barre de navigation + filtre actif */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {/* Badge filtre actif */}
            {filterBadgeLabel && (
              <Badge
                variant="secondary"
                className="gap-1.5 bg-blue-50 px-3 py-1 text-blue-700 text-sm"
              >
                🎫 {filterBadgeLabel}
              </Badge>
            )}

            {/* Bouton modifier / ouvrir modal */}
            <TicketSelectionModalTrigger
              eventId={event.id}
              eventName={event.title}
              initialQuantity={quantity || 1}
              initialTogether={together}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasFilter ? 'Modifier ma recherche' : 'Filtrer les billets'}
                </Button>
              }
            />
          </div>
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
            <TicketsList
              tickets={tickets ?? []}
              groups={groups ?? []}
              eventId={event.id}
              eventTitle={event.title}
              eventDate={event.eventDate}
              isLoading={false}
              filterQuantity={quantity}
              filterTogether={together}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
