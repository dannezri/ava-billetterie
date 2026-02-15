/**
 * Template Example
 * 
 * Exemple de page utilisant le Design System AVA
 * Copiez ce template pour créer vos propres pages
 */

'use client';

import * as React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

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

interface TemplateExampleProps {
  title?: string;
  description?: string;
}

export function TemplateExample({
  title = 'Titre de la Page',
  description = 'Description de la page',
}: TemplateExampleProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    // Simuler une recherche
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
            <Button variant="default" leftIcon={<Plus />}>
              Nouvelle action
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-custom py-8">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                leftIcon={<Search />}
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" leftIcon={<Filter />}>
                Filtres
              </Button>
              <Button
                variant="default"
                onClick={handleSearch}
                loading={isLoading}
              >
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Item 1 */}
          <Card interactive variant="elevated" className="relative">
            <CardBadge variant="success">Nouveau</CardBadge>
            <CardHeader>
              <CardTitle as="h4">Item Principal</CardTitle>
              <CardDescription>
                Description de l'item avec des détails importants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Catégorie</span>
                  <Badge variant="default">Premium</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">15 Mars 2026</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="text-2xl font-bold text-primary">45€</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full">
                Action principale
              </Button>
            </CardFooter>
          </Card>

          {/* Item 2 */}
          <Card interactive variant="elevated">
            <CardHeader>
              <CardTitle as="h4">Item Secondaire</CardTitle>
              <CardDescription>
                Autre type d'item avec un style différent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contenu de l'item avec des informations utiles pour l'utilisateur.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" className="flex-1">
                Annuler
              </Button>
              <Button variant="secondary" className="flex-1">
                Valider
              </Button>
            </CardFooter>
          </Card>

          {/* Item 3 */}
          <Card interactive variant="outline" className="relative">
            <CardBadge variant="warning">En attente</CardBadge>
            <CardHeader>
              <CardTitle as="h4">Item en Attente</CardTitle>
              <CardDescription>
                Nécessite une action de l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-warning/10 p-4 text-center">
                <p className="text-sm font-medium text-warning">
                  Action requise
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="warning" className="w-full">
                Compléter
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Empty State (conditionnel) */}
        {searchQuery && !isLoading && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <div className="mx-auto max-w-md">
                <h3 className="text-xl font-semibold">Aucun résultat</h3>
                <p className="mt-2 text-muted-foreground">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle as="h3">Informations Complémentaires</CardTitle>
            <CardDescription>
              Détails importants pour l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <h4 className="font-semibold text-primary">Trust Blue</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Utilisé pour les actions principales et la confiance
              </p>
            </div>
            <div className="rounded-lg bg-secondary/10 p-4">
              <h4 className="font-semibold text-secondary">Accent Green</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Utilisé pour les validations et les succès
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-card">
        <div className="container-custom py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 AVA Platform. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <Button variant="link" size="sm">
                À propos
              </Button>
              <Button variant="link" size="sm">
                Confidentialité
              </Button>
              <Button variant="link" size="sm">
                Conditions
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TemplateExample;
