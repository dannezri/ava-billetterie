/**
 * GroupCard Component
 * Carte pour un groupe de billets côte à côte (TicketGroup)
 */

import Link from 'next/link';
import { CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface IGroupCardProps {
  group: {
    id: string;
    eventId: string;
    quantity: number;
    totalPrice: number | string;
    section: string | null;
    seller: {
      name: string | null;
      trustScore: number;
      totalSales: number;
    };
    tickets: Array<{
      id: string;
      seatNumber: string | null;
      verificationStatus: string;
    }>;
  };
}

function getTrustScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-orange-600';
}

export function GroupCard({ group }: IGroupCardProps) {
  const pricePerTicket = Number(group.totalPrice) / group.quantity;

  const sellerInitials = group.seller.name
    ? group.seller.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AN';

  const allApproved = group.tickets.every(
    (t) => t.verificationStatus === 'APPROVED'
  );

  const seatNumbers = group.tickets
    .map((t) => t.seatNumber)
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="border-blue-100 transition-all duration-200 hover:shadow-md hover:border-blue-300">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Gauche : Info groupe */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <Users className="mr-1 h-3 w-3" />
                {group.quantity} billets côte à côte
              </Badge>
              {allApproved && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {group.section || 'Placement libre'}
            </h3>
            {seatNumbers && (
              <p className="text-sm text-slate-600">
                Sièges : {seatNumbers}
              </p>
            )}
          </div>

          {/* Centre : Prix */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {Number(group.totalPrice).toFixed(0)}€
              </p>
              <p className="text-sm text-slate-500">
                soit {pricePerTicket.toFixed(0)}€ / billet
              </p>
            </div>
          </div>

          {/* Droite : Vendeur + CTA */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{sellerInitials}</AvatarFallback>
              </Avatar>
              <div className="text-left sm:text-right">
                <p className="text-xs font-medium text-slate-900">
                  {group.seller.name || 'Vendeur anonyme'}
                </p>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      getTrustScoreColor(group.seller.trustScore)
                    )}
                  >
                    {group.seller.trustScore}/100
                  </span>
                  <span className="text-xs text-slate-500">
                    • {group.seller.totalSales} vente
                    {group.seller.totalSales > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/events/${group.eventId}/tickets/group/${group.id}`}>
                Voir le groupe
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
