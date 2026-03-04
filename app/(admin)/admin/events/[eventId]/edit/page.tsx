'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  Ticket,
  ShieldCheck,
  Clock,
  AlertTriangle,
  User,
  CalendarDays,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { EventForm } from '@/components/admin/events/EventForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventData {
  id: string;
  title: string;
  artist: string | null;
  category: string | null;
  description: string | null;
  eventDate: string;
  doorsOpenTime: string | null;
  venue: string;
  city: string;
  country: string;
  imageUrl: string | null;
  officialUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TicketStats {
  total: number;
  active: number;
  sold: number;
  pending: number;
  reserved: number;
}

interface AuditEntry {
  id: string;
  createdAt: string;
  metadata: {
    action: string;
    adminEmail?: string;
    affectedTickets?: number;
    changes?: Record<string, { from: string; to: string }>;
    criticalChanges?: string[];
  };
}

// ─── Labels lisibles pour les champs ─────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  title: 'Titre',
  artist: 'Artiste',
  category: 'Catégorie',
  description: 'Description',
  eventDate: 'Date',
  doorsOpenTime: 'Ouverture portes',
  venue: 'Salle',
  city: 'Ville',
  country: 'Pays',
  imageUrl: 'Image',
  officialUrl: 'URL officielle',
  isVerified: 'Vérification',
};

const CRITICAL_FIELD_LABELS: Record<string, string> = {
  eventDate: 'date',
  venue: 'salle',
  city: 'ville',
  country: 'pays',
};

// ─── Composant : Impact billets ───────────────────────────────────────────────

function TicketImpactCard({ stats }: { stats: TicketStats }) {
  const hasRisk = stats.active > 0 || stats.pending > 0 || stats.reserved > 0;

  if (stats.total === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Ticket className="h-4 w-4 text-gray-400" />
          Impact billets
        </h3>
        <p className="text-sm text-gray-400 italic">Aucun billet associé à cet événement.</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border p-4', hasRisk ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50')}>
      <h3 className={cn('text-sm font-semibold flex items-center gap-2 mb-3', hasRisk ? 'text-amber-800' : 'text-green-800')}>
        {hasRisk ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        Impact billets
      </h3>

      {hasRisk && (
        <p className="text-xs text-amber-700 mb-3 leading-relaxed">
          Toute modification de la <strong>date</strong>, de la <strong>salle</strong> ou de la <strong>ville</strong> impacte directement les acheteurs et vendeurs existants.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Actifs', value: stats.active, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', risk: true },
          { label: 'Vendus', value: stats.sold, color: 'text-blue-700 bg-blue-50 border-blue-200', risk: false },
          { label: 'En validation', value: stats.pending, color: 'text-amber-700 bg-amber-50 border-amber-200', risk: true },
          { label: 'Réservés', value: stats.reserved, color: 'text-purple-700 bg-purple-50 border-purple-200', risk: true },
        ].map(({ label, value, color, risk }) =>
          value > 0 ? (
            <div key={label} className={cn('rounded-lg border px-3 py-2', color)}>
              <p className="text-lg font-bold leading-none">{value}</p>
              <p className="text-[11px] mt-0.5 opacity-80">{label}</p>
              {risk && value > 0 && (
                <p className="text-[10px] mt-1 font-medium opacity-70">⚠ à risque</p>
              )}
            </div>
          ) : null
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span className="font-medium">{stats.total}</span> billet{stats.total > 1 ? 's' : ''} au total
      </p>
    </div>
  );
}

// ─── Composant : Historique audit ─────────────────────────────────────────────

