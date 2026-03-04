/**
 * API Route: GET /api/dashboard
 * Récupère les données pour le dashboard acheteur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/services/transaction.service';

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

    // 2. Récupérer les données dashboard via service
    const dashboardData = await getDashboardData(session.user.id);

    // 3. Retourner résultat
    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('[API] Get dashboard data error:', error);

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
