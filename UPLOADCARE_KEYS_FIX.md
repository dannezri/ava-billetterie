# 🔧 Correction Clés Uploadcare en Double

## ❌ Problème détecté

Dans votre `.env.local`, il y a des **clés en double** :

```bash
# ❌ Clés demo (invalides)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY="demopublickey"
UPLOADCARE_SECRET_KEY="demosecretkey"

# ✅ Vraies clés (valides)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=3bde0f0118d36994c259
UPLOADCARE_SECRET_KEY=81e99de2c431f4e2ace3
```

**Node.js utilise la PREMIÈRE occurrence**, donc les clés "demo" invalides sont chargées.

## ✅ Solution

### Option 1 : Éditer manuellement `.env.local`

1. Ouvrir le fichier `.env.local`
2. **Supprimer** les lignes avec "demopublickey" et "demosecretkey"
3. Garder uniquement les vraies clés :

```bash
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=3bde0f0118d36994c259
UPLOADCARE_SECRET_KEY=81e99de2c431f4e2ace3
```

4. Sauvegarder le fichier
5. **Redémarrer le serveur Next.js** (Ctrl+C puis `npm run dev`)

### Option 2 : Script automatique

Je peux créer un script pour nettoyer automatiquement le fichier.

## 🔄 Après correction

1. Redémarrer le serveur : `npm run dev`
2. Vider le cache du navigateur (Cmd+Shift+R sur Mac)
3. Retourner sur `/tickets/new`
4. Essayer d'uploader un PDF

## ✅ Vérification

Après avoir nettoyé le fichier, vérifier avec :

```bash
cat .env.local | grep UPLOADCARE
```

Vous devriez voir **uniquement** :
```bash
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=3bde0f0118d36994c259
UPLOADCARE_SECRET_KEY=81e99de2c431f4e2ace3
```

## 🆘 Si ça ne fonctionne toujours pas

Les clés `3bde0f0118d36994c259` sont peut-être aussi des clés de test. 

Pour obtenir de **vraies clés fonctionnelles** :

1. Aller sur https://uploadcare.com/
2. Se connecter ou créer un compte
3. Créer un nouveau projet
4. Aller dans **Settings** > **API keys**
5. Copier **Public Key** et **Secret Key**
6. Remplacer dans `.env.local`

---

**Action immédiate :** Supprimer les lignes avec "demopublickey" et "demosecretkey" du fichier `.env.local`, puis redémarrer le serveur.
