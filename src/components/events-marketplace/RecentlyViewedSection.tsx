'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecentlyViewedArtist {
  artist: string;
  imageUrl: string | null;
  eventId: string;
  viewedAt: number;
}

export interface FallbackArtist {
  artist: string;
  imageUrl: string | null;
  eventId: string;
}

interface RecentlyViewedSectionProps {
  /** Artistes populaires depuis la DB, affichés quand l'historique localStorage est vide */
  fallbackArtists?: FallbackArtist[];
}

const STORAGE_KEY = 'ava_recently_viewed';
const PLACEHOLDER_COLORS = [
  'bg-blue-50 text-blue-400',
  'bg-emerald-50 text-emerald-400',
  'bg-amber-50 text-amber-400',
  'bg-rose-50 text-rose-400',
  'bg-purple-50 text-purple-400',
];

function getPlaceholderColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

export function RecentlyViewedSection({ fallbackArtists = [] }: RecentlyViewedSectionProps) {
  const [localItems, setLocalItems] = useState<RecentlyViewedArtist[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentlyViewedArtist[] = JSON.parse(stored);
        setLocalItems(parsed.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 10));
      }
    } catch {}
  }, []);

  const handleRemove = (artist: string) => {
    const updated = localItems.filter((i) => i.artist !== artist);
    setLocalItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setLocalItems([]);
    localStorage.removeItem(STORAGE_KEY);
    setIsEditing(false);
  };

  // Avant hydratation : afficher le fallback server (évite le layout shift)
  const hasLocalHistory = mounted && localItems.length > 0;
  const isFallback = !hasLocalHistory;

  // Données à afficher : historique perso ou fallback populaire
  const displayItems: FallbackArtist[] = hasLocalHistory
    ? localItems.map((i) => ({ artist: i.artist, imageUrl: i.imageUrl, eventId: i.eventId }))
    : fallbackArtists;

  if (!mounted && fallbackArtists.length === 0) return null;
  if (mounted && displayItems.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {isFallback ? 'Populaires en ce moment' : 'Récemment consultés'}
        </h2>
        <div className="flex items-center gap-2">
          {!isFallback && isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-500 hover:text-rose-600"
              onClick={handleClearAll}
            >
              Tout effacer
            </Button>
          )}
          {!isFallback && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? 'Terminé' : 'Modifier'}
            </Button>
          )}
        </div>
      </div>

      {/* Carrousel horizontal */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {displayItems.map((item) => (
          <div key={item.artist} className="relative flex-shrink-0">
            {!isFallback && isEditing && (
              <button
                onClick={() => handleRemove(item.artist)}
                className="absolute -right-2 -top-2 z-10 rounded-full bg-gray-800 p-0.5 text-white shadow transition hover:bg-gray-700"
                aria-label={`Supprimer ${item.artist}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <Link href={`/events/artist/${encodeURIComponent(item.artist)}`}>
              <div className="group w-[140px]">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.artist}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className={cn('flex h-full w-full items-center justify-center', getPlaceholderColor(item.artist))}>
                      <span className="text-3xl font-bold opacity-60">
                        {item.artist.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {item.artist}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Utilitaire pour enregistrer un artiste consulté (à appeler depuis la page artiste).
 */
export function trackArtistView(artist: string, imageUrl: string | null, eventId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: RecentlyViewedArtist[] = stored ? JSON.parse(stored) : [];
    const filtered = existing.filter((i) => i.artist !== artist);
    const updated = [{ artist, imageUrl, eventId, viewedAt: Date.now() }, ...filtered].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
