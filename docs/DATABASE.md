# 📊 Database — Workflow Migrations Prisma

## ⚠️ RÈGLE D'OR : Plus JAMAIS `prisma db push` en production

`db push` écrase le schéma sans traçabilité. Utiliser **uniquement** `prisma migrate`.

---

## Développement Local

```bash
# 1. Modifier le schéma
vim prisma/schema.prisma

# 2. Générer la migration (crée prisma/migrations/YYYYMMDDHHMMSS_name/)
npx prisma migrate dev --name nom_descriptif

# 3. Prisma applique la migration ET régénère le client automatiquement
```

## Staging / Preview

```bash
npx prisma migrate deploy
npx prisma migrate status
```

## Production

```bash
# 1. TOUJOURS faire un backup AVANT
# Supabase : Settings → Database → Backups → Create backup

# 2. Tester en staging d'abord
DATABASE_URL="postgresql://staging..." npx prisma migrate deploy

# 3. Appliquer en prod
DATABASE_URL="postgresql://prod..." npx prisma migrate deploy

# 4. Vérifier
npx prisma migrate status
# Résultat attendu : "Database schema is up to date"
```

## Rollback Migration

```bash
# Si migration échoue :
npx prisma migrate resolve --rolled-back "YYYYMMDDHHMMSS_name"

# Restaurer backup DB (Supabase UI : Settings → Database → Backups → Restore)

# Supprimer le fichier migration problématique
rm -rf prisma/migrations/YYYYMMDDHHMMSS_name
```

---

## 🚨 Checklist Avant Chaque Migration Production

- [ ] Backup DB créé (Supabase Backups)
- [ ] Migration testée en staging
- [ ] Aucun `DROP TABLE` ou `DROP COLUMN` non intentionnel (`grep DROP prisma/migrations/*/migration.sql`)
- [ ] Indexes ajoutés pour colonnes filtrées
- [ ] Foreign keys correctes
- [ ] Notification équipe si migration > 30s

---

## Scripts npm disponibles

```bash
npm run db:migrate:dev      # Développement local
npm run db:migrate:deploy   # Production / Staging
npm run db:migrate:status   # Vérifier état
npm run db:studio           # Ouvrir Prisma Studio (UI visuelle)
npm run db:seed             # Seeder la base
```

---

## État Actuel des Migrations

| Migration | Date | Description |
|-----------|------|-------------|
| `20260215193226_init` | 15 fév 2026 | Schéma initial |
| `20260223120000_baseline_drift` | 23 fév 2026 | Corrections drift baseline |
| `20260226120000_add_ticket_groups` | 26 fév 2026 | Groupes de billets |
| `20260302120000_add_payouts_system` | 2 mar 2026 | Système de virements |
