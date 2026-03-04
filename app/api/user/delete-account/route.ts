/**
 * API Route: DELETE /api/user/delete-account
 * Supprime le compte utilisateur (soft delete + anonymisation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteUserAccount } from '@/lib/services/user.service';
import { deleteAccountSchema } from '@/lib/validations/user.validation';
import { z } from 'zod';

export async function DELETE(request: NextRequest) {
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
    const validatedData = deleteAccountSchema.parse({
      ...body,
      userId: session.user.id,
    });

    // 3. Supprimer le compte via service (avec validation du mot de passe)
    const { password } = validatedData;
    await deleteUserAccount(session.user.id, password);

    // 4. Déconnecter l'utilisateur
    await supabase.auth.signOut();

    // 5. Retourner résultat
    return NextResponse.json({
      success: true,
      message: 'Votre compte a été supprimé avec succès. Vos données ont été anonymisées.',
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

    console.error('[API] Delete account error:', error);

    if (error instanceof Error) {
      if (error.message.includes('password')) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Mot de passe incorrect',
          },
          { status: 401 }
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
