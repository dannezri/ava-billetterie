/**
 * Design System Showcase
 * 
 * Exemples d'utilisation de tous les composants du Design System
 * Utilisé pour la documentation et les tests visuels
 */

'use client';

import * as React from 'react';
import {
  Mail,
  Search,
  Lock,
  User,
  ShoppingCart,
  Heart,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Calendar,
  MapPin,
  CreditCard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBadge,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DesignSystemShowcase() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <div className="container mx-auto max-w-7xl space-y-16 py-12">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold lg:text-5xl">
          Design System{' '}
          <span className="text-gradient-primary">AVA Platform</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Composants réutilisables pour une expérience cohérente
        </p>
      </div>

      {/* Colors Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Couleurs</h2>
          <p className="text-muted-foreground">
            Trust Blue (primaire) et Accent Green (secondaire)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Trust Blue */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Trust Blue - Primaire</CardTitle>
              <CardDescription>
                Confiance, sécurité, transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <div className="h-16 rounded bg-trustBlue-100" />
                  <p className="text-xs text-center">100</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-trustBlue-300" />
                  <p className="text-xs text-center">300</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-trustBlue-500" />
                  <p className="text-xs text-center font-semibold">500</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-trustBlue-700" />
                  <p className="text-xs text-center">700</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-trustBlue-900" />
                  <p className="text-xs text-center">900</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accent Green */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Accent Green - Secondaire</CardTitle>
              <CardDescription>Validation, succès, confiance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <div className="h-16 rounded bg-accentGreen-100" />
                  <p className="text-xs text-center">100</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-accentGreen-300" />
                  <p className="text-xs text-center">300</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-accentGreen-500" />
                  <p className="text-xs text-center font-semibold">500</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-accentGreen-700" />
                  <p className="text-xs text-center">700</p>
                </div>
                <div className="space-y-1">
                  <div className="h-16 rounded bg-accentGreen-900" />
                  <p className="text-xs text-center">900</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Buttons</h2>
          <p className="text-muted-foreground">
            Différentes variantes et tailles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Variantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Variantes principales */}
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primaire</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="success">Succès</Button>
              <Button variant="destructive">Danger</Button>
              <Button variant="warning">Attention</Button>
              <Button variant="info">Info</Button>
            </div>

            <Separator />

            {/* Variantes secondaires */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="subtle">Subtle</Button>
            </div>

            <Separator />

            {/* Tailles */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Petit</Button>
              <Button size="default">Normal</Button>
              <Button size="lg">Grand</Button>
              <Button size="xl">Très grand</Button>
            </div>

            <Separator />

            {/* États */}
            <div className="flex flex-wrap gap-3">
              <Button loading>Chargement...</Button>
              <Button disabled>Désactivé</Button>
              <Button
                leftIcon={<CheckCircle />}
                onClick={() => setIsLoading(!isLoading)}
              >
                Avec icône gauche
              </Button>
              <Button rightIcon={<ShoppingCart />}>Avec icône droite</Button>
            </div>

            <Separator />

            {/* Boutons avec icônes uniquement */}
            <div className="flex flex-wrap gap-3">
              <Button size="icon-sm" variant="ghost">
                <Heart />
              </Button>
              <Button size="icon" variant="outline">
                <ShoppingCart />
              </Button>
              <Button size="icon-lg" variant="default">
                <Download />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inputs Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Inputs</h2>
          <p className="text-muted-foreground">
            Champs de saisie avec validation et icônes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Variantes et États</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tailles */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tailles</label>
              <div className="space-y-3">
                <Input inputSize="sm" placeholder="Petit input" />
                <Input inputSize="default" placeholder="Input normal" />
                <Input inputSize="lg" placeholder="Grand input" />
              </div>
            </div>

            <Separator />

            {/* Avec icônes */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Avec icônes</label>
              <div className="space-y-3">
                <Input leftIcon={<Mail />} placeholder="Email" />
                <Input leftIcon={<Search />} placeholder="Rechercher..." />
                <Input
                  leftIcon={<Lock />}
                  type="password"
                  placeholder="Mot de passe"
                />
                <Input
                  leftIcon={<User />}
                  rightIcon={<Eye />}
                  placeholder="Nom d'utilisateur"
                />
              </div>
            </div>

            <Separator />

            {/* États de validation */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Validation</label>
              <div className="space-y-3">
                <Input
                  leftIcon={<Mail />}
                  error="Cette adresse email est invalide"
                  placeholder="email@exemple.com"
                  defaultValue="email-invalide"
                />
                <Input
                  leftIcon={<Mail />}
                  success
                  placeholder="email@exemple.com"
                  defaultValue="email@valid.com"
                />
                <Input
                  helperText="Nous ne partagerons jamais votre email"
                  placeholder="Email"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Cards</h2>
          <p className="text-muted-foreground">
            Conteneurs flexibles pour différents contenus
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card de billet */}
          <Card variant="elevated" interactive className="relative">
            <CardBadge variant="success">Disponible</CardBadge>
            <CardHeader>
              <CardTitle as="h4">Concert - Jul</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Accor Arena, Paris
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  15 Mars 2026
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Prix facial
                  </span>
                  <span className="font-medium line-through">65€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Prix de vente
                  </span>
                  <span className="text-2xl font-bold text-primary">45€</span>
                </div>
                <div className="rounded-md bg-accentGreen-50 p-2 text-center text-sm font-medium text-accentGreen-700">
                  Économisez 20€ (31%)
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" leftIcon={<ShoppingCart />}>
                Acheter maintenant
              </Button>
            </CardFooter>
          </Card>

          {/* Card de profil vendeur */}
          <Card variant="outline">
            <CardHeader centerContent>
              <Avatar className="h-20 w-20">
                <AvatarImage src="/avatar-placeholder.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <CardTitle as="h5">Jean Dupont</CardTitle>
              <Badge variant="default" className="badge-success">
                <CheckCircle className="mr-1 h-3 w-3" />
                Vendeur vérifié
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Ventes</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-secondary">4.9</div>
                  <div className="text-sm text-muted-foreground">Note</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-trustBlue-600">
                    95%
                  </div>
                  <div className="text-sm text-muted-foreground">Fiabilité</div>
                </div>
              </div>
            </CardContent>
            <CardFooter align="center">
              <Button variant="outline" className="w-full">
                Voir le profil
              </Button>
            </CardFooter>
          </Card>

          {/* Card de transaction */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle as="h5">Transaction</CardTitle>
                  <CardDescription>#ABC123456789</CardDescription>
                </div>
                <CardBadge variant="success">Complété</CardBadge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">15 Fév 2026</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Montant billet</span>
                  <span className="font-medium">45.00€</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Frais plateforme
                  </span>
                  <span className="font-medium">2.25€</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total payé</span>
                  <span className="text-lg text-primary">47.25€</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="flex-1">
                Télécharger le billet
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Real-world examples */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Exemples Pratiques</h2>
          <p className="text-muted-foreground">
            Scénarios d'utilisation réels
          </p>
        </div>

        <div className="space-y-6">
          {/* Formulaire de recherche */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Recherche de billets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  leftIcon={<Search />}
                  placeholder="Événement, artiste, lieu..."
                />
                <Input
                  leftIcon={<MapPin />}
                  placeholder="Ville ou région"
                />
                <Input
                  leftIcon={<Calendar />}
                  type="date"
                  placeholder="Date"
                />
                <Button variant="default" className="md:col-span-2">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de mise en vente */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Mettre un billet en vente</CardTitle>
              <CardDescription>
                Remplissez les informations de votre billet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Événement</label>
                <Input placeholder="Concert - Jul" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix facial</label>
                  <Input
                    leftIcon={
                      <span className="text-muted-foreground">€</span>
                    }
                    type="number"
                    placeholder="65.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix de vente</label>
                  <Input
                    leftIcon={
                      <span className="text-muted-foreground">€</span>
                    }
                    type="number"
                    placeholder="45.00"
                    helperText="Prix ≤ prix facial"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload du billet (PDF)
                </label>
                <div className="flex gap-2">
                  <Input type="file" accept=".pdf" className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Upload />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" className="flex-1">
                Annuler
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
              >
                Mettre en vente
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Status badges */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">États et Badges</h2>
          <p className="text-muted-foreground">
            Indicateurs visuels de statut
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Statuts de billets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge className="badge-success">Disponible</Badge>
            <Badge className="badge-warning">En attente</Badge>
            <Badge className="badge-info">Réservé</Badge>
            <Badge className="badge-error">Rejeté</Badge>
            <Badge variant="secondary">Vendu</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h4">Statuts de transactions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge className="badge-info">Séquestre</Badge>
            <Badge className="badge-success">Libéré</Badge>
            <Badge className="badge-error">Litige</Badge>
            <Badge className="badge-warning">En attente</Badge>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
        <h3 className="text-xl font-semibold">
          Prêt à utiliser le Design System ?
        </h3>
        <p className="mt-2 text-muted-foreground">
          Consultez la documentation complète dans{' '}
          <code className="rounded bg-muted px-2 py-1 text-sm">
            DESIGN_SYSTEM.md
          </code>
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button variant="default">Commencer</Button>
          <Button variant="outline">Documentation</Button>
        </div>
      </div>
    </div>
  );
}

export default DesignSystemShowcase;
