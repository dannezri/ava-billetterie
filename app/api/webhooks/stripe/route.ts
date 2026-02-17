/**
 * Stripe Webhooks Handler
 * Gère les événements Stripe (paiements, KYC, transferts)
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db/prisma';
import stripe from '@/lib/stripe/client';

// Désactiver le body parser de Next.js pour les webhooks Stripe
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('❌ Missing signature or webhook secret');
      return NextResponse.json(
        { error: 'Webhook signature or secret missing' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log('✅ Webhook event received:', event.type);

    // Router les événements selon leur type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'identity.verification_session.verified':
        await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'identity.verification_session.requires_input':
        await handleIdentityRequiresInput(event.data.object as Stripe.Identity.VerificationSession);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Paiement réussi → Mettre à jour la transaction en séquestre + Envoyer emails
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);

  const transactionId = paymentIntent.metadata.transactionId;

  if (!transactionId) {
    console.error('❌ Missing transactionId in metadata');
    return;
  }

  try {
    // Récupérer la transaction avec toutes les relations
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      console.error('❌ Transaction not found:', transactionId);
      return;
    }

    // Mettre à jour la transaction en séquestre
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'ESCROWED',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Mettre à jour le statut du billet
    await prisma.ticket.update({
      where: { id: transaction.ticketId },
      data: { status: 'SOLD' },
    });

    // Créer un audit log
    await prisma.auditLog.create({
      data: {
        userId: transaction.buyerId,
        action: 'PAYMENT_SUCCEEDED',
        metadata: {
          transactionId: transaction.id,
          paymentIntentId: paymentIntent.id,
          amount: transaction.amount,
        },
      },
    });

    console.log('✅ Transaction updated to ESCROWED, ticket marked as SOLD');

    // Envoyer les emails
    await sendPurchaseConfirmationEmails(transaction);

  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

/**
 * Envoyer les emails de confirmation d'achat
 */
