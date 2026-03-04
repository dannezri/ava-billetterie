/**
 * API Routes: /api/disputes
 * GET - Liste des litiges de l'utilisateur
 * POST - Créer un nouveau litige
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDispute, getUserDisputes } from '@/lib/services/dispute.service';
import { createDisputeSchema } from '@/lib/validations/dispute';
import { z } from 'zod';

/**
 * GET /api/disputes
 * Récupère les litiges de l'utilisateur (acheteur ou vendeur)
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

    // 2. Parser query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const role = searchParams.get('role') as 'buyer' | 'seller' | undefined;

    // 3. Récupérer les litiges via service
    const disputes = await getUserDisputes(session.user.id, { status, role });

    // 4. Retourner résultat
    return NextResponse.json({
      success: true,
      data: {
        disputes,
        count: disputes.length,
      },
    });
  } catch (error) {
    console.error('[API] Get disputes error:', error);

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
 * POST /api/disputes
 * Crée un nouveau litige
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
    const validatedData = createDisputeSchema.parse(body);

    // 3. Créer le litige via service
    const dispute = await createDispute(validatedData, session.user.id);

    // 4. Retourner résultat
    return NextResponse.json(
      {
        success: true,
        data: dispute,
        message: 'Litige ouvert. Notre équipe examine votre demande.',
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

    console.error('[API] Create dispute error:', error);

    if (error instanceof Error) {
      // Erreurs métier spécifiques
      if (error.message === 'Transaction not found') {
        return NextResponse.json({ error: 'Not found', message: 'Transaction introuvable' }, { status: 404 });
      }

      if (error.message === 'A dispute already exists for this transaction') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Un litige existe déjà pour cette transaction' },
          { status: 409 }
        );
      }

      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden', message: error.message }, { status: 403 });
      }

      if (error.message.includes('can only be opened')) {
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
