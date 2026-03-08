/**
 * TicketCard Component
 * Carte billet compact (dans liste détail événement)
 * - ACTIVE  → cliquable normalement
 * - RESERVED → grisé, non-cliquable, décompte de libération
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, TrendingDown, Clock, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ITicketCardProps {
  ticket: {
    id: string;
    eventId: string;
    price: number;
    originalPrice: number | null;
    section: string | null;
    seatNumber: string | null;
    status?: string;
    expiresAt?: string | Date | null;
    seller: {
      name: string | null;
      trustScore: number;
      totalSales: number;
    };
    verificationStatus: string;
  };
}

function useCountdown(expiresAt: string | Date | null | undefined): string {
  const [timeLeft, setTimeLeft] = useState<string>('...');

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('bientôt');
      return;
    }

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('0:00');
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

export function TicketCard({ ticket }: ITicketCardProps) {
  const isReserved = ticket.status === 'RESERVED';
  const countdown = useCountdown(isReserved ? ticket.expiresAt : null);

  const discount = ticket.originalPrice
    ? Math.round(((ticket.originalPrice - ticket.price) / ticket.originalPrice) * 100)
    : 0;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isReserved
          ? 'opacity-60 grayscale-[40%] cursor-not-allowed'
          : 'hover:shadow-md'
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Gauche : Catégorie + Siège */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {ticket.section || 'Placement libre'}
              </h3>
              {ticket.verificationStatus === 'APPROVED' && !isReserved && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              {isReserved && (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </div>
            {ticket.seatNumber && (
              <p className="text-sm text-gray-500">Siège : {ticket.seatNumber}</p>
            )}
            {/* Badge + décompte si réservé */}
            {isReserved && (
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700">
                  <Clock className="h-3 w-3" />
                  Réservé par un acheteur
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Libre dans {countdown}
                </span>
              </div>
            )}
          </div>

          {/* Centre : Prix */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={cn('text-2xl font-bold', isReserved ? 'text-gray-400' : 'text-gray-900')}>
                {ticket.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
              </p>
              {ticket.originalPrice && ticket.originalPrice !== ticket.price && (
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-sm text-gray-400 line-through">
                    {ticket.originalPrice}€
                  </p>
                  {discount > 0 && !isReserved && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                      <TrendingDown className="h-3 w-3" />
                      -{discount}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Droite : CTA */}
          <div className="flex items-center sm:flex-col sm:items-end">
            {isReserved ? (
              <Button size="sm" disabled className="cursor-not-allowed">
                Indisponible
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/events/${ticket.eventId}/tickets/${ticket.id}`}>
                  Voir le billet
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
