/**
 * API Route: GET /api/transactions/[id]/invoice
 * Génère et retourne la facture PDF d'une transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTransactionById } from '@/lib/services/transaction.service';

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

    // 2. Récupérer la transaction (avec vérification ownership)
    const { transaction } = await getTransactionById(params.id, session.user.id);

    // 3. Vérifier que l'utilisateur est l'acheteur
    if (transaction.buyer_id !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Seul l\'acheteur peut télécharger la facture',
        },
        { status: 403 }
      );
    }

    // 4. TODO: Générer le PDF de la facture (avec pdfkit ou react-pdf)
    // Pour MVP : Retourner les données JSON pour génération côté client
    // En production : Générer PDF serveur et retourner stream

    const invoiceData = {
      invoiceNumber: `INV-${new Date(transaction.created_at).toISOString().split('T')[0].replace(/-/g, '')}-${transaction.id.substring(0, 6).toUpperCase()}`,
      issueDate: transaction.created_at,
      buyer: {
        name: `${transaction.buyer.first_name} ${transaction.buyer.last_name}`,
        email: transaction.buyer.email,
      },
      items: [
        {
          description: `Billet - ${transaction.ticket.event.title}`,
          category: transaction.ticket.seat_category,
          date: transaction.ticket.event.event_date,
          quantity: 1,
          unitPrice: Number(transaction.ticket_price),
          total: Number(transaction.ticket_price),
        },
        {
          description: 'Frais de plateforme (5%)',
          quantity: 1,
          unitPrice: Number(transaction.platform_fee),
          total: Number(transaction.platform_fee),
        },
      ],
      subtotal: Number(transaction.ticket_price),
      fees: Number(transaction.platform_fee),
      total: Number(transaction.total_amount),
      paymentMethod: transaction.card_brand
        ? `${transaction.card_brand.toUpperCase()} **** ${transaction.card_last4}`
        : 'Carte bancaire',
      transactionId: transaction.stripe_payment_intent_id,
    };

    // Retour temporaire (JSON)
    return NextResponse.json({
      success: true,
      data: invoiceData,
    });

    // TODO Production: Générer et retourner PDF
    // const pdfBuffer = await generateInvoicePDF(invoiceData);
    // return new NextResponse(pdfBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="facture-${invoiceData.invoiceNumber}.pdf"`,
    //   },
    // });
  } catch (error) {
    console.error('[API] Generate invoice error:', error);

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