function AuditHistoryCard({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-400" />
          Historique
        </h3>
        <p className="text-sm text-gray-400 italic">Aucune modification enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-gray-400" />
        Historique des modifications
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {entries.length}
        </span>
      </h3>

      <ol className="space-y-0">
        {entries.map((entry, i) => {
          const meta = entry.metadata;
          const isCreated = meta.action === 'EVENT_CREATED';
          const hasCritical = (meta.criticalChanges?.length ?? 0) > 0;
          const changes = meta.changes ?? {};
          const changedFields = Object.keys(changes);
          const isLast = i === entries.length - 1;

          return (
            <li key={entry.id} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  isCreated ? 'border-indigo-300 bg-indigo-50' :
                  hasCritical ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                )}>
                  {isCreated ? (
                    <ShieldCheck className="h-3 w-3 text-indigo-500" />
                  ) : hasCritical ? (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  ) : (
                    <Clock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" />}
              </div>

              {/* Content */}
              <div className={cn('pb-4 flex-1 min-w-0', isLast && 'pb-0')}>
                {/* Action label */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'text-xs font-semibold',
                    isCreated ? 'text-indigo-700' : hasCritical ? 'text-amber-700' : 'text-gray-700'
                  )}>
                    {isCreated ? 'Créé' : 'Modifié'}
                  </span>
                  {hasCritical && (
                    <span className="text-[10px] rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-700 font-medium">
                      champs critiques
                    </span>
                  )}
                </div>

                {/* Date + admin */}
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale: fr })}
                  {' · '}
                  <span className="font-mono text-gray-500">{format(new Date(entry.createdAt), 'dd/MM/yy HH:mm')}</span>
                </p>
                {meta.adminEmail && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <User className="h-2.5 w-2.5" />
                    {meta.adminEmail}
                  </p>
                )}

                {/* Diff des champs */}
                {changedFields.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {changedFields.map((field) => {
                      const isCritical = (meta.criticalChanges ?? []).includes(field);
                      const label = FIELD_LABELS[field] ?? field;
                      const { from, to } = changes[field];
                      return (
                        <li
                          key={field}
                          className={cn(
                            'rounded-md px-2 py-1 text-[11px]',
                            isCritical ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
                          )}
                        >
                          <span className="font-medium text-gray-600">{label}</span>
                          <span className="mx-1 text-gray-300">·</span>
                          <span className="line-through text-red-400 opacity-70">
                            {from ? truncate(from, 28) : <em className="not-italic opacity-40">vide</em>}
                          </span>
                          <span className="mx-1 text-gray-300">→</span>
                          <span className="text-green-700 font-medium">
                            {to ? truncate(to, 28) : <em className="not-italic opacity-40">vide</em>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Tickets affectés */}
                {(meta.affectedTickets ?? 0) > 0 && (
                  <p className="mt-1.5 text-[11px] text-amber-700 font-medium">
                    ⚠ {meta.affectedTickets} billet{meta.affectedTickets! > 1 ? 's' : ''} impacté{meta.affectedTickets! > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EditEventPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/admin/events/${params.eventId}`);
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Événement non trouvé');
        return;
      }
      const json = await res.json();
      setEvent(json.event);
      setTicketStats(json.ticketStats);
      setAuditHistory(json.auditHistory ?? []);
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [params.eventId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Événement introuvable'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const initialData = {
    title: event.title,
    artist: event.artist || '',
    category: event.category || '',
    description: event.description || '',
    eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
    doorsOpenTime: event.doorsOpenTime || '',
    venue: event.venue,
    city: event.city,
    country: event.country,
    imageUrl: event.imageUrl || '',
    officialUrl: event.officialUrl || '',
    isVerified: event.isVerified,
  };

  const isPast = new Date(event.eventDate) < new Date();

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/events" className="hover:text-gray-900">Événements</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{event.title}</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;événement</h1>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(new Date(event.eventDate), 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}, {event.city}
            </span>
            {isPast && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-medium">
                Événement passé
              </span>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 shrink-0',
            event.isVerified
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', event.isVerified ? 'bg-green-500' : 'bg-amber-400')} />
          {event.isVerified ? 'Vérifié' : 'Non vérifié'}
        </Badge>
      </div>

      {/* ── Layout 2 colonnes ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Colonne gauche : formulaire ─────────────────────────────────── */}
        <div>
          <EventForm
            mode="edit"
            eventId={event.id}
            initialData={initialData}
            onSaveSuccess={fetchEvent}
          />
        </div>

        {/* ── Colonne droite : sidebar ────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-4">
          {ticketStats && <TicketImpactCard stats={ticketStats} />}
          <AuditHistoryCard entries={auditHistory} />
        </div>
      </div>
    </div>
  );
}
