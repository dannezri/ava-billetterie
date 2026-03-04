/**
 * Page Recherche Globale
 * Route: /search
 */

import { Suspense } from 'react';
import { SearchClient } from './search-client';

export const metadata = {
  title: 'Recherche - Marketplace Billets',
  description: 'Recherchez des événements, artistes et villes',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchClient />
    </Suspense>
  );
}
