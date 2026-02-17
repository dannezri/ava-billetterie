'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  MessageCircle,
  ExternalLink,
  Calendar,
  MapPin,
  User,
  Euro,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TicketActionModal } from './TicketActionModal';

interface TicketValidationCardProps {
  ticket: {
    id: string;
    status: string;
    price: number;
    originalPrice: number | null;
    section: string | null;
    row: string | null;
    seatNumber: string | null;
    pdfUrl: string | null;
    barcodeNumber: string | null;
    createdAt: Date;
    event: {
      id: string;
      title: string;
      artist: string | null;
      venue: string;
      city: string;
      eventDate: Date;
    };
    seller: {
      id: string;
      name: string | null;
      email: string;
      kycStatus: string;
      trustScore: number;
      verifiedIdentity: boolean;
    };
  };
  onActionComplete: () => void;
}

export function TicketValidationCard({
  ticket,
  onActionComplete,
}: TicketValidationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<
    'approve' | 'reject' | 'request-info'
  >('approve');

  const handleOpenModal = (action: 'approve' | 'reject' | 'request-info') => {
    setModalAction(action);
    setModalOpen(true);
  };

  const kycStatusColors = {
    VERIFIED: 'bg-green-500',
    PENDING: 'bg-yellow-500',
    REJECTED: 'bg-red-500',
  };

  const kycStatusLabels = {
    VERIFIED: 'Vérifié',
    PENDING: 'En attente',
    REJECTED: 'Rejeté',
  };

  const trustScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold">
                {ticket.event.title}
              </CardTitle>
              {ticket.event.artist && (
                <CardDescription className="text-base mt-1">
                  {ticket.event.artist}
                </CardDescription>
              )}
            </div>
            <Badge
              variant="outline"
              className="ml-4 bg-yellow-50 text-yellow-700 border-yellow-300"
            >
              En attente
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informations événement */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(ticket.event.eventDate), 'EEEE d MMMM yyyy', {
                locale: fr,
              })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {ticket.event.venue}, {ticket.event.city}
            </div>
          </div>

          <Separator />

          {/* Informations billet */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Prix de vente</p>
              <p className="text-lg font-semibold flex items-center">
                <Euro className="w-4 h-4 mr-1" />
                {ticket.price.toFixed(2)} €
              </p>
            </div>
            {ticket.originalPrice && (
              <div>
                <p className="text-sm text-gray-500">Prix facial</p>
                <p className="text-lg font-semibold flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  {ticket.originalPrice.toFixed(2)} €
                </p>
              </div>
            )}
          </div>

          {(ticket.section || ticket.row || ticket.seatNumber) && (
            <div>
              <p className="text-sm text-gray-500">Placement</p>
              <p className="text-sm font-medium">
                {[ticket.section, ticket.row, ticket.seatNumber]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
          )}

          {ticket.barcodeNumber && (
            <div>
              <p className="text-sm text-gray-500">Code-barres</p>
              <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                {ticket.barcodeNumber}
              </p>
            </div>
          )}

          <Separator />

          {/* Informations vendeur */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-600" />
                <span className="font-medium">
                  {ticket.seller.name || 'Vendeur anonyme'}
                </span>
              </div>
              <Badge
                className={`${
                  kycStatusColors[
                    ticket.seller.kycStatus as keyof typeof kycStatusColors
                  ]
                } text-white`}
              >
                {
                  kycStatusLabels[
                    ticket.seller.kycStatus as keyof typeof kycStatusLabels
                  ]
                }
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{ticket.seller.email}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Score de confiance
              </span>
              <span
                className={`font-bold ${trustScoreColor(ticket.seller.trustScore)}`}
              >
                {ticket.seller.trustScore}/100
              </span>
            </div>

            <div className="text-xs text-gray-500">
              Soumis le{' '}
              {format(new Date(ticket.createdAt), 'dd/MM/yyyy à HH:mm')}
            </div>
          </div>

          {/* Lien vers PDF */}
          {ticket.pdfUrl && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(ticket.pdfUrl!, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir le PDF du billet
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            onClick={() => handleOpenModal('approve')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approuver
          </Button>
          <Button
            onClick={() => handleOpenModal('reject')}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeter
          </Button>
          <Button
            onClick={() => handleOpenModal('request-info')}
            variant="outline"
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Demander info
          </Button>
        </CardFooter>
      </Card>

      <TicketActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        ticketId={ticket.id}
        eventTitle={ticket.event.title}
        onSuccess={() => {
          setModalOpen(false);
          onActionComplete();
        }}
      />
    </>
  );
}
