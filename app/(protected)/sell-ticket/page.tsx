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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendre mon billet</h1>
        <p className="text-gray-500">
          Mettez votre billet en vente en quelques clics. Notre équipe vérifiera votre billet avant
          publication.
        </p>
      </div>

      {/* Bannière informative */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-clean p-5">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 flex-shrink-0" />
          Comment ça fonctionne ?
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle, title: 'Upload immédiat', desc: 'Déposez votre PDF maintenant, sans prérequis', color: 'text-emerald-600' },
            { icon: Clock, title: 'Séquestre J+2', desc: "Vos gains sont sécurisés après l'événement", color: 'text-blue-600' },
            { icon: Shield, title: 'KYC au retrait uniquement', desc: "Identité vérifiée seulement pour recevoir votre argent", color: 'text-blue-600' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-2.5">
              <Icon className={`h-4 w-4 ${color} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-sm font-medium text-blue-900">{title}</p>
                <p className="text-xs text-blue-700 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info événement si fourni */}
      {event && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-clean p-4">
          <h3 className="font-semibold text-emerald-900 mb-1 text-sm">Événement sélectionné</h3>
          <p className="text-emerald-800 font-medium">{event.title}</p>
          <p className="text-sm text-emerald-700 mt-0.5">
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

      {/* Formulaire */}
      <div className="bg-white border border-gray-200 rounded-clean shadow-clean p-6">
        <SellTicketForm eventId={params.eventId || ''} />
      </div>

      {/* Informations importantes */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-clean p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Informations importantes</h3>
        <ul className="space-y-3">
          {[
            'Votre billet sera vérifié par notre équipe dans les 24h',
            'Le prix de revente ne peut pas dépasser le prix facial du billet (loi française Art. 313-6-2)',
            'Formats acceptés : PDF uniquement, maximum 5 MB',
            "Paiement sécurisé en séquestre — libéré 2 jours après l'événement",
            <span key="kyc">La vérification d'identité (KYC) sera demandée <strong>uniquement au moment de retirer votre argent</strong></span>,
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
