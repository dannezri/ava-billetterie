# Workflow Achat de Billet - Plateforme Billets Éthique

## Vue d'Ensemble

Processus complet d'achat d'un billet avec système de séquestre bancaire J+2 pour protection maximale de l'acheteur.

**Durée totale** : Achat instantané → Libération vendeur J+2 après événement (variable selon date concert)

**Acteurs** :
- 👤 Acheteur (utilisateur authentifié)
- 🏪 Vendeur (utilisateur vérifié KYC)
- 🏦 Stripe (processeur paiement + séquestre)
- 🤖 Plateforme (validation, orchestration)

---

## Étapes Détaillées

### ÉTAPE 1 : Découverte & Sélection Billet

**Page** : `/events/[id]` ou `/events/[id]/tickets/[ticketId]`

**Actions Utilisateur** :
1. Navigation marketplace → Événement
2. Consultation billets disponibles
3. Sélection billet (clic "Voir le billet")
4. Vérification détails :
   - Prix de vente ≤ prix facial ✅
   - Catégorie siège
   - Trust Score vendeur
   - Badge "Vérifié" admin

**Conditions** :
- Billet `status = ACTIVE`
- Événement `event_date > NOW()`
- Vendeur `kyc_status = VERIFIED`

---

### ÉTAPE 2 : Initiation Achat (Réservation Temporaire)

**Déclencheur** : Clic bouton "Acheter maintenant"

**Frontend** : `/events/[id]/tickets/[ticketId]`
```typescript
const handleBuyClick = async () => {
  // 1. Vérifier authentification
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Redirection login avec returnUrl
    router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    return;
  }
  
  // 2. Initier réservation
  const res = await fetch('/api/tickets/reserve', {
    method: 'POST',
    body: JSON.stringify({ ticket_id: ticketId }),
  });
  
  if (!res.ok) {
    const { error } = await res.json();
    toast.error(error.message); // Ex: "Ce billet vient d'être vendu"
    return;
  }
  
  // 3. Redirect checkout
  router.push(`/checkout/${ticketId}`);
};
```

**Backend** : `POST /api/tickets/reserve`
```typescript
export async function POST(request: NextRequest) {
  const session = await getSession(); // Supabase Auth
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { ticket_id } = await request.json();
  
  // Transaction atomique Prisma
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier disponibilité (race condition protection)
      const ticket = await tx.ticket.findUnique({
        where: { id: ticket_id },
        include: { event: true },
      });
      
      if (!ticket || ticket.status !== 'ACTIVE') {
        throw new Error('Billet non disponible');
      }
      
      // 2. Créer transaction (status: PENDING)
      const transaction = await tx.transaction.create({
        data: {
          ticket_id,
          buyer_id: session.user.id,
          seller_id: ticket.seller_id,
          ticket_price: ticket.selling_price,
          platform_fee: ticket.selling_price * 0.05, // 5%
          total_amount: ticket.selling_price * 1.05,
          seller_net_amount: ticket.selling_price,
          status: 'PENDING',
        },
      });
      
      // 3. Réserver billet (status: RESERVED, timer 15 min)
      await tx.ticket.update({
        where: { id: ticket_id },
        data: { 
          status: 'RESERVED',
          // Expiration gérée par cron job (voir ci-dessous)
        },
      });
      
      return { transaction, ticket };
    });
    
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

**Timer Expiration Réservation** :
```typescript
// Cron job : POST /api/cron/expire-reservations
// Exécution : Toutes les 5 minutes (Vercel Cron)

