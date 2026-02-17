/**
 * Service d'envoi d'emails (Abstraction)
 * Utilise Resend en production, log en console en développement si pas de clé
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail(to: string, subject: string, html: string) {
  if (RESEND_API_KEY) {
    // Implémentation Resend réelle
    try {
      // Pour l'instant on simule, à décommenter quand Resend sera installé
      /*
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: 'Ava <noreply@ava-ticketing.com>',
        to,
        subject,
        html,
      });
      */
      console.log(`📧 [MOCK RESEND] Email envoyé à ${to} : ${subject}`);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
    }
  } else {
    // Fallback développement
    console.log('📨 ================= EMAIL SENT =================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- HTML ---');
    console.log(html);
    console.log('===============================================');
  }
}

/**
 * Email de confirmation KYC
 */
export async function sendKycVerifiedEmail(email: string, name: string = 'Vendeur') {
  const subject = '✅ Identité vérifiée - Vous pouvez vendre sur Ava';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Félicitations ${name} !</h1>
      <p>Votre identité a été vérifiée avec succès.</p>
      <p>Vous avez maintenant accès à toutes les fonctionnalités de vente sur Ava :</p>
      <ul>
        <li>Mise en vente illimitée</li>
        <li>Retrait des fonds</li>
        <li>Badge "Vendeur Vérifié"</li>
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Accéder à mon dashboard
        </a>
      </p>
      <p>À bientôt,<br>L'équipe Ava</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Email d'échec KYC
 */
export async function sendKycRejectedEmail(email: string, reason: string) {
  const subject = '⚠️ Problème avec votre vérification d\'identité';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Action requise</h1>
      <p>Nous n'avons pas pu vérifier votre identité automatiquement.</p>
      <p>Raison possible : <strong>${reason}</strong></p>
      <p>Merci de réessayer avec un document plus clair ou différent.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/settings" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Réessayer la vérification
        </a>
      </p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Email d'approbation de billet
 */
export async function sendTicketApprovedEmail(
  email: string,
  name: string,
  eventTitle: string,
  ticketId: string
) {
  const subject = `✅ Votre billet pour "${eventTitle}" est approuvé !`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Bonne nouvelle ${name} !</h1>
      <p>Votre billet pour <strong>${eventTitle}</strong> a été validé par notre équipe.</p>
      <p>Il est maintenant visible sur la marketplace et disponible à l'achat.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/sales" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Voir mes billets en vente
        </a>
      </p>
      <p>Vous recevrez une notification dès qu'un acheteur sera intéressé.</p>
      <p>À bientôt,<br>L'équipe Ava</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Email de rejet de billet
 */
export async function sendTicketRejectedEmail(
  email: string,
  name: string,
  eventTitle: string,
  reason: string
) {
  const subject = `⚠️ Problème avec votre billet pour "${eventTitle}"`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Action requise ${name}</h1>
      <p>Malheureusement, nous n'avons pas pu valider votre billet pour <strong>${eventTitle}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>Raison du rejet :</strong>
        <p style="margin: 10px 0 0 0;">${reason}</p>
      </div>
      <p>Vous pouvez :</p>
      <ul>
        <li>Vérifier que le PDF est lisible et complet</li>
        <li>Vous assurer que le prix ne dépasse pas le prix facial</li>
        <li>Soumettre un nouveau billet avec un document valide</li>
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/sell-ticket" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Soumettre un nouveau billet
        </a>
      </p>
      <p>Besoin d'aide ? Répondez à cet email, notre équipe vous aidera.</p>
      <p>L'équipe Ava</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Email de demande d'informations complémentaires
 */
export async function sendTicketInfoRequestEmail(
  email: string,
  name: string,
  eventTitle: string,
  message: string,
  ticketId: string
) {
  const subject = `ℹ️ Informations requises pour votre billet "${eventTitle}"`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Bonjour ${name},</h1>
      <p>Notre équipe a besoin d'informations complémentaires concernant votre billet pour <strong>${eventTitle}</strong>.</p>
      <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <strong>Message de l'équipe :</strong>
        <p style="margin: 10px 0 0 0;">${message}</p>
      </div>
      <p>Merci de répondre à cet email avec les informations demandées dans les plus brefs délais.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Voir mon dashboard
        </a>
      </p>
      <p>Merci de votre coopération,<br>L'équipe Ava</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}
