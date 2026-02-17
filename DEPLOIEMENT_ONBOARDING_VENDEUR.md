# 🚀 Déploiement Onboarding Vendeur - Vercel

## ✅ Déploiement effectué

**Date** : 15 février 2026  
**Commit** : `eea0e14`  
**Branch** : `main`

---

## 📦 Modifications déployées

### Fichiers ajoutés (26 fichiers)

#### Backend (9 fichiers)
- ✅ `app/api/stripe-connect/account-status/route.ts`
- ✅ `app/api/stripe-connect/create-account/route.ts`
- ✅ `app/api/stripe-connect/dashboard-link/route.ts`
- ✅ `app/api/stripe-connect/onboarding-link/route.ts`
- ✅ `src/services/stripe-connect/index.ts`
- ✅ Routes de test (4 fichiers)

#### Frontend (8 fichiers)
- ✅ `app/seller/onboarding/page.tsx`
- ✅ `app/seller/onboarding/complete/page.tsx`
- ✅ `app/seller/onboarding/refresh/page.tsx`
- ✅ `app/seller/dashboard/page.tsx`
- ✅ `src/components/stripe-connect/SellerOnboarding.tsx`
- ✅ `src/components/stripe-connect/OnboardingFlow.tsx`
- ✅ `src/components/auth/SellerProtection.tsx`
- ✅ `src/hooks/use-stripe-connect.ts`

#### Documentation (5 fichiers)
- ✅ `ONBOARDING_VENDEUR_START.md`
- ✅ `ONBOARDING_VENDEUR_COMPLETE.md`
- ✅ `GUIDE_ONBOARDING_VENDEUR.md`
- ✅ `API_ONBOARDING_REFERENCE.md`
- ✅ `ONBOARDING_VENDEUR_README.md`

### Total : **4016 lignes** de code ajoutées

---

## 🌐 URLs de déploiement

### Production
Le déploiement sera automatiquement détecté par Vercel dans les prochaines minutes.

**Project** : `ava-billetterie-web`  
**Dernière URL** : `https://ava-billetterie-3041c133j-avas-projects-033b4f47.vercel.app`

### Vérification du déploiement

1. **Dashboard Vercel**
   - Aller sur : https://vercel.com/dashboard
   - Projet : `ava-billetterie-web`
   - Vérifier l'onglet "Deployments"

2. **Via CLI**
   ```bash
   vercel ls --yes
   ```

3. **Logs de déploiement**
   ```bash
   vercel logs ava-billetterie-web --yes
   ```

---

## ⚙️ Variables d'environnement requises

### À configurer sur Vercel

Avant que l'onboarding vendeur fonctionne en production, configurez ces variables :

```bash
# Stripe (OBLIGATOIRE)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app

# Database (déjà configurée)
DATABASE_URL=postgresql://...

# Supabase (déjà configurée)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Configuration rapide

```bash
# Via Vercel CLI
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
```

### Ou via Dashboard Vercel

1. Aller sur : https://vercel.com/dashboard
2. Sélectionner le projet `ava-billetterie-web`
3. Settings → Environment Variables
4. Ajouter les variables ci-dessus

---

## 🔗 Webhooks Stripe en production

### Étape 1 : Récupérer l'URL de production

```
https://votre-domaine.vercel.app/api/webhooks/stripe
```

### Étape 2 : Configurer sur Stripe

1. Aller sur : https://dashboard.stripe.com/webhooks
2. Cliquer sur "Add endpoint"
3. Entrer l'URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
4. Sélectionner les événements :
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `payout.paid`
   - `payout.failed`

5. Copier le "Signing secret" (`whsec_...`)
6. L'ajouter comme variable d'environnement : `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Tests post-déploiement

### 1. Vérifier l'API

```bash
# Health check
curl https://votre-domaine.vercel.app/api/health

# Test Stripe Connect (nécessite auth)
curl https://votre-domaine.vercel.app/api/stripe-connect/account-status \
  -H "Authorization: Bearer <token>"
```

### 2. Vérifier les pages

- ✅ `/seller/onboarding` - Page d'onboarding
- ✅ `/seller/onboarding/complete` - Confirmation
- ✅ `/seller/dashboard` - Dashboard (protégé)

### 3. Flow complet

1. Se connecter à l'app
2. Aller sur `/seller/onboarding`
3. Cliquer sur "Commencer la configuration"
4. Vérifier la redirection vers Stripe
5. Compléter l'onboarding Stripe (mode test)
6. Vérifier le retour sur `/seller/onboarding/complete`
7. Accéder au `/seller/dashboard`