export async function POST(request: NextRequest) {
  // Vérifier authentification cron (secret token)
  
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  // Libérer réservations expirées
  await prisma.$transaction([
    // Annuler transactions PENDING > 15 min
    prisma.transaction.updateMany({
      where: {
        status: 'PENDING',
        created_at: { lt: fifteenMinutesAgo },
      },
      data: { status: 'CANCELLED' },
    }),
    
    // Remettre billets en vente
    prisma.ticket.updateMany({
      where: {
        status: 'RESERVED',
        transaction: {
          status: 'CANCELLED',
        },
      },
      data: { status: 'ACTIVE' },
    }),
  ]);
  
  return NextResponse.json({ success: true });
}
```

---

### ÉTAPE 3 : Page Checkout (Paiement Stripe)

**Page** : `/checkout/[ticketId]`

**Layout** :
```
┌────────────────────────────────────────┐
│  Récapitulatif Commande                │
│  - Événement : Coldplay Paris          │
│  - Date : 15 Juil 2025                 │
│  - Catégorie : Carré Or                │
│  - Prix billet : 50.00€                │
│  - Frais plateforme (5%) : 2.50€       │
│  ────────────────────────────────────  │
│  Total à payer : 52.50€                │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Paiement Sécurisé (Stripe Elements)   │
│  [Numéro carte]                        │
│  [MM/YY] [CVC]                         │
│                                        │
│  ☐ Enregistrer cette carte             │
│                                        │
│  Timer : ⏱️ 14:23 restantes            │
│                                        │
│  [Payer 52.50€]                        │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Garanties Sécurité                    │
│  🛡️ Séquestre bancaire J+2             │
│  🔒 Paiement crypté SSL                │
│  ✅ Garantie Sérénité                  │
└────────────────────────────────────────┘
```

**Implémentation Frontend** :
```typescript
"use client";
import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage({ params }: { params: { ticketId: string } }) {
  const [clientSecret, setClientSecret] = useState<string>();
  
  useEffect(() => {
    // Créer Payment Intent au chargement page
    fetch('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: params.ticketId }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.client_secret));
  }, [params.ticketId]);
  
  if (!clientSecret) return <CheckoutSkeleton />;
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm ticketId={params.ticketId} />
    </Elements>
  );
}

function CheckoutForm({ ticketId }: { ticketId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    
    if (paymentIntent.status === 'succeeded') {
      // Redirect page succès
      router.push(`/checkout/success?transaction_id=${paymentIntent.metadata.transaction_id}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? 'Traitement...' : 'Payer 52.50€'}
      </Button>
    </form>
  );
}
```

---

### ÉTAPE 4 : Création Payment Intent (Séquestre)

**Backend** : `POST /api/payments/create-intent`
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { ticket_id } = await request.json();
  
  // 1. Récupérer transaction + ticket + vendeur
  const transaction = await prisma.transaction.findFirst({
    where: {
      ticket_id,
      buyer_id: session.user.id,
      status: 'PENDING',
    },
    include: {
      ticket: {
        include: {
          event: true,
          seller: true,
        },
      },
    },
  });
  
  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }
  
  // 2. Vérifier que vendeur a Stripe Connect Account
  if (!transaction.ticket.seller.stripe_account_id) {
    return NextResponse.json(
      { error: 'Vendeur non configuré' },
      { status: 400 }
    );
  }
  
  // 3. Créer Payment Intent avec SÉQUESTRE
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(transaction.total_amount * 100), // Convertir en centimes
    currency: 'eur',
    
    // Métadonnées (traçabilité)
    metadata: {
      transaction_id: transaction.id,
      ticket_id: ticket_id,
      event_id: transaction.ticket.event_id,
      event_date: transaction.ticket.event.event_date.toISOString(),
      buyer_id: session.user.id,
      seller_id: transaction.ticket.seller_id,
    },
    
    // SÉQUESTRE : Fonds dirigés vers compte vendeur mais BLOQUÉS
    transfer_data: {
      destination: transaction.ticket.seller.stripe_account_id,
    },
    on_behalf_of: transaction.ticket.seller.stripe_account_id,
    
    // PAS de transfert automatique (contrôle manuel J+2)
    // transfer_group pour identification
    transfer_group: transaction.id,
    
    // Description
    description: `Achat billet ${transaction.ticket.event.name}`,
  });
  
  // 4. Enregistrer Payment Intent ID
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { stripe_payment_intent_id: paymentIntent.id },
  });
  
  // 5. Retourner client_secret au frontend
  return NextResponse.json({
    client_secret: paymentIntent.client_secret,
    transaction_id: transaction.id,
  });
}
```

**Point Clé Séquestre** :
```typescript
// ❌ MAUVAIS (libération immédiate) :
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5250,
  currency: 'eur',
  transfer_data: {
    destination: seller_stripe_account_id,
    amount: 5000, // Transfert AUTO → ❌ Pas de séquestre !
  },
});

