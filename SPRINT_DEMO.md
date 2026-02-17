# 🎥 Guide de Démo Sprint Review - Flow Vendeur

Ce guide décrit les étapes pour démontrer le flow vendeur complet lors de la Sprint Review.

## 🎭 Scénarios

Nous allons tester 3 profils différents pour valider tous les états du système.

### 👤 Profil 1 : Le Nouveau Vendeur (Alice)
**Objectif** : Montrer l'inscription et l'onboarding Stripe complet.

1.  **Inscription** : Créer un compte avec `alice.demo@gmail.com` (ou un email valide).
2.  **Navigation** : Aller sur **Profil Vendeur** via `/dashboard/seller/profile`.
3.  **Dashboard Profil** : Constater l'état "Action requise" (Stripe manquant + KYC manquant).
4.  **Stripe Onboarding** :
    *   Section "1. Compte de paiement".
    *   Cliquer sur "Configurer le compte de paiement".
    *   Remplir le formulaire Stripe (Mode Test : utiliser `FR` et IBAN de test Stripe).
    *   Retour au site -> Toast "Compte Stripe connecté".
5.  **KYC** :
    *   Section "2. Vérification d'identité".
    *   Cliquer sur "Démarrer la vérification".
    *   Uploader une fausse pièce d'identité (Mode Test : utiliser les images par défaut Stripe).
    *   Attendre la validation (Webhook).
    *   Rafraîchissement automatique -> Badge "Vérifié" et alerte verte "Compte vérifié".

### 👤 Profil 2 : Le Vendeur en Attente (Bob)
**Objectif** : Montrer la persistance de l'état et les rappels.

1.  **Inscription** : Créer un compte avec `bob.demo@gmail.com`.
2.  **Stripe Onboarding** : Faire l'onboarding Stripe MAIS s'arrêter avant le KYC ou simuler un échec.
3.  **Dashboard** :
    *   Aller sur `/dashboard/seller`.
    *   Vérifier que le badge KYC indique "En attente" ou "Requis".
    *   Aller sur `/dashboard/seller/profile` pour voir l'alerte jaune "Action requise".
    *   Aller sur `/dashboard/seller/payments` : Voir le solde à 0€.

### 👤 Profil 3 : Le Vendeur Confirmé (Charlie)
**Objectif** : Montrer les fonctionnalités post-onboarding.

*Pré-requis : Avoir complété le flow avec Charlie avant la démo.*

1.  **Connexion** : Se connecter avec `charlie.demo@gmail.com`.
2.  **Dashboard Paiements** :
    *   Aller sur `/dashboard/seller/payments`.
    *   Montrer le solde disponible (simuler via API si possible ou expliquer).
    *   Cliquer sur "Dashboard Stripe" pour montrer l'accès au compte Express.
    *   Cliquer sur "Retirer mes gains" (si solde > 0) pour montrer la modale de confirmation.
3.  **Mise en vente (Mock)** :
    *   Aller sur "Vendre un billet".
    *   Montrer que l'accès est autorisé car KYC validé.

## 🛠️ Préparation Technique

### 1. Webhook Listener
Assurez-vous que le listener Stripe tourne pour valider le KYC en temps réel.

```bash
npm run stripe:listen
```

### 2. Base de données
Si besoin de nettoyer un utilisateur de test pour recommencer :

```bash
npx tsx scripts/reset-stripe-user.ts <email>
```

### 3. Sentry
Vérifier que Sentry capture bien les erreurs (déjà testé via Wizard).

## 📝 Checklist Démo

- [ ] Serveur lancé (`npm run dev`)
- [ ] Stripe Listen lancé
- [ ] `.env.local` configuré (Stripe keys + Sentry DSN)
- [ ] Emails de test accessibles (ou fictifs valides comme @gmail.com)
