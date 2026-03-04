/**
 * PurchaseCard Component
 * Card sticky pour achat de billet
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Shield, Heart, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart/cart.context';
import { useToast } from '@/hooks/use-toast';

interface IPurchaseCardProps {
  ticket: {
    id: string;
    eventId: string;
    price: number;
    status: string;
    section: string | null;
    seatNumber: string | null;
  };
  event: {
    id: string;
    title: string;
    eventDate: string;
  };
  platformFee: number;
  ticketsAvailable: number;
}

const PLATFORM_FEE_PERCENT = 0.05;

export function PurchaseCard({ ticket, event, platformFee, ticketsAvailable }: IPurchaseCardProps) {
  const { addItem, isInCart, removeItem } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isFavLoading, setIsFavLoading] = useState(false);

  // Charger l'état favori initial
  useEffect(() => {
    fetch(`/api/favorites/check?eventId=${event.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setIsFavorite(json.data.isFavorite);
          setFavoriteId(json.data.favoriteId);
        }
      })
      .catch(() => {});
  }, [event.id]);

  const ticketPrice = Number(ticket.price);
  const calculatedFee = Math.round(ticketPrice * PLATFORM_FEE_PERCENT * 100) / 100;
  const total = Math.round((ticketPrice + calculatedFee) * 100) / 100;
  const alreadyInCart = isInCart(ticket.id);
  const isUnavailable = ticket.status !== 'ACTIVE';
  const isLastTicket = ticketsAvailable === 1;

  const handleAddToCart = async () => {
    if (alreadyInCart) {
      toast({
        title: 'Déjà dans votre panier',
        description: 'Ce billet est déjà réservé dans votre panier.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Impossible de réserver ce billet');
      }

      addItem({
        type: 'single',
        ticketId: ticket.id,
        ticketIds: [ticket.id],
        transactionId: data.data.transactionId,
        transactionIds: [data.data.transactionId],
        expiresAt: data.data.expiresAt,
        price: total,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        section: ticket.section,
        seatNumber: ticket.seatNumber,
        quantity: 1,
      });

      toast({
        title: 'Billet ajouté au panier',
        description: 'Vous avez 15 minutes pour finaliser votre achat.',
        action: (
          <Link href="/cart" className="text-sm font-medium underline">
            Voir le panier
          </Link>
        ) as any,
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    setIsLoading(true);
    await removeItem(ticket.id);
    toast({ title: 'Billet retiré du panier' });
    setIsLoading(false);
  };

  const handleToggleFavorite = async () => {
    setIsFavLoading(true);
    try {
      if (isFavorite && favoriteId) {
        const res = await fetch(`/api/favorites/${favoriteId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erreur lors de la suppression');
        setIsFavorite(false);
        setFavoriteId(null);
        toast({ title: 'Retiré des favoris' });
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: event.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'ajout');
        setIsFavorite(true);
        setFavoriteId(data.data?.id ?? null);
        toast({
          title: 'Ajouté aux favoris',
          description: 'Retrouvez cet événement dans Mes favoris.',
          action: (
            <Link href="/favorites" className="text-sm font-medium underline">
              Voir mes favoris
            </Link>
          ) as any,
        });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setIsFavLoading(false);
    }
  };

  return (
    <Card className="sticky top-24 border-2">
      <CardHeader>
        <CardTitle className="text-lg">Achat sécurisé</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Détails prix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Prix du billet</span>
            <span className="font-medium text-slate-900">{ticket.price}€</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Frais plateforme (5%)</span>
            <span className="font-medium text-slate-900">{calculatedFee}€</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)}€</span>
          </div>
        </div>

        {/* Alerte dernier billet */}
        {isLastTicket && !isUnavailable && (
          <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
            <p className="text-xs text-orange-800">
              <strong>Dernier billet disponible !</strong> Dépêchez-vous avant qu'il ne soit vendu.
            </p>
          </div>
        )}

        {/* Bouton panier */}
        {isUnavailable ? (
          <div className="rounded-lg bg-slate-100 p-4 text-center">
            <p className="text-sm font-medium text-slate-700">Billet non disponible</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href={`/events/${ticket.eventId}`}>Voir autres billets</Link>
            </Button>
          </div>
        ) : alreadyInCart ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <Check className="h-4 w-4 shrink-0" />
              <span className="font-medium">Dans votre panier</span>
            </div>
            <div className="flex gap-2">
              <Button size="lg" className="flex-1" asChild>
                <Link href="/cart">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Voir le panier
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleRemoveFromCart}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retirer'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Réservation...' : 'Ajouter au panier'}
          </Button>
        )}

        {/* Bouton Favoris */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleToggleFavorite}
          disabled={isFavLoading}
        >
          {isFavLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`mr-2 h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          )}
          {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </Button>

        <Separator />

        {/* Garantie */}
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Garantie Sérénité</h4>
          </div>
          <p className="text-xs text-purple-700">
            Votre achat est protégé. En cas de problème d'accès à l'événement, vous serez
            intégralement remboursé.
          </p>
          <Link
            href="/serenity-guarantee"
            className="mt-2 inline-block text-xs font-medium text-purple-600 underline hover:text-purple-800"
          >
            En savoir plus
          </Link>
        </div>

        {/* Info séquestre */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-700">
            💳 <strong>Paiement sécurisé</strong> via Stripe
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Les fonds sont bloqués en séquestre et libérés au vendeur 2 jours après l'événement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
