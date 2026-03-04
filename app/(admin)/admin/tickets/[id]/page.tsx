'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Barcode,
  Shield,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  MapPin,
  Tag,
  Euro,
  RefreshCw,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketDetail {
  id: string;
  status: string;
  verificationStatus: string;
  price: number;
  originalPrice: number | null;
  section: string | null;
  row: string | null;
  seatNumber: string | null;
  pdfUrl: string | null;
  pdfHash: string | null;
  barcodeNumber: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  wait_hours: number;
  event: {
    id: string;
    title: string;
    artist: string | null;
    venue: string;
    city: string;
    country: string;
    eventDate: string;
    category: string | null;
    imageUrl: string | null;
    officialUrl: string | null;
    isVerified: boolean;
  };
  seller: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    kycStatus: string;
    verifiedIdentity: boolean;
    trustScore: number;
    stripeAccountId: string | null;
    _count: { ticketsForSale: number; sales: number; disputes: number };
  };
  transaction: {
    id: string;
    amount: number;
    platformFee: number;
    status: string;
    createdAt: string;
    escrowReleaseDate: string;
    releasedAt: string | null;
    buyer: { id: string; name: string | null; email: string };
  } | null;
}

interface AuditLog {
  id: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  PENDING_VALIDATION: 'bg-amber-50 text-amber-700 border-amber-200',
  SOLD: 'bg-blue-50 text-blue-700 border-blue-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  FLAGGED: 'bg-red-50 text-red-700 border-red-200',
  DRAFT: 'bg-gray-50 text-gray-500 border-gray-200',
  RESERVED: 'bg-purple-50 text-purple-700 border-purple-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
};

