/**
 * Composant d'onboarding vendeur - Flow complet
 * Affiche les étapes du processus d'onboarding
 */

'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface OnboardingFlowProps {
  currentStep: number;
}

const STEPS: Omit<OnboardingStep, 'status'>[] = [
  {
    id: 'account',
    title: 'Création du compte',
    description: 'Configuration de votre compte vendeur Stripe',
  },
  {
    id: 'identity',
    title: 'Vérification d\'identité',
    description: 'Vérifiez votre identité avec une pièce officielle',
  },
  {
    id: 'bank',
    title: 'Coordonnées bancaires',
    description: 'Ajoutez votre IBAN pour recevoir les paiements',
  },
  {
    id: 'done',
    title: 'Compte activé',
    description: 'Vous pouvez maintenant vendre des billets',
  },
];

export default function OnboardingFlow({ currentStep }: OnboardingFlowProps) {
  const getStepStatus = (index: number): OnboardingStep['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de votre compte vendeur</CardTitle>
        <CardDescription>
          Suivez ces étapes pour compléter votre profil
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {status === 'completed' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                  {status === 'active' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  {status === 'pending' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-medium ${
                        status === 'active' ? 'text-primary' : ''
                      } ${status === 'pending' ? 'text-muted-foreground' : ''}`}
                    >
                      {step.title}
                    </h3>
                    {status === 'completed' && (
                      <span className="text-xs text-green-600">✓ Terminé</span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      status === 'pending'
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Number */}
                <div className="flex-shrink-0">
                  <span
                    className={`text-sm font-medium ${
                      status === 'pending' ? 'text-muted-foreground' : 'text-primary'
                    }`}
                  >
                    {index + 1}/{STEPS.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium text-primary">
              {Math.round((currentStep / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
