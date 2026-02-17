/**
 * Stripe Connect Service
 * Gestion des comptes Connect pour les vendeurs (Custom Accounts)
 */

import Stripe from 'stripe';
import stripe from '@/lib/stripe/client';
import prisma from '@/lib/db/prisma';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateConnectAccountParams {
  userId: string;
  email: string;
  country?: string;
  businessType?: 'individual' | 'company';
}

export interface ConnectAccountOnboardingResult {
  accountId: string;
  onboardingUrl: string;
  expiresAt: number;
}

// ============================================================================
// ACCOUNT CREATION
// ============================================================================

/**
 * Créer un compte Stripe Connect Custom Account pour un vendeur
 * 
 * @param params - Paramètres de création du compte
 * @returns ID du compte créé
 */
export async function createConnectAccount(
  params: CreateConnectAccountParams
): Promise<string> {
  const { userId, email, country = 'FR', businessType = 'individual' } = params;

  try {
    // Vérifier si l'utilisateur a déjà un compte Connect
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    if (existingUser?.stripeAccountId) {
      console.log('✅ User already has a Stripe account:', existingUser.stripeAccountId);
      return existingUser.stripeAccountId;
    }

    // Pour Express accounts, on ne doit PAS utiliser d'account_token
    // Stripe gère les ToS et les informations automatiquement via l'onboarding UI
    console.log('🚀 Creating Express account (no token needed)...');

    // Créer le compte Stripe Connect Express directement
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email, // Email directement, pas via token
      business_type: 'individual', // ✅ Spécifier explicitement "individual" pour des particuliers
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      // Configuration pour les paiements en séquestre
      settings: {
        payouts: {
          schedule: {
            // Paiements manuels via notre séquestre
            interval: 'manual',
          },
        },
      },
      metadata: {
        user_id: userId,
        platform: 'ava-ticketing',
        created_at: new Date().toISOString(),
      },
    });

    // Mettre à jour l'utilisateur dans la base de données
    // Utiliser upsert pour gérer le cas où l'utilisateur n'existe pas encore dans public.users
    // (ce qui peut arriver en dev si auth.users et public.users sont désynchronisés)
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        stripeAccountId: account.id,
      },
      create: {
        id: userId,
        email,
        stripeAccountId: account.id,
        // Valeurs par défaut pour les champs obligatoires
        kycStatus: 'PENDING',
        verifiedIdentity: false,
        trustScore: 50,
      },
    });

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ADMIN_ACTION',
        metadata: {
          action: 'stripe_connect_account_created',
          accountId: account.id,
        },
        ipAddress: 'system',
        userAgent: 'stripe-connect-service',
      },
    });

    console.log('✅ Stripe Connect account created:', account.id);
    return account.id;
  } catch (error) {
    console.error('❌ Error creating Stripe Connect account:', error);
    throw new Error('Failed to create Stripe Connect account');
  }
}

// ============================================================================
// ACCOUNT ONBOARDING
// ============================================================================

/**
 * Générer un lien d'onboarding pour compléter le compte Connect
 * 
 * @param accountId - ID du compte Stripe Connect
 * @param refreshUrl - URL de retour en cas de problème
 * @param returnUrl - URL de retour après succès
 * @returns Lien d'onboarding et expiration
 */
export async function createAccountOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<ConnectAccountOnboardingResult> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      accountId,
      onboardingUrl: accountLink.url,
      expiresAt: accountLink.expires_at,
    };
  } catch (error) {
    console.error('❌ Error creating account link:', error);
    throw new Error('Failed to create onboarding link');
  }
}

/**
 * Créer un lien de mise à jour pour un compte existant
 */
export async function createAccountUpdateLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_update',
    });

    return accountLink.url;
  } catch (error) {
    console.error('❌ Error creating account update link:', error);
    throw new Error('Failed to create account update link');
  }
}

/**
 * Créer un lien de connexion au dashboard Stripe Express
 */
