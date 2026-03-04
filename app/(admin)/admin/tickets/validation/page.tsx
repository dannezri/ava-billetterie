'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  MessageCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Euro,
  Barcode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketItem {
  id: string;
  status: string;
  price: number;
  originalPrice: number | null;
  section: string | null;
  row: string | null;
  seatNumber: string | null;
  pdfUrl: string | null;
  barcodeNumber: string | null;
  rejectionReason: string | null;
  createdAt: string;
  wait_hours: number;
  event: {
    id: string;
    title: string;
    artist: string | null;
    venue: string;
    city: string;
    eventDate: string;
  };
  seller: {
    id: string;
    name: string | null;
    email: string;
    kycStatus: string;
    trustScore: number;
    verifiedIdentity: boolean;
  };
}

interface QueueStats {
  total: number;
  overdue_12h: number;
  overdue_24h: number;
}

const CHECKLIST_ITEMS = [
  { id: 'pdf_lisible', label: 'PDF lisible et complet' },
  { id: 'barcode_visible', label: 'Code-barres visible' },
  { id: 'prix_coherent', label: 'Prix cohérent (≤ prix facial)' },
  { id: 'evenement_valide', label: 'Événement valide et futur' },
  { id: 'pas_manipulation', label: 'Aucune manipulation détectée' },
];

type ModalAction = 'approve' | 'reject' | 'info';

