/**
 * Page Profil du Dashboard Vendeur
 * Gestion des informations personnelles et onboarding (Stripe + KYC)
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SellerOnboarding } from '@/components/stripe-connect';
import IdentityVerification from '@/components/kyc/IdentityVerification';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, CreditCard, Bell } from 'lucide-react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  stripeAccountId: string | null;
  trustScore: number;
}

export default function SellerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Gestion du retour de Stripe Onboarding
  useEffect(() => {
    if (searchParams.get('success')) {
      toast({
        title: 'Compte Stripe connecté',
        description: 'Votre compte de paiement a été configuré avec succès.',
      });
      // Nettoyer l'URL
      router.replace('/dashboard/seller/profile');
    } else if (searchParams.get('refresh')) {
      toast({
        title: 'Session expirée',
        description: 'Veuillez reprendre la configuration de votre compte Stripe.',
        variant: 'destructive',
      });
      router.replace('/dashboard/seller/profile');
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          console.error('Failed to fetch profile:', response.status);
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          kycStatus: data.kycStatus as any,
          stripeAccountId: data.stripeAccountId,
          trustScore: data.trustScore || 0,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isFullyOnboarded = profile.stripeAccountId && profile.kycStatus === 'VERIFIED';

  return (
    <div className="container max-w-4xl py-8">
      {/* Header avec état global du compte */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profil Vendeur</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos informations, sécurité et configuration de votre compte vendeur
        </p>
        
        {/* ✨ NOUVEAU : KYC/Stripe requis uniquement pour le RETRAIT (pas pour vendre) */}
        {!isFullyOnboarded && (
          <Alert className="mt-4 border-blue-200 bg-blue-50 text-blue-900">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Configuration pour le retrait</AlertTitle>
            <AlertDescription>
              <strong>Vous pouvez vendre des billets dès maintenant</strong>, sans configuration
              préalable. La vérification ci-dessous est uniquement requise pour{' '}
              <a
                href="/dashboard/seller/withdraw"
                className="underline font-medium hover:no-underline"
              >
                retirer vos gains
              </a>{' '}
              :
              <ul className="list-disc list-inside mt-2 text-sm">
                {!profile.stripeAccountId && <li>Configurer le compte de paiement (Stripe)</li>}
                {profile.kycStatus !== 'VERIFIED' && <li>Vérifier votre identité (KYC)</li>}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {isFullyOnboarded && (
          <Alert className="mt-4 border-green-200 bg-green-50 text-green-900">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertTitle>Compte prêt pour les retraits</AlertTitle>
            <AlertDescription>
              Votre identité est vérifiée et votre compte bancaire est configuré. Vous pouvez vendre
              et retirer vos gains sans restriction.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger 
            value="onboarding" 
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs">Configuration</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profil</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configuration (Onboarding) */}
        <TabsContent value="onboarding" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Configuration pour le retrait</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Complétez ces étapes pour pouvoir retirer vos gains après chaque vente.{' '}
              <strong>Non requis pour vendre un billet.</strong>
            </p>
          </div>

          {/* Section 1: Paiement (Stripe) */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground font-semibold">1</span>
              <div>
                <h3 className="text-base font-semibold">Compte de paiement</h3>
                <p className="text-sm text-muted-foreground">Configuration de votre compte Stripe</p>
              </div>
            </div>
            <Separator />
            <SellerOnboarding />
          </div>

          {/* Section 2: Identité (KYC) */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground font-semibold">2</span>
              <div>
                <h3 className="text-base font-semibold">Vérification d&apos;identité</h3>
                <p className="text-sm text-muted-foreground">Vérifiez votre identité pour commencer à vendre</p>
              </div>
            </div>
            <Separator />
            <IdentityVerification status={profile.kycStatus} />
          </div>
        </TabsContent>

        {/* Tab: Profil */}
        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Informations personnelles</h3>
                <p className="text-sm text-muted-foreground">
                  Mettez à jour vos informations de contact
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" defaultValue={profile.name || ''} placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" type="tel" defaultValue={profile.phone || ''} placeholder="+33 6 ..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={profile.email || ''} 
                    disabled 
                    className="bg-muted cursor-not-allowed" 
                  />
                  <p className="text-xs text-muted-foreground">
                    ℹ️ L&apos;email ne peut pas être modifié pour des raisons de sécurité
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Annuler</Button>
                <Button>Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Sécurité du compte</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez la sécurité et la confiance de votre compte
                </p>
              </div>
              <Separator />

              {/* Trust Score */}
              <div className="rounded-lg border p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Score de confiance</h4>
                    <p className="text-sm text-muted-foreground">
                      Votre réputation sur la plateforme basée sur vos transactions
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${profile.trustScore}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-primary">{profile.trustScore}/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Augmentez votre score en vendant régulièrement et en obtenant de bonnes évaluations
                  </p>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Mot de passe</h4>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification : il y a 3 mois
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Préférences de notification</h3>
                <p className="text-sm text-muted-foreground">
                  Choisissez comment vous souhaitez être notifié
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                {[
                  {
                    id: 'sales',
                    title: 'Nouvelles ventes',
                    description: 'Recevoir un email lorsqu\'un billet est vendu',
                    enabled: true,
                    important: true,
                  },
                  {
                    id: 'payments',
                    title: 'Paiements reçus',
                    description: 'Notification lors du versement des fonds',
                    enabled: true,
                    important: true,
                  },
                  {
                    id: 'messages',
                    title: 'Messages acheteurs',
                    description: 'Alertes pour les nouveaux messages',
                    enabled: true,
                    important: false,
                  },
                  {
                    id: 'updates',
                    title: 'Mises à jour produit',
                    description: 'Nouveautés et fonctionnalités',
                    enabled: false,
                    important: false,
                  },
                  {
                    id: 'marketing',
                    title: 'Offres et promotions',
                    description: 'Recevoir les offres spéciales',
                    enabled: false,
                    important: false,
                  },
                ].map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {notification.important && (
                          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked={notification.enabled}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button>Enregistrer les préférences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
