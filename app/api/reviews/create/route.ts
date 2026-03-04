/**
 * API Route: POST /api/reviews/create
 * Crée un nouvel avis sur un vendeur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createReview } from '@/lib/services/review.service';
import { createReviewSchema } from '@/lib/validations/review.validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Parser & valider body
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // 3. Créer l'avis via service
    const review = await createReview(validatedData, session.user.id);

    // 4. Retourner résultat
    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Avis soumis pour modération. Merci !',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Données invalides',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('[API] Create review error:', error);

    if (error instanceof Error) {
      // Erreurs métier spécifiques
      if (error.message === 'Transaction not found') {
        return NextResponse.json({ error: 'Not found', message: 'Transaction introuvable' }, { status: 404 });
      }

      if (error.message === 'A review already exists for this transaction') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Vous avez déjà laissé un avis pour cette transaction' },
          { status: 409 }
        );
      }

      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden', message: error.message }, { status: 403 });
      }

      if (error.message.includes('can only be left')) {
        return NextResponse.json(
          { error: 'Bad request', message: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
