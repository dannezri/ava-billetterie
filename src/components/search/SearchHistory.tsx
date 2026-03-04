/**
 * SearchHistory Component
 * Historique des recherches récentes (localStorage)
 */

'use client';

import { Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ISearchHistoryProps {
  history: string[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

export function SearchHistory({
  history,
  onSelectQuery,
  onClearHistory,
}: ISearchHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <Clock className="mr-2 h-4 w-4 text-blue-600" />
          Recherches récentes
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="h-auto p-0 text-xs text-slate-500 hover:text-slate-900"
        >
          Effacer
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {history.map((query, index) => (
            <button
              key={index}
              onClick={() => onSelectQuery(query)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              <span className="truncate">{query}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
