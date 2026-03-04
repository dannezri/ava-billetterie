'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  Clock,
  ArrowRight,
  Ticket,
  Calendar,
  MapPin,
  AlertTriangle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart, CartItem } from '@/lib/cart/cart.context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Countdown par item ───────────────────────────────────────────────────────

function useItemCountdown(expiresAt: string): { label: string; isUrgent: boolean; expired: boolean } {
  const [state, setState] = useState({ label: '...', isUrgent: false, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setState({ label: '0:00', isUrgent: true, expired: true });
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setState({
        label: `${m}:${s.toString().padStart(2, '0')}`,
        isUrgent: diff < 3 * 60 * 1000,
        expired: false,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return state;
}

// ─── Carte d'un item ──────────────────────────────────────────────────────────

function CartItemCard({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (id: string) => Promise<void>;
}) {
  const { label, isUrgent, expired } = useItemCountdown(item.expiresAt);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.ticketId);
  };

  return (
    <Card className={cn('transition-all', expired && 'opacity-50')}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Infos événement */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-start gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold text-slate-900">{item.eventTitle}</p>
                {item.type === 'group' && (
                  <Badge variant="outline" className="mt-0.5 text-xs border-blue-200 text-blue-700 bg-blue-50">
                    {item.quantity} billets côte à côte
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(item.eventDate), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>

            {(item.section || item.seatNumber) && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {[item.section, item.seatNumber && `Siège ${item.seatNumber}`]
                    .filter(Boolean)
                    .join(' — ')}
                </span>
              </div>
            )}
          </div>

          {/* Prix + countdown + supprimer */}
          <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
            <p className="text-xl font-bold text-slate-900">{Number(item.price).toFixed(2)} €</p>

            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono font-semibold',
                expired
                  ? 'bg-red-100 text-red-700'
                  : isUrgent
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              <Clock className="h-3 w-3" />
              {expired ? 'Expirée' : `Expire dans ${label}`}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="ml-1.5 text-xs">Retirer</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page panier ──────────────────────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, totalItems } = useCart();

  const validItems = items.filter((i) => new Date(i.expiresAt).getTime() > Date.now());
  const expiredItems = items.filter((i) => new Date(i.expiresAt).getTime() <= Date.now());

  const totalPrice = validItems.reduce((s, i) => s + Number(i.price), 0);
  const platformFeeTotal = totalPrice - totalPrice / 1.05;

  const allTransactionIds = validItems.flatMap((i) => i.transactionIds);

  const handlePayAll = useCallback(() => {
    if (allTransactionIds.length === 0) return;
    router.push(`/checkout/cart?transactions=${allTransactionIds.join(',')}`);
  }, [allTransactionIds, router]);

  // Panier vide
  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <ShoppingCart className="mb-6 h-16 w-16 text-slate-200" />
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Votre panier est vide</h1>
          <p className="mb-8 text-slate-500">
            Ajoutez des billets depuis les pages événements pour les retrouver ici.
          </p>
          <Button asChild size="lg">
            <Link href="/events">Parcourir les événements</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mon panier</h1>
            <p className="text-sm text-slate-500">
              {totalItems} billet{totalItems > 1 ? 's' : ''} réservé{totalItems > 1 ? 's' : ''}
            </p>
          </div>
          <Badge variant="outline" className="text-base font-semibold px-3 py-1">
            {totalPrice.toFixed(2)} €
          </Badge>
        </div>

        {/* Alerte items expirés */}
        {expiredItems.length > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {expiredItems.length} réservation{expiredItems.length > 1 ? 's ont' : ' a'} expiré.
            Retirez-les ou retrouvez les billets sur la page événement.
          </div>
        )}

        {/* Items valides */}
        {validItems.length > 0 && (
          <div className="space-y-4">
            {validItems.map((item) => (
              <CartItemCard key={item.ticketId} item={item} onRemove={removeItem} />
            ))}
          </div>
        )}

        {/* Items expirés (affichés en dessous) */}
        {expiredItems.length > 0 && (
          <div className="mt-4 space-y-4">
            {expiredItems.map((item) => (
              <CartItemCard key={item.ticketId} item={item} onRemove={removeItem} />
            ))}
          </div>
        )}

        {/* Récapitulatif + bouton payer */}
        {validItems.length > 0 && (
          <Card className="mt-8 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-2 text-sm mb-4">
                {validItems.map((item) => (
                  <div key={item.ticketId} className="flex justify-between">
                    <span className="text-muted-foreground truncate max-w-[70%]">
                      {item.type === 'group' ? `${item.quantity}× ` : ''}{item.eventTitle}
                    </span>
                    <span className="font-medium shrink-0">{Number(item.price).toFixed(2)} €</span>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-1.5 text-sm mb-5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total billets</span>
                  <span>{(totalPrice - platformFeeTotal).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frais de service (5%)</span>
                  <span>{platformFeeTotal.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{totalPrice.toFixed(2)} €</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-base"
                onClick={handlePayAll}
                disabled={allTransactionIds.length === 0}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Payer {totalPrice.toFixed(2)} € en une fois
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Paiement sécurisé — tous vos billets en une seule transaction
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Link href="/events" className="text-sm text-slate-500 underline-offset-2 hover:underline">
            Continuer mes recherches
          </Link>
        </div>
      </div>
    </div>
  );
}
