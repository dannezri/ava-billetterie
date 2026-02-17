import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { TicketStatus, TicketVerificationStatus } from '@prisma/client';

/**
 * Schéma de validation pour la création d'un billet
 */
const createTicketSchema = z.object({
  eventId: z.string().uuid('ID événement invalide'),
  originalPrice: z.number().min(1).max(5000),
  sellingPrice: z.number().min(1).max(5000),
  section: z.string().min(1).max(100),
  row: z.string().max(50).optional().transform(val => val === '' ? undefined : val),
  seatNumber: z.string().max(50).optional().transform(val => val === '' ? undefined : val),
  pdfUrl: z.string().url('URL PDF invalide'),
  pdfHash: z.string().min(1, 'Hash PDF requis'),
  barcodeNumber: z.string().min(5).max(50).optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  {
    message: 'Le prix de vente ne peut pas dépasser le prix facial',
    path: ['sellingPrice'],
  }
);

/**
 * POST /api/tickets/create
 * Créer un nouveau billet à vendre
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 2. Récupérer l'utilisateur depuis la DB
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // 3. Vérifier le statut KYC
    if (dbUser.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        { 
          error: 'KYC non vérifié',
          message: 'Vous devez vérifier votre identité avant de vendre des billets',
          code: 'KYC_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // 4. Valider les données
    const body = await request.json();
    console.log('📥 Body reçu:', body);
    
    const validatedData = createTicketSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    // 5. Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // 6. Vérifier les doublons (code-barres et hash PDF)
    if (validatedData.barcodeNumber) {
      const existingBarcode = await prisma.ticket.findFirst({
        where: {
          barcodeNumber: validatedData.barcodeNumber,
          status: {
            notIn: ['CANCELLED'],
          },
        },
      });

      if (existingBarcode) {
        return NextResponse.json(
          { 
            error: 'Billet en doublon',
            message: 'Un billet avec ce code-barres existe déjà',
            code: 'DUPLICATE_BARCODE'
          },
          { status: 409 }
        );
      }
    }

    const existingHash = await prisma.ticket.findFirst({
      where: {
        pdfHash: validatedData.pdfHash,
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    if (existingHash) {
      return NextResponse.json(
        { 
          error: 'Billet en doublon',
          message: 'Ce fichier PDF a déjà été uploadé',
          code: 'DUPLICATE_PDF_HASH'
        },
        { status: 409 }
      );
    }

    // 7. Créer le billet
    const ticket = await prisma.ticket.create({
      data: {
        eventId: validatedData.eventId,
        sellerId: dbUser.id,
        status: TicketStatus.PENDING_VALIDATION,
        verificationStatus: TicketVerificationStatus.PENDING,
        originalPrice: validatedData.originalPrice,
        price: validatedData.sellingPrice,
        section: validatedData.section,
        row: validatedData.row || null,
        seatNumber: validatedData.seatNumber || null,
        pdfUrl: validatedData.pdfUrl,
        pdfHash: validatedData.pdfHash,
        barcodeNumber: validatedData.barcodeNumber || null,
      },
      include: {
        event: true,
      },
    });

    // 8. Logger l'action (audit trail)
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: 'TICKET_UPLOAD',
        metadata: {
          ticketId: ticket.id,
          eventId: validatedData.eventId,
          price: validatedData.sellingPrice,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // 9. TODO: Envoyer notification à l'équipe de validation
    // await sendNotificationToValidationTeam(ticket);

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: 'Billet créé avec succès. Il sera vérifié par notre équipe dans les prochaines heures.',
      ticket: {
        id: ticket.id,
        status: ticket.status,
        verificationStatus: ticket.verificationStatus,
        event: {
          title: ticket.event.title,
          eventDate: ticket.event.eventDate,
        },
      },
    });

  } catch (error) {
    console.error('❌ Error creating ticket:', error);

    // Erreur de validation Zod
    if (error instanceof z.ZodError) {
      console.error('❌ Validation Zod errors:', error.errors);
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      { error: 'Erreur lors de la création du billet' },
      { status: 500 }
    );
  }
}
