/**
 * AdjacentGroupCard
 * Carte pour un groupe virtuel de billets adjacents (côte à côte)
 * détectés automatiquement depuis les billets individuels.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, MapPin, CheckCircle2, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IAdjacentGroup } from '@/lib/services/adjacent-tickets.service';
import { useCart } from '@/lib/cart/cart.context';
import { useToast } from '@/hooks/use-toast';

interface IAdjacentGroupCardProps {
  group: IAdjacentGroup;
  eventId: string;
  eventTitle: string;
  eventDate: string;
}

const PLATFORM_FEE_RATE = 0.05;

export function AdjacentGroupCard({ group, eventId, eventTitle, eventDate }: IAdjacentGroupCardProps) {
  const { addItem, isInCart, removeItem } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const alreadyInCart = isInCart(group.ticketIds[0]);
  const totalWithFees = Number(group.totalPrice) * (1 + PLATFORM_FEE_RATE);

  const seatsDisplay =
    group.seats.length <= 4
      ? group.seats.join(', ')
      : `${group.seats[0]} → ${group.seats[group.seats.length - 1]}`;

  const handleAddToCart = async () => {
    if (alreadyInCart) {
      toast({ title: 'Déjà dans votre panier', description: 'Ce groupe est déjà réservé.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tickets/reserve-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: group.ticketIds }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Impossible de réserver ce groupe');
      }

      addItem({
        type: 'group',
        ticketId: group.ticketIds[0],
        ticketIds: group.ticketIds,
        transactionId: data.data.transactionIds[0],
        transactionIds: data.data.transactionIds,
        expiresAt: data.data.expiresAt,
        price: Math.round(totalWithFees * 100) / 100,
        eventId,
        eventTitle,
        eventDate,
        section: group.section,
        seatNumber: group.seats[0],
        quantity: group.quantity,
      });

      toast({
        title: `${group.quantity} billets ajoutés au panier`,
        description: 'Vous avez 15 minutes pour finaliser votre achat.',
        action: (
          <Link href="/cart" className="text-sm font-medium underline">
            Voir le panier
          </Link>
        ) as any,
      });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    setLoading(true);
    await removeItem(group.ticketIds[0]);
    toast({ title: 'Groupe retiré du panier' });
    setLoading(false);
  };

  return (
    <Card
      className={cn(
        'border-2 transition-all duration-200',
        alreadyInCart
          ? 'border-green-400 bg-green-50/30'
          : 'border-green-200 bg-gradient-to-br from-green-50/40 to-white hover:border-green-400 hover:shadow-md'
      )}
    >
      <CardContent className="p-5">
        {/* ── Header : badge + prix ─────────────────────────────────── */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge className="gap-1.5 bg-green-600 px-3 py-1 text-white hover:bg-green-700">
            <Users className="h-3.5 w-3.5" />
            {group.quantity} places côte à côte
          </Badge>

          <div className="text-right">
            <p className="text-2xl font-bold text-green-700">
              {group.totalPrice.toFixed(2)}€
            </p>
            <p className="text-sm text-slate-500">
              {group.pricePerTicket.toFixed(2)}€ / billet
            </p>
          </div>
        </div>

        {/* ── Catégorie ──────────────────────────────────────────────── */}
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Catégorie
          </p>
          <p className="font-semibold text-slate-800">{group.section}</p>
        </div>

        {/* ── Sièges consécutifs ─────────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-white p-3">
          <MapPin className="h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="text-xs font-medium text-slate-400">
              Sièges consécutifs détectés
            </p>
            <p className="font-bold text-slate-800">{seatsDisplay}</p>
          </div>
          <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-green-500" />
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          {alreadyInCart ? (
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/cart">
                  <Check className="mr-1.5 h-4 w-4 text-green-600" />
                  Voir panier
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:bg-red-50"
                onClick={handleRemoveFromCart}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retirer'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={loading}
              className="shrink-0 gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {loading ? 'Réservation...' : `Ajouter les ${group.quantity}`}
            </Button>
          )}
        </div>

        {/* ── Note ───────────────────────────────────────────────────── */}
        <p className="mt-3 text-center text-xs text-slate-400">
          Ces {group.quantity} billets sont achetés ensemble — places garanties côte à côte
        </p>
      </CardContent>
    </Card>
  );
}
