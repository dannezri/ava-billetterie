/**
 * API Route: POST /api/user/avatar
 * Upload l'avatar de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadAvatar } from '@/lib/services/user.service';

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

    // 2. Parser FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Fichier requis',
        },
        { status: 400 }
      );
    }

    // 3. Valider le fichier
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Fichier trop volumineux (max 5MB)',
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'Type de fichier non autorisé (JPEG, PNG, WebP uniquement)',
        },
        { status: 400 }
      );
    }

    // 4. Upload via service
    const result = await uploadAvatar(session.user.id, file);

    // 5. Retourner résultat
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Avatar mis à jour avec succès',
    });
  } catch (error) {
    console.error('[API] Upload avatar error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