export async function createLoginLink(accountId: string): Promise<string> {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    console.error('❌ Error creating login link:', error);
    throw new Error('Failed to create login link');
  }
}

// ============================================================================
// ACCOUNT VERIFICATION STATUS
// ============================================================================

/**
 * Vérifier le statut d'un compte Connect
 */
export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
        disabled_reason: account.requirements?.disabled_reason,
      },
      capabilities: {
        cardPayments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      },
    };
  } catch (error) {
    console.error('❌ Error retrieving account status:', error);
    throw new Error('Failed to retrieve account status');
  }
}

/**
 * Vérifier si un compte est prêt à recevoir des paiements
 */
export async function isAccountReadyForPayments(accountId: string): Promise<boolean> {
  try {
    const status = await getAccountStatus(accountId);
    return (
      status.chargesEnabled &&
      status.detailsSubmitted &&
      status.capabilities.cardPayments === 'active' &&
      status.capabilities.transfers === 'active'
    );
  } catch (error) {
    console.error('❌ Error checking account readiness:', error);
    return false;
  }
}

// ============================================================================
// BALANCE & TRANSFERS
// ============================================================================

/**
 * Récupérer le solde d'un compte Connect
 */
export async function getAccountBalance(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    return {
      available: balance.available,
      pending: balance.pending,
      connectReserved: balance.connect_reserved,
    };
  } catch (error) {
    console.error('❌ Error retrieving account balance:', error);
    throw new Error('Failed to retrieve account balance');
  }
}

/**
 * Créer un payout manuel vers le compte bancaire du vendeur
 * Utilisé après libération du séquestre
 */
export async function createPayout(
  accountId: string,
  amount: number,
  currency: string = 'eur',
  metadata?: Record<string, string>
): Promise<Stripe.Payout> {
  try {
    const payout = await stripe.payouts.create(
      {
        amount,
        currency,
        metadata: metadata || {},
      },
      {
        stripeAccount: accountId,
      }
    );

    console.log('✅ Payout created:', payout.id);
    return payout;
  } catch (error) {
    console.error('❌ Error creating payout:', error);
    throw new Error('Failed to create payout');
  }
}

// ============================================================================
// EXTERNAL ACCOUNT (Bank Account)
// ============================================================================

/**
 * Lister les comptes bancaires d'un compte Connect
 */
export async function listExternalAccounts(accountId: string) {
  try {
    const externalAccounts = await stripe.accounts.listExternalAccounts(accountId, {
      object: 'bank_account',
      limit: 10,
    });

    return externalAccounts.data;
  } catch (error) {
    console.error('❌ Error listing external accounts:', error);
    throw new Error('Failed to list external accounts');
  }
}

/**
 * Ajouter un compte bancaire à un compte Connect
 * Note: En production, cela devrait être fait via l'interface Stripe Connect
 */
export async function addExternalAccount(
  accountId: string,
  bankToken: string
): Promise<Stripe.BankAccount | Stripe.Card> {
  try {
    const externalAccount = await stripe.accounts.createExternalAccount(accountId, {
      external_account: bankToken,
    });

    console.log('✅ External account added:', externalAccount.id);
    return externalAccount;
  } catch (error) {
    console.error('❌ Error adding external account:', error);
    throw new Error('Failed to add external account');
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Récupérer l'ID du compte Connect d'un utilisateur
 */
export async function getUserConnectAccountId(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    return user?.stripeAccountId || null;
  } catch (error) {
    console.error('❌ Error retrieving user Connect account:', error);
    return null;
  }
}

/**
 * Supprimer un compte Connect (à utiliser avec prudence)
 */
export async function deleteConnectAccount(accountId: string): Promise<void> {
  try {
    await stripe.accounts.del(accountId);
    console.log('✅ Connect account deleted:', accountId);
  } catch (error) {
    console.error('❌ Error deleting Connect account:', error);
    throw new Error('Failed to delete Connect account');
  }
}

