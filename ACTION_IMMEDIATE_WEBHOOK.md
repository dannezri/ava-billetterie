# ⚠️ ACTION REQUISE : Configuration Webhook

Votre webhook Stripe retourne une erreur 400 car la signature ne correspond pas.

## 1. Copiez cette clé (issue de votre terminal)

```
whsec_0e196ab1b77f1b8d1d98c92e5715606ba3fa3866a134cc431b6c31ddcf6d1c8e
```

## 2. Mettez à jour `.env.local`

Ouvrez `.env.local` et remplacez la ligne :

```env
STRIPE_WEBHOOK_SECRET=whsec_0e196ab1b77f1b8d1d98c92e5715606ba3fa3866a134cc431b6c31ddcf6d1c8e
```

## 3. REDÉMARREZ LE SERVEUR

C'est l'étape la plus importante. Next.js ne recharge pas les variables d'environnement automatiquement.

```bash
# Dans le terminal où tourne npm run dev
Ctrl+C
npm run dev
```

## 4. Retestez

Relancez la vérification d'identité. Vous devriez voir :
`[200] POST http://localhost:3000/api/webhooks/stripe`
