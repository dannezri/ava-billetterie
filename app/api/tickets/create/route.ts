import { prisma } from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';
import { TicketStatus, TicketVerificationStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
  // Données extraction automatique (optionnelles)
  extractedPrice: z.number().min(0).max(5000).optional(),
  extractionConfidence: z.number().min(0).max(1).optional(),
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

    // 3. ✨ NOUVEAU PARADIGME : Pas de vérification KYC pour créer un billet
    // Le KYC est uniquement requis au moment du retrait des gains

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
    // Désactivé en mode test via SKIP_DUPLICATE_TICKET_CHECK=true dans .env.local
    const skipDuplicateCheck = process.env.SKIP_DUPLICATE_TICKET_CHECK === 'true';

    if (!skipDuplicateCheck && validatedData.barcodeNumber) {
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

    // Un même PDF multi-pages peut contenir plusieurs billets avec des codes-barres différents.
    // On ne bloque que si le couple (pdfHash + barcodeNumber) est identique,
    // ce qui correspond à un vrai doublon du même billet.
    if (!skipDuplicateCheck && validatedData.barcodeNumber && validatedData.pdfHash) {
      const existingHash = await prisma.ticket.findFirst({
        where: {
          pdfHash: validatedData.pdfHash,
          barcodeNumber: validatedData.barcodeNumber,
          status: {
            notIn: ['CANCELLED'],
          },
        },
      });

      if (existingHash) {
        return NextResponse.json(
          { 
            error: 'Billet en doublon',
            message: 'Ce fichier PDF a déjà été uploadé pour ce code-barres',
            code: 'DUPLICATE_PDF_HASH'
          },
          { status: 409 }
        );
      }
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
        // Données extraction automatique
        extractedPrice: validatedData.extractedPrice ?? null,
        extractionConfidence: validatedData.extractionConfidence ?? null,
      },
      include: {
        event: true,
      },
    });

    // 7.5 Stocker définitivement le fichier sur Uploadcare (secret key côté serveur)
    // Nécessaire car le paramètre store:true du client upload peut être ignoré
    // si le projet Uploadcare a "Allow client uploads to control store time" désactivé.
    const ucPublicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
    const ucSecretKey = process.env.UPLOADCARE_SECRET_KEY;
    const fileUuid = validatedData.pdfHash; // pdfHash contient l'UUID Uploadcare
    if (ucPublicKey && ucSecretKey && fileUuid && /^[0-9a-f-]{36}$/.test(fileUuid)) {
      try {
        const ucAuthHeader = `Uploadcare.Simple ${ucPublicKey}:${ucSecretKey}`;
        const storeRes = await fetch(`https://api.uploadcare.com/files/${fileUuid}/storage/`, {
          method: 'PUT',
          headers: {
            Authorization: ucAuthHeader,
            Accept: 'application/vnd.uploadcare-v0.7+json',
          },
        });
        if (storeRes.ok) {
          // Récupérer l'URL CDN canonique depuis l'API Uploadcare
          const infoRes = await fetch(`https://api.uploadcare.com/files/${fileUuid}/`, {
            headers: {
              Authorization: ucAuthHeader,
              Accept: 'application/vnd.uploadcare-v0.7+json',
            },
          });
          if (infoRes.ok) {
            const info = await infoRes.json();
            const canonicalUrl: string = info.original_file_url ?? validatedData.pdfUrl;
            // Mettre à jour le billet avec l'URL CDN canonique si différente
            if (canonicalUrl && canonicalUrl !== validatedData.pdfUrl) {
              await prisma.ticket.update({
                where: { id: ticket.id },
                data: { pdfUrl: canonicalUrl },
              });
            }
          }
        }
      } catch (ucErr) {
        // Non-bloquant : l'upload a réussi, le stockage sera tenté manuellement si besoin
        console.warn('[tickets/create] Uploadcare store warning:', ucErr);
      }
    }

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
