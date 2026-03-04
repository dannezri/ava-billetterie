/**
 * API Route: GET /api/notifications
 * Récupère les notifications de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNotifications } from '@/lib/services/notification.service';
import { getNotificationsSchema } from '@/lib/validations/notification.validation';
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
      unread: searchParams.get('unread'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      type: searchParams.get('type'),
    };

    const validatedParams = getNotificationsSchema.parse(rawParams);

    // 3. Récupérer les notifications via service
    const result = await getNotifications(session.user.id, validatedParams);

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

    console.error('[API] Get notifications error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
