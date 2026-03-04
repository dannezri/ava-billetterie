/**
 * API Route: GET /api/transactions/[id]/download
 * Télécharge le PDF du billet (avec vérification sécurité)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canDownloadTicket, getTransactionById } from '@/lib/services/transaction.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Vérifier que l'utilisateur peut télécharger le billet
    const canDownload = await canDownloadTicket(params.id, session.user.id);

    if (!canDownload) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Vous ne pouvez pas télécharger ce billet. Il doit être en séquestre ou libéré.',
        },
        { status: 403 }
      );
    }

    // 3. Récupérer la transaction pour obtenir l'URL du PDF
    const { transaction } = await getTransactionById(params.id, session.user.id);

    if (!transaction.ticket.pdf_url) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'PDF du billet introuvable',
        },
        { status: 404 }
      );
    }

    // 4. Option A : Redirection vers URL présignée (Uploadcare/Cloudinary)
    // TODO: Générer URL présignée avec expiration 1h
    // const presignedUrl = await generatePresignedUrl(transaction.ticket.pdf_url);
    // return NextResponse.redirect(presignedUrl);

    // 4. Option B (temporaire) : Retourner l'URL directement
    // En production, utiliser URL présignée pour sécurité
    return NextResponse.json({
      success: true,
      data: {
        secureUrl: transaction.ticket.pdf_url,
        filename: `billet-${transaction.ticket.event.title.replace(/\s/g, '-')}.pdf`,
        transactionId: transaction.id,
      },
    });
  } catch (error) {
    console.error('[API] Download ticket error:', error);

    if (error instanceof Error) {
      if (error.message === 'Transaction not found') {
        return NextResponse.json({ error: 'Not found', message: 'Transaction introuvable' }, { status: 404 });
      }

      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden', message: 'Accès refusé' }, { status: 403 });
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