async function sendPurchaseConfirmationEmails(transaction: any) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Format de la date de l'événement
    const eventDate = new Date(transaction.ticket.event.eventDate);
    const formattedDate = eventDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Format de la date de libération du séquestre
    const releaseDate = new Date(transaction.escrowReleaseDate);
    const formattedReleaseDate = releaseDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Email à l'acheteur
    await resend.emails.send({
      from: 'AVA Billetterie <noreply@ava-tickets.com>',
      to: transaction.buyer.email,
      subject: `✅ Achat confirmé - ${transaction.ticket.event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2B87E3; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .ticket-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }
              .button { display: inline-block; padding: 12px 24px; background: #2B87E3; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Achat confirmé !</h1>
              </div>
              <div class="content">
                <p>Bonjour ${transaction.buyer.name || 'cher client'},</p>
                <p>Votre achat de billet a été confirmé avec succès !</p>
                
                <div class="ticket-info">
                  <h2>📋 Récapitulatif</h2>
                  <p><strong>Événement :</strong> ${transaction.ticket.event.title}</p>
                  <p><strong>Date :</strong> ${formattedDate}</p>
                  <p><strong>Lieu :</strong> ${transaction.ticket.event.venue}, ${transaction.ticket.event.city}</p>
                  ${transaction.ticket.section ? `<p><strong>Placement :</strong> ${transaction.ticket.section}</p>` : ''}
                  <p><strong>Montant payé :</strong> ${Number(transaction.amount).toFixed(2)}€</p>
                </div>

                <p><strong>🎟️ Votre billet</strong></p>
                <p>Votre billet est maintenant disponible dans votre espace personnel.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  Télécharger mon billet
                </a>

                <p><strong>🛡️ Protection acheteur</strong></p>
                <p>Votre paiement est sécurisé par notre système de séquestre. Les fonds seront transférés au vendeur 2 jours après l'événement, vous laissant le temps de signaler tout problème.</p>

                <p><strong>📧 Besoin d'aide ?</strong></p>
                <p>Notre équipe est à votre disposition : <a href="mailto:support@ava-tickets.com">support@ava-tickets.com</a></p>
              </div>
              <div class="footer">
                <p>© 2026 AVA Billetterie - Plateforme de revente de billets éthique</p>
                <p>Cet email a été envoyé à ${transaction.buyer.email}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Email au vendeur
    await resend.emails.send({
      from: 'AVA Billetterie <noreply@ava-tickets.com>',
      to: transaction.seller.email,
      subject: `💰 Vente réalisée - ${transaction.ticket.event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10B981; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .sale-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2B87E3; }
              .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Vente réalisée !</h1>
              </div>
              <div class="content">
                <p>Bonjour ${transaction.seller.name || 'cher vendeur'},</p>
                <p>Félicitations ! Votre billet a été vendu avec succès.</p>
                
                <div class="sale-info">
                  <h2>📋 Détails de la vente</h2>
                  <p><strong>Événement :</strong> ${transaction.ticket.event.title}</p>
                  <p><strong>Date événement :</strong> ${formattedDate}</p>
                  ${transaction.ticket.section ? `<p><strong>Placement :</strong> ${transaction.ticket.section}</p>` : ''}
                  <p><strong>Prix de vente :</strong> ${Number(transaction.ticket.price).toFixed(2)}€</p>
                  <p><strong>Frais plateforme (5%) :</strong> ${Number(transaction.platformFee).toFixed(2)}€</p>
                  <p><strong>Montant net :</strong> ${(Number(transaction.amount) - Number(transaction.platformFee)).toFixed(2)}€</p>
                </div>

                <p><strong>💸 Paiement</strong></p>
                <p>Votre paiement sera disponible le <strong>${formattedReleaseDate}</strong> (2 jours après l'événement).</p>
                <p>Les fonds seront automatiquement transférés sur votre compte Stripe Connect.</p>

                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller" class="button">
                  Voir mes ventes
                </a>

                <p><strong>🛡️ Système de séquestre</strong></p>
                <p>Le paiement est sécurisé par notre système de séquestre. Cela garantit la satisfaction de l'acheteur et protège votre réputation de vendeur.</p>

                <p><strong>📧 Questions ?</strong></p>
                <p>Contactez-nous : <a href="mailto:support@ava-tickets.com">support@ava-tickets.com</a></p>
              </div>
              <div class="footer">
                <p>© 2026 AVA Billetterie - Plateforme de revente de billets éthique</p>
                <p>Cet email a été envoyé à ${transaction.seller.email}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Confirmation emails sent to buyer and seller');
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    // Ne pas faire échouer le webhook si l'email échoue
  }
}

/**
 * Paiement échoué → Libérer la réservation
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  const ticketId = paymentIntent.metadata.ticket_id;

  if (!ticketId) {
    return;
  }

  try {
    // Remettre le billet en vente
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'ACTIVE' },
    });

    console.log('✅ Ticket released back to marketplace');
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

/**
 * Charge réussie (confirmation supplémentaire)
 */
async function handleChargeSucceeded(charge: Stripe.Charge) {
  console.log('💳 Charge succeeded:', charge.id);
  // Log pour audit
  // TODO: Créer audit log
}

/**
 * Transfert créé → Séquestre libéré vers le vendeur
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log('💸 Transfer created:', transfer.id);

  const transactionId = transfer.metadata.transaction_id;

  if (!transactionId) {
    console.error('❌ Missing transaction_id in transfer metadata');
    return;
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'RELEASED',
        stripeTransferId: transfer.id,
        releasedAt: new Date(),
      },
    });

    console.log('✅ Transaction marked as released');

    // TODO: Envoyer email au vendeur
  } catch (error) {
    console.error('❌ Error handling transfer:', error);
  }
}

/**
 * KYC vérifié → Mettre à jour le statut utilisateur
 */
async function handleIdentityVerified(
  session: Stripe.Identity.VerificationSession
) {
  console.log('✅ Identity verified:', session.id);

  const userId = session.metadata?.user_id;

  if (!userId) {
    console.error('❌ Missing user_id in verification session metadata');
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'VERIFIED',
        kycProviderId: session.id,
      },
    });

    console.log('✅ User KYC status updated to VERIFIED');

    // TODO: Envoyer email de confirmation
  } catch (error) {
    console.error('❌ Error updating KYC status:', error);
  }
}

/**
 * KYC nécessite input supplémentaire
 */
async function handleIdentityRequiresInput(
  session: Stripe.Identity.VerificationSession
) {
  console.log('⚠️ Identity requires input:', session.id);

  const userId = session.metadata?.user_id;

  if (!userId) {
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING',
      },
    });

    console.log('✅ User KYC status updated to PENDING');

    // TODO: Envoyer email demandant plus d'informations
  } catch (error) {
    console.error('❌ Error updating KYC status:', error);
  }
}
