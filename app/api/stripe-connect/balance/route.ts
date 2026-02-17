import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/client';
import prisma from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';

/**
 * @api {GET} /api/stripe-connect/balance
 * @description Récupère le solde du compte Stripe Connect associé à l'utilisateur.
 * 
 * @returns {Object} JSON response
 * - available: number (montant disponible en centimes)
 * - pending: number (montant en attente en centimes)
 * - currency: string (devise, ex: 'eur')
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

    // Récupérer le solde du compte Stripe Connect
    const balance = await stripe.balance.retrieve({
      stripeAccount: dbUser.stripeAccountId,
    });

    // Formatter le solde (disponible et en attente)
    const available = balance.available.reduce((acc, current) => acc + current.amount, 0);
    const pending = balance.pending.reduce((acc, current) => acc + current.amount, 0);

    return NextResponse.json({
      available: available, // En centimes
      pending: pending, // En centimes
      currency: balance.available[0]?.currency || 'eur',
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