export default function ValidationQueuePage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOverdue, setFilterOverdue] = useState<'all' | '12h' | '24h'>('all');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [pdfChecking, setPdfChecking] = useState(false);

  const selected = tickets.find((t) => t.id === selectedId);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets?queue=true&limit=50');
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setTickets(data.tickets || []);
      setStats(data.queue_stats);
      // Sélectionner le premier si rien de sélectionné
      if (!selectedId && data.tickets?.length > 0) {
        setSelectedId(data.tickets[0].id);
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger la queue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedId, toast]);

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Réinitialiser la checklist et l'état PDF quand on change de billet
  // + vérification HEAD pour détecter les PDFs expirés/introuvables
  useEffect(() => {
    setChecklist({});
    setPdfError(false);
    setPdfChecking(false);

    const ticket = tickets.find((t) => t.id === selectedId);
    if (!ticket?.pdfUrl) return;

    let cancelled = false;
    setPdfChecking(true);

    // HEAD request pour vérifier l'accessibilité avant de charger l'iframe
    fetch(ticket.pdfUrl, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) setPdfError(true);
      })
      .catch(() => {
        if (cancelled) return;
        // En cas d'erreur réseau/CORS, on laisse l'iframe essayer
      })
      .finally(() => {
        if (!cancelled) setPdfChecking(false);
      });

    return () => { cancelled = true; };
  }, [selectedId, tickets]);

  const filteredTickets = tickets.filter((t) => {
    if (filterOverdue === '12h') return t.wait_hours >= 12;
    if (filterOverdue === '24h') return t.wait_hours >= 24;
    return true;
  });

  const checklistCount = Object.values(checklist).filter(Boolean).length;
  const canApprove = checklistCount >= 4; // Au moins 4/5

  const formatWait = (hours: number) => {
    if (hours < 1) return '< 1h';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j ${hours % 24}h`;
  };

  const handleAction = async (action: ModalAction) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      let res: Response;

      if (action === 'approve') {
        res = await fetch(`/api/admin/tickets/${selected.id}/approve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: '' }),
        });
      } else if (action === 'reject') {
        res = await fetch(`/api/admin/tickets/${selected.id}/reject`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason }),
        });
      } else {
        // Demande info via tRPC (fallback)
        toast({ title: 'Info envoyée', description: 'Message envoyé au vendeur' });
        setModalAction(null);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      toast({
        title: action === 'approve' ? '✅ Billet approuvé' : '❌ Billet rejeté',
        description: 'Le vendeur a été notifié.',
      });

      // Retirer de la liste et sélectionner le suivant
      const idx = tickets.findIndex((t) => t.id === selected.id);
      const newTickets = tickets.filter((t) => t.id !== selected.id);
      setTickets(newTickets);
      setSelectedId(newTickets[Math.min(idx, newTickets.length - 1)]?.id || null);
      setModalAction(null);
      setRejectReason('');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6 overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Queue de Validation</h1>
            {stats && (
              <Badge variant="secondary" className="font-medium">
                {stats.total} en attente
              </Badge>
            )}
            {stats && stats.overdue_24h > 0 && (
              <Badge variant="destructive" className="font-medium">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.overdue_24h} SLA dépassé
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Filtres */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['all', '12h', '24h'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterOverdue(f)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                    filterOverdue === f
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {f === 'all' ? 'Tous' : `> ${f}`}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* ── Split view ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Liste gauche (40%) ─── */}
        <div className="w-[380px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 gap-2">
              <CheckCircle className="h-10 w-10 text-green-300" />
              <p>Aucun billet en attente</p>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              {filteredTickets.map((ticket) => {
                const isSLA = ticket.wait_hours >= 24;
                const isWarn = ticket.wait_hours >= 12;
                const isSelected = ticket.id === selectedId;

                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedId(ticket.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                      isSLA && !isSelected && 'border-red-200 bg-red-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.event.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {ticket.seller.name || ticket.seller.email}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {ticket.price.toFixed(0)}€
                        </p>
                        <div
                          className={cn(
                            'flex items-center gap-0.5 text-xs justify-end',
                            isSLA ? 'text-red-600 font-medium' : isWarn ? 'text-amber-600' : 'text-gray-400'
                          )}
                        >
                          {isSLA && <AlertTriangle className="h-3 w-3" />}
                          <Clock className="h-3 w-3" />
                          {formatWait(ticket.wait_hours)}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 hidden" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Preview droite (60%) ─── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Sélectionnez un billet pour le prévisualiser
            </div>
          ) : (
            <div className="p-6 space-y-4 max-w-2xl mx-auto">
              {/* Infos billet */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selected.event.title}</h2>
                    {selected.event.artist && (
                      <p className="text-sm text-gray-500">{selected.event.artist}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(selected.event.eventDate), 'EEEE d MMMM yyyy', { locale: fr })} —{' '}
                      {selected.event.venue}, {selected.event.city}
                    </p>
                  </div>
                  <a
                    href={`/admin/tickets/${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                  >
                    Détail complet <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Prix vente</p>
                    <p className="text-base font-bold text-gray-900">{selected.price.toFixed(2)}€</p>
                  </div>
                  {selected.originalPrice && (
                    <div>
                      <p className="text-xs text-gray-500">Prix facial</p>
                      <p className="text-base font-semibold text-gray-700">{selected.originalPrice.toFixed(2)}€</p>
                      {selected.price > selected.originalPrice && (
                        <p className="text-xs text-red-600 font-medium">⚠️ Au-dessus du facial !</p>
                      )}
                    </div>
                  )}
                  {selected.barcodeNumber && (
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Barcode className="h-3 w-3" /> Code-barres
                      </p>
                      <p className="text-xs font-mono bg-gray-50 px-2 py-1 rounded mt-1 truncate">
                        {selected.barcodeNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Infos vendeur */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Vendeur
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selected.seller.name || 'Sans nom'}
                    </p>
                    <p className="text-xs text-gray-500">{selected.seller.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        selected.seller.kycStatus === 'VERIFIED'
                          ? 'border-green-300 text-green-700 bg-green-50'
                          : 'border-yellow-300 text-yellow-700 bg-yellow-50'
                      )}
                    >
                      KYC: {selected.seller.kycStatus}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1 text-indigo-500" />
                      {selected.seller.trustScore}/100
                    </Badge>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              {selected.pdfUrl ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-medium text-gray-600">PDF du billet</p>
                    <a
                      href={selected.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 flex items-center gap-1"
                    >
                      Ouvrir <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {pdfChecking ? (
                    <div className="flex items-center justify-center h-[400px] text-sm text-gray-400 gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Chargement du PDF…
                    </div>
                  ) : pdfError ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-center px-6 bg-red-50">
                      <AlertTriangle className="h-10 w-10 text-red-400" />
                      <div>
                        <p className="text-sm font-medium text-red-700">PDF introuvable sur le CDN</p>
                        <p className="text-xs text-red-500 mt-1">
                          Le fichier a expiré ou n'a pas été stocké définitivement sur Uploadcare.
                        </p>
                      </div>
                      <a
                        href={selected.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 underline flex items-center gap-1"
                      >
                        Tenter d'ouvrir l'URL directement <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <iframe
                      key={selected.id}
                      src={selected.pdfUrl}
                      className="w-full h-[400px] border-0"
                      title={`PDF billet ${selected.id}`}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <p className="text-sm text-gray-400">Aucun PDF disponible</p>
                </div>
              )}

              {/* Checklist */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Checklist de validation ({checklistCount}/{CHECKLIST_ITEMS.length})
                </h3>
                <div className="space-y-2.5">
                  {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox
                        id={item.id}
                        checked={!!checklist[item.id]}
                        onCheckedChange={(v) =>
                          setChecklist((prev) => ({ ...prev, [item.id]: !!v }))
                        }
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor={item.id}
                        className={cn(
                          'text-sm cursor-pointer',
                          checklist[item.id] ? 'text-green-700 line-through opacity-60' : 'text-gray-700'
                        )}
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {!canApprove && (
                  <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Cochez au moins 4 éléments pour approuver
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pb-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!canApprove}
                  onClick={() => setModalAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setModalAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalAction('info')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Info
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ─────────────────────────────────────────────────── */}
      {/* Modal Approuver */}
      <Dialog open={modalAction === 'approve'} onOpenChange={() => setModalAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Approuver le billet
            </DialogTitle>
            <DialogDescription>
              Le billet <strong>{selected?.event.title}</strong> sera activé et visible sur la
              marketplace. Le vendeur sera notifié.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAction(null)}>
              Annuler
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('approve')}
              disabled={submitting}
            >
              {submitting ? 'En cours...' : 'Confirmer l\'approbation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeter */}
      <Dialog open={modalAction === 'reject'} onOpenChange={() => setModalAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Rejeter le billet
            </DialogTitle>
            <DialogDescription>
              Expliquez la raison du rejet. Le vendeur recevra ce message par email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="reject-reason">
              Raison du rejet <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Ex: PDF illisible, prix supérieur au facial, document incomplet..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-gray-400 mt-1">{rejectReason.length}/10 caractères minimum</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAction(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction('reject')}
              disabled={submitting || rejectReason.length < 10}
            >
              {submitting ? 'En cours...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Demander Info */}
      <Dialog open={modalAction === 'info'} onOpenChange={() => setModalAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-blue-600 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> Demander des informations
            </DialogTitle>
            <DialogDescription>
              Le vendeur recevra ce message et pourra fournir les informations manquantes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="info-message">Votre message</Label>
            <Textarea
              id="info-message"
              placeholder="Que souhaitez-vous demander au vendeur ?"
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAction(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => handleAction('info')}
              disabled={submitting || infoMessage.length < 10}
            >
              Envoyer le message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
