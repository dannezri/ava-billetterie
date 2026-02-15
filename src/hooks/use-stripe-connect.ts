/**
 * Hook personnalisé pour Stripe Connect
 * Facilite la gestion des comptes vendeurs
 */

import { useState, useCallback } from 'react';

interface AccountStatus {
  hasAccount: boolean;
  id?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabled_reason?: string;
  };
  capabilities?: {
    cardPayments?: string;
    transfers?: string;
  };
}

interface UseStripeConnectReturn {
  accountStatus: AccountStatus | null;
  loading: boolean;
  error: string | null;
  checkAccountStatus: () => Promise<void>;
  createOnboardingLink: () => Promise<string>;
  openDashboard: () => Promise<void>;
  isAccountReady: boolean;
}

export function useStripeConnect(): UseStripeConnectReturn {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Vérifier le statut du compte Connect
   */
  const checkAccountStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe-connect/account-status');
      const data = await response.json();

      if (response.ok) {
        setAccountStatus(data);
      } else {
        setAccountStatus({ hasAccount: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      setAccountStatus({ hasAccount: false });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un lien d'onboarding
   */
  const createOnboardingLink = useCallback(async (): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du lien');
      }

      return data.onboardingUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ouvrir le dashboard Stripe Express
   */
  const openDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe-connect/dashboard-link', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ouverture du dashboard');
      }

      window.open(data.url, '_blank');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Vérifier si le compte est prêt à vendre
   */
  const isAccountReady = Boolean(
    accountStatus?.hasAccount &&
      accountStatus.chargesEnabled &&
      accountStatus.payoutsEnabled &&
      accountStatus.detailsSubmitted
  );

  return {
    accountStatus,
    loading,
    error,
    checkAccountStatus,
    createOnboardingLink,
    openDashboard,
    isAccountReady,
  };
}

/**
 * Hook simple pour vérifier si l'utilisateur peut vendre
 */
export function useCanSell(): boolean {
  const { isAccountReady } = useStripeConnect();
  return isAccountReady;
}
