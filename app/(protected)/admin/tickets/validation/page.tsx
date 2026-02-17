'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { TicketValidationCard } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function AdminTicketValidationPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.admin.getPendingTickets.useQuery(
    { limit: 20 },
    {
      refetchOnWindowFocus: false,
      retry: false,
      // Force refetch when refreshKey changes
      queryKey: ['admin.getPendingTickets', { limit: 20 }, refreshKey],
    }
  );

  const statsQuery = trpc.admin.getStats.useQuery();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
    statsQuery.refetch();
  };

  const handleActionComplete = () => {
    handleRefresh();
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error.message || 'Impossible de charger les billets en attente'}
          </AlertDescription>
        </Alert>
        {error.message.includes('Accès réservé') && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas les droits d&apos;accès à cette page.
              Contactez un administrateur.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Validation des billets
            </h1>
            <p className="text-gray-600 mt-2">
              Vérifiez et validez les billets soumis par les vendeurs
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        {statsQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700 font-medium">En attente</p>
              <p className="text-2xl font-bold text-yellow-900">
                {statsQuery.data.pendingTickets}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">Actifs</p>
              <p className="text-2xl font-bold text-green-900">
                {statsQuery.data.activeTickets}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">Rejetés</p>
              <p className="text-2xl font-bold text-red-900">
                {statsQuery.data.rejectedTickets}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-700 font-medium">Litiges</p>
              <p className="text-2xl font-bold text-orange-900">
                {statsQuery.data.openDisputes}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">Transactions</p>
              <p className="text-2xl font-bold text-blue-900">
                {statsQuery.data.totalTransactions}
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Liste des billets */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">
            Chargement des billets...
          </span>
        </div>
      ) : data?.tickets && data.tickets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.tickets.map((ticket) => (
            <TicketValidationCard
              key={ticket.id}
              ticket={{
                ...ticket,
                price: Number(ticket.price),
                originalPrice: ticket.originalPrice
                  ? Number(ticket.originalPrice)
                  : null,
              }}
              onActionComplete={handleActionComplete}
            />
          ))}
        </div>
      ) : (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Aucun billet en attente</AlertTitle>
          <AlertDescription>
            Tous les billets ont été traités. Revenez plus tard ou actualisez
            la page.
          </AlertDescription>
        </Alert>
      )}

      {/* Pagination */}
      {data?.nextCursor && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline">Charger plus de billets</Button>
        </div>
      )}
    </div>
  );
}
