/**
 * TicketsList Component
 * Liste des billets disponibles pour un événement
 */

'use client';

import { useState } from 'react';
import { Ticket, Filter, AlertCircle } from 'lucide-react';
import { TicketCard } from './TicketCard';
import { AdjacentGroupCard } from './AdjacentGroupCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ITicketsListProps {
  tickets: any[];
  groups?: any[];
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  isLoading?: boolean;
  /** Contexte de filtrage actif (quantity > 0) */
  filterQuantity?: number;
  filterTogether?: boolean;
}

/**
 * Skeleton pour carte billet
 */
function TicketCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketsList({
  tickets,
  groups = [],
  eventId,
  eventTitle = '',
  eventDate = '',
  isLoading = false,
  filterQuantity = 0,
  filterTogether = false,
}: ITicketsListProps) {
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc'>('price_asc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Tri des billets
  const sortedTickets = [...tickets].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Filtrage par catégorie
  const filteredTickets =
    categoryFilter === 'all'
      ? sortedTickets
      : sortedTickets.filter((t) => t.section === categoryFilter);

  // Catégories uniques
  const categories = Array.from(new Set(tickets.map((t) => t.section).filter(Boolean)));

  const activeTickets = filteredTickets.filter((t) => t.status !== 'RESERVED');
  const hasTickets = filteredTickets.length > 0;
  const hasGroups = groups.length > 0;

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <TicketCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // État vide avec filtre actif côte à côte
  if (!hasTickets && !hasGroups && filterQuantity > 1 && filterTogether) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-orange-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Aucun groupe de {filterQuantity} billets disponible
          </h3>
          <p className="mb-6 text-gray-600">
            Il n'existe pas de groupe de {filterQuantity} billets côte à côte pour cet événement.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Button variant="outline" asChild>
              <Link href={`?quantity=${filterQuantity}&together=false`}>
                Voir les billets individuels (places séparées)
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="?">Modifier ma recherche</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État vide général
  if (!hasTickets && !hasGroups) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <Ticket className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Aucun billet disponible
          </h3>
          <p className="text-gray-600">
            Il n'y a pas de billets en vente pour cet événement actuellement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Section billets individuels ─────────────────────────────────────── */}
      {hasTickets && (
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTickets.length} billet
              {activeTickets.length > 1 ? 's' : ''} disponible
              {activeTickets.length > 1 ? 's' : ''}
              {filteredTickets.length > activeTickets.length && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  (+{filteredTickets.length - activeTickets.length} temporairement réservé
                  {filteredTickets.length - activeTickets.length > 1 ? 's' : ''})
                </span>
              )}
              {filterQuantity > 1 && !filterTogether && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  (achetez-en {filterQuantity} séparément)
                </span>
              )}
            </h2>

            <div className="flex gap-2">
              {categories.length > 1 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat || ''}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Prix croissant</SelectItem>
                  <SelectItem value="price_desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={{ ...ticket, eventId }} />
            ))}
          </div>
        </section>
      )}

      {/* ── Section groupes adjacents (virtuels) ───────────────────────────── */}
      {hasGroups && (
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {groups.length} groupe{groups.length > 1 ? 's' : ''} de {filterQuantity} billets
              côte à côte
            </h2>
            <p className="text-sm text-gray-500">
              Sièges consécutifs détectés automatiquement
            </p>
          </div>
          <div className="space-y-3">
            {groups.map((group: any) => (
              <AdjacentGroupCard
                key={group.id}
                group={group}
                eventId={eventId}
                eventTitle={eventTitle}
                eventDate={eventDate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
