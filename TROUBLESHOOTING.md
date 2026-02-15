# 🔧 Troubleshooting Déploiement

## Problème : API Routes retournent 404

### Diagnostic

L'application est déployée mais `/api/health` retourne une 404.

### Cause probable

Le dossier `app/` à la racine contenait uniquement les pages par défaut de Next.js, sans les API routes. Les API routes étaient dans `src/app/api/` mais Next.js n'utilise pas `src/app/` quand un dossier `app/` existe à la racine.

### Solution appliquée

✅ Les API routes ont été copiées de `src/app/api/` vers `app/api/`
✅ Le code a été poussé sur GitHub (commit `aa171ff`)
✅ Vercel devrait redéployer automatiquement

### Vérifications

1. **Vérifier que les fichiers existent localement :**
```bash
ls -la app/api/health/route.ts
ls -la app/api/webhooks/stripe/route.ts
```

2. **Vérifier le dernier commit :**
```bash
git log -1 --oneline
```

3. **Forcer un nouveau déploiement Vercel :**
```bash
cd /Users/dannezri/Desktop/ava
vercel --prod --force
```

4. **Voir les logs de build en temps réel :**
```bash
vercel logs --follow
```

5. **Tester le health check après déploiement :**
```bash
curl https://ava-billetterie-web.vercel.app/api/health
```

Devrait retourner :
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-15T...",
    "environment": "production",
    "database": "connected",
    "stripe": "configured"
  }
}
```

### Alternative : Déploiement manuel via CLI

Si le déploiement automatique ne fonctionne pas :

```bash
cd /Users/dannezri/Desktop/ava
vercel --prod
```

Cette commande va :
1. Builder l'application localement
2. Uploader les fichiers vers Vercel
3. Déployer en production immédiatement

### Vérification Dashboard Vercel

1. Aller sur : https://vercel.com/avas-projects-033b4f47/ava-billetterie-web
2. Vérifier l'onglet "Deployments"
3. Cliquer sur le dernier déploiement
4. Vérifier les logs de build
5. S'assurer qu'il n'y a pas d'erreurs

### Erreurs courantes

#### Erreur : "Module not found"
- **Cause :** Import relatif incorrect
- **Solution :** Vérifier les chemins d'import dans `route.ts`

#### Erreur : "Prisma Client not generated"
- **Cause :** `prisma generate` n'a pas été exécuté
- **Solution :** Le script `vercel-build` devrait le faire automatiquement

#### Erreur : "Environment variable not found"
- **Cause :** Variables d'environnement manquantes sur Vercel
- **Solution :** Vérifier avec `vercel env ls`

### Commandes de diagnostic

```bash
# Vérifier les variables d'environnement Vercel
vercel env ls

# Voir les déploiements
vercel ls ava-billetterie-web

# Voir les logs
vercel logs ava-billetterie-web

# Forcer un redéploiement
vercel --prod --force
```

### Next Steps après résolution

1. ✅ Tester `/api/health`
2. ✅ Tester `/api/webhooks/stripe` (POST uniquement)
3. ✅ Vérifier les logs Vercel
4. ✅ Configurer les webhooks Stripe avec la bonne URL
5. ✅ Tester un webhook Stripe depuis le dashboard

## Support

Si le problème persiste :
1. Vérifier les logs de build dans le dashboard Vercel
2. S'assurer que `package.json` contient bien `vercel-build`
3. Vérifier que `tsconfig.json` inclut le dossier `app/`
4. Tester le build localement : `npm run build`
