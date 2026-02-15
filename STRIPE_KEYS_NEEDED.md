# 🔑 Clés Stripe Requises pour le Déploiement

## ⚠️ Action Immédiate Requise

Le build Vercel échoue car les clés Stripe ne sont pas configurées.

## 📋 Clés à Récupérer

Allez sur votre Dashboard Stripe : **https://dashboard.stripe.com/apikeys**

### 1. Clé Publique (Publishable Key)
- Format : `pk_test_...` (mode test) ou `pk_live_...` (mode live)
- Utilisée côté client pour créer des tokens de paiement
- **Sûre à exposer** dans le code frontend

### 2. Clé Secrète (Secret Key)
- Format : `sk_test_...` (mode test) ou `sk_live_...` (mode live)
- Utilisée côté serveur pour les appels API Stripe
- **NE JAMAIS EXPOSER** publiquement

## 🚀 Méthode Rapide : Commandes Directes

Une fois que vous avez vos clés, exécutez ces commandes :

```bash
cd /Users/dannezri/Desktop/ava

# Ajouter STRIPE_SECRET_KEY
echo "sk_test_VOTRE_CLE_SECRETE_ICI" | vercel env add STRIPE_SECRET_KEY production
echo "sk_test_VOTRE_CLE_SECRETE_ICI" | vercel env add STRIPE_SECRET_KEY preview
echo "sk_test_VOTRE_CLE_SECRETE_ICI" | vercel env add STRIPE_SECRET_KEY development

# Ajouter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo "pk_test_VOTRE_CLE_PUBLIQUE_ICI" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
echo "pk_test_VOTRE_CLE_PUBLIQUE_ICI" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
echo "pk_test_VOTRE_CLE_PUBLIQUE_ICI" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY development
```

**Remplacez :**
- `sk_test_VOTRE_CLE_SECRETE_ICI` par votre vraie clé secrète
- `pk_test_VOTRE_CLE_PUBLIQUE_ICI` par votre vraie clé publique

## 📝 Alternative : Script Automatisé

Vous pouvez aussi utiliser le script :

```bash
cd /Users/dannezri/Desktop/ava

# Définir les variables
export STRIPE_SECRET_KEY="sk_test_VOTRE_CLE_SECRETE_ICI"
export STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIQUE_ICI"

# Exécuter le script
bash scripts/add-stripe-keys.sh
```

## ✅ Après Configuration

Une fois les clés ajoutées, redéployez :

```bash
vercel --prod
```

Ou attendez que le déploiement automatique se déclenche via GitHub.

## 🔍 Vérifier les Variables Configurées

```bash
vercel env ls
```

Vous devriez voir :
- ✅ `STRIPE_SECRET_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `DATABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## ⚠️ Mode Test vs Production

Pour le MVP, utilisez les clés **TEST** (commencent par `pk_test_` et `sk_test_`).

Les clés de **PRODUCTION** (commencent par `pk_live_` et `sk_live_`) ne doivent être utilisées qu'après les tests complets.

## 📚 Documentation Stripe

- API Keys : https://dashboard.stripe.com/apikeys
- Webhooks : https://dashboard.stripe.com/webhooks
- Documentation : https://stripe.com/docs/keys

## 🆘 Besoin d'Aide ?

Si vous n'avez pas encore de compte Stripe :
1. Créez un compte sur https://stripe.com
2. Activez le mode Test
3. Récupérez vos clés de test
4. Configurez-les avec les commandes ci-dessus

---

**Une fois configuré, votre application sera entièrement déployée ! 🎉**
