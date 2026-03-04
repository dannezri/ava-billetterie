/**
 * API Route: POST /api/user/preferences
 * Met à jour les préférences de notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateNotificationPreferences } from '@/lib/services/user.service';
import { updatePreferencesSchema } from '@/lib/validations/user.validation';
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
    const validatedData = updatePreferencesSchema.parse({
      ...body,
      userId: session.user.id,
    });

    // 3. Mettre à jour les préférences via service
    const updatedPreferences = await updateNotificationPreferences(
      session.user.id,
      validatedData
    );

    // 4. Retourner résultat
    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      message: 'Préférences mises à jour avec succès',
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

    console.error('[API] Update preferences error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
