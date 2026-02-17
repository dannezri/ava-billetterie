import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/client';
import prisma from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';

/**
 * @api {GET} /api/stripe-connect/transactions
 * @description Récupère l'historique des transactions (virements sortants et ventes entrantes) du compte Stripe Connect.
 * 
 * @returns {Object} JSON response
 * - payouts: Array<{ id, amount, currency, status, date, arrival_date }>
 * - transactions: Array<{ id, amount, currency, status, date, type, description }>
 * 
 * @error 401 Non authentifié
 * @error 404 Compte Stripe non configuré
 * @error 500 Erreur serveur
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeAccountId: true },
    });

    if (!dbUser?.stripeAccountId) {
      return NextResponse.json({ error: 'Compte Stripe non configuré' }, { status: 404 });
    }

    // Récupérer les virements (payouts) sortants
    const payouts = await stripe.payouts.list(
      { limit: 10 },
      { stripeAccount: dbUser.stripeAccountId }
    );

    // Récupérer les transactions entrantes (ventes)
    // On filtre sur type 'charge' ou 'transfer' pour voir les encaissements
    const transactions = await stripe.balanceTransactions.list(
      { limit: 10 },
      { stripeAccount: dbUser.stripeAccountId }
    );

    return NextResponse.json({
      payouts: payouts.data.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        date: p.created,
        arrival_date: p.arrival_date,
      })),
      transactions: transactions.data.map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        date: t.created,
        type: t.type,
        description: t.description,
      })),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
