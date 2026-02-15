# ⚠️ Problème de déploiement Vercel

## 🚨 Situation actuelle

**Date** : 15 février 2026  
**Problème** : Les modifications d'onboarding vendeur ne sont pas déployées sur Vercel  
**Cause** : Limite de déploiements gratuits atteinte (100 déploiements/jour)

### Erreur Vercel

```
Error: Resource is limited - try again in 20 hours 
(more than 100, code: "api-deployments-free-per-day").
```

---

## ✅ Ce qui a été fait

1. ✅ **Code committé** : Commit `eea0e14` sur GitHub
2. ✅ **Code pushé** : Disponible sur `origin/main`
3. ❌ **Déploiement Vercel** : Bloqué par la limite

### Fichiers prêts à déployer

- ✅ 26 fichiers ajoutés/modifiés
- ✅ 4016 lignes de code
- ✅ Système d'onboarding vendeur complet
- ✅ Documentation complète

---

## 🔧 Solutions

### Solution 1 : Attendre 20 heures (Recommandé)

Le déploiement automatique se déclenchera automatiquement une fois la limite réinitialisée.

**Quand** : Dans ~20 heures (vers le 16 février 2026, ~14h)  
**Action** : Aucune, le déploiement se fera automatiquement

### Solution 2 : Déclencher manuellement via Dashboard Vercel

1. Aller sur : https://vercel.com/dashboard
2. Sélectionner le projet `ava-billetterie-web`
3. Onglet "Deployments"
4. Cliquer sur "Redeploy" sur le dernier déploiement
5. Sélectionner "Use existing Build Cache" → Non
6. Cliquer sur "Redeploy"

**Note** : Cela peut aussi être bloqué par la limite.

### Solution 3 : Upgrade vers Vercel Pro (Payant)

- **Prix** : ~$20/mois
- **Avantages** :
  - Déploiements illimités
  - Builds plus rapides
  - Support prioritaire
  - Domaines personnalisés illimités

### Solution 4 : Déployer sur une autre plateforme temporairement

Alternatives gratuites :
- **Netlify** : 300 minutes de build/mois
- **Railway** : $5 de crédit gratuit/mois
- **Render** : Gratuit pour sites statiques

---

## 📊 Vérification du déploiement

### Vérifier si le nouveau déploiement est actif

```bash
# Via CLI
vercel ls --yes | head -5

# Vérifier le commit déployé
curl https://votre-domaine.vercel.app/api/health
```

### Vérifier les logs

```bash
# Logs du dernier déploiement
vercel logs --yes

# Logs en temps réel
vercel logs --follow
```

---

## 🎯 Actions recommandées

### Immédiat (Maintenant)

1. ✅ **Documenter le problème** (ce fichier)
2. ⏳ **Attendre 20 heures** pour le déploiement automatique
3. 📧 **Informer l'équipe** du délai

### Demain (16 février)

1. ✅ **Vérifier le déploiement automatique**
   ```bash
   vercel ls --yes | head -5
   ```

2. ✅ **Tester l'onboarding vendeur**
   ```
   https://votre-domaine.vercel.app/seller/onboarding
   ```

3. ✅ **Configurer les variables Stripe**
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   vercel env add NEXT_PUBLIC_APP_URL production
   ```

### Moyen terme (Cette semaine)

4. 💰 **Évaluer l'upgrade Vercel Pro**
   - Si beaucoup de déploiements nécessaires
   - Si besoin de builds plus rapides
   - Si équipe > 1 développeur

5. 🔧 **Optimiser les déploiements**
   - Limiter les déploiements de test
   - Utiliser des branches pour les tests
   - Déployer uniquement les versions stables

---

## 🧪 Tester localement en attendant

En attendant le déploiement, vous pouvez tester localement :

```bash
# 1. Lancer le serveur local
npm run dev

# 2. Ouvrir dans le navigateur
http://localhost:3000/seller/onboarding

