/**
 * Page Découverte Concerts & Festivals
 * Route: /events
 *
 * Architecture "marketplace musicale" :
 *   - Hero carousel (artistes mis en avant)
 *   - Filtres horizontaux sticky (catégories musicales + dates)
 *   - Section "Récemment consultés" (localStorage)
 *   - Section "Recommandé pour vous" (artistes groupés)
 *   - Section "Catégories populaires"
 */

import { prisma } from '@/lib/prisma';
import { EventsSearchBar } from '@/components/events-marketplace/EventsSearchBar';
import { HeroCarousel } from '@/components/events-marketplace/HeroCarousel';
import { FiltersBar } from '@/components/events-marketplace/FiltersBar';
import { RecentlyViewedSection, FallbackArtist } from '@/components/events-marketplace/RecentlyViewedSection';
import { RecommendedSection } from '@/components/events-marketplace/RecommendedSection';
import { CategoriesSection } from '@/components/events-marketplace/CategoriesSection';
import { ArtistCardData } from '@/components/events-marketplace/ArtistCard';

export const metadata = {
  title: 'Concerts & Festivals - Billets Éthiques',
  description:
    'Trouvez vos artistes préférés et achetez vos billets au meilleur prix. Concerts, festivals, événements live.',
};

// Catégories musicales autorisées (filtrer tout ce qui est sport / théâtre)
const MUSIC_CATEGORIES = [
  'Pop',
  'Rock',
  'Rap',
  'Hip-Hop',
  'Électro',
  'Jazz',
  'Reggae',
  'Classique',
  'Metal',
  'R&B',
  'Soul',
  'Folk',
  'Country',
  'Latin',
  'K-Pop',
  'Concert',
  'Festival',
  'Musique',
];

interface EventsPageProps {
  searchParams: Promise<{
    category?: string;
    date?: string;
    location?: string;
  }>;
}

