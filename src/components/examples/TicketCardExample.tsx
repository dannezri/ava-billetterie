/**
 * Example Ticket Card Component using shadcn/ui
 * Demonstrates integration of shadcn/ui components with tRPC
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export function TicketCardExample() {
  const { toast } = useToast();
  const { data, isLoading, error } = trpc.ticket.getAll.useQuery({
    limit: 6,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement des billets : {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || data.tickets.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <Alert>
          <AlertDescription>
            Aucun billet disponible pour le moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handlePurchase = (ticketId: string) => {
    toast({
      title: 'Billet ajouté au panier',
      description: 'Vous pouvez finaliser votre achat dans le panier.',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'default',
      RESERVED: 'secondary',
      SOLD: 'outline',
      CANCELLED: 'destructive',
      PENDING_VERIFICATION: 'secondary',
      FLAGGED: 'destructive',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billets Disponibles</h1>
        <p className="text-muted-foreground">
          Trouvez le billet parfait pour votre événement
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.tickets.map((ticket) => (
          <Card key={ticket.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">
                    {ticket.event.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {ticket.event.venue}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(ticket.status) as any}>
                  {ticket.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {ticket.price.toFixed(2)}€
                  </p>
                  {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                    <p className="text-sm text-muted-foreground line-through">
                      Prix original: {ticket.originalPrice.toFixed(2)}€
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  {ticket.section && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Section:</span> {ticket.section}
                    </p>
                  )}
                  {ticket.row && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Rang:</span> {ticket.row}
                    </p>
                  )}
                  {ticket.seatNumber && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Siège:</span> {ticket.seatNumber}
                    </p>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Vendu par{' '}
                    <span className="font-medium">{ticket.seller.name}</span>
                    {ticket.seller.verifiedIdentity && (
                      <span className="ml-1 text-green-600">✓ Vérifié</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handlePurchase(ticket.id)}
                disabled={ticket.status !== 'AVAILABLE'}
              >
                {ticket.status === 'AVAILABLE' ? 'Acheter' : 'Indisponible'}
              </Button>
              <Button variant="outline" size="icon">
                <span className="sr-only">Plus d&apos;infos</span>
                ℹ️
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