// ✅ CORRECT (séquestre, libération manuelle J+2) :
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5250,
  currency: 'eur',
  transfer_data: {
    destination: seller_stripe_account_id,
    // PAS de "amount" → fonds bloqués chez vendeur
  },
  on_behalf_of: seller_stripe_account_id,
  // Libération via stripe.transfers.create() plus tard (J+2)
});
```

---

### ÉTAPE 5 : Confirmation Paiement (Webhook Stripe)

**Déclencheur** : Stripe envoie webhook `payment_intent.succeeded`

**Backend** : `POST /api/webhooks/stripe`
```typescript
import { headers } from 'next/headers';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    // Vérifier signature webhook (sécurité)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Traiter événement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    await handlePaymentSuccess(paymentIntent);
  }
  
  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const transactionId = paymentIntent.metadata.transaction_id;
  
  await prisma.$transaction(async (tx) => {
    // 1. Récupérer transaction
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ticket: { include: { event: true } },
        buyer: true,
        seller: true,
      },
    });
    
    if (!transaction) throw new Error('Transaction not found');
    
    // 2. Calculer date libération séquestre (event_date + 2 jours)
    const eventDate = new Date(transaction.ticket.event.event_date);
    const releaseDate = new Date(eventDate);
    releaseDate.setDate(releaseDate.getDate() + 2);
    
    // 3. Mettre à jour transaction (status: ESCROWED)
    await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'ESCROWED',
        stripe_charge_id: paymentIntent.latest_charge as string,
        escrow_release_date: releaseDate,
        payment_method: paymentIntent.payment_method_types[0],
      },
    });
    
    // 4. Marquer billet comme VENDU
    await tx.ticket.update({
      where: { id: transaction.ticket_id },
      data: { status: 'SOLD' },
    });
    
    // 5. Créer notifications
    await tx.notification.createMany({
      data: [
        // Notification acheteur
        {
          user_id: transaction.buyer_id,
          type: 'PURCHASE_CONFIRMED',
          title: 'Achat confirmé ! 🎉',
          message: `Votre billet pour ${transaction.ticket.event.name} est confirmé.`,
          link_url: `/my-purchases/${transactionId}`,
        },
        // Notification vendeur
        {
          user_id: transaction.seller_id,
          type: 'TICKET_SOLD',
          title: 'Billet vendu !',
          message: `Votre billet a été vendu. Paiement disponible le ${releaseDate.toLocaleDateString('fr-FR')}.`,
          link_url: `/seller/sales/${transactionId}`,
        },
      ],
    });
  });
  
  // 6. Envoyer emails (service externe Resend)
  await Promise.all([
    sendEmailPurchaseConfirmation(transaction),
    sendEmailSaleConfirmation(transaction),
  ]);
  
  // 7. Log Sentry (succès)
  console.log(`✅ Payment succeeded: ${transactionId}`);
}
```

---

### ÉTAPE 6 : Accès au Billet (Acheteur)

**Page** : `/my-purchases/[transactionId]`

**Téléchargement PDF** :
```typescript
// Frontend
const handleDownloadTicket = async () => {
  try {
    const res = await fetch(`/api/my-purchases/${transactionId}/download`);
    
    if (!res.ok) {
      throw new Error('Téléchargement impossible');
    }
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billet-${eventName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Billet téléchargé');
  } catch (error) {
    toast.error('Erreur téléchargement');
  }
};
```

**Backend** : `GET /api/my-purchases/[transactionId]/download`
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 1. Vérifier ownership
  const transaction = await prisma.transaction.findUnique({
    where: { id: params.transactionId },
    include: { ticket: true },
  });
  
  if (!transaction || transaction.buyer_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 2. Vérifier statut (seulement si ESCROWED ou RELEASED)
  if (!['ESCROWED', 'RELEASED'].includes(transaction.status)) {
    return NextResponse.json(
      { error: 'Billet non disponible' },
      { status: 400 }
    );
  }
  
  // 3. Générer URL présignée Uploadcare (expire 1h)
  const presignedUrl = await generatePresignedUrl(transaction.ticket.pdf_url);
  
  // Option A : Redirect vers URL présignée
  return NextResponse.redirect(presignedUrl);
  
  // Option B : Stream PDF avec watermark (plus sécurisé)
  // const pdfBuffer = await fetchAndWatermarkPDF(
  //   transaction.ticket.pdf_url,
  //   transaction.id
  // );
  // return new NextResponse(pdfBuffer, {
  //   headers: {
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename="billet-${transaction.id}.pdf"`,
  //   },
  // });
}
```

---

### ÉTAPE 7 : Libération Séquestre J+2 (Automatique)

**Déclencheur** : Cron job quotidien (2h du matin)

**Backend** : `POST /api/cron/release-escrow`
```typescript
// Vercel Cron : vercel.json
{
  "crons": [{
    "path": "/api/cron/release-escrow",
    "schedule": "0 2 * * *" // Tous les jours à 2h
  }]
}

