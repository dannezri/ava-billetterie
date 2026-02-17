# 🔑 Comment obtenir des clés Uploadcare valides

## ⚠️ Problème actuel

Les clés dans `.env.local` ne sont pas valides :
```bash
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=3bde0f0118d36994c259  ❌ INVALIDE
UPLOADCARE_SECRET_KEY=81e99de2c431f4e2ace3              ❌ INVALIDE
```

Test API : Page not found ❌

## ✅ Solution : Obtenir de vraies clés

### Étape 1 : Créer un compte Uploadcare

1. Aller sur **https://uploadcare.com/**
2. Cliquer sur **"Sign Up"** ou **"Get Started"**
3. Créer un compte avec votre email
4. Confirmer votre email

### Étape 2 : Créer un projet

1. Une fois connecté, vous arriverez sur le dashboard
2. Si demandé, cliquer sur **"Create Project"**
3. Donner un nom : `Ava Development` ou `Ava MVP`
4. Sélectionner le plan **Free** (3000 fichiers/mois)

### Étape 3 : Récupérer les clés API

1. Dans le menu de gauche, aller dans **"Settings"** 
2. Cliquer sur **"API keys"**
3. Vous verrez :
   ```
   Public Key:  pub_xxxxxxxxxxxxxxxx
   Secret Key:  sec_xxxxxxxxxxxxxxxx
   ```

### Étape 4 : Configurer dans .env.local

1. Ouvrir le fichier `.env.local` à la racine du projet
2. Remplacer les lignes Uploadcare :
   ```bash
   NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=pub_xxxxxxxxxxxxxxxx
   UPLOADCARE_SECRET_KEY=sec_xxxxxxxxxxxxxxxx
   ```
3. Sauvegarder

### Étape 5 : Redémarrer

1. **Arrêter le serveur** Next.js (Ctrl+C dans le terminal)
2. **Relancer** : `npm run dev`
3. **Rafraîchir** la page `/tickets/new` dans le navigateur
4. **Tester** l'upload d'un PDF

## 🎯 Plan gratuit Uploadcare

Le plan gratuit inclut :
- ✅ **3000 fichiers/mois** (largement suffisant pour le MVP)
- ✅ **3 GB stockage**
- ✅ **10 GB bande passante**
- ✅ **Scan antivirus**
- ✅ **CDN mondial**

Pour 50 billets du MVP : **amplement suffisant** ! 🎉

## 🔗 Liens utiles

- **Dashboard Uploadcare** : https://app.uploadcare.com/
- **API Keys** : https://app.uploadcare.com/projects/-/api-keys/
- **Documentation** : https://uploadcare.com/docs/

## 🆘 Alternative temporaire

Si vous voulez tester le formulaire rapidement sans Uploadcare, je peux créer un composant d'upload temporaire avec `<input type="file">` HTML standard.

---

**Important** : Sans vraies clés Uploadcare, le widget ne fonctionnera pas et affichera toujours "Oops! Something went wrong".
