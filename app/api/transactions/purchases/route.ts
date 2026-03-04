/**
 * API Route: GET /api/transactions/purchases
 * Récupère la liste des achats de l'utilisateur connecté
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserPurchases } from '@/lib/services/transaction.service';
import { getUserPurchasesSchema } from '@/lib/validations/transaction.validation';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Parser & valider query params
    const { searchParams } = new URL(request.url);
    const rawParams = {
      filter: searchParams.get('filter') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedParams = getUserPurchasesSchema.parse(rawParams);

    // 3. Récupérer les achats via service
    const result = await getUserPurchases(session.user.id, validatedParams);

    // 4. Retourner résultat
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Paramètres invalides',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('[API] Get purchases error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
