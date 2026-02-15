# Routes de Test Stripe Connect

⚠️ **ATTENTION** : Ces routes sont **uniquement disponibles en développement** et sont automatiquement désactivées en production.

## Vue d'ensemble

Ces routes permettent de tester l'intégration Stripe Connect sans authentification, ce qui facilite les tests automatisés et le développement local.

## Routes disponibles

### 1. Créer un compte de test
```bash
POST /api/stripe-connect/test/create-account
```

**Body:**
```json
{
  "userId": "test-user-123",
  "email": "seller@example.com",
  "country": "FR",
  "businessType": "individual"
}
```

**Response:**
```json
{
  "success": true,
  "accountId": "acct_xxxxxxxxxxxxx",
  "message": "Compte Stripe Connect de test créé avec succès",
  "warning": "Ceci est une route de test - désactivée en production"
}
```

### 2. Récupérer le statut d'un compte
```bash
GET /api/stripe-connect/test/account-status?accountId=acct_xxxxxxxxxxxxx
```

**Response:**
```json
{
  "success": true,
  "status": {
    "id": "acct_xxxxxxxxxxxxx",
    "chargesEnabled": false,
    "payoutsEnabled": false,
    "detailsSubmitted": false,
    "requirements": {...},
    "capabilities": {...}
  },
  "warning": "Ceci est une route de test - désactivée en production"
}
```

### 3. Générer un lien d'onboarding
```bash
POST /api/stripe-connect/test/onboarding-link
```

**Body:**
```json
{
  "accountId": "acct_xxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "onboardingUrl": "https://connect.stripe.com/setup/...",
  "expiresAt": 1234567890,
  "warning": "Ceci est une route de test - désactivée en production"
}
```

### 4. Générer un lien dashboard
```bash
POST /api/stripe-connect/test/dashboard-link
```

**Body:**
```json
{
  "accountId": "acct_xxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/express/...",
  "warning": "Ceci est une route de test - désactivée en production"
}
```

## Utilisation avec le script de test

Le script `scripts/test-stripe-connect.sh` utilise automatiquement ces routes :

```bash
# Exécuter tous les tests
npm run stripe:test

# Ou individuellement
bash scripts/test-stripe-connect.sh create
bash scripts/test-stripe-connect.sh onboarding
bash scripts/test-stripe-connect.sh status
bash scripts/test-stripe-connect.sh dashboard
```

## Sécurité

- ✅ **Désactivées automatiquement en production** via `isDevelopment`
- ✅ Retourne 403 si appelées hors développement
- ✅ Ne nécessitent pas d'authentification utilisateur
- ⚠️ **NE JAMAIS** committer avec `isDevelopment` modifié

## Différences avec les routes de production

| Aspect | Routes de Test | Routes de Production |
|--------|---------------|----------------------|
| Authentification | Aucune | Requise (Supabase) |
| Environnement | Development uniquement | Tous |
| Sécurité | Basse (tests) | Haute (production) |
| userId | Paramètre optionnel | Récupéré de la session |
| Logs | Verbose | Standard |

## Routes de production

Les routes de production (avec authentification) sont dans :
- `/api/stripe-connect/create-account`
- `/api/stripe-connect/onboarding-link`
- `/api/stripe-connect/dashboard-link`
- `/api/stripe-connect/account-status`

Ces routes nécessitent une session Supabase valide et sont utilisées par l'application web.
