# 🔐 Test Authentification Stripe Connect

Ce guide explique comment tester les fonctionnalités Stripe Connect qui nécessitent une authentification.

## ⚠️ Problème 401 Unauthorized

Si vous voyez des erreurs 401 dans la console pour `/api/stripe-connect/account-status` ou `/onboarding-link`, c'est normal si vous n'êtes pas connecté.

## ✅ Comment tester manuellement

1.  **Lancez le serveur** :
    ```bash
    npm run dev
    ```

2.  **Ouvrez le navigateur** :
    Allez sur `http://localhost:3000`.

3.  **Connectez-vous** :
    - Cliquez sur "Se connecter" ou "S'inscrire".
    - Créez un compte ou connectez-vous.

4.  **Accédez à l'onboarding** :
    - Allez sur `http://localhost:3000/seller/onboarding`.
    - Le composant `SellerOnboarding` vérifiera automatiquement votre statut.
    - Vous ne devriez plus voir d'erreur 401.

## 🤖 Test automatisé (Avancé)

Pour tester via API (curl/Postman), vous avez besoin d'un token Supabase valide.

1.  Connectez-vous dans le navigateur.
2.  Ouvrez les DevTools (F12) -> Application -> Local Storage.
3.  Cherchez la clé `sb-<project-id>-auth-token`.
4.  Copiez `access_token`.
5.  Utilisez ce token dans vos requêtes :

    ```bash
    curl http://localhost:3000/api/stripe-connect/account-status \
      -H "Authorization: Bearer <VOTRE_ACCESS_TOKEN>"
    ```

## 🛠️ Scripts de test

Le script `scripts/test-stripe-connect.sh` utilise des routes de test (`/api/stripe-connect/test/*`) qui **contournent** l'authentification Supabase pour vérifier la logique Stripe isolément.

```bash
bash scripts/test-stripe-connect.sh test
```

Utilisez ce script pour vérifier que la configuration Stripe (clés API) est correcte.
