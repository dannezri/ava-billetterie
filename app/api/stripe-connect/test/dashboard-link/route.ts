import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/client';
import { isDevelopment } from '@/config/env';

/**
 * Route de TEST pour générer un lien dashboard
 * ⚠️ DÉSACTIVÉE EN PRODUCTION - Bypass l'authentification
 */
export async function POST(req: NextRequest) {
  // Vérifier qu'on est en développement
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Cette route de test n\'est disponible qu\'en développement' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId requis dans le body' },
        { status: 400 }
      );
    }

    // Pour les comptes Custom, on utilise un lien "Update" au lieu d'un lien "Dashboard Express"
    // car ils n'ont pas accès au Dashboard Express.
    // Cela les redirige vers le formulaire d'onboarding/settings hébergé par Stripe.
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'http://localhost:3000/api/stripe-connect/test/refresh', // URL dummy pour le test
      return_url: 'http://localhost:3000/api/stripe-connect/test/return',   // URL dummy pour le test
      type: 'account_update',
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      warning: 'Ceci est une route de test - désactivée en production',
      note: 'Lien de type "account_update" (pour Custom Accounts)',
    });
  } catch (error) {
    console.error('Error creating test dashboard link:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du lien dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
