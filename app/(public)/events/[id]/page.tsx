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
import {
  Calendar,
  MapPin,
  TicketIcon,
  Clock,
  ArrowLeft,
  AlertCircle,
  Globe,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  date: Date;
  location: string;
  country: string;
  category: string | null;
  availableTickets: number;
  minPrice: number | null;
  maxPrice: number | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all events
        const res = await fetch('/api/events');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message || 'Failed to fetch event');
        }

        // Find the specific event
        const foundEvent = data.data.events.find((e: any) => e.id === eventId);

        if (!foundEvent) {
          throw new Error('Événement non trouvé');
        }

        setEvent({
          ...foundEvent,
          date: new Date(foundEvent.date),
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

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

  const formattedDate = format(event.date, 'EEEE dd MMMM yyyy', { locale: fr });
  const formattedTime = format(event.date, 'HH:mm', { locale: fr });
  const priceRange =
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative mb-6 h-96 w-full overflow-hidden rounded-lg">
              <Image
                src={event.imageUrl || '/placeholder-event.jpg'}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
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
            <h1 className="mb-4 text-4xl font-bold">{event.title}</h1>

            {event.description && (
              <p className="mb-6 text-lg text-muted-foreground">
                {event.description}
              </p>
            )}

            {/* Event Details */}
            <Card className="mb-6">
              <CardContent className="grid gap-4 p-6 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Calendar className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-sm text-muted-foreground">
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
                      {event.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Pays</p>
                    <p className="text-sm text-muted-foreground">
                      {event.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold">
                  À propos de cet événement
                </h2>
                <p className="text-muted-foreground">
                  {event.description ||
                    "Plus d'informations disponibles prochainement."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Prix des billets
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {priceRange}
                  </p>
                </div>

                <div className="mb-6 flex items-center space-x-2 text-sm">
                  <TicketIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.availableTickets > 0 ? (
                      <>
                        <span className="font-semibold text-foreground">
                          {event.availableTickets}
                        </span>{' '}
                        billet{event.availableTickets > 1 ? 's' : ''} disponible
                        {event.availableTickets > 1 ? 's' : ''}
                      </>
                    ) : (
                      <span className="font-semibold text-destructive">
                        Complet
                      </span>
                    )}
                  </span>
                </div>

                {event.availableTickets > 0 ? (
                  <>
                    <Button
                      size="lg"
                      className="mb-3 w-full"
                      onClick={() => {
                        // TODO: Implement ticket purchase
                        alert(
                          'Fonctionnalité d\'achat de billets à venir !'
                        );
                      }}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Acheter des billets
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Paiement sécurisé via Stripe
                    </p>
                  </>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Billets épuisés
                  </Button>
                )}

                <div className="mt-6 space-y-2 border-t pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Catégorie</span>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Protection Acheteur
                    </span>
                    <span className="font-semibold text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Billets Vérifiés
                    </span>
                    <span className="font-semibold text-green-600">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
