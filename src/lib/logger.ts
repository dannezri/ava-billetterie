import * as Sentry from '@sentry/nextjs';

/**
 * Logger centralisé intégrant Sentry pour les erreurs critiques
 */
export const logger = {
  /**
   * Log d'information standard
   */
  log: (message: string, ...args: any[]) => {
    console.log(message, ...args);
  },

  /**
   * Log d'erreur critique (envoyé à Sentry)
   */
  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(`❌ ${message}`, error);
    
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(`${message}: ${String(error)}`, 'error');
      }
    });
  },

  /**
   * Log d'avertissement (envoyé à Sentry)
   */
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`⚠️ ${message}`, context);
    
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureMessage(message, 'warning');
    });
  },
};
