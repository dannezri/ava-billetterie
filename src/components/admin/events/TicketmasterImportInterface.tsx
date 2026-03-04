'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Music,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ITicketmasterEventWithStatus {
  ticketmaster_id: string;
  title: string;
  artist: string;
  category: string;
  event_date: string;
  doors_open_time?: string;
  venue: string;
  city: string;
  country: string;
  image_url?: string;
  official_url: string;
  status: 'new' | 'duplicate' | 'exists';
  duplicate_reason?: string;
}

interface IImportStats {
  total: number;
  new: number;
  duplicates: number;
  exists: number;
}

type FilterMode = 'all' | 'new' | 'duplicate' | 'exists';

export function TicketmasterImportInterface() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [events, setEvents] = useState<ITicketmasterEventWithStatus[]>([]);
  const [stats, setStats] = useState<IImportStats | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // ─── Fetch événements Ticketmaster ──────────────────────────────────────────

  const handleFetchEvents = async () => {
    setLoading(true);
    setEvents([]);
    setStats(null);
    setSelectedIds(new Set());
    setFilterMode('all');

    try {
      const res = await fetch('/api/admin/ticketmaster/fetch-events', { method: 'POST' });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }

      const data = await res.json();
      setEvents(data.events);
      setStats(data.stats);

      // Auto-sélectionner les "nouveaux" uniquement
      const newIds = new Set<string>(
        data.events
          .filter((e: ITicketmasterEventWithStatus) => e.status === 'new')
          .map((e: ITicketmasterEventWithStatus) => e.ticketmaster_id)
      );
      setSelectedIds(newIds);

      toast({
        title: `${data.stats.total} événements trouvés`,
        description: `${data.stats.new} nouveaux · ${data.stats.duplicates} doublons potentiels · ${data.stats.exists} déjà en DB`,
      });
    } catch (err: any) {
      toast({
        title: 'Erreur de recherche',
        description: err.message || 'Erreur lors de la récupération des événements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Gestion sélection ───────────────────────────────────────────────────────

  const handleToggleSelect = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredEvents = events.filter((e) =>
    filterMode === 'all' ? true : e.status === filterMode
  );

  const selectableFiltered = filteredEvents.filter((e) => e.status !== 'exists');
  const allFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((e) => selectedIds.has(e.ticketmaster_id));

  const handleSelectAllFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableFiltered.forEach((e) => {
        checked ? next.add(e.ticketmaster_id) : next.delete(e.ticketmaster_id);
      });
      return next;
    });
  };

  // ─── Import final ────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (selectedIds.size === 0) {
      toast({ title: 'Aucun événement sélectionné', variant: 'destructive' });
      return;
    }

    const confirmed = window.confirm(
      `Importer ${selectedIds.size} événement(s) sélectionné(s) ?\n\nLes images artistes seront récupérées automatiquement via Spotify.`
    );
    if (!confirmed) return;

    setImporting(true);

    try {
      const selectedEvents = events.filter((e) => selectedIds.has(e.ticketmaster_id));

      const res = await fetch('/api/admin/ticketmaster/import-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: selectedEvents }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }

      const { imported, failed } = await res.json();

      if (failed > 0) {
        toast({
          title: `${imported} importé(s), ${failed} échec(s)`,
          description: 'Certains événements ont échoué à l\'import',
          variant: 'destructive',
        });
      } else {
        toast({
          title: `${imported} événement(s) importé(s) avec succès !`,
        });
      }

      router.push('/admin/events');
    } catch (err: any) {
      toast({
        title: "Erreur lors de l'import",
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  // ─── Render initial (aucun événement) ───────────────────────────────────────

  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <Music className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Prêt à importer depuis Ticketmaster
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Récupère les 50 prochains concerts musicaux en France avec détection des doublons
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleFetchEvents}
            disabled={loading}
            className="gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Recherche en cours…
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Rechercher les événements Ticketmaster
              </>
            )}
          </Button>
          {loading && (
            <p className="text-xs text-gray-400">
              Connexion à l'API Ticketmaster et vérification des doublons… (10-20 s)
            </p>
          )}
        </div>
      </Card>
    );
  }

  // ─── Render résultats ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card
            className={`p-4 cursor-pointer border-2 transition-colors ${filterMode === 'new' ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-green-200'}`}
            onClick={() => setFilterMode((m) => (m === 'new' ? 'all' : 'new'))}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                <p className="text-sm text-gray-500">Nouveaux</p>
              </div>
            </div>
          </Card>
          <Card
            className={`p-4 cursor-pointer border-2 transition-colors ${filterMode === 'duplicate' ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:border-orange-200'}`}
            onClick={() => setFilterMode((m) => (m === 'duplicate' ? 'all' : 'duplicate'))}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.duplicates}</p>
                <p className="text-sm text-gray-500">Doublons potentiels</p>
              </div>
            </div>
          </Card>
          <Card
            className={`p-4 cursor-pointer border-2 transition-colors ${filterMode === 'exists' ? 'border-gray-400 bg-gray-50' : 'border-transparent hover:border-gray-200'}`}
            onClick={() => setFilterMode((m) => (m === 'exists' ? 'all' : 'exists'))}
          >
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.exists}</p>
                <p className="text-sm text-gray-500">Déjà en DB</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtre actif */}
      {filterMode !== 'all' && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filtre actif :</span>
          <Badge
            variant="outline"
            className="cursor-pointer"
            onClick={() => setFilterMode('all')}
          >
            {filterMode === 'new' && 'Nouveaux'}
            {filterMode === 'duplicate' && 'Doublons potentiels'}
            {filterMode === 'exists' && 'Déjà en DB'}
            {' '}× Effacer
          </Badge>
          <span className="text-gray-400">({filteredEvents.length} événements)</span>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12 pl-4">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={handleSelectAllFiltered}
                    aria-label="Sélectionner tous les importables"
                  />
                </TableHead>
                <TableHead className="w-28">Statut</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead className="w-40">Artiste</TableHead>
                <TableHead className="w-32">Date</TableHead>
                <TableHead className="w-44">Lieu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const isDisabled = event.status === 'exists';
                const isSelected = selectedIds.has(event.ticketmaster_id);

                return (
                  <TableRow
                    key={event.ticketmaster_id}
                    className={`transition-colors ${isDisabled ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50'} ${isSelected ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => handleToggleSelect(event.ticketmaster_id, isDisabled)}
                  >
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(event.ticketmaster_id, isDisabled)}
                        disabled={isDisabled}
                        aria-label={`Sélectionner ${event.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      {event.status === 'new' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          Nouveau
                        </Badge>
                      )}
                      {event.status === 'duplicate' && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
                          Doublon ?
                        </Badge>
                      )}
                      {event.status === 'exists' && (
                        <Badge variant="secondary">Existe déjà</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-gray-900 text-sm leading-tight">
                          {event.title}
                        </p>
                        {event.duplicate_reason && (
                          <p className="text-xs text-orange-600">
                            ⚠ {event.duplicate_reason}
                          </p>
                        )}
                        {event.category && (
                          <p className="text-xs text-gray-400">{event.category}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{event.artist}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700 tabular-nums">
                        {new Date(event.event_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm text-gray-700 leading-tight">{event.venue}</p>
                        <p className="text-xs text-gray-400">{event.city}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{selectedIds.size}</span> événement(s) sélectionné(s) sur{' '}
          {events.filter((e) => e.status !== 'exists').length} importables
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchEvents}
            disabled={loading || importing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.size === 0 || importing}
            className="gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Import en cours…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Importer {selectedIds.size > 0 ? selectedIds.size : ''} événement(s)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