function getDateRange(dateFilter?: string): { gte: Date; lte?: Date } | { gte: Date } {
  const now = new Date();
  if (dateFilter === 'week') {
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    return { gte: now, lte: end };
  }
  if (dateFilter === 'weekend') {
    const day = now.getDay();
    const daysUntilSat = (6 - day + 7) % 7 || 0;
    const sat = new Date(now);
    sat.setDate(now.getDate() + daysUntilSat);
    sat.setHours(0, 0, 0, 0);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    sun.setHours(23, 59, 59, 999);
    return { gte: sat, lte: sun };
  }
  if (dateFilter === 'month') {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { gte: now, lte: end };
  }
  return { gte: now };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const { category, date, location } = params;

  // Filtre catégorie : si fournie et musicale, l'utiliser ; sinon, toutes les catégories musicales
  const categoryFilter =
    category && MUSIC_CATEGORIES.includes(category)
      ? { in: [category] }
      : { in: MUSIC_CATEGORIES };

  const dateRange = getDateRange(date);

  // Clause where de base
  const whereBase = {
    eventDate: dateRange,
    OR: [
      { category: categoryFilter },
      // Inclure aussi les events sans catégorie mais avec artiste (edge case)
      ...(category ? [] : [{ category: null, artist: { not: null } }]),
    ],
    ...(location ? { city: location } : {}),
  };

  // ─────────────────────────────────────────────────────────────
  // AGRÉGATION : Grouper par artiste
  // ─────────────────────────────────────────────────────────────
  const artistGroups = await prisma.event.groupBy({
    by: ['artist'],
    where: {
      ...whereBase,
      artist: { not: null },
    },
    _count: { id: true },
    _min: { eventDate: true },
    _max: { eventDate: true },
    orderBy: { _min: { eventDate: 'asc' } },
  });

  // Enrichir chaque artiste avec l'image du premier événement
  const artistsWithDetails: ArtistCardData[] = await Promise.all(
    artistGroups.map(async (grp) => {
      const firstEvent = await prisma.event.findFirst({
        where: {
          artist: grp.artist,
          eventDate: dateRange,
        },
        orderBy: { eventDate: 'asc' },
        select: { id: true, imageUrl: true, city: true, category: true },
      });

      return {
        artist: grp.artist ?? 'Artiste inconnu',
        eventsCount: grp._count.id,
        firstEventDate: grp._min.eventDate,
        lastEventDate: grp._max.eventDate,
        imageUrl: firstEvent?.imageUrl ?? null,
        city: firstEvent?.city ?? null,
        category: firstEvent?.category ?? null,
      };
    }),
  );

  // ─────────────────────────────────────────────────────────────
  // RÉCEMMENT CONSULTÉS — fallback : artistes les plus populaires (hors filtre date)
  // Chargés indépendamment pour toujours afficher quelque chose
  // ─────────────────────────────────────────────────────────────
  const popularGroups = await prisma.event.groupBy({
    by: ['artist'],
    where: { eventDate: { gte: new Date() }, artist: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const fallbackArtists: FallbackArtist[] = await Promise.all(
    popularGroups.map(async (grp) => {
      const ev = await prisma.event.findFirst({
        where: { artist: grp.artist, eventDate: { gte: new Date() } },
        orderBy: { eventDate: 'asc' },
        select: { id: true, imageUrl: true },
      });
      return {
        artist: grp.artist ?? 'Artiste inconnu',
        imageUrl: ev?.imageUrl ?? null,
        eventId: ev?.id ?? '',
      };
    }),
  );

  // ─────────────────────────────────────────────────────────────
  // HERO : Top 5 artistes avec le plus d'événements
  // ─────────────────────────────────────────────────────────────
  const heroArtists = [...artistsWithDetails]
    .sort((a, b) => b.eventsCount - a.eventsCount)
    .slice(0, 5)
    .map((a) => ({
      artist: a.artist,
      eventsCount: a.eventsCount,
      imageUrl: a.imageUrl,
      firstEventId: '', // Non utilisé dans le hero (lien vers /artist/xxx)
    }));

  // ─────────────────────────────────────────────────────────────
  // RECOMMANDÉ : artistes restants (hors hero)
  // ─────────────────────────────────────────────────────────────
  const heroNames = new Set(heroArtists.map((h) => h.artist));
  const recommended = artistsWithDetails
    .filter((a) => !heroNames.has(a.artist))
    .slice(0, 12);

  // ─────────────────────────────────────────────────────────────
  // FALLBACK : si aucun artiste trouvé, tous les événements sans filtre musique
  // (au cas où la DB n'a pas encore de catégories musicales)
  // ─────────────────────────────────────────────────────────────
  let finalHeroArtists = heroArtists;
  let finalRecommended = recommended;

  if (artistsWithDetails.length === 0) {
    const allGroups = await prisma.event.groupBy({
      by: ['artist'],
      where: { eventDate: { gte: new Date() }, artist: { not: null } },
      _count: { id: true },
      _min: { eventDate: true },
      _max: { eventDate: true },
      orderBy: { _min: { eventDate: 'asc' } },
    });

    const allArtists: ArtistCardData[] = await Promise.all(
      allGroups.map(async (grp) => {
        const ev = await prisma.event.findFirst({
          where: { artist: grp.artist, eventDate: { gte: new Date() } },
          orderBy: { eventDate: 'asc' },
          select: { imageUrl: true, city: true, category: true },
        });
        return {
          artist: grp.artist ?? 'Artiste inconnu',
          eventsCount: grp._count.id,
          firstEventDate: grp._min.eventDate,
          lastEventDate: grp._max.eventDate,
          imageUrl: ev?.imageUrl ?? null,
          city: ev?.city ?? null,
          category: ev?.category ?? null,
        };
      }),
    );

    const sortedAll = [...allArtists].sort((a, b) => b.eventsCount - a.eventsCount);
    finalHeroArtists = sortedAll.slice(0, 5).map((a) => ({
      artist: a.artist,
      eventsCount: a.eventsCount,
      imageUrl: a.imageUrl,
      firstEventId: '',
    }));
    const heroNamesAll = new Set(finalHeroArtists.map((h) => h.artist));
    finalRecommended = sortedAll.filter((a) => !heroNamesAll.has(a.artist)).slice(0, 12);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search bar */}
      <EventsSearchBar />

      {/* Hero Carousel */}
      <HeroCarousel artists={finalHeroArtists} />

      {/* Filtres horizontaux (sticky) */}
      <FiltersBar categories={MUSIC_CATEGORIES} />

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* "Récemment consultés" — historique perso (localStorage) + fallback DB */}
        <RecentlyViewedSection fallbackArtists={fallbackArtists} />

        {/* "Recommandé pour vous" */}
        <RecommendedSection artists={finalRecommended} />

        {/* "Catégories populaires" */}
        <CategoriesSection categories={MUSIC_CATEGORIES.slice(0, 12)} />

      </div>
    </div>
  );
}
