# Contrats API - Plateforme Billets Éthique

## Vue d'Ensemble

Documentation complète de tous les endpoints API de la plateforme avec schémas de requêtes/réponses, codes d'erreur, et exemples d'utilisation.

**Base URL** : 
- Production : `https://billets-ethiques.fr/api`
- Staging : `https://staging.billets-ethiques.vercel.app/api`
- Local : `http://localhost:3000/api`

**Authentification** :
- Session Supabase (cookie `sb-access-token`)
- Header `Authorization: Bearer <session_token>` (optionnel, cookie prioritaire)

**Format Réponses** :
- Content-Type : `application/json`
- Charset : UTF-8
- Dates : ISO 8601 (`2025-07-15T20:00:00.000Z`)
- Montants : Décimal avec 2 décimales (ex: `52.50`)

---

## Table des Matières

1. [Authentification](#1-authentification)
2. [Événements](#2-événements)
3. [Billets](#3-billets)
4. [Transactions](#4-transactions)
5. [Paiements](#5-paiements)
6. [Stripe Connect](#6-stripe-connect)
7. [KYC](#7-kyc)
8. [Litiges](#8-litiges)
9. [Avis](#9-avis)
10. [Favoris](#10-favoris)
11. [Notifications](#11-notifications)
12. [Utilisateur](#12-utilisateur)
13. [Admin](#13-admin)
14. [Webhooks](#14-webhooks)
15. [Codes d'Erreur](#15-codes-derreur)

---

## 1. Authentification

### POST `/api/auth/signup`

Inscription nouvel utilisateur.

**Request** :
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

**Validation** :
```typescript
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
});
```

**Response** `201 Created` :
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "email_verified": false
  },
  "message": "Email de vérification envoyé"
}
```

**Erreurs** :
- `400` : Validation échouée
- `409` : Email déjà utilisé

---

### POST `/api/auth/login`

Connexion utilisateur.

**Request** :
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

**Response** `200 OK` :
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "BUYER",
    "kyc_status": "PENDING"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_at": 1719936000
  }
}
```

**Erreurs** :
- `401` : Identifiants invalides
- `403` : Compte suspendu

---

### POST `/api/auth/logout`

Déconnexion utilisateur.

**Request** : Aucun body

**Response** `200 OK` :
```json
{
  "message": "Déconnexion réussie"
}
```

---

### POST `/api/auth/forgot-password`

Demande de réinitialisation mot de passe.

**Request** :
```json
{
  "email": "user@example.com"
}
```

**Response** `200 OK` :
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

---

### POST `/api/auth/reset-password`

Réinitialisation mot de passe (avec token).

**Request** :
```json
{
  "token": "eyJhbGc...",
  "new_password": "NewSecureP@ssw0rd"
}
```

**Response** `200 OK` :
```json
{
  "message": "Mot de passe réinitialisé"
}
```

---

### GET `/api/auth/me`

Récupérer utilisateur connecté.

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "BUYER",
  "kyc_status": "VERIFIED",
  "trust_score": 85,
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

---

## 2. Événements

### GET `/api/events`

Liste des événements (marketplace).

**Query Params** :
```
page        : number  (default: 1)
limit       : number  (default: 12, max: 50)
sort        : "relevance" | "date_asc" | "date_desc" | "price_min" | "popularity"
dateFrom    : ISO date (optional)
dateTo      : ISO date (optional)
cities      : string[] (comma-separated, ex: "Paris,Lyon,Marseille")
genres      : string[] (comma-separated)
artists     : string   (search query, case-insensitive)
priceMin    : number   (optional)
priceMax    : number   (optional)
```

**Exemple** :
```
GET /api/events?page=1&limit=12&sort=date_asc&cities=Paris&genres=Rock,Pop&priceMin=20&priceMax=100
```

**Response** `200 OK` :
```json
{
  "events": [
    {
      "id": "event-uuid-1",
      "name": "Coldplay - Music of the Spheres",
      "slug": "coldplay-paris-2025",
      "artist": "Coldplay",
      "genre": "Pop Rock",
      "venue_name": "Stade de France",
      "city": "Paris",
      "postal_code": "93200",
      "event_date": "2025-07-15T20:00:00.000Z",
      "doors_open_time": "19:00",
      "image_url": "https://cdn.uploadcare.com/coldplay.jpg",
      "is_verified": true,
      "tickets_available": 23,
      "min_price": 45.00,
      "max_price": 120.00
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 12,
    "totalPages": 13
  },
  "filters": {
    "availableCities": ["Paris", "Lyon", "Marseille", "Bordeaux"],
    "availableGenres": ["Rock", "Pop", "Jazz", "Électro", "Hip-Hop"]
  }
}
```

---

### GET `/api/events/[id]`

Détail d'un événement.

**Params** :
- `id` : UUID de l'événement

**Response** `200 OK` :
```json
{
  "event": {
    "id": "event-uuid-1",
    "name": "Coldplay - Music of the Spheres",
    "slug": "coldplay-paris-2025",
    "description": "Concert exceptionnel de Coldplay dans le cadre de leur tournée mondiale...",
    "artist": "Coldplay",
    "genre": "Pop Rock",
    "venue_name": "Stade de France",
    "venue_address": "ZAC du Cornillon Nord",
    "city": "Paris",
    "postal_code": "93200",
    "country": "FR",
    "latitude": 48.9245,
    "longitude": 2.3601,
    "event_date": "2025-07-15T20:00:00.000Z",
    "doors_open_time": "19:00",
    "image_url": "https://cdn.uploadcare.com/coldplay.jpg",
    "official_url": "https://fnacspectacles.com/coldplay",
    "is_verified": true,
    "tickets_available": 23,
    "created_at": "2025-02-01T08:00:00.000Z"
  },
  "tickets": [
    {
      "id": "ticket-uuid-1",
      "selling_price": 85.00,
      "original_price": 89.50,
      "seat_category": "Carré Or",
      "seat_number": "A12",
      "verification_status": "APPROVED",
      "seller": {
        "pseudo": "JeanV",
        "trust_score": 92,
        "total_sales": 15
      }
    }
  ],
  "stats": {
    "ticketsAvailable": 23,
    "minPrice": 45.00,
    "maxPrice": 120.00,
    "avgPrice": 72.50,
    "priceDistribution": [
      { "range": "0-50", "count": 3 },
      { "range": "50-100", "count": 15 },
      { "range": "100-150", "count": 5 }
    ]
  }
}
```

**Erreurs** :
- `404` : Événement non trouvé

---

### GET `/api/events/search`

Recherche globale événements.

**Query Params** :
```
q           : string (required, min 2 chars)
type        : "all" | "events" | "artists" | "cities" (default: "all")
limit       : number (default: 20, max: 50)
```

**Exemple** :
```
GET /api/events/search?q=coldplay&type=all
```

**Response** `200 OK` :
```json
{
  "query": "coldplay",
  "results": {
    "events": [
      {
        "id": "event-uuid-1",
        "name": "Coldplay - Music of the Spheres",
        "artist": "Coldplay",
        "city": "Paris",
        "event_date": "2025-07-15T20:00:00.000Z",
        "image_url": "https://...",
        "min_price": 45.00
      }
    ],
    "artists": [
      {
        "name": "Coldplay",
        "genre": "Pop Rock",
        "eventsCount": 3
      }
    ],
    "cities": [
      {
        "name": "Paris",
        "eventsCount": 156
      }
    ]
  },
  "totalResults": 4
}
```

---

## 3. Billets

### GET `/api/tickets/[id]`

Détail d'un billet (public).

**Params** :
- `id` : UUID du billet

**Response** `200 OK` :
```json
{
  "ticket": {
    "id": "ticket-uuid-1",
    "event_id": "event-uuid-1",
    "status": "ACTIVE",
    "selling_price": 85.00,
    "original_price": 89.50,
    "seat_category": "Carré Or",
    "seat_number": "A12",
    "verification_status": "APPROVED",
    "views_count": 47,
    "created_at": "2025-02-10T14:30:00.000Z"
  },
  "event": {
    "id": "event-uuid-1",
    "name": "Coldplay - Music of the Spheres",
    "event_date": "2025-07-15T20:00:00.000Z",
    "venue_name": "Stade de France",
    "city": "Paris"
  },
  "seller": {
    "pseudo": "JeanV",
    "trust_score": 92,
    "total_sales": 15,
    "member_since": "2024-06-01T00:00:00.000Z",
    "reviews": [
      {
        "rating": 5,
        "comment": "Transaction parfaite, billet conforme !",
        "created_at": "2025-02-05T18:00:00.000Z"
      }
    ],
    "avg_rating": 4.8
  }
}
```

**Erreurs** :
- `404` : Billet non trouvé
- `410` : Billet déjà vendu (status = SOLD)

---

### POST `/api/tickets/reserve`

Réserver un billet (15 minutes).

**Auth** : Requise

**Request** :
```json
{
  "ticket_id": "ticket-uuid-1"
}
```

**Response** `201 Created` :
```json
{
  "transaction": {
    "id": "transaction-uuid-1",
    "ticket_id": "ticket-uuid-1",
    "buyer_id": "user-uuid-1",
    "seller_id": "user-uuid-2",
    "total_amount": 89.25,
    "status": "PENDING",
    "created_at": "2025-02-17T15:30:00.000Z",
    "expires_at": "2025-02-17T15:45:00.000Z"
  },
  "ticket": {
    "id": "ticket-uuid-1",
    "status": "RESERVED"
  }
}
```

**Erreurs** :
- `401` : Non authentifié
- `409` : Billet déjà réservé ou vendu
- `400` : Impossible d'acheter son propre billet

---

### POST `/api/tickets/favorite`

Ajouter un événement aux favoris.

**Auth** : Requise

**Request** :
```json
{
  "event_id": "event-uuid-1"
}
```

**Response** `201 Created` :
```json
{
  "favorite": {
    "id": "favorite-uuid-1",
    "user_id": "user-uuid-1",
    "event_id": "event-uuid-1",
    "created_at": "2025-02-17T16:00:00.000Z"
  }
}
```

**Erreurs** :
- `409` : Événement déjà dans les favoris

---

### DELETE `/api/tickets/favorite/[id]`

Retirer un favori.

**Auth** : Requise

**Params** :
- `id` : UUID du favori

**Response** `200 OK` :
```json
{
  "message": "Favori supprimé"
}
```

---

## 4. Transactions

### GET `/api/transactions/purchases`

Liste des achats de l'utilisateur connecté.

**Auth** : Requise

**Query Params** :
```
filter      : "all" | "upcoming" | "past" (default: "all")
page        : number (default: 1)
limit       : number (default: 20)
```

**Response** `200 OK` :
```json
{
  "transactions": [
    {
      "id": "transaction-uuid-1",
      "ticket": {
        "id": "ticket-uuid-1",
        "event": {
          "name": "Coldplay - Music of the Spheres",
          "event_date": "2025-07-15T20:00:00.000Z",
          "venue_name": "Stade de France",
          "city": "Paris",
          "image_url": "https://..."
        },
        "seat_category": "Carré Or",
        "seat_number": "A12"
      },
      "total_amount": 89.25,
      "status": "ESCROWED",
      "escrow_release_date": "2025-07-17T20:00:00.000Z",
      "created_at": "2025-02-17T15:30:00.000Z"
    }
  ],
  "stats": {
    "total": 12,
    "upcoming": 3,
    "past": 9
  },
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### GET `/api/transactions/[id]`

Détail d'une transaction.

**Auth** : Requise (buyer_id ou seller_id = user)

**Params** :
- `id` : UUID de la transaction

**Response** `200 OK` :
```json
{
  "transaction": {
    "id": "transaction-uuid-1",
    "ticket_id": "ticket-uuid-1",
    "buyer_id": "user-uuid-1",
    "seller_id": "user-uuid-2",
    "ticket_price": 85.00,
    "platform_fee": 4.25,
    "total_amount": 89.25,
    "seller_net_amount": 85.00,
    "stripe_payment_intent_id": "pi_...",
    "status": "ESCROWED",
    "escrow_release_date": "2025-07-17T20:00:00.000Z",
    "payment_method": "card",
    "card_last4": "4242",
    "card_brand": "visa",
    "created_at": "2025-02-17T15:30:00.000Z"
  },
  "ticket": {
    "id": "ticket-uuid-1",
    "selling_price": 85.00,
    "original_price": 89.50,
    "seat_category": "Carré Or",
    "seat_number": "A12",
    "pdf_url": "https://cdn.uploadcare.com/..."
  },
  "event": {
    "id": "event-uuid-1",
    "name": "Coldplay - Music of the Spheres",
    "event_date": "2025-07-15T20:00:00.000Z",
    "venue_name": "Stade de France",
    "city": "Paris"
  },
  "seller": {
    "pseudo": "JeanV",
    "trust_score": 92,
    "avg_rating": 4.8,
    "total_sales": 15
  },
  "dispute": null,
  "review": null
}
```

**Erreurs** :
- `403` : Accès refusé (pas votre transaction)
- `404` : Transaction non trouvée

---

### GET `/api/my-purchases/[transactionId]/download`

Télécharger le PDF du billet.

**Auth** : Requise (buyer uniquement)

**Params** :
- `transactionId` : UUID de la transaction

**Response** `200 OK` :
- Content-Type : `application/pdf`
- Content-Disposition : `attachment; filename="billet-{id}.pdf"`
- Body : Fichier PDF (stream)

**Ou Redirect** `302` :
- Location : URL présignée Uploadcare (expire 1h)

**Erreurs** :
- `403` : Accès refusé
- `400` : Billet non disponible (status invalide)

---

### GET `/api/transactions/[id]/invoice`

Télécharger la facture (PDF).

**Auth** : Requise (buyer uniquement)

**Response** `200 OK` :
- Content-Type : `application/pdf`
- Body : Facture générée (pdfkit)

**Contenu Facture** :
- Header : Logo plateforme + Mentions légales
- Numéro facture : `INV-20250217-0001`
- Date émission
- Informations client (nom, email, adresse)
- Détails transaction :
  - Billet : {événement} - {catégorie}
  - Prix HT : 85.00€
  - TVA (20%) : 17.00€
  - Frais plateforme : 4.25€
  - Total TTC : 89.25€
- Footer : CGV, Contact support

---

## 5. Paiements

### POST `/api/payments/create-intent`

Créer un Payment Intent Stripe (avec séquestre).

**Auth** : Requise

**Request** :
```json
{
  "ticket_id": "ticket-uuid-1"
}
```

**Response** `201 Created` :
```json
{
  "client_secret": "pi_..._secret_...",
  "transaction_id": "transaction-uuid-1",
  "amount": 89.25,
  "publishable_key": "pk_live_..."
}
```

**Erreurs** :
- `404` : Transaction non trouvée (réservation expirée)
- `400` : Vendeur non configuré (pas de Stripe Account)

---

### GET `/api/payments/methods`

Liste des moyens de paiement enregistrés (Stripe Customer).

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "methods": [
    {
      "id": "pm_...",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2027
      },
      "is_default": true
    }
  ]
}
```

---

### POST `/api/payments/methods/add`

Ajouter une carte (via Setup Intent).

**Auth** : Requise

**Request** :
```json
{
  "payment_method_id": "pm_...",
  "set_as_default": true
}
```

**Response** `201 Created` :
```json
{
  "message": "Carte ajoutée",
  "method": {
    "id": "pm_...",
    "card": {
      "brand": "mastercard",
      "last4": "5555"
    }
  }
}
```

---

### DELETE `/api/payments/methods/[id]`

Supprimer une carte.

**Auth** : Requise

**Params** :
- `id` : Payment Method ID (pm_...)

**Response** `200 OK` :
```json
{
  "message": "Carte supprimée"
}
```

---

## 6. Stripe Connect

### POST `/api/stripe-connect/create-account`

Créer un compte Stripe Connect (vendeur).

**Auth** : Requise

**Request** : Aucun body (auto depuis user session)

**Response** `201 Created` :
```json
{
  "account_id": "acct_...",
  "onboarding_url": "https://connect.stripe.com/setup/..."
}
```

**Process** :
1. Créer Custom Account Stripe
2. Enregistrer `stripe_account_id` dans DB
3. Générer Account Link (onboarding)
4. Retourner URL pour redirection

---

### GET `/api/stripe-connect/onboarding-link`

Générer un nouveau lien d'onboarding (si incomplet).

**Auth** : Requise (vendeur)

**Response** `200 OK` :
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

---

### GET `/api/stripe-connect/dashboard-link`

Accéder au dashboard Stripe Express.

**Auth** : Requise (vendeur)

**Response** `200 OK` :
```json
{
  "url": "https://connect.stripe.com/express/..."
}
```

---

### GET `/api/stripe-connect/account-status`

Statut du compte Stripe Connect.

**Auth** : Requise (vendeur)

**Response** `200 OK` :
```json
{
  "account_id": "acct_...",
  "charges_enabled": true,
  "payouts_enabled": true,
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "past_due": []
  },
  "onboarding_completed": true
}
```

---

### GET `/api/stripe-connect/balance`

Solde disponible vendeur.

**Auth** : Requise (vendeur)

**Response** `200 OK` :
```json
{
  "available": 450.00,
  "pending": 125.50,
  "currency": "eur"
}
```

---

### POST `/api/stripe-connect/payout`

Déclencher un payout (retrait vers compte bancaire).

**Auth** : Requise (vendeur)

**Request** :
```json
{
  "amount": 450.00
}
```

**Validation** :
- `amount <= balance.available`
- `amount >= 10.00` (minimum Stripe)

**Response** `201 Created` :
```json
{
  "payout": {
    "id": "po_...",
    "amount": 450.00,
    "arrival_date": "2025-02-20T00:00:00.000Z",
    "status": "in_transit"
  }
}
```

---

## 7. KYC

### POST `/api/kyc/create-session`

Créer une session Stripe Identity (KYC).

**Auth** : Requise

**Request** : Aucun body

**Response** `201 Created` :
```json
{
  "session_id": "vs_...",
  "client_secret": "vs_..._secret_...",
  "url": "https://verify.stripe.com/start/..."
}
```

**Frontend Integration** :
```html
<script src="https://js.stripe.com/v3/"></script>
<script>
  const stripe = Stripe('pk_live_...');
  const session = await fetch('/api/kyc/create-session').then(r => r.json());
  
  const { error } = await stripe.verifyIdentity(session.client_secret);
  
  if (error) {
    console.error(error);
  } else {
    // Redirection ou polling status
  }
</script>
```

---

### GET `/api/kyc/status`

Statut de la vérification KYC.

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "kyc_status": "VERIFIED",
  "kyc_provider_id": "vs_...",
  "kyc_verified_at": "2025-02-17T10:30:00.000Z",
  "kyc_rejected_reason": null
}
```

**Statuts possibles** :
- `PENDING` : En attente vérification
- `VERIFIED` : Vérifié
- `REJECTED` : Rejeté
- `EXPIRED` : Expiré (à renouveler)

---

## 8. Litiges

### GET `/api/disputes`

Liste des litiges de l'utilisateur (acheteur ou vendeur).

**Auth** : Requise

**Query Params** :
```
status      : "all" | "open" | "investigating" | "resolved" (default: "all")
role        : "buyer" | "seller" (default: auto-detect)
```

**Response** `200 OK` :
```json
{
  "disputes": [
    {
      "id": "dispute-uuid-1",
      "transaction_id": "transaction-uuid-1",
      "reporter_id": "user-uuid-1",
      "reason": "NO_ACCESS",
      "description": "Billet refusé à l'entrée du Stade de France",
      "status": "INVESTIGATING",
      "created_at": "2025-07-15T21:30:00.000Z",
      "transaction": {
        "ticket": {
          "event": {
            "name": "Coldplay - Music of the Spheres"
          }
        }
      }
    }
  ]
}
```

---

### POST `/api/disputes`

Ouvrir un litige.

**Auth** : Requise (acheteur uniquement)

**Request** :
```json
{
  "transaction_id": "transaction-uuid-1",
  "reason": "NO_ACCESS",
  "description": "Le billet a été refusé à l'entrée. Le code-barres était invalide.",
  "evidence_urls": [
    "https://cdn.uploadcare.com/photo-refus.jpg",
    "https://cdn.uploadcare.com/email-staff.jpg"
  ]
}
```

**Validation** :
```typescript
const disputeSchema = z.object({
  transaction_id: z.string().uuid(),
  reason: z.enum([
    'FAKE_TICKET',
    'DUPLICATE',
    'NO_ACCESS',
    'EVENT_CANCELLED',
    'WRONG_TICKET',
    'OTHER',
  ]),
  description: z.string().min(50).max(1000),
  evidence_urls: z.array(z.string().url()).max(5).optional(),
});
```

**Contraintes métier** :
- J-1 à J+2 de l'événement uniquement
- Pas de litige existant sur cette transaction
- Transaction status = ESCROWED

**Response** `201 Created` :
```json
{
  "dispute": {
    "id": "dispute-uuid-1",
    "transaction_id": "transaction-uuid-1",
    "status": "OPEN",
    "created_at": "2025-07-15T21:30:00.000Z"
  },
  "message": "Litige ouvert. Notre équipe examine votre demande."
}
```

**Side Effects** :
- `transaction.status` → `DISPUTED`
- `transaction.manual_review` → `true` (bloque libération séquestre)
- Notification vendeur
- Webhook Slack équipe support

**Erreurs** :
- `400` : Délai invalide (hors période J-1 à J+2)
- `409` : Litige déjà existant
- `403` : Seul l'acheteur peut ouvrir un litige

---

### GET `/api/disputes/[id]`

Détail d'un litige.

**Auth** : Requise (acheteur, vendeur ou admin)

**Response** `200 OK` :
```json
{
  "dispute": {
    "id": "dispute-uuid-1",
    "transaction_id": "transaction-uuid-1",
    "reporter_id": "user-uuid-1",
    "reason": "NO_ACCESS",
    "description": "...",
    "evidence_urls": ["https://..."],
    "status": "INVESTIGATING",
    "resolution_notes": null,
    "resolved_by": null,
    "resolved_at": null,
    "created_at": "2025-07-15T21:30:00.000Z"
  },
  "transaction": {
    "id": "transaction-uuid-1",
    "total_amount": 89.25,
    "ticket": {
      "event": {
        "name": "Coldplay - Music of the Spheres"
      }
    }
  },
  "reporter": {
    "pseudo": "AcheteurX"
  },
  "messages": [] // Timeline échanges (à implémenter)
}
```

---

### POST `/api/disputes/[id]/message`

Ajouter un message dans le litige.

**Auth** : Requise (acheteur, vendeur ou admin)

**Request** :
```json
{
  "message": "Voici la preuve supplémentaire demandée"
}
```

**Response** `201 Created` :
```json
{
  "message": {
    "id": "message-uuid-1",
    "dispute_id": "dispute-uuid-1",
    "user_id": "user-uuid-1",
    "content": "...",
    "created_at": "2025-07-16T10:00:00.000Z"
  }
}
```

---

## 9. Avis

### POST `/api/reviews/create`

Laisser un avis sur un vendeur (post-transaction).

**Auth** : Requise (acheteur uniquement)

**Request** :
```json
{
  "transaction_id": "transaction-uuid-1",
  "reviewed_user_id": "user-uuid-2",
  "rating": 5,
  "comment": "Transaction parfaite, billet conforme. Merci !"
}
```

**Validation** :
```typescript
const reviewSchema = z.object({
  transaction_id: z.string().uuid(),
  reviewed_user_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});
```

**Contraintes métier** :
- J+3 après l'événement minimum
- Transaction status = RELEASED
- Pas d'avis existant (unique constraint)
- User = buyer de la transaction

**Response** `201 Created` :
```json
{
  "review": {
    "id": "review-uuid-1",
    "transaction_id": "transaction-uuid-1",
    "reviewer_id": "user-uuid-1",
    "reviewed_user_id": "user-uuid-2",
    "rating": 5,
    "comment": "...",
    "is_published": false,
    "created_at": "2025-07-18T14:00:00.000Z"
  },
  "message": "Avis soumis pour modération. Merci !"
}
```

**Erreurs** :
- `400` : Délai invalide (avant J+3)
- `409` : Avis déjà laissé
- `403` : Seul l'acheteur peut laisser un avis

---

### GET `/api/reviews/user/[userId]`

Avis reçus par un vendeur (publics).

**Params** :
- `userId` : UUID du vendeur

**Query Params** :
```
page        : number (default: 1)
limit       : number (default: 10)
```

**Response** `200 OK` :
```json
{
  "reviews": [
    {
      "id": "review-uuid-1",
      "rating": 5,
      "comment": "Transaction parfaite !",
      "reviewer": {
        "pseudo": "AcheteurY"
      },
      "created_at": "2025-02-15T18:00:00.000Z"
    }
  ],
  "stats": {
    "total": 47,
    "avg_rating": 4.8,
    "distribution": {
      "5": 35,
      "4": 10,
      "3": 2,
      "2": 0,
      "1": 0
    }
  },
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 10. Favoris

### GET `/api/favorites`

Liste des favoris de l'utilisateur.

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "favorites": [
    {
      "id": "favorite-uuid-1",
      "event": {
        "id": "event-uuid-1",
        "name": "Coldplay - Music of the Spheres",
        "event_date": "2025-07-15T20:00:00.000Z",
        "city": "Paris",
        "image_url": "https://...",
        "tickets_available": 23,
        "min_price": 45.00
      },
      "created_at": "2025-02-10T16:00:00.000Z"
    }
  ]
}
```

---

## 11. Notifications

### GET `/api/notifications`

Liste des notifications de l'utilisateur.

**Auth** : Requise

**Query Params** :
```
unread      : boolean (default: false, si true filtre is_read=false)
page        : number (default: 1)
limit       : number (default: 20)
```

**Response** `200 OK` :
```json
{
  "notifications": [
    {
      "id": "notification-uuid-1",
      "type": "PURCHASE_CONFIRMED",
      "title": "Achat confirmé ! 🎉",
      "message": "Votre billet pour Coldplay - Paris est confirmé.",
      "link_url": "/my-purchases/transaction-uuid-1",
      "is_read": false,
      "created_at": "2025-02-17T15:35:00.000Z"
    }
  ],
  "unread_count": 3,
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### PATCH `/api/notifications/[id]/read`

Marquer une notification comme lue.

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "notification": {
    "id": "notification-uuid-1",
    "is_read": true,
    "read_at": "2025-02-17T16:00:00.000Z"
  }
}
```

---

### PATCH `/api/notifications/read-all`

Marquer toutes les notifications comme lues.

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "message": "Toutes les notifications ont été marquées comme lues",
  "count": 12
}
```

---

## 12. Utilisateur

### GET `/api/user/profile`

Récupérer le profil de l'utilisateur connecté.

**Auth** : Requise

**Response** `200 OK` :
```json
{
  "id": "user-uuid-1",
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+33612345678",
  "avatar_url": "https://cdn.uploadcare.com/avatar.jpg",
  "role": "SELLER",
  "kyc_status": "VERIFIED",
  "stripe_account_id": "acct_...",
  "trust_score": 92,
  "total_sales": 15,
  "total_purchases": 28,
  "notification_email": true,
  "notification_sms": false,
  "created_at": "2024-06-01T00:00:00.000Z"
}
```

---

### PATCH `/api/user/profile`

Modifier le profil.

**Auth** : Requise

**Request** :
```json
{
  "first_name": "Jean-Pierre",
  "last_name": "Dupont",
  "phone": "+33612345679"
}
```

**Validation** :
- Email non modifiable (nécessite re-vérification séparée)
- first_name, last_name : 2-100 chars
- phone : format E.164 (optionnel)

**Response** `200 OK` :
```json
{
  "user": {
    "id": "user-uuid-1",
    "first_name": "Jean-Pierre",
    "last_name": "Dupont",
    "phone": "+33612345679"
  }
}
```

---

### POST `/api/user/avatar`

Upload avatar.

**Auth** : Requise

**Request** : `multipart/form-data`
```
file: <image> (max 5MB, jpg/png/webp)
```

**Response** `200 OK` :
```json
{
  "avatar_url": "https://cdn.uploadcare.com/avatar-new.jpg"
}
```

---

### POST `/api/user/preferences`

Modifier les préférences de notifications.

**Auth** : Requise

**Request** :
```json
{
  "notification_email": true,
  "notification_sms": false
}
```

**Response** `200 OK` :
```json
{
  "preferences": {
    "notification_email": true,
    "notification_sms": false
  }
}
```

---

### DELETE `/api/user/delete-account`

Supprimer le compte (RGPD).

**Auth** : Requise

**Request** :
```json
{
  "password": "CurrentP@ssw0rd",
  "confirmations": ["irreversible", "data_loss", "tickets_cancelled"]
}
```

**Process** :
1. Vérifier mot de passe
2. Annuler billets actifs (status = CANCELLED)
3. Anonymiser données :
   - email → `deleted_<uuid>@anonymized.com`
   - first_name, last_name → `"Utilisateur supprimé"`
   - phone → null
   - avatar_url → null
4. Soft delete : `deleted_at = NOW()`
5. Déconnexion forcée (Supabase)
6. Email confirmation

**Response** `200 OK` :
```json
{
  "message": "Compte supprimé. Vos données ont été anonymisées."
}
```

---

### GET `/api/user/export-data`

Export données personnelles (RGPD).

**Auth** : Requise

**Response** `200 OK` :
- Content-Type : `application/json`
- Content-Disposition : `attachment; filename="data-export.json"`

**Contenu** :
```json
{
  "user": {
    "id": "user-uuid-1",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "created_at": "2024-06-01T00:00:00.000Z"
  },
  "purchases": [...],
  "sales": [...],
  "reviews": [...],
  "notifications": [...],
  "audit_logs": [...]
}
```

---

## 13. Admin

*(Sélection endpoints clés, documentation complète admin séparée)*

### GET `/api/admin/tickets/pending`

Liste billets en attente de validation.

**Auth** : Admin uniquement

**Response** `200 OK` :
```json
{
  "tickets": [
    {
      "id": "ticket-uuid-1",
      "event": {
        "name": "Coldplay - Paris"
      },
      "seller": {
        "pseudo": "VendeurX",
        "trust_score": 75
      },
      "selling_price": 85.00,
      "original_price": 89.50,
      "pdf_url": "https://...",
      "barcode_number": "123456789",
      "extracted_price": 89.50,
      "verification_status": "PENDING",
      "created_at": "2025-02-17T10:00:00.000Z"
    }
  ],
  "count": 12
}
```

---

### PATCH `/api/admin/tickets/[id]/approve`

Approuver un billet.

**Auth** : Admin uniquement

**Response** `200 OK` :
```json
{
  "ticket": {
    "id": "ticket-uuid-1",
    "verification_status": "APPROVED",
    "status": "ACTIVE",
    "verified_by": "admin-uuid-1",
    "verified_at": "2025-02-17T16:30:00.000Z"
  }
}
```

---

### PATCH `/api/admin/tickets/[id]/reject`

Rejeter un billet.

**Auth** : Admin uniquement

**Request** :
```json
{
  "reason": "Prix de vente supérieur au prix facial (illégal)"
}
```

**Response** `200 OK` :
```json
{
  "ticket": {
    "id": "ticket-uuid-1",
    "verification_status": "REJECTED",
    "status": "REJECTED",
    "rejection_reason": "Prix de vente supérieur au prix facial (illégal)"
  }
}
```

---

## 14. Webhooks

### POST `/api/webhooks/stripe`

Webhooks Stripe (événements asynchrones).

**Headers** :
```
Stripe-Signature: t=...,v1=...
```

**Events gérés** :
- `payment_intent.succeeded` : Paiement réussi → Séquestre actif
- `payment_intent.payment_failed` : Paiement échoué → Libérer réservation
- `identity.verification_session.verified` : KYC approuvé
- `identity.verification_session.requires_input` : KYC en attente infos
- `transfer.paid` : Transfer effectué (libération séquestre)
- `payout.paid` : Payout vendeur effectué

**Response** `200 OK` :
```json
{
  "received": true
}
```

**Sécurité** :
```typescript
const signature = headers().get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
// Si signature invalide → Exception thrown
```

---

## 15. Codes d'Erreur

### Codes HTTP Standards

| Code | Signification | Utilisation |
|------|---------------|-------------|
| `200` | OK | Succès requête GET/PATCH/DELETE |
| `201` | Created | Ressource créée (POST) |
| `204` | No Content | Succès sans body (DELETE) |
| `400` | Bad Request | Validation échouée, données invalides |
| `401` | Unauthorized | Non authentifié |
| `403` | Forbidden | Authentifié mais accès refusé |
| `404` | Not Found | Ressource inexistante |
| `409` | Conflict | Conflit (ex: email déjà utilisé) |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur |

### Format Réponse Erreur
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Prix de vente doit être inférieur ou égal au prix facial",
    "details": [
      {
        "field": "selling_price",
        "message": "Doit être <= original_price",
        "received": 95.00,
        "expected": "<= 89.50"
      }
    ]
  }
}
```

### Codes Erreur Métier

| Code | Message | Context |
|------|---------|---------|
| `TICKET_NOT_AVAILABLE` | Ce billet n'est plus disponible | Réservation billet déjà vendu |
| `TICKET_ALREADY_RESERVED` | Billet déjà réservé | Tentative réservation multiple |
| `RESERVATION_EXPIRED` | Votre réservation a expiré | Timer 15 min dépassé |
| `ILLEGAL_PRICE` | Prix de vente supérieur au prix facial (illégal) | Validation billet |
| `KYC_NOT_VERIFIED` | Vérification d'identité requise | Accès route vendeur |
| `DISPUTE_WINDOW_CLOSED` | Délai pour ouvrir un litige dépassé | Ouverture litige hors J-1/J+2 |
| `REVIEW_TOO_EARLY` | Avis disponible 3 jours après le concert | Tentative avis avant J+3 |
| `DUPLICATE_TICKET` | Ce billet a déjà été listé (doublon détecté) | Upload PDF doublon |
| `INSUFFICIENT_BALANCE` | Solde insuffisant pour ce retrait | Payout vendeur |
| `STRIPE_ERROR` | Erreur de paiement | Wrapper erreurs Stripe |

### Exemples Réponses Erreur

**400 - Validation Zod** :
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": ["email"],
        "message": "Invalid email format"
      },
      {
        "path": ["password"],
        "message": "String must contain at least 8 character(s)"
      }
    ]
  }
}
```

**401 - Non authentifié** :
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentification requise"
  }
}
```

**403 - Accès refusé** :
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Vous n'avez pas accès à cette ressource"
  }
}
```

**409 - Conflit** :
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cette adresse email est déjà utilisée"
  }
}
```

**429 - Rate Limit** :
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Trop de requêtes. Réessayez dans 60 secondes.",
    "retry_after": 60
  }
}
```

**500 - Erreur Serveur** :
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Une erreur interne est survenue. Nos équipes ont été notifiées.",
    "request_id": "req_abc123" // Pour support
  }
}
```

---

## Rate Limiting

**Limites par endpoint** :

| Endpoint | Limite | Fenêtre | Reset |
|----------|--------|---------|-------|
| `/api/auth/login` | 5 req | 1 min | Sliding window |
| `/api/auth/signup` | 3 req | 1 min | Sliding window |
| `/api/payments/*` | 10 req | 1 min | Sliding window |
| `/api/disputes` (POST) | 2 req | 1 hour | Fixed window |
| Global (autres) | 100 req | 1 hour | Sliding window |

**Headers Réponse** :
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1719936000
```

**Implémentation** :
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  
  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }
  
  return NextResponse.next();
}
```

---

## Pagination

**Format standard** :

**Query Params** :
```
page        : number (default: 1, min: 1)
limit       : number (default: 20, min: 1, max: 100)
```

**Response** :
```json
{
  "data": [...],
  "pagination": {
    "total": 156,
    "page": 2,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Versioning API

**Stratégie** : URL versioning (future-proof)

**URLs** :
- Actuel (v1 implicite) : `/api/events`
- Futur (v2 explicite) : `/api/v2/events`

**Headers** :
- `API-Version: 1.0.0` (optionnel, informatif)

**Deprecation** :
- Header `Deprecation: true` sur endpoints obsolètes
- Header `Sunset: Sat, 01 Jan 2026 00:00:00 GMT` (date fin support)

---

## CORS

**Configuration** :
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://billets-ethiques.fr' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};
```

**Développement local** :
```
Access-Control-Allow-Origin: http://localhost:3000
```

---

## Changelog API

### v1.0.0 (2025-02-17) - MVP Initial Release

**Ajouts** :
- Authentification complète (signup, login, forgot password)
- CRUD Événements (liste, détail, recherche)
- Workflow achat complet (réservation, paiement, séquestre)
- Gestion billets (upload, validation, favoris)
- Transactions (achats, ventes, factures)
- Stripe Connect (onboarding, payouts)
- KYC (Stripe Identity)
- Litiges (ouverture, résolution)
- Avis (création, modération)
- Notifications (temps réel)
- Profil utilisateur (CRUD, suppression RGPD)
- Admin (validation billets, gestion litiges)

**Webhooks** :
- Stripe : `payment_intent.succeeded`, `identity.verification_session.verified`

---

**Dernière mise à jour** : 2025-02-17
**Version API** : 1.0.0 (MVP)
**Mainteneur** : Équipe Technique Billets Éthiques