/**
 * API Route: GET /api/reviews/user/[userId]
 * Récupère les avis d'un vendeur (publics)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserReviews } from '@/lib/services/review.service';
import { getUserReviewsSchema } from '@/lib/validations/review.validation';
import { z } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // 1. Parser & valider query params
    const { searchParams } = new URL(request.url);
    const rawParams = {
      userId: params.userId,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    };

    const validatedParams = getUserReviewsSchema.parse(rawParams);

    // 2. Récupérer les avis via service
    const result = await getUserReviews(params.userId, validatedParams);

    // 3. Retourner résultat
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

    console.error('[API] Get user reviews error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
