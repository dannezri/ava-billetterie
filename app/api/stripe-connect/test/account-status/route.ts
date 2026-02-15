import { NextRequest, NextResponse } from 'next/server';
import { getAccountStatus } from '@/services/stripe-connect';
import { isDevelopment } from '@/config/env';

/**
 * Route de TEST pour récupérer le statut d'un compte Stripe Connect
 * ⚠️ DÉSACTIVÉE EN PRODUCTION - Bypass l'authentification
 */
export async function GET(req: NextRequest) {
  // Vérifier qu'on est en développement
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Cette route de test n\'est disponible qu\'en développement' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId requis en paramètre' },
        { status: 400 }
      );
    }

    const status = await getAccountStatus(accountId);

    return NextResponse.json({
      success: true,
      status,
      warning: 'Ceci est une route de test - désactivée en production',
    });
  } catch (error) {
    console.error('Error retrieving test account status:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
