/**
 * API Routes: /api/user/profile
 * GET - Récupérer le profil utilisateur
 * PATCH - Mettre à jour le profil utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile, updateUserProfile } from '@/lib/services/user.service';
import { updateProfileSchema } from '@/lib/validations/user.validation';
import { z } from 'zod';

/**
 * GET /api/user/profile
 * Récupère le profil complet de l'utilisateur
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

    // 2. Récupérer le profil via service
    const profile = await getUserProfile(session.user.id);

    // 3. Retourner résultat
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[API] Get profile error:', error);

    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ error: 'Not found', message: 'Utilisateur introuvable' }, { status: 404 });
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

/**
 * PATCH /api/user/profile
 * Met à jour le profil de l'utilisateur
 */
export async function PATCH(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse({
      ...body,
      userId: session.user.id,
    });

    // 3. Mettre à jour le profil via service
    const updatedProfile = await updateUserProfile(session.user.id, validatedData);

    // 4. Retourner résultat
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profil mis à jour avec succès',
    });
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

    console.error('[API] Update profile error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
