/**
 * SearchBar Component
 * Barre de recherche avancée avec autocomplete
 */

'use client';

import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ISearchBarProps {
  query: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ query, onSearch }: ISearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      onSearch(localQuery.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Rechercher un événement, artiste ou ville..."
            className="h-14 pl-12 text-lg"
          />
        </div>
        <Button type="submit" size="lg" className="px-8">
          Rechercher
        </Button>
      </div>
    </form>
  );
}
