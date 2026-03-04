/**
 * Page Checkout Groupe
 * Route: /checkout/group?tickets=id1,id2,id3
 *
 * Flow: Valider billets → Réserver → Payer (Stripe) → Succès
 */

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';
import { GroupCheckoutClient } from './group-checkout-client';
import type { Metadata } from 'next';

interface GroupCheckoutPageProps {
  searchParams: { tickets?: string; transactionIds?: string };
}

/**
 * Charge et valide tous les billets du groupe
 */
async function getGroupData(ticketIds: string[]) {
  if (ticketIds.length < 2 || ticketIds.length > 10) return null;

  const tickets = await prisma.ticket.findMany({
    where: { id: { in: ticketIds } },
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
        select: { id: true, name: true, trustScore: true },
      },
    },
  });

  if (tickets.length !== ticketIds.length) return null;

  // Vérifications métier
  const firstEventId = tickets[0].eventId;
  const firstSellerId = tickets[0].sellerId;

  for (const t of tickets) {
    if (t.eventId !== firstEventId) return null;
    if (t.sellerId !== firstSellerId) return null;
    if (t.status !== 'ACTIVE' && t.status !== 'RESERVED') return null;
    if (t.verificationStatus !== 'APPROVED') return null;
  }

  // Trier dans l'ordre des IDs passés en URL
  const ordered = ticketIds.map((id) => tickets.find((t) => t.id === id)!);

  return { tickets: ordered, event: ordered[0].event, seller: ordered[0].seller };
}

export async function generateMetadata({
  searchParams,
}: GroupCheckoutPageProps): Promise<Metadata> {
  const ticketIds = (searchParams.tickets ?? '').split(',').filter(Boolean);
  const data = await getGroupData(ticketIds);

  return {
    title: data ? `Achat groupe – ${data.event.title}` : 'Groupe introuvable',
    robots: 'noindex, nofollow',
  };
}

export default async function GroupCheckoutPage({ searchParams }: GroupCheckoutPageProps) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    const returnUrl = `/checkout/group?tickets=${searchParams.tickets ?? ''}`;
    redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // ── Valider les IDs ───────────────────────────────────────────────────────
  const ticketIds = (searchParams.tickets ?? '').split(',').filter(Boolean);

  if (ticketIds.length < 2) {
    notFound();
  }

  const data = await getGroupData(ticketIds);

  if (!data) {
    notFound();
  }

  // ── Vérifier que l'acheteur n'est pas le vendeur ──────────────────────────
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });

  if (!dbUser) notFound();

  if (data.seller.id === dbUser.id) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Action impossible</h1>
          <p className="text-muted-foreground">
            Vous ne pouvez pas acheter vos propres billets.
          </p>
        </div>
      </div>
    );
  }

  // ── Préparer les données pour le client ───────────────────────────────────
  const groupData = {
    ticketIds,
    tickets: data.tickets.map((t) => ({
      id: t.id,
      price: Number(t.price),
      section: t.section,
      seatNumber: t.seatNumber,
      row: t.row,
    })),
    event: {
      id: data.event.id,
      title: data.event.title,
      eventDate: data.event.eventDate.toISOString(),
      venue: data.event.venue,
      city: data.event.city,
      imageUrl: data.event.imageUrl,
    },
    seller: {
      name: data.seller.name,
      trustScore: data.seller.trustScore,
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
              <a href={`/events/${data.event.id}`} className="hover:text-primary">
                {data.event.title}
              </a>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground">
              Paiement groupe ({ticketIds.length} billets)
            </li>
          </ol>
        </nav>

        <GroupCheckoutClient
          group={groupData}
          preReservedTransactionIds={
            searchParams.transactionIds
              ? searchParams.transactionIds.split(',').filter(Boolean)
              : null
          }
        />
      </div>
    </div>
  );
}
