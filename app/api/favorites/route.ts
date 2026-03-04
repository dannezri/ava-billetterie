/**
 * API Routes: /api/favorites
 * GET - Liste des favoris de l'utilisateur
 * POST - Ajouter un événement aux favoris
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserFavorites, addFavorite } from '@/lib/services/favorite.service';
import { getUserFavoritesSchema, addFavoriteSchema } from '@/lib/validations/favorite.validation';
import { z } from 'zod';

/**
 * GET /api/favorites
 * Récupère la liste des favoris de l'utilisateur
 */
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
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = getUserFavoritesSchema.parse(rawParams);

    // 3. Récupérer les favoris via service
    const result = await getUserFavorites(session.user.id, validatedParams);

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

    console.error('[API] Get favorites error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Ajoute un événement aux favoris
 */
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
    const validatedData = addFavoriteSchema.parse(body);

    // 3. Ajouter aux favoris via service
    const favorite = await addFavorite(session.user.id, validatedData.eventId);

    // 4. Retourner résultat
    return NextResponse.json(
      {
        success: true,
        data: favorite,
        message: 'Événement ajouté aux favoris',
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

    console.error('[API] Add favorite error:', error);

    if (error instanceof Error) {
      if (error.message === 'Event not found') {
        return NextResponse.json({ error: 'Not found', message: 'Événement introuvable' }, { status: 404 });
      }

      if (error.message === 'Event already in favorites') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Événement déjà dans vos favoris' },
          { status: 409 }
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
