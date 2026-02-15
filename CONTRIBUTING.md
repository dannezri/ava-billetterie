# Guide de Contribution - Plateforme de Revente de Billets Éthique

## 🌳 Trunk-Based Development

Nous utilisons **Trunk-Based Development** pour garder une base de code stable et déployable à tout moment.

### Principes

- **Main branch** : Toujours stable, protégée, déployée automatiquement en production
- **Feature branches** : Courtes durées de vie (max 2-3 jours)
- **Small commits** : Commits atomiques et fréquents
- **CI/CD** : Tests automatiques sur chaque push

## 📝 Convention de Commits

Nous utilisons **Conventional Commits** :

```
type(scope): description courte

[optional body]

[optional footer(s)]
```

### Types autorisés

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, points-virgules manquants, etc.
- `refactor`: Refactoring sans changement de comportement
- `perf`: Amélioration de performance
- `test`: Ajout ou correction de tests
- `build`: Changements système de build
- `ci`: Changements CI/CD
- `chore`: Tâches diverses (dépendances, etc.)
- `revert`: Annulation d'un commit précédent

### Exemples

```bash
feat(auth): add Stripe Identity KYC verification flow
fix(tickets): prevent duplicate barcode uploads
docs(api): update webhook documentation
refactor(payments): extract escrow logic to service
perf(db): add index on tickets.barcode_number
```

## 🔄 Workflow de Développement

### 1. Créer une branche feature

```bash
# Toujours partir de main à jour
git checkout main
git pull origin main

# Créer une branche avec un nom descriptif
git checkout -b feat/stripe-kyc-integration
# ou
git checkout -b fix/duplicate-ticket-validation
```

**Convention de nommage** : `type/description-kebab-case`

### 2. Développer et committer

```bash
# Faire des commits atomiques et fréquents
git add src/services/kyc.ts
git commit -m "feat(auth): add Stripe Identity API client"

git add src/app/api/kyc/verify/route.ts
git commit -m "feat(auth): create KYC verification endpoint"
```

### 3. Pousser et créer une PR

```bash
# Pousser la branche
git push origin feat/stripe-kyc-integration

# Créer une Pull Request sur GitHub
# Utiliser le template fourni
```

### 4. Review et Merge

- **Minimum 1 review** requise
- **Tous les checks CI** doivent passer
- **Squash and merge** pour garder un historique propre
- **Supprimer la branche** après merge

## ✅ Checklist avant PR

- [ ] Code lint sans erreur (`npm run lint`)
- [ ] Types TypeScript valides (`npm run type-check`)
- [ ] Tests passent (`npm run test:ci`)
- [ ] Build réussit (`npm run build`)
- [ ] Pas de `console.log` oubliés
- [ ] Documentation à jour si API publique modifiée
- [ ] Commits suivent Conventional Commits

## 🔒 Protection de la Branche Main

### Règles automatiques (GitHub)

- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Dismiss stale approvals when new commits pushed
- ✅ Require status checks to pass before merging
  - `lint`
  - `type-check`
  - `test`
  - `build`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ❌ No force push allowed
- ❌ No deletion allowed

### Qui peut merger sur main ?

- Maintainers avec rôle "Admin"
- Après validation des CI/CD checks
- Après au moins 1 review approuvée

## 🧪 Tests

### Avant chaque commit

Les hooks Husky vérifient automatiquement :
- Formatage Prettier
- Linting ESLint
- Types TypeScript

### Avant chaque push

```bash
npm run type-check  # Vérification TypeScript
npm run lint        # Linting
npm run test:ci     # Tests unitaires
```

### Tests à écrire obligatoirement

- ✅ Logique métier critique (paiements, séquestre)
- ✅ Validations Zod
- ✅ Fonctions utilitaires
- ✅ API endpoints (tests d'intégration)

## 🚀 Déploiement

### Automatique

- **Production** : Merge sur `main` → déploiement Vercel automatique
- **Preview** : Chaque PR → déploiement preview Vercel

### Rollback

Si un bug critique en production :

```bash
# Revert du dernier commit sur main
git revert HEAD
git push origin main

# Ou revert d'un commit spécifique
git revert <commit-hash>
git push origin main
```

## 🐛 Hotfix en Production

Pour un bug critique nécessitant un déploiement immédiat :

```bash
# Créer une branche hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/critical-escrow-bug

# Fix rapide
git commit -m "fix(payments): correct escrow release calculation"

# Push et PR avec label "priority: critical"
git push origin hotfix/critical-escrow-bug

# Review express + merge immédiat
```

## 📊 Métriques de Qualité

### Objectifs

- **Build time** : < 3 minutes
- **Test coverage** : > 80% pour logique critique
- **PR review time** : < 4 heures
- **Branch lifetime** : < 3 jours
- **Main branch stability** : 100% (aucun build cassé)

## 🤝 Code Review

### Pour les reviewers

- Vérifier la logique métier
- Valider la sécurité (especially paiements/KYC)
- Suggérer des améliorations
- Vérifier les performances (queries DB)
- Confirmer les tests sont pertinents

### Ce qui est bloquant

- ❌ Logique de paiement non testée
- ❌ Faille de sécurité (SQL injection, XSS)
- ❌ Performance dégradée (N+1 queries)
- ❌ Breaking change sans migration
- ❌ Secrets hardcodés

### Ce qui n'est pas bloquant

- ✅ Suggestions de style (si ESLint passe)
- ✅ Optimisations mineures
- ✅ TODOs pour itérations futures

## 📚 Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

## 🆘 Support

- Questions techniques : Créer une Discussion GitHub
- Bugs : Créer une Issue avec le template
- Urgent : Ping sur Slack #dev-urgent
