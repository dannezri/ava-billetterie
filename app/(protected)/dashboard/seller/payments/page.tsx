/**
 * Page Paiements du Dashboard Vendeur
 * Affiche le solde, l'historique des transactions et permet les virements
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ExternalLink, Calendar, ArrowUpRight, ArrowDownLeft, Wallet, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useStripeConnect } from '@/hooks/use-stripe-connect';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Interfaces pour les données API
interface BalanceData {
  available: number;
  pending: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  type?: string;
  description?: string;
  arrival_date?: number;
}

interface TransactionsData {
  payouts: Transaction[];
  transactions: Transaction[];
}

export default function SellerPaymentsPage() {
  const { toast } = useToast();
  const { openDashboard, loading: stripeLoading } = useStripeConnect();
  
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [history, setHistory] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Charger les données
  const fetchPaymentsData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        fetch('/api/stripe-connect/balance'),
        fetch('/api/stripe-connect/transactions'),
      ]);

      if (balanceRes.ok) {
        setBalance(await balanceRes.json());
      }
      if (historyRes.ok) {
        setHistory(await historyRes.json());
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de paiement.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  // Déclencher un virement
  const handlePayout = async () => {
    setPayoutLoading(true);
    try {
      const response = await fetch('/api/stripe-connect/payout', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du virement');
      }

      toast({
        title: 'Virement initié',
        description: `Un virement de ${(data.amount / 100).toFixed(2)}€ a été déclenché vers votre compte bancaire.`,
      });

      // Rafraîchir les données
      fetchPaymentsData();
    } catch (error) {
      toast({
        title: 'Erreur de virement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setPayoutLoading(false);
    }
  };

  // Helper pour formater les montants
  const formatCurrency = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Helper pour formater les dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez vos paiements, suivez votre solde et effectuez des virements.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne Gauche : Solde */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-blue-100 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Solde disponible
              </CardTitle>
              <CardDescription>Prêt à être viré</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-12 w-32" />
              ) : (
                <div className="text-4xl font-bold text-blue-900">
                  {formatCurrency(balance?.available || 0)}
                </div>
              )}

              <div className="mt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={loading || (balance?.available || 0) <= 0 || payoutLoading}
                    >
                      {payoutLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        'Retirer mes gains'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer le virement</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous êtes sur le point de virer {formatCurrency(balance?.available || 0)} vers votre compte bancaire lié.
                        <br /><br />
                        Les fonds arriveront généralement sous 2 à 3 jours ouvrés selon votre banque.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePayout}>Confirmer le virement</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {(balance?.available || 0) <= 0 && !loading && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Aucun solde disponible pour le virement.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>En cours</CardTitle>
              <CardDescription>Fonds en attente de libération</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-semibold text-muted-foreground">
                  {formatCurrency(balance?.pending || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Les paiements sont généralement disponibles 2 jours après l&apos;événement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liens utiles</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={openDashboard}
                disabled={stripeLoading}
                variant="outline"
                className="w-full justify-between"
              >
                Dashboard Stripe
                <ExternalLink className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Accédez à l&apos;interface Stripe pour gérer vos documents fiscaux et coordonnées bancaires.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite : Historique */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
              <CardDescription>Derniers mouvements sur votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payouts */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Virements sortants</h3>
                    {history?.payouts.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucun virement effectué.</p>
                    ) : (
                      <div className="space-y-3">
                        {history?.payouts.map((payout) => (
                          <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <ArrowUpRight className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Virement vers banque</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(payout.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">-{formatCurrency(payout.amount, payout.currency)}</p>
                              <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                                {payout.status === 'paid' ? 'Payé' : payout.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Incoming Transactions */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Transactions récentes</h3>
                    {history?.transactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucune transaction récente.</p>
                    ) : (
                      <div className="space-y-3">
                        {history?.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <ArrowDownLeft className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{tx.description || 'Vente de billet'}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(tx.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-green-600">+{formatCurrency(tx.amount, tx.currency)}</p>
                              <Badge variant="outline" className="text-[10px]">
                                {tx.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

