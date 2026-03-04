'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroArtist {
  artist: string;
  eventsCount: number;
  imageUrl: string | null;
  firstEventId: string;
}

interface HeroCarouselProps {
  artists: HeroArtist[];
}

const PLACEHOLDER_GRADIENT = [
  'from-violet-900 via-purple-800 to-indigo-900',
  'from-rose-900 via-pink-800 to-orange-900',
  'from-emerald-900 via-teal-800 to-cyan-900',
  'from-amber-900 via-orange-800 to-red-900',
  'from-blue-900 via-indigo-800 to-purple-900',
];

export function HeroCarousel({ artists }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % artists.length);
  }, [artists.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + artists.length) % artists.length);
  }, [artists.length]);

  useEffect(() => {
    if (isPaused || artists.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, isPaused, artists.length]);

  if (artists.length === 0) return null;

  const current_artist = artists[current];

  return (
    <section
      className="relative h-[480px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image ou gradient */}
      {current_artist.imageUrl ? (
        <Image
          src={current_artist.imageUrl}
          alt={current_artist.artist}
          fill
          className="object-cover transition-opacity duration-700"
          priority
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            PLACEHOLDER_GRADIENT[current % PLACEHOLDER_GRADIENT.length],
          )}
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-lg">
            <h1 className="mb-3 text-6xl font-bold text-white drop-shadow-lg">
              {current_artist.artist}
            </h1>
            {current_artist.eventsCount > 1 && (
              <p className="mb-6 text-white/85 text-lg">
                {current_artist.eventsCount} dates disponibles
              </p>
            )}
            <Button
              size="lg"
              asChild
              className="bg-white text-black hover:bg-white/90 font-semibold shadow-xl"
            >
              <Link href={`/events/artist/${encodeURIComponent(current_artist.artist)}`}>
                Voir les billets
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Flèche gauche */}
      {artists.length > 1 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/35"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Flèche droite */}
      {artists.length > 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/35"
          aria-label="Suivant"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Dots indicateurs */}
      {artists.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {artists.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Aller au slide ${index + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === current ? 'w-8 bg-white' : 'w-2 bg-white/50',
              )}
            />
          ))}
        </div>
      )}

      {/* Badge favoris (coin supérieur droit) */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
        <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
        <span>3.7k</span>
      </div>
    </section>
  );
}
