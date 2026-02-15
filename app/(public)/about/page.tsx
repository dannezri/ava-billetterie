/**
 * About Page
 * Example page using MainLayout
 */

import { MainLayout } from '@/components/layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Heart, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-12 md:py-16">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">À propos d&apos;AVA</h1>
          <p className="text-xl text-muted-foreground">
            La plateforme de revente de billets éthique et sécurisée qui
            protège acheteurs et vendeurs.
          </p>
        </div>

        {/* Values */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Système d&apos;escrow pour protéger vos transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vos fonds sont sécurisés jusqu&apos;à confirmation de
                l&apos;événement. Aucun risque de fraude.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Éthique</CardTitle>
              <CardDescription>
                Pas de spéculation excessive sur les prix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nous limitons les marges pour éviter la revente abusive et
                protéger les fans.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Transparence</CardTitle>
              <CardDescription>
                Frais clairs et historique complet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pas de frais cachés. Vous savez exactement ce que vous payez ou
                recevez.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              AVA Billetterie est né de la frustration face aux plateformes de
              revente traditionnelles qui ne protègent ni les acheteurs ni les
              vendeurs.
            </p>
            <p>
              Nous avons créé une solution technique innovante combinant
              vérification d&apos;identité, escrow automatique et détection de
              fraude pour offrir la meilleure expérience possible.
            </p>
            <p>
              Notre mission est simple : permettre à chacun d&apos;acheter ou
              vendre des billets en toute confiance.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
