/**
 * Search Client Component
 * Composant client pour la recherche globale
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchHistory } from '@/components/search/SearchHistory';
import { IEventFilters } from '@/types/marketplace.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as 'all' | 'events' | 'artists' | 'cities';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<any>({ events: [], artists: [], cities: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<IEventFilters>({});
  const [activeTab, setActiveTab] = useState(typeParam);
  const [history, setHistory] = useState<string[]>([]);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Fetch résultats
  const fetchResults = useCallback(async (searchQuery: string, searchType: string) => {
    if (!searchQuery.trim()) {
      setResults({ events: [], artists: [], cities: [] });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchType,
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search');

      const data = await response.json();
      setResults(data.results);

      // Ajouter à l'historique
      const newHistory = [searchQuery, ...history.filter((h) => h !== searchQuery)].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  // Charger les résultats au montage
  useEffect(() => {
    if (queryParam) {
      fetchResults(queryParam, typeParam);
    }
  }, [queryParam, typeParam]);

  // Gestion de la recherche
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${activeTab}`);
    fetchResults(newQuery, activeTab);
  };

  // Changement de tab
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'all' | 'events' | 'cities' | 'artists');
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${value}`);
      fetchResults(query, value);
    }
  };

  // Sélection depuis l'historique
  const handleSelectFromHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    router.push(`/search?q=${encodeURIComponent(historyQuery)}&type=${activeTab}`);
    fetchResults(historyQuery, activeTab);
  };

  // Effacer l'historique
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const totalResults =
    (results.events?.length || 0) +
    (results.artists?.length || 0) +
    (results.cities?.length || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec barre de recherche */}
        <div className="mb-8">
          <h1 className="mb-6 text-4xl font-bold text-slate-900">Recherche</h1>
          <SearchBar query={query} onSearch={handleSearch} />
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden w-80 shrink-0 space-y-6 lg:block">
            {/* Filtres */}
            <SearchFilters filters={filters} onFiltersChange={setFilters} />

            {/* Historique */}
            {history.length > 0 && (
              <SearchHistory
                history={history}
                onSelectQuery={handleSelectFromHistory}
                onClearHistory={handleClearHistory}
              />
            )}
          </aside>

          {/* Résultats */}
          <main className="flex-1">
            {query ? (
              <>
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">
                      Tous ({totalResults})
                    </TabsTrigger>
                    <TabsTrigger value="events">
                      Événements ({results.events?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="artists">
                      Artistes ({results.artists?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="cities">
                      Villes ({results.cities?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    {isLoading ? (
                      <div className="py-12 text-center">
                        <p className="text-slate-600">Recherche en cours...</p>
                      </div>
                    ) : (
                      <SearchResults results={results} query={query} />
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-slate-600">
                  Entrez un terme de recherche pour commencer
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
