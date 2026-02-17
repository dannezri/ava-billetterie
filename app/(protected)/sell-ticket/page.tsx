import { Metadata } from 'next';
import { SellTicketForm } from '@/components/tickets';
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

export const metadata: Metadata = {
  title: 'Vendre mon billet | Ava',
  description: 'Mettez votre billet en vente de manière sécurisée',
};

/**
 * Page de vente de billet
 * Protégée par authentification et KYC
 */
export default async function SellTicketPage({
  searchParams,
}: {
  searchParams: { eventId?: string };
}) {
  // Vérifier l'authentification
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/sell-ticket');
  }

  // Récupérer l'utilisateur depuis la DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Vérifier le statut KYC
  const needsKyc = dbUser.kycStatus !== 'VERIFIED';

  // Si eventId fourni, vérifier qu'il existe
  let event = null;
  if (searchParams.eventId) {
    event = await prisma.event.findUnique({
      where: { id: searchParams.eventId },
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendre mon billet</h1>
        <p className="text-gray-600">
          Mettez votre billet en vente de manière sécurisée. Notre équipe vérifiera votre billet avant publication.
        </p>
      </div>

      {/* Alerte KYC si nécessaire */}
      {needsKyc && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Vérification d'identité requise
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Vous devez vérifier votre identité avant de pouvoir vendre des billets.
                  Cela nous permet de garantir la sécurité de tous les utilisateurs.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="/account/kyc"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Vérifier mon identité
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info événement si fourni */}
      {event && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-1">Événement sélectionné</h3>
          <p className="text-blue-800">{event.title}</p>
          <p className="text-sm text-blue-600">
            {new Date(event.eventDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' à '}
            {event.venue}, {event.city}
          </p>
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {needsKyc ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Vérification requise
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Veuillez vérifier votre identité pour accéder à ce formulaire.
            </p>
          </div>
        ) : (
          <SellTicketForm
            eventId={searchParams.eventId || ''}
            onSuccess={(ticketId) => {
              // Redirection vers la page du billet créé
              window.location.href = `/seller/tickets/${ticketId}`;
            }}
            onError={(error) => {
              console.error('Erreur création billet:', error);
            }}
          />
        )}
      </div>

      {/* Informations complémentaires */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">📋 Informations importantes</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Votre billet sera vérifié par notre équipe dans les prochaines heures</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Le prix de vente ne peut pas dépasser le prix facial du billet</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Formats acceptés : PDF uniquement, maximum 5 MB</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Votre paiement sera sécurisé en séquestre jusqu'à 2 jours après l'événement</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Aucun frais pour le vendeur, commission prélevée sur l'acheteur</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