export async function POST(request: NextRequest) {
  // 1. Vérifier authentification cron (secret token)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Query transactions éligibles libération
  const eligibleTransactions = await prisma.transaction.findMany({
    where: {
      status: 'ESCROWED',
      escrow_release_date: { lte: new Date() }, // Date dépassée
      manual_review: false, // Pas de litige
    },
    include: {
      ticket: { include: { event: true } },
      seller: true,
    },
  });
  
  console.log(`🔓 ${eligibleTransactions.length} transactions à libérer`);
  
  // 3. Libérer chaque transaction
  const results = await Promise.allSettled(
    eligibleTransactions.map(transaction => releaseEscrow(transaction))
  );
  
  // 4. Log résultats
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`✅ ${succeeded} libérations réussies, ❌ ${failed} échecs`);
  
  return NextResponse.json({
    total: eligibleTransactions.length,
    succeeded,
    failed,
  });
}

async function releaseEscrow(transaction: Transaction) {
  try {
    // 1. Créer Stripe Transfer (libération fonds)
    const transfer = await stripe.transfers.create({
      amount: Math.round(transaction.seller_net_amount * 100),
      currency: 'eur',
      destination: transaction.seller.stripe_account_id,
      transfer_group: transaction.id,
      metadata: {
        transaction_id: transaction.id,
        event_name: transaction.ticket.event.name,
      },
      description: `Vente billet ${transaction.ticket.event.name}`,
    });
    
    // 2. Mettre à jour transaction DB
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'RELEASED',
        stripe_transfer_id: transfer.id,
        released_at: new Date(),
      },
    });
    
    // 3. Notification vendeur
    await prisma.notification.create({
      data: {
        user_id: transaction.seller_id,
        type: 'ESCROW_RELEASED',
        title: '💸 Paiement disponible !',
        message: `${transaction.seller_net_amount}€ ont été transférés sur votre compte.`,
        link_url: `/seller/payments`,
      },
    });
    
    // 4. Email vendeur
    await sendEmailPaymentReleased(transaction);
    
    console.log(`✅ Escrow released: ${transaction.id}`);
    
  } catch (error) {
    console.error(`❌ Escrow release failed: ${transaction.id}`, error);
    
    // Log Sentry pour investigation
    Sentry.captureException(error, {
      tags: { transaction_id: transaction.id },
    });
    
    throw error;
  }
}
```

---

### ÉTAPE 8 : Demande Avis (J+3)

**Déclencheur** : Cron job quotidien (envoi emails J+3)

**Backend** : `POST /api/cron/send-review-requests`
```typescript
export async function POST(request: NextRequest) {
  // Vérifier auth cron
  
  // 1. Query transactions J+3 sans avis
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const eligibleTransactions = await prisma.transaction.findMany({
    where: {
      status: 'RELEASED',
      ticket: {
        event: {
          event_date: {
            gte: new Date(threeDaysAgo.setHours(0, 0, 0, 0)),
            lt: new Date(threeDaysAgo.setHours(23, 59, 59, 999)),
          },
        },
      },
      review: null, // Pas d'avis existant
    },
    include: {
      buyer: true,
      seller: true,
      ticket: { include: { event: true } },
    },
  });
  
  // 2. Envoyer notifications + emails
  for (const transaction of eligibleTransactions) {
    await prisma.notification.create({
      data: {
        user_id: transaction.buyer_id,
        type: 'REVIEW_REQUEST',
        title: 'Comment était le concert ? 🎵',
        message: `Laissez un avis sur votre achat pour ${transaction.ticket.event.name}`,
        link_url: `/my-purchases/${transaction.id}/review`,
      },
    });
    
    await sendEmailReviewRequest(transaction);
  }
  
  return NextResponse.json({ sent: eligibleTransactions.length });
}
```

---

## Gestion Exceptions

### Cas 1 : Paiement Échoué
```typescript
// Webhook : payment_intent.payment_failed

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const transactionId = paymentIntent.metadata.transaction_id;
  
  await prisma.$transaction([
    // Marquer transaction FAILED
    prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'FAILED' },
    }),
    
    // Libérer billet (remettre ACTIVE)
    prisma.ticket.update({
      where: { id: paymentIntent.metadata.ticket_id },
      data: { status: 'ACTIVE' },
    }),
  ]);
  
  // Notification acheteur
  // Suggestion : Réessayer ou autre billet
}
```

### Cas 2 : Réservation Expirée (Timer 15 min)

Géré par cron job `expire-reservations` (voir Étape 2).

### Cas 3 : Litige Ouvert
```typescript
// Si acheteur ouvre litige (J-1 à J+2)

await prisma.transaction.update({
  where: { id: transactionId },
  data: {
    status: 'DISPUTED',
    manual_review: true, // ❗ BLOQUE libération séquestre
  },
});

