# ✅ Checklist Uploadcare - Déploiement

## 🎯 Configuration requise avant déploiement

### 1. Compte Uploadcare

- [ ] Créer un compte sur https://uploadcare.com/
- [ ] Créer un projet pour l'environnement de développement
- [ ] Créer un projet pour l'environnement de production
- [ ] Noter les clés API (Public Key + Secret Key)

### 2. Variables d'environnement

#### Développement (.env.local)
```bash
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey...
UPLOADCARE_SECRET_KEY=demoprivatekey...
```

#### Production (Vercel/Railway)
```bash
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=prod_public_key
UPLOADCARE_SECRET_KEY=prod_secret_key
```

- [ ] Variables configurées en développement
- [ ] Variables configurées en production
- [ ] Validation avec `npm run env:validate`

### 3. Tests

- [ ] Lancer les tests : `npm test uploadcare.test.ts`
- [ ] Test manuel : Upload PDF < 5MB → ✅
- [ ] Test manuel : Upload PDF > 5MB → ❌
- [ ] Test manuel : Upload image → ❌
- [ ] Test manuel : Upload doublon → ❌

### 4. Vérification code

- [ ] Pas d'erreurs linter : `npm run lint`
- [ ] Pas d'erreurs TypeScript dans les fichiers créés
- [ ] Build réussi : `npm run build`

## 📦 Fichiers créés (à committer)

### Configuration
- [x] `src/config/uploadcare.ts`
- [x] `env.template` (mis à jour)

### Composants
- [x] `src/components/tickets/TicketUploadWidget.tsx`
- [x] `src/components/tickets/SellTicketForm.tsx`
- [x] `src/components/tickets/index.ts`

### API
- [x] `src/app/api/tickets/create/route.ts`

### Pages
- [x] `app/(protected)/sell-ticket/page.tsx`

### Tests
- [x] `__tests__/uploadcare.test.ts`

### Documentation
- [x] `docs/UPLOADCARE_INTEGRATION.md`
- [x] `UPLOADCARE_QUICK_START.md`
- [x] `UPLOADCARE_IMPLEMENTATION_SUMMARY.md`
- [x] `UPLOADCARE_CHECKLIST.md` (ce fichier)

### Dépendances
- [x] `@uploadcare/react-widget`
- [x] `@uploadcare/upload-client`

## 🚀 Commandes de déploiement

### 1. Commit des changements

```bash
git add .
git commit -m "feat: Intégration Uploadcare pour upload billets PDF

- Widget upload avec contraintes 5MB, PDF uniquement
- Formulaire vente de billet complet
- API création avec validation et détection doublons
- Tests de validation
- Documentation complète
"
```

### 2. Déploiement

```bash
# Push vers le repo
git push origin main

# Ou déploiement direct Vercel
npm run deploy:production
```

### 3. Configuration production

```bash
# Ajouter les variables d'environnement sur Vercel
vercel env add NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY
vercel env add UPLOADCARE_SECRET_KEY

# Ou via le dashboard Vercel
# https://vercel.com/[votre-projet]/settings/environment-variables
```

## 🧪 Tests post-déploiement

### En production

- [ ] Accéder à `/sell-ticket`
- [ ] Vérifier que le widget s'affiche
- [ ] Tester upload PDF valide
- [ ] Vérifier que le billet est créé en DB
- [ ] Vérifier l'audit log
- [ ] Tester les cas d'erreur (taille, format)

### Monitoring

- [ ] Vérifier les logs Vercel
- [ ] Vérifier le dashboard Uploadcare
- [ ] Vérifier les métriques d'upload
- [ ] Configurer les alertes (optionnel)

## 📊 Métriques à surveiller

### Uploadcare Dashboard
- Nombre d'uploads par jour
- Taux d'échec
- Bande passante utilisée
- Stockage utilisé

### Application
- Nombre de billets créés
- Taux de validation (approuvé/rejeté)
- Temps moyen de validation
- Doublons détectés

## 🔒 Sécurité

### Vérifications
- [ ] Clés API en variables d'environnement (pas en dur)
- [ ] Validation côté client activée
- [ ] Validation côté serveur activée
- [ ] KYC requis pour vendre
- [ ] Détection doublons active
- [ ] Audit logs activés
- [ ] Scan antivirus Uploadcare actif

### Bonnes pratiques
- [ ] Clés de production différentes du dev
- [ ] Rotation des clés tous les 6 mois
- [ ] Monitoring des uploads suspects
- [ ] Backup régulier de la DB

## 📈 Limites et quotas

### Plan gratuit Uploadcare
- **3000 fichiers/mois**
- **3 GB stockage**
- **10 GB bande passante**

Pour le MVP (50 billets), le plan gratuit est suffisant.

### Upgrade si nécessaire
- [ ] Évaluer l'usage après 1 mois
- [ ] Prévoir upgrade si > 2500 uploads/mois
- [ ] Budget : ~$25/mois pour plan Starter

## 🆘 Troubleshooting

### Widget ne s'affiche pas
1. Vérifier la clé publique dans .env
2. Vérifier la console navigateur
3. Vérifier que le script Uploadcare se charge

### Upload échoue
1. Vérifier la taille du fichier (< 5MB)
2. Vérifier le format (PDF uniquement)
3. Vérifier les logs serveur
4. Vérifier le dashboard Uploadcare

### Doublon non détecté
1. Vérifier que le hash est bien stocké
2. Vérifier l'index DB sur `pdfHash`
3. Vérifier les logs d'audit

### Erreur KYC
1. Vérifier le statut KYC de l'utilisateur
2. Rediriger vers `/account/kyc`
3. Vérifier l'intégration Stripe Identity

## ✅ Validation finale

Avant de considérer l'intégration comme complète :

- [ ] Toutes les variables d'environnement configurées
- [ ] Tous les tests passent
- [ ] Build production réussi
- [ ] Déploiement effectué
- [ ] Tests post-déploiement OK
- [ ] Documentation à jour
- [ ] Équipe formée à l'utilisation

## 📞 Support

### Uploadcare
- Documentation : https://uploadcare.com/docs/
- Support : https://uploadcare.com/support/
- Status : https://status.uploadcare.com/

### Interne
- Documentation technique : `docs/UPLOADCARE_INTEGRATION.md`
- Guide rapide : `UPLOADCARE_QUICK_START.md`
- Résumé : `UPLOADCARE_IMPLEMENTATION_SUMMARY.md`

---

**Date de création :** 2026-02-16  
**Statut :** ✅ Prêt pour déploiement  
**Dernière mise à jour :** 2026-02-16
