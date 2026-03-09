# Git Workflow — Ava Billetterie

## Structure des branches

```
main (Production — protégée, déploiement Vercel auto)
  ├── feature/*  (nouvelles fonctionnalités)
  └── hotfix/*   (fixes urgents production)
```

| Branche | Rôle | Protection | Déploiement |
|---------|------|------------|-------------|
| `main` | Production stable | PR obligatoire | Vercel prod auto |
| `feature/*` | Développement | Aucune | Vercel preview auto |
| `hotfix/*` | Fix urgent prod | Aucune | Vercel preview auto |

---

## Développer une feature

```bash
# 1. Toujours partir de main à jour
git checkout main
git pull origin main

# 2. Créer branche descriptive
git checkout -b feature/nom-descriptif

# 3. Développer + committer (convention Conventional Commits)
git add .
git commit -m "feat: description courte"
git commit -m "fix: correction bug X"
git commit -m "chore: mise à jour dépendances"

# 4. Pusher → Preview Vercel créée automatiquement
git push origin feature/nom-descriptif

# 5. Tester la Preview URL (visible dans GitHub PR / Vercel dashboard)

# 6. Ouvrir une Pull Request vers main
# → Review → Merge → Deploy prod automatique

# 7. Supprimer la branche après merge
git branch -d feature/nom-descriptif
git push origin --delete feature/nom-descriptif
```

---

## Hotfix urgent (production cassée)

```bash
# 1. Partir de main
git checkout main
git pull origin main

# 2. Créer branche hotfix
git checkout -b hotfix/description-bug

# 3. Corriger + tester
git add .
git commit -m "fix: description du correctif"

# 4. Push → PR immédiate vers main
git push origin hotfix/description-bug

# 5. Merge rapide → deploy prod automatique
# 6. Supprimer branche hotfix
git branch -d hotfix/description-bug
git push origin --delete hotfix/description-bug
```

---

## Règles absolues

- **TOUJOURS** partir de `main` à jour avant de créer une branche
- **1 feature = 1 branche** (pas de branches multi-features)
- **JAMAIS** committer directement sur `main` (protection activée sur GitHub)
- **JAMAIS** créer une feature branch depuis une autre feature branch
- **TOUJOURS** supprimer la branche après merge

---

## Convention Conventional Commits

Format : `<type>(<scope optionnel>): <description>`

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance, dépendances |
| `docs` | Documentation |
| `style` | Formatage, CSS |
| `refactor` | Refactoring sans changement fonctionnel |
| `test` | Ajout/modification de tests |
| `perf` | Amélioration performance |

Exemples :
```
feat(stripe): add payment retry mechanism
fix(auth): resolve session expiry on mobile
chore: upgrade next.js to 15.2
docs: update API contracts
```

---

## Commandes utiles

```bash
# Mettre à jour main local
git checkout main && git pull origin main

# Voir toutes les branches
git branch -a

# Mettre à jour sa feature avec les derniers commits de main
git checkout feature/ma-feature
git rebase main

# Supprimer branches locales déjà mergées
git branch --merged main | grep -v "main" | xargs git branch -d

# Supprimer une branche distante
git push origin --delete feature/ancienne

# Nettoyer références distantes supprimées
git fetch --prune

# Voir les tags
git tag -l

# Revenir à un état sauvegardé (tag backup)
git checkout backup-pre-migration-20260309
```

---

## Workflow Vercel

- **`main`** → déploiement automatique sur `ava-billetterie.vercel.app` (prod)
- **`feature/*`** → Preview URL générée automatiquement (visible dans GitHub PR)
- **`hotfix/*`** → Preview URL générée automatiquement

La Preview URL est disponible dans :
- L'onglet **Checks** de la Pull Request GitHub
- Le **Dashboard Vercel** → onglet Deployments

---

## Sécurité

- Ne **jamais** committer de fichiers `.env*` (couverts par `.gitignore`)
- Ne **jamais** committer `.vercel/` ou `*.bak`
- Les secrets sont gérés dans Vercel Dashboard → Environment Variables
- Tag de backup créé avant toute migration : `backup-pre-migration-20260309`
