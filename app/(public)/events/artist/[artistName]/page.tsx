/**
 * Page Artiste — liste de toutes les dates disponibles pour un artiste
 * Route: /events/artist/[artistName]
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ArtistPageProps {
  params: Promise<{ artistName: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { artistName } = await params;
  const name = decodeURIComponent(artistName);
  return {
    title: `${name} — Billets disponibles`,
    description: `Achetez vos billets pour les concerts de ${name}. Toutes les dates disponibles.`,
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { artistName } = await params;
  const name = decodeURIComponent(artistName);

  // Tous les événements futurs de cet artiste
  const events = await prisma.event.findMany({
    where: {
      artist: name,
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: 'asc' },
    include: {
      tickets: {
        where: { status: 'ACTIVE' },
        select: { id: true, price: true },
      },
    },
  });

  if (events.length === 0) {
    notFound();
  }

  const firstEvent = events[0];
  const minPrice = events.reduce((min, ev) => {
    const prices = ev.tickets.map((t) => Number(t.price));
    const evMin = prices.length > 0 ? Math.min(...prices) : null;
    return evMin !== null && (min === null || evMin < min) ? evMin : min;
  }, null as number | null);

  const totalTickets = events.reduce((sum, ev) => sum + ev.tickets.length, 0);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero artiste */}
      <section className="relative h-80 w-full overflow-hidden md:h-96">
        {firstEvent.imageUrl ? (
          <Image
            src={firstEvent.imageUrl}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Bouton retour */}
        <div className="absolute left-4 top-4 z-10">
          <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20">
            <Link href="/events">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        {/* Infos artiste */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">{name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {events.length} date{events.length > 1 ? 's' : ''} disponible{events.length > 1 ? 's' : ''}
              </span>
              {totalTickets > 0 && (
                <span className="flex items-center gap-1.5">
                  <Ticket className="h-4 w-4" />
                  {totalTickets} billet{totalTickets > 1 ? 's' : ''} en vente
                </span>
              )}
              {minPrice !== null && (
                <Badge className="bg-emerald-600 text-white">
                  À partir de {minPrice}€
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Liste des dates */}
      <div className="container mx-auto px-4 py-10">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Choisissez une date</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const eventDate = new Date(event.eventDate);
            const ticketCount = event.tickets.length;
            const eventPrices = event.tickets.map((t) => Number(t.price));
            const eventMinPrice = eventPrices.length > 0 ? Math.min(...eventPrices) : null;
            const isSoldOut = ticketCount === 0;

            return (
              <Card
                key={event.id}
                className={`group overflow-hidden transition-shadow hover:shadow-lg ${isSoldOut ? 'opacity-60' : ''}`}
              >
                <div className="p-6">
                  {/* Date + titre */}
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                        {eventDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {eventDate.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {event.doorsOpenTime && (
                        <p className="mt-0.5 text-sm text-slate-500">
                          Ouverture des portes : {event.doorsOpenTime}
                        </p>
                      )}
                    </div>
                    {isSoldOut ? (
                      <Badge variant="secondary">Complet</Badge>
                    ) : ticketCount < 5 ? (
                      <Badge className="bg-orange-500 text-white">
                        Plus que {ticketCount} !
                      </Badge>
                    ) : null}
                  </div>

                  {/* Lieu */}
                  <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span>
                      {event.venue}
                      {event.city ? `, ${event.city}` : ''}
                    </span>
                  </div>

                  {/* Titre événement */}
                  {event.title && event.title !== name && (
                    <p className="mb-4 text-sm text-slate-500">{event.title}</p>
                  )}

                  {/* Footer : prix + CTA */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      {eventMinPrice !== null ? (
                        <>
                          <p className="text-xs text-slate-500">À partir de</p>
                          <p className="text-lg font-bold text-slate-900">{eventMinPrice}€</p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">Prix non disponible</p>
                      )}
                    </div>
                    <Button
                      asChild
                      disabled={isSoldOut}
                      className={isSoldOut ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                    >
                      <Link href={`/events/${event.id}`}>
                        {isSoldOut ? 'Complet' : 'Voir les billets'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
