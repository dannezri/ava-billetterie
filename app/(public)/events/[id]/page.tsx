// app/(public)/events/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketCard, PurchaseModal } from '@/components/tickets';
import { FilterSidebar, TicketFilters } from '@/components/events';
import {
  Calendar,
  MapPin,
  TicketIcon,
  Clock,
  ArrowLeft,
  AlertCircle,
  Globe,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  artist?: string;
  description: string | null;
  imageUrl: string | null;
  eventDate: Date;
  venue: string;
  city: string;
  country: string;
  category: string | null;
  availableTickets: number;
  minPrice: number | null;
  maxPrice: number | null;
}

interface Ticket {
  id: string;
  price: number;
  originalPrice?: number;
  section?: string;
  row?: string;
  seatNumber?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  seller: {
    id: string;
    name?: string;
    email: string;
    trustScore: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({
    minPrice: 0,
    maxPrice: 500,
    categories: [],
    sortBy: 'price_asc',
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    async function fetchEventAndTickets() {
      setLoading(true);
      setError(null);
      try {
        // Fetch event details
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();

        if (!eventsRes.ok) {
          throw new Error(eventsData.error?.message || 'Failed to fetch event');
        }

        const foundEvent = eventsData.data.events.find((e: any) => e.id === eventId);

        if (!foundEvent) {
          throw new Error('Événement non trouvé');
        }

        setEvent({
          ...foundEvent,
          eventDate: new Date(foundEvent.date),
        });

        // Fetch tickets for this event
        const ticketsResponse = await fetch(`/api/events/${eventId}/tickets`);
        const ticketsData = await ticketsResponse.json();

        if (ticketsResponse.ok && ticketsData.success) {
          setTickets(ticketsData.data);
          setFilteredTickets(ticketsData.data);

          // Set initial price range based on tickets
          if (ticketsData.data.length > 0) {
            const prices = ticketsData.data.map((t: Ticket) => t.price);
            setFilters(prev => ({
              ...prev,
              minPrice: Math.min(...prices),
              maxPrice: Math.max(...prices),
            }));
          }
        } else {
          setTickets([]);
          setFilteredTickets([]);
        }

      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEventAndTickets();
    }
  }, [eventId]);

  // Apply filters to tickets
  useEffect(() => {
    let result = [...tickets];

    // Filter by price range
    result = result.filter(
      (t) => t.price >= filters.minPrice && t.price <= filters.maxPrice
    );

    // Filter by category (section)
    if (filters.categories.length > 0) {
      result = result.filter((t) =>
        t.section ? filters.categories.includes(t.section) : false
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'date_added':
        // Default order (as received from API)
        break;
    }

    setFilteredTickets(result);
  }, [tickets, filters]);

  // Get unique categories from tickets
  const availableCategories = Array.from(
    new Set(tickets.map((t) => t.section).filter(Boolean) as string[])
  );

  // Get price range from tickets
  const priceRange = tickets.length > 0 ? {
    min: Math.floor(Math.min(...tickets.map(t => t.price)) / 10) * 10,
    max: Math.ceil(Math.max(...tickets.map(t => t.price)) / 10) * 10,
  } : { min: 0, max: 500 };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="mb-4 h-8 w-32" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="mb-6 h-96 w-full rounded-lg" />
              <Skeleton className="mb-4 h-10 w-3/4" />
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/events')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux événements
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error || 'Événement non trouvé'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const formattedDate = format(event.eventDate, 'EEEE dd MMMM yyyy', { locale: fr });
  const formattedTime = format(event.eventDate, 'HH:mm', { locale: fr });
  const priceRangeDisplay =
    event.minPrice && event.maxPrice
      ? event.minPrice === event.maxPrice
        ? `${event.minPrice.toFixed(2)}€`
        : `${event.minPrice.toFixed(2)}€ - ${event.maxPrice.toFixed(2)}€`
      : 'Prix non disponible';

  return (
    <MainLayout>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/events')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux événements
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          {/* Image */}
          <div className="relative mb-6 h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={event.imageUrl || '/placeholder-event.jpg'}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
              priority
              unoptimized={event.imageUrl?.includes('unsplash')}
            />
            {event.category && (
              <div className="absolute left-4 top-4">
                <Badge variant="secondary" className="text-lg">
                  {event.category}
                </Badge>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <h1 className="mb-2 text-4xl font-bold">{event.title}</h1>
          {event.artist && (
            <p className="mb-4 text-xl text-muted-foreground">
              {event.artist}
            </p>
          )}

          {/* Event Details */}
          <Card className="mb-6">
            <CardContent className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start space-x-3">
                <Calendar className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Date</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Heure</p>
                  <p className="text-sm text-muted-foreground">
                    {formattedTime}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Lieu</p>
                  <p className="text-sm text-muted-foreground">
                    {event.venue}, {event.city}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TicketIcon className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Billets disponibles</p>
                  <p className="text-sm text-muted-foreground">
                    {filteredTickets.length} billet{filteredTickets.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {event.description && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-3 text-2xl font-semibold">
                  À propos de cet événement
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tickets Marketplace */}
        <div className="mb-6">
          <h2 className="mb-4 text-3xl font-bold">
            Billets disponibles ({filteredTickets.length})
          </h2>
          <p className="text-muted-foreground">
            Tous les billets sont vérifiés et protégés par notre garantie acheteur
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableCategories={availableCategories}
                  priceRange={priceRange}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Tickets List */}
          <div className="lg:col-span-3">
            {filteredTickets.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    {...ticket}
                    eventTitle={event.title}
                    eventDate={event.eventDate}
                    eventVenue={`${event.venue}, ${event.city}`}
                    onBuy={() => {
                      setSelectedTicket(ticket);
                      setIsPurchaseModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TicketIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">
                    Aucun billet trouvé
                  </h3>
                  <p className="text-center text-muted-foreground">
                    Essayez d'ajuster vos filtres pour voir plus de résultats
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      setFilters({
                        minPrice: priceRange.min,
                        maxPrice: priceRange.max,
                        categories: [],
                        sortBy: 'price_asc',
                      })
                    }
                  >
                    Réinitialiser les filtres
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Purchase Modal */}
        {selectedTicket && (
          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => {
              setIsPurchaseModalOpen(false);
              setSelectedTicket(null);
            }}
            ticket={{
              id: selectedTicket.id,
              price: selectedTicket.price,
              section: selectedTicket.section,
              row: selectedTicket.row,
              seatNumber: selectedTicket.seatNumber,
              eventTitle: event.title,
              eventDate: event.eventDate,
              eventVenue: `${event.venue}, ${event.city}`,
            }}
            onSuccess={() => {
              // Rafraîchir la liste des billets
              window.location.reload();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
