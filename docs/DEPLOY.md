# 🚀 DÉPLOIEMENT — Guide Phase 0 Quick Wins

## Prérequis

- [ ] Backup DB Supabase créé (Settings → Database → Backups → Create backup)
- [ ] Variables Upstash Redis ajoutées sur Vercel
- [ ] Branch `phase-0-quick-wins` testée sur preview Vercel

---

## Variables d'Environnement à Ajouter sur Vercel

```bash
# Rate Limiting — Upstash Redis
# Créer sur https://upstash.com → Redis → Create Database (région Europe)
UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=Axxxxxxxxxxxxxxxxxxxxx
```

---

## Étapes de Déploiement

### 1. Preview Branch (Staging)

```bash
git push origin phase-0-quick-wins
# Vercel crée automatiquement une preview URL

# Tests sur preview :
curl -I https://ava-git-phase-0-xxx.vercel.app | grep -E "Strict-Transport|X-Frame|X-Content"
# Attendu : 3 headers présents
```

### 2. Migration Database

```bash
# ⚠️ BACKUP D'ABORD (Supabase UI)

# Vérifier status (doit être "up to date")
DIRECT_URL="postgresql://..." npx prisma migrate status

# Si migrations pending :
DIRECT_URL="postgresql://..." npx prisma migrate deploy
```

### 3. Production Deploy

```bash
git checkout main
git merge phase-0-quick-wins
git push origin main
# Vercel déploie automatiquement
```

### 4. Smoke Tests Post-Deploy

```bash
# 1. Headers sécurité
curl -I https://votre-domaine.vercel.app | grep -E "Strict-Transport|X-Frame|X-Content-Type|Permissions-Policy"

# 2. Route debug supprimée
curl https://votre-domaine.vercel.app/api/debug-test
# Attendu : 404

# 3. Route stripe-test supprimée
curl https://votre-domaine.vercel.app/api/stripe-test
# Attendu : 404

# 4. Rate limiting auth (6 requêtes login = 429 attendu)
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://votre-domaine.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Sortie attendue : 401 401 401 401 401 429

# 5. Upload PDF malveillant (fichier .txt renommé)
# Via UI : Essayer d'uploader un fichier .txt renommé en .pdf
# Attendu : erreur "Signature de fichier invalide"
```

---

## Rollback (si problème)

```bash
# Rollback Vercel : Deployments → Previous → Promote to Production

# Si migration DB problématique :
npx prisma migrate resolve --rolled-back "YYYYMMDDHHMMSS_name"
# + Restaurer backup Supabase (UI : Settings → Database → Backups → Restore)
```

---

## Monitoring Post-Deploy (48h)

- [ ] Sentry : 0 nouveau spike d'erreurs
- [ ] Upstash Console : Rate limiting actif (voir métriques)
- [ ] Supabase : Connexions DB normales
- [ ] Vercel Analytics : Latence p99 < 2s

---

## Checklist Phase 0 — Production Ready

### Sécurité
- [x] Routes debug supprimées (`/api/debug-test`, `/api/stripe-test`, etc.)
- [x] Rate limiting actif (login: 5/min, signup: 3/10min, reset: 3/h, paiements: 10/h)
- [x] File upload magic bytes validation (PDF + MIME)
- [x] Headers sécurité (HSTS, X-Frame, X-Content-Type, Permissions-Policy)
- [x] 8 vulnérabilités npm (4 low, 4 high Next.js — documentées SECURITY.md)
- [x] Variables d'env via `config` centralisé (plus de `process.env` direct Stripe)

### Database
- [x] 4 migrations Prisma présentes et à jour
- [x] Fichier parasite `schema.prisma:117` supprimé
- [x] Documentation workflow (`docs/DATABASE.md`)

### RGPD
- [x] PostHog retiré de la politique cookies (jamais initialisé)
- [x] Cookie policy cohérente avec services actifs

### Configuration
- [x] Typo Uploadcare corrigée (`ucarecd.net` → `ucarecdn.net`)

### Bloquants P0 Restants (Phase 1)
- [ ] Migration Next.js 15 (fix CVE DoS)
- [ ] Rate limiting complet (paiements cart/group, stripe-connect)
- [ ] Middleware RBAC centralisé
- [ ] Banner cookies RGPD interactif
- [ ] CSP headers
