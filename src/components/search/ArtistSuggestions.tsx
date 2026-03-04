/**
 * ArtistSuggestions Component
 * Suggestions d'artistes similaires
 */

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IArtistSuggestionsProps {
  artists: Array<{
    name: string;
    category: string;
    eventsCount: number;
  }>;
  onSelectArtist: (artistName: string) => void;
}

export function ArtistSuggestions({ artists, onSelectArtist }: IArtistSuggestionsProps) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Artistes similaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {artists.map((artist, index) => (
            <button
              key={index}
              onClick={() => onSelectArtist(artist.name)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{artist.name}</p>
                  <p className="text-xs text-slate-600">{artist.category}</p>
                </div>
              </div>
              <Badge variant="secondary">
                {artist.eventsCount} événement{artist.eventsCount > 1 ? 's' : ''}
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
