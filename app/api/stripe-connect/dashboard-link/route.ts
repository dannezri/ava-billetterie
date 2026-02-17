import { NextRequest, NextResponse } from 'next/server';
import { createLoginLink, getUserConnectAccountId } from '@/services/stripe-connect';
import { createClient } from '@/lib/supabase/server-client';

/**
 * @api {POST} /api/stripe-connect/dashboard-link
 * @description Génère un lien de connexion éphémère vers le Dashboard Stripe Express pour permettre au vendeur de gérer ses informations bancaires et fiscales.
 * 
 * @returns {Object} JSON response
 * - success: boolean
 * - url: string (Lien vers Stripe Express)
 * 
 * @error 401 Non authentifié
 * @error 404 Compte Stripe non trouvé
 * @error 500 Erreur serveur
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'accountId depuis la base de données
    const accountId = await getUserConnectAccountId(user.id);

    if (!accountId) {
      return NextResponse.json({ error: 'Aucun compte Stripe Connect trouvé' }, { status: 404 });
    }

    const url = await createLoginLink(accountId);

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Error creating dashboard link:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du lien dashboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
