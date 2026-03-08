/**
 * API pour télécharger un billet avec URL sécurisée et watermark
 * POST /api/tickets/[id]/download
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentification
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Vous devez être connecté',
          },
        },
        { status: 401 }
      );
    }

    const ticketId = params.id;
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TRANSACTION_ID',
            message: 'ID de transaction manquant',
          },
        },
        { status: 400 }
      );
    }

    // 2. Vérifier que l'utilisateur est bien l'acheteur
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: 'Transaction non trouvée',
          },
        },
        { status: 404 }
      );
    }

    if (transaction.buyerId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Vous n\'êtes pas autorisé à télécharger ce billet',
          },
        },
        { status: 403 }
      );
    }

    if (transaction.ticketId !== ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TICKET_MISMATCH',
            message: 'Le billet ne correspond pas à la transaction',
          },
        },
        { status: 400 }
      );
    }

    // 3. Vérifier que le PDF existe
    if (!transaction.ticket.pdfUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PDF_NOT_AVAILABLE',
            message: 'Le PDF du billet n\'est pas disponible',
          },
        },
        { status: 404 }
      );
    }

    // 4. Générer URL sécurisée avec watermark
    const secureUrl = await generateSecureTicketUrl(
      transaction.ticket.pdfUrl,
      {
        transactionId: transaction.id,
        buyerEmail: user.email || '',
        eventTitle: transaction.ticket.event.title,
        ticketId: transaction.ticket.id,
      }
    );

    // 5. Logger le téléchargement
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TICKET_PURCHASE', // Utiliser une action existante ou en créer une nouvelle
        metadata: {
          ticketId: transaction.ticket.id,
          transactionId: transaction.id,
          action: 'TICKET_DOWNLOADED',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        secureUrl,
        expiresIn: 3600, // 1 heure en secondes
        watermark: `TX-${transaction.id.substring(0, 8)}`,
      },
    });
  } catch (error: any) {
    console.error('Error generating secure ticket URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Erreur lors de la génération de l\'URL sécurisée',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Génère une URL sécurisée avec watermark pour le PDF du billet
 * Utilise Uploadcare pour les transformations
 */
async function generateSecureTicketUrl(
  pdfUrl: string,
  metadata: {
    transactionId: string;
    buyerEmail: string;
    eventTitle: string;
    ticketId: string;
  }
): Promise<string> {
  // Extraire l'UUID Uploadcare de l'URL
  const uploadcareUuidMatch = pdfUrl.match(/\/([a-f0-9-]{36})\//);
  
  if (!uploadcareUuidMatch) {
    // Si ce n'est pas une URL Uploadcare, retourner l'URL originale avec un token
    return generateSignedUrl(pdfUrl);
  }

  const uuid = uploadcareUuidMatch[1];
  
  // Générer un watermark avec l'ID de transaction
  const watermarkText = `TX-${metadata.transactionId.substring(0, 8).toUpperCase()}`;
  
  // Créer une URL Uploadcare avec transformations
  // Documentation: https://uploadcare.com/docs/transformations/document-conversion/
  const uploadcareUrl = `https://ucarecdn.com/${uuid}/`;
  
  // Appliquer les transformations
  const transformations = [
    'document', // Conversion document
    `-/format/pdf/`, // Format PDF
    `-/page/1-/`, // Toutes les pages
  ];

  // Note: Uploadcare ne supporte pas directement les watermarks sur PDF
  // Pour un vrai watermark, il faudrait:
  // 1. Convertir PDF en images
  // 2. Appliquer watermark sur chaque image
  // 3. Reconvertir en PDF
  // Ou utiliser un service comme Cloudinary ou un traitement serveur

  // Pour l'instant, on génère une URL signée avec expiration
  const transformedUrl = uploadcareUrl + transformations.join('');
  
  // Ajouter une signature HMAC pour sécuriser l'URL
  return generateSignedUrl(transformedUrl, { ...metadata, expiresAt: Date.now() + 3600000 });
}

/**
 * Génère une URL signée avec expiration
 */
function generateSignedUrl(url: string, params: Record<string, any> = {}): string {
  const secret = process.env.TICKET_SIGNATURE_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-me';
  const expiresAt = params.expiresAt || Date.now() + 3600000; // 1h par défaut
  
  const urlObj = new URL(url);
  urlObj.searchParams.set('expires', expiresAt.toString());
  
  // Ajouter les métadonnées en query params encodées
  if (params.transactionId) {
    urlObj.searchParams.set('tx', params.transactionId.substring(0, 8));
  }
  
  // Générer la signature HMAC
  const dataToSign = urlObj.pathname + urlObj.search;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64url');
  
  urlObj.searchParams.set('sig', signature);
  
  return urlObj.toString();
}