// Le cron release-escrow ignorera cette transaction
// Résolution manuelle admin requise
```

### Cas 4 : Événement Annulé
```typescript
// Endpoint admin : POST /api/admin/events/[id]/cancel

// 1. Marquer événement annulé
await prisma.event.update({
  where: { id: eventId },
  data: { is_cancelled: true },
});

// 2. Rembourser toutes transactions ESCROWED
const transactions = await prisma.transaction.findMany({
  where: {
    ticket: { event_id: eventId },
    status: 'ESCROWED',
  },
});

for (const transaction of transactions) {
  // Stripe refund
  await stripe.refunds.create({
    payment_intent: transaction.stripe_payment_intent_id,
    reason: 'requested_by_customer',
  });
  
  // Update DB
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'REFUNDED' },
  });
  
  // Notification acheteur
}
```

---

## Diagramme Séquence Complet
```
Acheteur          Frontend           Backend API        Stripe          DB          Vendeur
   │                  │                   │               │            │              │
   │ Clic "Acheter"   │                   │               │            │              │
   ├─────────────────>│                   │               │            │              │
   │                  │ POST /reserve     │               │            │              │
   │                  ├──────────────────>│               │            │              │
   │                  │                   │ BEGIN TX      │            │              │
   │                  │                   ├──────────────────────────>│              │
   │                  │                   │ UPDATE ticket (RESERVED)  │              │
   │                  │                   │ CREATE transaction        │              │
   │                  │                   │<──────────────────────────┤              │
   │                  │<──────────────────┤               │            │              │
   │                  │                   │               │            │              │
   │ Redirect checkout│                   │               │            │              │
   ├─────────────────>│                   │               │            │              │
   │                  │ POST /create-intent│              │            │              │
   │                  ├──────────────────>│               │            │              │
   │                  │                   │ paymentIntents.create     │              │
   │                  │                   ├──────────────>│            │              │
   │                  │                   │ (transfer_data: seller)   │              │
   │                  │                   │<──────────────┤            │              │
   │                  │<──────────────────┤               │            │              │
   │                  │ client_secret     │               │            │              │
   │                  │                   │               │            │              │
   │ Stripe Elements  │                   │               │            │              │
   │ (saisie carte)   │                   │               │            │              │
   │ Submit payment   │                   │               │            │              │
   ├─────────────────>│ confirmPayment()  │               │            │              │
   │                  ├───────────────────┼──────────────>│            │              │
   │                  │                   │               │ (charge card)             │
   │                  │                   │               │            │              │
   │                  │                   │ Webhook: payment_intent.succeeded        │
   │                  │                   │<──────────────┤            │              │
   │                  │                   │ UPDATE transaction (ESCROWED)            │
   │                  │                   ├──────────────────────────>│              │
   │                  │                   │ UPDATE ticket (SOLD)      │              │
   │                  │                   │ escrow_release_date = J+2 │              │
   │                  │                   │<──────────────────────────┤              │
   │                  │                   │ Notification vendeur      │              │
   │                  │                   ├───────────────────────────┼─────────────>│
   │                  │                   │               │            │              │
   │<────────────────────────────────────┤               │            │              │
   │ Redirect /success│                   │               │            │              │
   │                  │                   │               │            │              │
   │                  │  ... J+2 jours passent ...        │            │              │
   │                  │                   │               │            │              │
   │                  │                   │ Cron: release-escrow       │              │
   │                  │                   │ transfers.create()         │              │
   │                  │                   ├──────────────>│            │              │
   │                  │                   │               │ (transfer to seller)      │
   │                  │                   │<──────────────┤            │              │
   │                  │                   │ UPDATE transaction (RELEASED)            │
   │                  │                   ├──────────────────────────>│              │
   │                  │                   │ Notification vendeur      │              │
   │                  │                   ├───────────────────────────┼─────────────>│
   │                  │                   │               │            │  💸 Payé    │
```

---

## Métriques Clés

**Performance** :
- Temps moyen achat : < 2 minutes (découverte → confirmation)
- Taux succès paiement : > 95%
- Disponibilité service : 99.9%

**Business** :
- Taux abandon panier : < 30% (timer 15 min)
- Taux litiges : < 3% (objectif MVP)
- Délai libération moyen : J+2 exact (automatisé)

**Sécurité** :
- 0 fraude double-vente (transaction atomique)
- 0 fuite données carte (Stripe PCI-compliant)
- 100% transactions séquestres (conformité légale)

---

**Dernière mise à jour** : 2025-02-17
**Version** : 1.0.0 (MVP)