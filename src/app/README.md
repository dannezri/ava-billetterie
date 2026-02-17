# ⚠️ ATTENTION : Dossier Obsolète

## Ce dossier `src/app/` n'est PLUS utilisé par Next.js

Next.js utilise le dossier `app/` à la **racine du projet**, pas `src/app/`.

### ✅ Structure correcte

```
/Users/dannezri/Desktop/ava/
├── app/                          ← Next.js utilise CELUI-CI
│   ├── (auth)/
│   ├── (protected)/
│   ├── (public)/
│   ├── api/                      ← Routes API ici
│   │   ├── stripe-connect/
│   │   │   ├── create-account/
│   │   │   ├── onboarding-link/
│   │   │   ├── dashboard-link/
│   │   │   ├── account-status/
│   │   │   └── test/             ← Routes de test (dev only)
│   │   └── ...
│   ├── seller/                   ← Pages vendeur ici
│   │   └── onboarding/
│   ├── layout.tsx
│   └── page.tsx
└── src/
    ├── app/                      ← ❌ OBSOLÈTE - Ne plus utiliser
    ├── components/               ← ✅ Composants React ici
    ├── lib/                      ← ✅ Utilitaires ici
    ├── services/                 ← ✅ Services métier ici
    └── ...
```

## 📋 Migration effectuée (15 février 2026)

Tous les fichiers de ce dossier ont été **migrés vers `/app/`** :

### Routes API déplacées
- ✅ `src/app/api/stripe-connect/*` → `app/api/stripe-connect/*`
- ✅ `src/app/api/debug-test/*` → `app/api/debug-test/*`
- ✅ Routes de test créées dans `app/api/stripe-connect/test/*`

### Pages déplacées
- ✅ `src/app/(dashboard)/seller/onboarding/*` → `app/seller/onboarding/*`

## 🚫 Ne PAS créer de nouveaux fichiers ici

Si vous avez besoin de créer :
- **Routes API** → Utilisez `app/api/`
- **Pages** → Utilisez `app/`
- **Composants** → Utilisez `src/components/`
- **Services** → Utilisez `src/services/`
- **Utilitaires** → Utilisez `src/lib/`

## 🔍 Pourquoi cette structure ?

Next.js 13+ (App Router) cherche les routes dans cet ordre :
1. `app/` (à la racine) ← **PRIORITAIRE**
2. `src/app/` (dans src/) ← **Ignoré si app/ existe**

Comme nous avons `app/` à la racine, **tout ce qui est dans `src/app/` est ignoré**.

## 🗑️ Action recommandée

Ce dossier peut être supprimé après vérification que tout fonctionne :

```bash
# Vérifier que les tests passent
npm run stripe:test

# Vérifier que l'app fonctionne
npm run dev

# Si tout est OK, supprimer src/app/
# rm -rf src/app/
```

## 📚 Documentation

Pour plus d'informations, voir :
- `STRIPE_CONNECT_FIXES.md` - Correctifs appliqués
- `STRIPE_CONNECT_TESTING.md` - Guide de test
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Date** : 15 février 2026  
**Statut** : ⚠️ Dossier obsolète - Migration vers `/app/` effectuée