# 3. Tester le flow complet
# - Se connecter
# - Cliquer sur "Commencer la configuration"
# - Suivre le flow Stripe (mode test)
```

### Configuration locale

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 📈 Monitoring

### Vérifier la limite de déploiements

```bash
# Via Dashboard Vercel
# Settings → Usage → Deployments
# Voir le compteur : X/100 déploiements utilisés
```

### Alternatives pour éviter la limite

1. **Branches de développement**
   - Créer une branche `dev` pour les tests
   - Déployer uniquement `main` en production

2. **Preview Deployments**
   - Utiliser les preview deployments pour les tests
   - Ne compter que les déploiements en production

3. **Build local avant push**
   ```bash
   # Tester le build localement
   npm run build
   
   # Si OK, alors push
   git push origin main
   ```

---

## 🔍 Diagnostic

### Vérifier le statut du projet

```bash
# Projet Vercel
vercel project ls

# Derniers déploiements
vercel ls --yes | head -20

# Logs du dernier déploiement
vercel logs
```

### Vérifier GitHub → Vercel webhook

1. Aller sur GitHub : https://github.com/dannezri/ava-billetterie
2. Settings → Webhooks
3. Vérifier que le webhook Vercel est actif
4. Vérifier les "Recent Deliveries"

---

## 📝 Checklist post-déploiement

Une fois le déploiement effectué (dans ~20h) :

- [ ] Vérifier que le déploiement est actif
- [ ] Tester `/seller/onboarding` → Doit afficher la page
- [ ] Tester `/seller/dashboard` → Doit afficher la page (après auth)
- [ ] Tester les API routes :
  - [ ] `POST /api/stripe-connect/onboarding-link`
  - [ ] `GET /api/stripe-connect/account-status`
  - [ ] `POST /api/stripe-connect/dashboard-link`
- [ ] Configurer les variables d'environnement Stripe
- [ ] Configurer les webhooks Stripe
- [ ] Tester le flow complet d'onboarding

---

## 💡 Leçons apprises

### Pour éviter ce problème à l'avenir

1. **Limiter les déploiements de test**
   - Tester localement avant de push
   - Utiliser des branches de développement

2. **Upgrade vers Vercel Pro si nécessaire**
   - Si équipe > 1 développeur
   - Si déploiements fréquents nécessaires

3. **Utiliser des environnements de staging**
   - Branche `staging` pour les tests
   - Branche `main` pour la production uniquement

4. **Optimiser le workflow**
   ```bash
   # Workflow recommandé
   git checkout -b feature/nouvelle-fonctionnalite
   # Développer et tester localement
   npm run build # Vérifier le build
   git push origin feature/nouvelle-fonctionnalite
   # Créer une PR
   # Merger dans main uniquement après validation
   ```

---

## 🆘 Support

### Contacts

- **Vercel Support** : https://vercel.com/support
- **Documentation** : https://vercel.com/docs
- **Status** : https://www.vercel-status.com

### Ressources

- [Vercel Limits](https://vercel.com/docs/concepts/limits/overview)
- [Vercel Pricing](https://vercel.com/pricing)
- [Deployment Frequency](https://vercel.com/docs/concepts/deployments/deployment-frequency)

---

## 📊 Résumé

| Élément | Statut | Note |
|---------|--------|------|
| Code committé | ✅ | Commit `eea0e14` |
| Code sur GitHub | ✅ | Branch `main` |
| Déploiement Vercel | ❌ | Limite atteinte |
| ETA déploiement | ⏳ | ~20 heures |
| Tests locaux | ✅ | Fonctionnels |

### Actions immédiates

1. ⏳ **Attendre 20 heures** pour le déploiement automatique
2. 🧪 **Tester localement** en attendant
3. 📧 **Informer l'équipe** du délai

### Actions demain

1. ✅ Vérifier le déploiement
2. ✅ Tester l'onboarding
3. ✅ Configurer Stripe

---

**Problème documenté le 15 février 2026**  
**Résolution attendue : 16 février 2026, ~14h**
