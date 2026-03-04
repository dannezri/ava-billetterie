/**
 * API Route: GET /api/user/export-data
 * Exporte les données personnelles de l'utilisateur (RGPD)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exportUserData } from '@/lib/services/user.service';

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

    // 2. Exporter les données via service
    const data = await exportUserData(session.user.id);

    // 3. Retourner résultat au format JSON téléchargeable
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="export-donnees-${session.user.id}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('[API] Export user data error:', error);

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