const TX_STYLES: Record<string, string> = {
  ESCROWED: 'bg-blue-50 text-blue-700 border-blue-200',
  RELEASED: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200',
  DISPUTED: 'bg-red-50 text-red-700 border-red-200',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-2 gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={cn('text-sm text-gray-900 text-right', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'approve' | 'reject' | 'release' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.status === 404) {
        toast({ title: 'Introuvable', description: 'Ce billet n\'existe pas.', variant: 'destructive' });
        router.push('/admin/tickets');
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTicket(data.ticket);
      setAuditLogs(data.audit_logs || []);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger le billet', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [id]); // eslint-disable-line

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!ticket) return;
    setSubmitting(true);
    try {
      const url = `/api/admin/tickets/${ticket.id}/${action}`;
      const body = action === 'reject' ? { reason: rejectReason } : { notes: '' };
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
      toast({
        title: action === 'approve' ? '✅ Billet approuvé' : '❌ Billet rejeté',
        description: 'Le statut a été mis à jour.',
      });
      setModal(null);
      setRejectReason('');
      fetchTicket();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const isPending = ticket.status === 'PENDING_VALIDATION';
  const isReserved = ticket.status === 'RESERVED';
  const overdue = ticket.wait_hours >= 24;

  const handleRelease = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/release`, { method: 'PATCH' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
      toast({ title: '🔓 Place libérée', description: 'Le billet est de nouveau disponible à l\'achat.' });
      setModal(null);
      fetchTicket();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux billets
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTicket} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
          {isPending && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setModal('approve')}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setModal('reject')}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Rejeter
              </Button>
            </>
          )}
          {isReserved && (
            <Button
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => setModal('release')}
            >
              <Unlock className="h-3.5 w-3.5 mr-1.5" />
              Libérer la place
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/tickets/validation">
              Queue de validation →
            </Link>
          </Button>
        </div>
      </div>

      {/* Bannière réservation active */}
      {isReserved && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
          <Unlock className="h-4 w-4 shrink-0" />
          <span>
            Ce billet est <strong>réservé par un acheteur</strong>
            {ticket.expiresAt && (
              <>
                {' '}— expiration le{' '}
                <strong>{format(new Date(ticket.expiresAt), 'dd MMM yyyy à HH:mm', { locale: fr })}</strong>
              </>
            )}
            . Vous pouvez forcer la libération pour le remettre en vente.
          </span>
        </div>
      )}

      {/* Status banner for overdue */}
      {overdue && isPending && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            SLA dépassé — ce billet attend depuis{' '}
            <strong>{Math.floor(ticket.wait_hours / 24)}j {ticket.wait_hours % 24}h</strong>
          </span>
        </div>
      )}

      {/* Rejection reason */}
      {ticket.rejectionReason && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Raison du rejet</p>
            <p className="mt-0.5 text-red-600">{ticket.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left column (3/5) */}
        <div className="lg:col-span-3 space-y-5">

          {/* Ticket info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{ticket.event.title}</h1>
                {ticket.event.artist && (
                  <p className="text-sm text-gray-500">{ticket.event.artist}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge variant="outline" className={cn('text-xs', STATUS_STYLES[ticket.status] || '')}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', STATUS_STYLES[ticket.verificationStatus] || '')}>
                  {ticket.verificationStatus}
                </Badge>
              </div>
            </div>

            <div className="space-y-0.5 divide-y divide-gray-50">
              <InfoRow
                label="Date de l'événement"
                value={
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {format(new Date(ticket.event.eventDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                }
              />
              <InfoRow
                label="Lieu"
                value={
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {ticket.event.venue}, {ticket.event.city}
                  </span>
                }
              />
              {ticket.event.category && (
                <InfoRow label="Catégorie" value={<span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-gray-400" />{ticket.event.category}</span>} />
              )}
              <InfoRow
                label="Prix de vente"
                value={
                  <span className="flex items-center gap-1 font-semibold">
                    {fmt(ticket.price)}
                    {ticket.originalPrice && ticket.price > ticket.originalPrice && (
                      <span className="text-xs text-red-600 font-medium">⚠️ Au-dessus du facial</span>
                    )}
                  </span>
                }
              />
              {ticket.originalPrice && (
                <InfoRow label="Prix facial" value={fmt(ticket.originalPrice)} />
              )}
              {ticket.section && <InfoRow label="Section" value={ticket.section} />}
              {ticket.row && <InfoRow label="Rangée" value={ticket.row} />}
              {ticket.seatNumber && <InfoRow label="Siège" value={ticket.seatNumber} />}
              {ticket.barcodeNumber && (
                <InfoRow
                  label="Code-barres"
                  value={<span className="flex items-center gap-1"><Barcode className="h-3.5 w-3.5 text-gray-400" />{ticket.barcodeNumber}</span>}
                  mono
                />
              )}
              {ticket.pdfHash && <InfoRow label="Hash PDF" value={ticket.pdfHash} mono />}
              <InfoRow label="Soumis le" value={format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })} />
              <InfoRow label="Mis à jour" value={format(new Date(ticket.updatedAt), 'dd MMM yyyy HH:mm', { locale: fr })} />
              {ticket.expiresAt && (
                <InfoRow label="Expire le" value={format(new Date(ticket.expiresAt), 'dd MMM yyyy', { locale: fr })} />
              )}
            </div>

            {ticket.event.officialUrl && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={ticket.event.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Site officiel de l'événement
                </a>
              </div>
            )}
          </div>

          {/* PDF viewer */}
          {ticket.pdfUrl ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> PDF du billet
                </p>
                <a
                  href={ticket.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  Ouvrir <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <iframe
                src={ticket.pdfUrl}
                className="w-full h-[500px] border-0"
                title={`PDF billet ${ticket.id}`}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucun PDF disponible</p>
            </div>
          )}
        </div>

        {/* Right column (2/5) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Seller */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Vendeur
            </h2>
            <div className="space-y-0.5 divide-y divide-gray-50">
              <InfoRow label="Nom" value={ticket.seller.name || 'Sans nom'} />
              <InfoRow label="Email" value={ticket.seller.email} />
              {ticket.seller.phone && <InfoRow label="Téléphone" value={ticket.seller.phone} />}
              <InfoRow
                label="KYC"
                value={
                  <Badge variant="outline" className={cn('text-xs', ticket.seller.kycStatus === 'VERIFIED' ? 'border-green-300 text-green-700 bg-green-50' : 'border-amber-300 text-amber-700 bg-amber-50')}>
                    {ticket.seller.kycStatus}
                  </Badge>
                }
              />
              <InfoRow
                label="Trust Score"
                value={
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    {ticket.seller.trustScore}/100
                  </span>
                }
              />
              <InfoRow label="Billets en vente" value={ticket.seller._count.ticketsForSale} />
              <InfoRow label="Ventes totales" value={ticket.seller._count.sales} />
              {ticket.seller._count.disputes > 0 && (
                <InfoRow
                  label="Litiges"
                  value={<span className="text-red-600 font-medium">{ticket.seller._count.disputes}</span>}
                />
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                <Link href={`/admin/users/${ticket.seller.id}`}>
                  Voir le profil
                </Link>
              </Button>
              {ticket.seller.stripeAccountId && (
                <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                  <a
                    href={`https://dashboard.stripe.com/connect/accounts/${ticket.seller.stripeAccountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Stripe <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Transaction */}
          {ticket.transaction && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5" /> Transaction
              </h2>
              <div className="space-y-0.5 divide-y divide-gray-50">
                <InfoRow
                  label="Statut"
                  value={
                    <Badge variant="outline" className={cn('text-xs', TX_STYLES[ticket.transaction.status] || '')}>
                      {ticket.transaction.status}
                    </Badge>
                  }
                />
                <InfoRow label="Montant" value={<span className="font-semibold">{fmt(ticket.transaction.amount)}</span>} />
                <InfoRow label="Commission" value={fmt(ticket.transaction.platformFee)} />
                <InfoRow label="Acheteur" value={ticket.transaction.buyer.name || ticket.transaction.buyer.email} />
                <InfoRow label="Date" value={format(new Date(ticket.transaction.createdAt), 'dd MMM yyyy', { locale: fr })} />
                <InfoRow
                  label="Libération séquestre"
                  value={format(new Date(ticket.transaction.escrowReleaseDate), 'dd MMM yyyy', { locale: fr })}
                />
                {ticket.transaction.releasedAt && (
                  <InfoRow label="Libéré le" value={format(new Date(ticket.transaction.releasedAt), 'dd MMM yyyy', { locale: fr })} />
                )}
              </div>
            </div>
          )}

          {/* Audit log */}
          {auditLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Historique ({auditLogs.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        {(log.metadata as any)?.action || log.action}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(log.createdAt), 'dd MMM HH:mm', { locale: fr })}
                      </span>
                    </div>
                    {(log.metadata as any)?.adminEmail && (
                      <p className="text-xs text-gray-400 mt-0.5">par {(log.metadata as any).adminEmail}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket ID */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">ID du billet</p>
            <p className="font-mono text-xs text-gray-700 break-all">{ticket.id}</p>
          </div>
        </div>
      </div>

      {/* Modal Libérer */}
      <Dialog open={modal === 'release'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-orange-600 flex items-center gap-2">
              <Unlock className="h-5 w-5" /> Libérer la place
            </DialogTitle>
            <DialogDescription>
              La réservation en cours sera annulée et le billet <strong>{ticket.event.title}</strong> redeviendra disponible à l'achat. L'acheteur sera désengagé sans pénalité.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleRelease}
              disabled={submitting}
            >
              {submitting ? 'Libération...' : 'Confirmer la libération'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Approuver */}
      <Dialog open={modal === 'approve'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Approuver le billet
            </DialogTitle>
            <DialogDescription>
              Le billet <strong>{ticket.event.title}</strong> sera activé et visible sur la marketplace. Le vendeur sera notifié.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('approve')} disabled={submitting}>
              {submitting ? 'En cours...' : 'Confirmer l\'approbation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeter */}
      <Dialog open={modal === 'reject'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Rejeter le billet
            </DialogTitle>
            <DialogDescription>
              Expliquez la raison du rejet. Le vendeur recevra ce message.
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
            <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => handleAction('reject')} disabled={submitting || rejectReason.length < 10}>
              {submitting ? 'En cours...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
