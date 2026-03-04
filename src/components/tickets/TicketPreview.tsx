/**
 * TicketPreview Component
 * Prévisualisation détaillée d'un billet
 */

import { CheckCircle2, Shield, Clock, TrendingDown, Ticket as TicketIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatShortDate } from '@/lib/utils';

interface ITicketPreviewProps {
  ticket: {
    id: string;
    price: number;
    originalPrice: number | null;
    section: string | null;
    row: string | null;
    seatNumber: string | null;
    verificationStatus: string;
    createdAt: Date;
  };
}

export function TicketPreview({ ticket }: ITicketPreviewProps) {
  const discount = ticket.originalPrice
    ? Math.round(((ticket.originalPrice - ticket.price) / ticket.originalPrice) * 100)
    : 0;

  const daysListed = Math.floor(
    (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Détails du billet</span>
          {ticket.verificationStatus === 'APPROVED' && (
            <Badge className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Vérifié
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Catégorie et siège */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-500">Placement</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-slate-900">
              {ticket.section || 'Placement libre'}
            </p>
            {ticket.row && (
              <p className="text-slate-700">Rangée : {ticket.row}</p>
            )}
            {ticket.seatNumber && (
              <p className="text-slate-700">Siège : {ticket.seatNumber}</p>
            )}
            {!ticket.row && !ticket.seatNumber && ticket.section === null && (
              <p className="text-sm text-slate-600">Placement non numéroté</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Prix */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-500">Prix de vente</h3>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-blue-600">{ticket.price}€</p>
            {ticket.originalPrice && ticket.originalPrice !== ticket.price && (
              <div className="mb-1 flex items-center gap-2">
                <p className="text-lg text-slate-400 line-through">
                  {ticket.originalPrice}€
                </p>
                {discount > 0 && (
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    <TrendingDown className="mr-1 h-3 w-3" />
                    -{discount}%
                  </Badge>
                )}
              </div>
            )}
          </div>
          {ticket.originalPrice && (
            <p className="mt-2 text-sm text-slate-600">
              Prix facial : {ticket.originalPrice}€
            </p>
          )}
          {discount > 0 && (
            <p className="mt-1 text-sm font-medium text-green-600">
              💰 Économisez {(ticket.originalPrice! - ticket.price).toFixed(2)}€ vs prix facial
            </p>
          )}
        </div>

        <Separator />

        {/* Timeline */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-500">Historique</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Mis en vente</p>
                <p className="text-xs text-slate-600">
                  Il y a {daysListed} jour{daysListed > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {ticket.verificationStatus === 'APPROVED' && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Vérifié par notre équipe</p>
                  <p className="text-xs text-slate-600">
                    {formatShortDate(ticket.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Garanties */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-500">Garanties</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Billet vérifié</p>
                <p className="text-xs text-green-700">
                  Validé par notre équipe de modération
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Paiement sécurisé</p>
                <p className="text-xs text-blue-700">
                  Transaction via Stripe avec séquestre J+2
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3">
              <TicketIcon className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Garantie Sérénité</p>
                <p className="text-xs text-purple-700">
                  Remboursement si problème d'accès
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
