# 📡 API Reference - Onboarding Vendeur

Guide de référence rapide pour les API routes Stripe Connect.

---

## 🔑 Authentification

Toutes les routes nécessitent une authentification Supabase.

```typescript
// Header requis
Authorization: Bearer <supabase_access_token>
```

---

## 📍 Endpoints

### 1. Créer un compte Connect

**POST** `/api/stripe-connect/create-account`

Crée un nouveau compte Stripe Connect pour l'utilisateur authentifié.

#### Request Body

```json
{
  "country": "FR",           // Optionnel, défaut: "FR"
  "businessType": "individual" // Optionnel, défaut: "individual"
}
```

#### Response Success (200)

```json
{
  "success": true,
  "accountId": "acct_1234567890",
  "message": "Compte Stripe Connect créé avec succès"
}
```

#### Response Error (500)

```json
{
  "error": "Erreur lors de la création du compte Connect",
  "details": "Stripe API error message"
}
```

#### Exemple cURL

```bash
curl -X POST http://localhost:3000/api/stripe-connect/create-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"country":"FR","businessType":"individual"}'
```

---

### 2. Générer un lien d'onboarding

**POST** `/api/stripe-connect/onboarding-link`

Génère un lien d'onboarding Stripe. Si l'utilisateur n'a pas de compte, il sera créé automatiquement.

#### Request Body

Aucun body requis. Le système récupère automatiquement l'`accountId` de l'utilisateur.

#### Response Success (200)

```json
{
  "success": true,
  "accountId": "acct_1234567890",
  "onboardingUrl": "https://connect.stripe.com/setup/s/...",
  "expiresAt": 1708012345
}
```

#### Response Error (401)

```json
{
  "error": "Non authentifié"
}
```

#### Response Error (500)

```json
{
  "error": "Erreur lors de la génération du lien d'onboarding",
  "details": "Error message"
}
```

#### URLs de retour

Le système configure automatiquement :
- **Refresh URL** : `/seller/onboarding/refresh` (lien expiré)
- **Return URL** : `/seller/onboarding/complete` (succès)

#### Exemple cURL

```bash
curl -X POST http://localhost:3000/api/stripe-connect/onboarding-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

#### Exemple JavaScript

```typescript
const response = await fetch('/api/stripe-connect/onboarding-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();

if (data.success) {
  // Rediriger vers Stripe
  window.location.href = data.onboardingUrl;
}
```

---

### 3. Vérifier le statut du compte

**GET** `/api/stripe-connect/account-status`

Récupère le statut du compte Stripe Connect de l'utilisateur.

#### Query Parameters

Aucun. Le système récupère automatiquement l'`accountId` de l'utilisateur.

#### Response Success (200) - Compte existant

```json
{
  "success": true,
  "hasAccount": true,
  "id": "acct_1234567890",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true,
  "requirements": {
    "currentlyDue": [],
    "eventuallyDue": [],
    "pastDue": [],
    "pendingVerification": [],
    "disabled_reason": null
  },
  "capabilities": {
    "cardPayments": "active",
    "transfers": "active"
  }
}
```

#### Response Success (200) - Pas de compte

```json
{
  "success": false,
  "hasAccount": false,
  "message": "Aucun compte Stripe Connect trouvé"
}
```

#### Response Error (401)

```json
{
  "error": "Non authentifié"
}
```

#### Exemple cURL

```bash
curl http://localhost:3000/api/stripe-connect/account-status \
  -H "Authorization: Bearer <token>"
```

#### Exemple JavaScript

```typescript
const response = await fetch('/api/stripe-connect/account-status');
const data = await response.json();

if (data.hasAccount) {
  console.log('Statut:', {
    chargesEnabled: data.chargesEnabled,
    payoutsEnabled: data.payoutsEnabled,
    detailsSubmitted: data.detailsSubmitted,
  });
}
```

---

### 4. Générer un lien dashboard

**POST** `/api/stripe-connect/dashboard-link`

Génère un lien vers le dashboard Stripe Express pour le vendeur.

#### Request Body

Aucun body requis. Le système récupère automatiquement l'`accountId` de l'utilisateur.

#### Response Success (200)

```json
{
  "success": true,
  "url": "https://connect.stripe.com/express/acct_.../..."
}
```

#### Response Error (404)

```json
{
  "error": "Aucun compte Stripe Connect trouvé"
}
```

#### Response Error (500)

```json
{
  "error": "Erreur lors de la génération du lien dashboard",
  "details": "Error message"
}
```

#### Exemple cURL

```bash
curl -X POST http://localhost:3000/api/stripe-connect/dashboard-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

#### Exemple JavaScript

```typescript
const response = await fetch('/api/stripe-connect/dashboard-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();

if (data.success) {
  // Ouvrir dans un nouvel onglet
  window.open(data.url, '_blank');
}
```

---

## 🔄 Flow complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clique "Devenir Vendeur"                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend appelle POST /onboarding-link                   │
│    → Si pas de compte, création automatique                 │
│    → Génération du lien Stripe                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirection vers Stripe Connect UI                       │
│    → User remplit le formulaire                             │
│    → Vérifie identité                                        │
│    → Ajoute coordonnées bancaires                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Stripe redirige vers /seller/onboarding/complete         │
│    → Compte activé                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. User accède au dashboard vendeur                         │
│    → GET /account-status pour vérifier                      │
│    → Accès aux fonctionnalités vendeur                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Tests

### Environnement de test

```bash
# Variables d'environnement
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Données de test

```json
{
  "email": "test@example.com",
  "phone": "+33612345678",
  "country": "FR",
  "businessType": "individual",
  "iban": "FR1420041010050500013M02606"
}
```

### Tester avec Postman

1. **Importer la collection** :
   - URL de base : `http://localhost:3000/api/stripe-connect`
   - Ajouter l'authentification Bearer

2. **Séquence de tests** :
   - POST `/create-account`
   - POST `/onboarding-link`
   - GET `/account-status`
   - POST `/dashboard-link`

---

## 🛡️ Sécurité

### Headers requis

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Validation

- ✅ Authentification Supabase obligatoire
- ✅ Vérification de l'utilisateur dans la DB
- ✅ Validation des paramètres d'entrée
- ✅ Gestion des erreurs Stripe
- ✅ Audit logs automatiques

### Limitations

- **Rate limiting** : Implémenté par Stripe (pas de limite côté app)
- **Expiration des liens** : 5 minutes pour les liens d'onboarding
- **Pays supportés** : FR par défaut (configurable)

---

## 📊 Codes d'erreur

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 401 | Non authentifié | Token invalide/expiré | Se reconnecter |
| 404 | Compte non trouvé | Pas de compte Stripe | Créer un compte |
| 500 | Erreur serveur | Erreur Stripe API | Vérifier les logs |

---

## 🔗 Liens utiles

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Account Onboarding](https://stripe.com/docs/connect/enable-payment-acceptance-guide)
- [Express Dashboard](https://stripe.com/docs/connect/express-dashboard)
- [Testing Guide](https://stripe.com/docs/connect/testing)

---

**API Reference v1.0**  
**Dernière mise à jour : 15 février 2026**
