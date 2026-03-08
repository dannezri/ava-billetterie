/**
 * Page Prévisualisation Billet
 * Route: /events/[id]/tickets/[ticketId]
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TicketPreview } from '@/components/tickets/TicketPreview';
import { PurchaseCard } from '@/components/tickets/PurchaseCard';

interface TicketPreviewPageProps {
  params: {
    id: string;
    ticketId: string;
  };
}

/**
 * Fetch ticket data (Server Component)
 */
async function getTicketData(ticketId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
}

/**
 * Generate metadata dynamically
 */
export async function generateMetadata({
  params,
}: TicketPreviewPageProps): Promise<Metadata> {
  const data = await getTicketData(params.ticketId);

  if (!data || !data.ticket || !data.event) {
    return {
      title: 'Billet introuvable',
    };
  }

  const { ticket, event } = data;

  return {
    title: `Billet ${event.title} - ${ticket.price}€`,
    description: `Achetez ce billet pour ${event.title} au prix de ${ticket.price}€`,
  };
}

export default async function TicketPreviewPage({ params }: TicketPreviewPageProps) {
  const data = await getTicketData(params.ticketId);

  if (!data || !data.ticket || !data.event) {
    notFound();
  }

  const { ticket, event } = data;

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/events"
              className="text-gray-600 hover:text-gray-900"
            >
              Événements
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/events/${event.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              {event.title}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Ce billet</span>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'événement
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne gauche (60%) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Rappel événement (mini card) */}
            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="p-4">
                <h2 className="mb-2 text-xl font-bold text-gray-900">{event.title}</h2>
                {event.artist && (
                  <p className="mb-2 text-gray-600">{event.artist}</p>
                )}
                <div className="flex flex-col gap-2 text-sm text-gray-700 sm:flex-row sm:gap-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="capitalize">{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                    <span>
                      {event.venue} • {event.city}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prévisualisation billet */}
            <TicketPreview ticket={ticket} />

          </div>

          {/* Colonne droite (40%) */}
          <div className="space-y-6">
            {/* Card achat (sticky) */}
            <PurchaseCard
              ticket={{
                id: ticket.id,
                eventId: event.id,
                price: ticket.price,
                status: ticket.status,
                section: ticket.section ?? null,
                seatNumber: ticket.seatNumber ?? null,
              }}
              event={{
                id: event.id,
                title: event.title,
                eventDate: event.eventDate,
              }}
              platformFee={Math.round(ticket.price * 0.05 * 100) / 100}
              ticketsAvailable={1}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
