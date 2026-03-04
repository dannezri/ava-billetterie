/**
 * Page Checkout - Paiement Billet
 * Route: /checkout/[ticketId]
 * Flow: Reserve → Payment → Success
 */

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';
import { CheckoutClient } from './checkout-client';
import type { Metadata } from 'next';

interface CheckoutPageProps {
  params: {
    ticketId: string;
  };
  searchParams: {
    transactionId?: string;
  };
}

// Récupérer les données du billet côté serveur
async function getTicketData(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          venue: true,
          city: true,
          imageUrl: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          trustScore: true,
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  // Vérifier que le billet est disponible
  if (ticket.status !== 'ACTIVE' && ticket.status !== 'RESERVED') {
    return null;
  }

  if (ticket.verificationStatus !== 'APPROVED') {
    return null;
  }

  return ticket;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const ticket = await getTicketData(params.ticketId);

  if (!ticket) {
    return {
      title: 'Billet introuvable',
    };
  }

  return {
    title: `Achat - ${ticket.event.title}`,
    description: `Finaliser l'achat de votre billet pour ${ticket.event.title}`,
    robots: 'noindex, nofollow', // Pas d'indexation des pages checkout
  };
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  // transactionId passé depuis le panier (réservation déjà effectuée)
  const preReservedTransactionId = searchParams.transactionId ?? null;
  // Vérifier l'authentification
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Rediriger vers login si non authentifié
  if (authError || !user) {
    const returnUrl = `/checkout/${params.ticketId}`;
    redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // Récupérer le billet
  const ticket = await getTicketData(params.ticketId);

  if (!ticket) {
    notFound();
  }

  // Récupérer l'utilisateur de la DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    notFound();
  }

  // Vérifier que l'utilisateur n'achète pas son propre billet
  if (ticket.sellerId === dbUser.id) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Action impossible</h1>
          <p className="text-muted-foreground">
            Vous ne pouvez pas acheter votre propre billet.
          </p>
        </div>
      </div>
    );
  }

  // Préparer les données pour le client
  const ticketData = {
    id: ticket.id,
    price: Number(ticket.price),
    section: ticket.section,
    row: ticket.row,
    seatNumber: ticket.seatNumber,
    eventTitle: ticket.event.title,
    eventDate: ticket.event.eventDate,
    eventVenue: ticket.event.venue,
    eventCity: ticket.event.city,
    eventImage: ticket.event.imageUrl,
    seller: {
      name: ticket.seller.name,
      trustScore: ticket.seller.trustScore,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/events" className="hover:text-primary">
                Événements
              </a>
            </li>
            <li>/</li>
            <li>
              <a href={`/events/${ticket.event.id}`} className="hover:text-primary">
                {ticket.event.title}
              </a>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground">Paiement</li>
          </ol>
        </nav>

        {/* Composant client avec Stripe */}
        <CheckoutClient ticket={ticketData} preReservedTransactionId={preReservedTransactionId} />
      </div>
    </div>
  );
}
