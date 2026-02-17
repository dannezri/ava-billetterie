import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/client';
import prisma from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';

/**
 * @api {POST} /api/stripe-connect/payout
 * @description Déclenche un virement manuel (payout) de la totalité du solde disponible vers le compte bancaire lié.
 * 
 * @returns {Object} JSON response
 * - success: boolean
 * - payoutId: string
 * - amount: number (montant viré en centimes)
 * - arrival_date: number (timestamp d'arrivée prévue)
 * 
 * @error 400 Solde insuffisant ou erreur Stripe
 * @error 401 Non authentifié
 * @error 404 Compte Stripe non configuré
 * @error 500 Erreur serveur
 */
export async function POST(req: NextRequest) {
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

    // Récupérer le solde disponible
    const balance = await stripe.balance.retrieve({
      stripeAccount: dbUser.stripeAccountId,
    });

    // Calculer le montant total disponible (toutes devises confondues, mais on assume EUR ici)
    const availableAmount = balance.available.find(b => b.currency === 'eur')?.amount || 0;

    if (availableAmount <= 0) {
      return NextResponse.json({ error: 'Solde insuffisant pour effectuer un virement' }, { status: 400 });
    }

    // Créer le virement (payout) de tout le solde disponible
    const payout = await stripe.payouts.create(
      {
        amount: availableAmount,
        currency: 'eur',
        // method: 'standard', // ou 'instant' si supporté (frais supp)
      },
      { stripeAccount: dbUser.stripeAccountId }
    );

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
      amount: payout.amount,
      arrival_date: payout.arrival_date,
    });
  } catch (error) {
    console.error('Erreur lors du virement:', error);
    // Gestion des erreurs Stripe spécifiques
    if (error && typeof error === 'object' && 'type' in error && (error as any).type === 'StripeInvalidRequestError') {
       return NextResponse.json({ error: (error as any).message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur lors du virement' }, { status: 500 });
  }
}
