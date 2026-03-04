/**
 * Page Favoris
 * Liste des événements mis en favoris par l'utilisateur
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Calendar, MapPin, Ticket, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Types alignés sur le schema Prisma (camelCase via @map)
type Favorite = {
  id: string;
  event: {
    id: string;
    title: string;
    eventDate: string;
    city: string;
    imageUrl: string | null;
    ticketsAvailable: number;
    minPrice: number;
  };
  createdAt: string;
};

export default function FavoritesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ favorites: Favorite[] }>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const json = await res.json();
      return json.data;
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const res = await fetch(`/api/favorites/${favoriteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove favorite');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({ title: 'Favori retiré' });
    },
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger vos favoris.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mes favoris</h1>
        <p className="text-muted-foreground mt-2">Retrouvez vos événements favoris</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : data && data.favorites.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Aucun favori pour le moment</p>
            <Button asChild>
              <Link href="/events">Découvrir des événements</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.favorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden">
              <div className="relative">
                {favorite.event.imageUrl ? (
                  <img
                    src={favorite.event.imageUrl}
                    alt={favorite.event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeFavoriteMutation.mutate(favorite.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{favorite.event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(favorite.event.eventDate), 'PPP', { locale: fr })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {favorite.event.city}
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    {favorite.event.ticketsAvailable} billets disponibles dès {favorite.event.minPrice.toFixed(2)} €
                  </div>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href={`/events/${favorite.event.id}`}>Voir les billets</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