---

## 📊 Monitoring

### Logs Vercel

```bash
# Logs en temps réel
vercel logs --follow

# Logs d'un déploiement spécifique
vercel logs <deployment-url>
```

### Stripe Dashboard

Surveiller :
- **Webhooks** : Taux de succès des webhooks
- **Connect** : Nombre de comptes créés
- **Events** : Logs des événements

### Métriques clés

- ✅ Nombre de comptes vendeurs créés
- ✅ Taux de complétion de l'onboarding
- ✅ Temps moyen d'onboarding
- ✅ Taux d'erreur des API

---

## 🚨 Troubleshooting

### Erreur de build Vercel

```bash
# Vérifier localement
npm run build

# Si erreur, corriger et repush
git add .
git commit -m "fix: build error"
git push origin main
```

### Erreur "Webhook signature failed"

```bash
# Vérifier que STRIPE_WEBHOOK_SECRET est défini
vercel env ls

# Ajouter si manquant
vercel env add STRIPE_WEBHOOK_SECRET production
```

### Erreur "Non authentifié"

```bash
# Vérifier les variables Supabase
vercel env ls | grep SUPABASE
```

### Pages 404

```bash
# Vérifier les routes dans app/
# S'assurer que les fichiers page.tsx existent
ls app/seller/onboarding/page.tsx
```

---

## 📝 Checklist post-déploiement

### Configuration Vercel
- [ ] Variables d'environnement Stripe configurées
- [ ] Variable NEXT_PUBLIC_APP_URL configurée
- [ ] Webhooks Stripe configurés
- [ ] Domaine personnalisé configuré (optionnel)

### Tests
- [ ] Health check API fonctionne
- [ ] Page d'onboarding accessible
- [ ] Création de compte Stripe fonctionne
- [ ] Redirection vers Stripe fonctionne
- [ ] Retour après onboarding fonctionne
- [ ] Dashboard vendeur accessible (après onboarding)

### Monitoring
- [ ] Logs Vercel activés
- [ ] Stripe webhooks surveillés
- [ ] Alertes configurées (optionnel)

### Documentation
- [ ] Équipe informée du déploiement
- [ ] Documentation mise à jour
- [ ] Guide de test partagé

---

## 🎯 Prochaines étapes

### Immédiat (Aujourd'hui)

1. **Configurer les variables Stripe en production**
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   ```

2. **Configurer les webhooks Stripe**
   - URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
   - Copier le secret dans Vercel

3. **Tester le flow complet**
   - Créer un compte test
   - Compléter l'onboarding
   - Vérifier le dashboard

### Court terme (Cette semaine)

4. **Monitoring**
   - Surveiller les logs
   - Vérifier les métriques Stripe
   - Tester avec des utilisateurs beta

5. **Optimisations**
   - Améliorer les temps de chargement
   - Ajouter des analytics
   - Optimiser les images

### Moyen terme (2 semaines)

6. **Fonctionnalités suivantes**
   - Upload de billets
   - KYC intégré
   - Paiements et séquestre

---

## 📞 Support

### En cas de problème

1. **Vérifier les logs Vercel**
   ```bash
   vercel logs --follow
   ```

2. **Vérifier Stripe Dashboard**
   - https://dashboard.stripe.com/logs

3. **Consulter la documentation**
   - [ONBOARDING_VENDEUR_START.md](./ONBOARDING_VENDEUR_START.md)
   - [GUIDE_ONBOARDING_VENDEUR.md](./GUIDE_ONBOARDING_VENDEUR.md)

4. **Rollback si nécessaire**
   ```bash
   # Revenir au déploiement précédent
   vercel rollback
   ```

---

## ✅ Résumé

**📦 Déploiement effectué** : ✅  
**📝 Commit** : `eea0e14`  
**🌐 Branch** : `main`  
**📊 Fichiers** : 26 fichiers ajoutés, 4016 lignes  
**⏱️ Durée estimée** : ~1-2 minutes (build)  
**🔄 Auto-deploy** : Activé (Vercel détecte le push)

### Actions requises

1. ⚠️ **Configurer les clés Stripe en production**
2. ⚠️ **Configurer les webhooks Stripe**
3. ✅ **Tester le flow d'onboarding**
4. ✅ **Surveiller les logs**

---

**Déploiement effectué le 15 février 2026**  
**Plateforme Ava - Onboarding Vendeur v1.0**
