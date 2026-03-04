/**
 * API Route: POST /api/disputes/[id]/messages
 * Ajoute un message à la timeline d'un litige
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addDisputeMessage } from '@/lib/services/dispute.service';
import { z } from 'zod';

const addMessageSchema = z.object({
  message: z
    .string()
    .min(2, 'Message trop court (minimum 2 caractères)')
    .max(2000, 'Message trop long (maximum 2000 caractères)'),
  attachmentUrls: z.array(z.string().url()).max(5).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentification requise' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = addMessageSchema.parse(body);

    const newMessage = await addDisputeMessage(
      params.id,
      session.user.id,
      validated.message,
      validated.attachmentUrls
    );

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
        message: 'Message ajouté',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'Dispute not found') {
        return NextResponse.json(
          { error: 'Not found', message: 'Litige introuvable' },
          { status: 404 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes('Cannot add messages')) {
        return NextResponse.json(
          { error: 'Bad request', message: error.message },
          { status: 400 }
        );
      }
    }

    console.error('[API] Add dispute message error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
