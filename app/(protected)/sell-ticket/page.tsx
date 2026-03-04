import { Metadata } from 'next';
import { SellTicketForm } from '@/components/tickets/SellTicketForm';
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { Shield, Clock, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vendre mon billet | Ava',
  description: 'Mettez votre billet en vente de manière sécurisée',
};

/**
 * Page de vente de billet
 * ✨ NOUVEAU PARADIGME : Accessible à TOUT utilisateur authentifié
 * - KYC + Stripe Connect UNIQUEMENT requis pour le retrait des gains
 * - Tout user peut uploader un billet immédiatement
 */
export default async function SellTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  // Vérifier l'authentification (seul prérequis)
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/sell-ticket');
  }

  // Récupérer l'utilisateur depuis la DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, kycStatus: true },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Résoudre les searchParams (Next.js 15 async)
  const params = await searchParams;

  // Info événement si fourni (non bloquant)
  let event = null;
  if (params.eventId) {
    event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { id: true, title: true, eventDate: true, venue: true, city: true },
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendre mon billet</h1>
        <p className="text-muted-foreground">
          Mettez votre billet en vente en quelques clics. Notre équipe vérifiera votre billet avant
          publication.
        </p>
      </div>

      {/* ✨ Bannière informative (remplace le blocage KYC) */}
      <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Comment ça fonctionne ?
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Upload immédiat</p>
              <p className="text-xs text-blue-700">Déposez votre PDF maintenant, sans prérequis</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Séquestre J+2</p>
              <p className="text-xs text-blue-700">Vos gains sont sécurisés après l'événement</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">KYC au retrait uniquement</p>
              <p className="text-xs text-blue-700">
                Identité vérifiée seulement pour recevoir votre argent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info événement si fourni */}
      {event && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <h3 className="font-semibold text-green-900 mb-1">Événement sélectionné</h3>
          <p className="text-green-800 font-medium">{event.title}</p>
          <p className="text-sm text-green-700">
            {new Date(event.eventDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            — {event.venue}, {event.city}
          </p>
        </div>
      )}

      {/* Formulaire — accessible à TOUS les users authentifiés */}
      <div className="rounded-lg border bg-card p-6">
        <SellTicketForm eventId={params.eventId || ''} />
      </div>

      {/* Informations complémentaires */}
      <div className="mt-8 rounded-lg bg-muted/50 border p-6">
        <h3 className="font-semibold mb-4">📋 Informations importantes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Votre billet sera vérifié par notre équipe dans les 24h</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>
              Le prix de revente ne peut pas dépasser le prix facial du billet (loi française Art.
              313-6-2)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Formats acceptés : PDF uniquement, maximum 5 MB</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>
              Paiement sécurisé en séquestre — libéré 2 jours après l'événement
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>
              La vérification d'identité (KYC) sera demandée{' '}
              <strong>uniquement au moment de retirer votre argent</strong>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
