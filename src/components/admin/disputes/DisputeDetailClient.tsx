'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Clock,
  AlertTriangle,
  Shield,
  ExternalLink,
  Send,
  Lock,
  Unlock,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DisputeResolutionModal } from './DisputeResolutionModal';
import { DisputeEvidenceGallery } from './DisputeEvidenceGallery';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';

interface DisputeMessage {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

interface DisputeDetail {
  id: string;
  status: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  createdAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  wait_hours: number;
  is_overdue_sla: boolean;
  is_urgent: boolean;
  assignedAdmin: { id: string; name: string | null; email: string } | null;
  resolvedBy: { id: string; name: string | null; email: string } | null;
  reporter: { id: string; name: string | null; email: string };
  messages: DisputeMessage[];
  transaction: {
    id: string;
    amount: number;
    platformFee: number;
    status: string;
    stripePaymentIntentId: string | null;
    escrowReleaseDate: string;
    ticket: {
      id: string;
      pdfUrl: string | null;
      section: string | null;
      event: { id: string; title: string; eventDate: string; venue: string };
    };
    buyer: {
      id: string;
      name: string | null;
      email: string;
      trustScore: number;
      totalSales: number;
      createdAt: string;
    };
    seller: {
      id: string;
      name: string | null;
      email: string;
      trustScore: number;
      totalSales: number;
      disputesAsSellerCount: number;
      disputesResolvedAgainst: number;
      createdAt: string;
    };
  };
}

const REASON_LABELS: Record<string, string> = {
  FAKE_TICKET: 'Billet frauduleux',
  NO_ACCESS: 'Accès refusé',
  DUPLICATE: 'Doublon',
  EVENT_CANCELLED: 'Événement annulé',
  WRONG_TICKET: 'Mauvais billet',
  SELLER_NO_RESPONSE: 'Vendeur muet',
  OTHER: 'Autre',
};

function TrustScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-700 bg-green-50' : score >= 50 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50';
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', color)}>
      <Shield className="h-3 w-3" />
      {score}/100
    </span>
  );
}

function PartyCard({
  title,
  user,
  isReporter,
  isRecidivist,
}: {
  title: string;
  user: DisputeDetail['transaction']['buyer'] | DisputeDetail['transaction']['seller'];
  isReporter?: boolean;
  isRecidivist?: boolean;
}) {
  const seller = user as DisputeDetail['transaction']['seller'];
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {title}
          {isReporter && <Badge variant="outline" className="text-xs">Plaignant</Badge>}
          {isRecidivist && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Récidiviste
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <div>
          <p className="font-semibold text-sm text-gray-900">{user.name || '—'}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <TrustScoreBadge score={user.trustScore} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          <span>Ventes totales</span>
          <span className="font-medium text-gray-700">{user.totalSales}</span>
          {seller.disputesAsSellerCount !== undefined && (
            <>
              <span>Litiges reçus</span>
              <span className={cn('font-medium', seller.disputesAsSellerCount > 2 ? 'text-red-600' : 'text-gray-700')}>
                {seller.disputesAsSellerCount}
              </span>
              <span>Litiges perdus</span>
              <span className="font-medium text-gray-700">{seller.disputesResolvedAgainst}</span>
            </>
          )}
          <span>Membre depuis</span>
          <span className="font-medium text-gray-700">
            {format(new Date(user.createdAt), 'MMM yyyy', { locale: fr })}
          </span>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-1 text-xs h-7" asChild>
          <Link href={`/admin/users/${user.id}`}>
            <ExternalLink className="h-3 w-3 mr-1" />
            Voir profil
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TimelineMessage({
  msg,
  buyerId,
  sellerId,
}: {
  msg: DisputeMessage;
  buyerId: string;
  sellerId: string;
}) {
  const isAdmin = msg.author.id !== buyerId && msg.author.id !== sellerId;
  const isBuyer = msg.author.id === buyerId;

  return (
    <div className={cn('flex gap-3', isAdmin ? 'flex-row-reverse' : '')}>
      <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
        <AvatarFallback className={cn('text-xs', isAdmin ? 'bg-indigo-100 text-indigo-700' : isBuyer ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>
          {(msg.author.name || msg.author.email).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={cn('flex-1 max-w-[80%]', isAdmin ? 'items-end' : '')}>
        <div className={cn('flex items-center gap-2 mb-1', isAdmin ? 'justify-end' : '')}>
          <span className="text-xs font-medium text-gray-700">
            {isAdmin ? 'Admin' : isBuyer ? 'Acheteur' : 'Vendeur'} — {msg.author.name || msg.author.email}
          </span>
          {msg.isInternal && (
            <Badge variant="outline" className="text-xs h-4 px-1 text-yellow-700 border-yellow-300 bg-yellow-50">
              <Lock className="h-2.5 w-2.5 mr-0.5" />
              Note interne
            </Badge>
          )}
          <span className="text-xs text-gray-400">
            {format(new Date(msg.createdAt), 'dd MMM HH:mm', { locale: fr })}
          </span>
        </div>
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            msg.isInternal
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
              : isAdmin
              ? 'bg-indigo-600 text-white'
              : isBuyer
              ? 'bg-blue-50 border border-blue-100 text-gray-800'
              : 'bg-gray-50 border border-gray-200 text-gray-800'
          )}
        >
          {msg.message}
        </div>
      </div>
    </div>
  );
}

interface DisputeDetailClientProps {
  disputeId: string;
  adminEmail: string;
}

export function DisputeDetailClient({ disputeId, adminEmail }: DisputeDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [assigningToMe, setAssigningToMe] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);

  const fetchDispute = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setDispute(data.dispute);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger le litige', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [disputeId, toast]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  const handleAssignToMe = async () => {
    if (!dispute) return;
    setAssigningToMe(true);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: 'me' }),
      });
      if (res.ok) {
        await fetchDispute();
        toast({ title: 'Litige assigné à vous' });
      } else {
        throw new Error('Erreur API');
      }
    } catch {
      toast({ title: 'Erreur assignation', variant: 'destructive' });
    } finally {
      setAssigningToMe(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !dispute) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim(), isInternal }),
      });
      if (!res.ok) throw new Error('Erreur envoi');
      setNewMessage('');
      setIsInternal(false);
      await fetchDispute();
      toast({ title: isInternal ? 'Note interne ajoutée' : 'Message envoyé' });
    } catch {
      toast({ title: 'Erreur envoi message', variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleResolved = () => {
    setResolveModal(false);
    fetchDispute();
    toast({ title: 'Litige résolu', description: 'Les parties ont été notifiées.' });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-lg" />)}
          </div>
          <div className="lg:col-span-6 h-96 bg-gray-100 rounded-lg" />
          <div className="lg:col-span-3 space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return <div className="text-center py-12 text-gray-500">Litige introuvable</div>;
  }

  const isResolved = ['RESOLVED_REFUND', 'RESOLVED_RELEASE', 'CLOSED'].includes(dispute.status);
  const isRecidivist = dispute.transaction.seller.disputesAsSellerCount >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/disputes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Litiges
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                Litige #{dispute.id.slice(0, 8).toUpperCase()}
              </h1>
              <StatusBadge status={dispute.status} />
              {dispute.is_overdue_sla && (
                <Badge className="bg-red-600 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  SLA dépassé
                </Badge>
              )}
              {dispute.is_urgent && (
                <Badge className="bg-orange-500 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {REASON_LABELS[dispute.reason] || dispute.reason} —{' '}
              Ouvert {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true, locale: fr })}
              {dispute.assignedAdmin && (
                <span className="ml-2 text-indigo-600">
                  · Assigné à {dispute.assignedAdmin.name || dispute.assignedAdmin.email}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!dispute.assignedAdmin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAssignToMe}
              disabled={assigningToMe}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {assigningToMe ? 'Assignation...' : "M'assigner"}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled className="text-green-700">
              <UserCheck className="h-4 w-4 mr-1" />
              {dispute.assignedAdmin.name || dispute.assignedAdmin.email}
            </Button>
          )}
          {!isResolved && (
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setResolveModal(true)}
            >
              Résoudre
            </Button>
          )}
        </div>
      </div>

      {/* Layout 3 colonnes */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Sidebar gauche — Parties */}
        <div className="lg:col-span-3 space-y-4">
          <PartyCard
            title="Acheteur"
            user={dispute.transaction.buyer}
            isReporter={dispute.reporter.id === dispute.transaction.buyer.id}
          />
          <PartyCard
            title="Vendeur"
            user={dispute.transaction.seller}
            isReporter={dispute.reporter.id === dispute.transaction.seller.id}
            isRecidivist={isRecidivist}
          />
          {/* Transaction */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Transaction</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <span className="text-gray-500">Montant</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dispute.transaction.amount)}
                </span>
                <span className="text-gray-500">Commission</span>
                <span className="font-medium text-gray-700">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dispute.transaction.platformFee)}
                </span>
                <span className="text-gray-500">Statut TX</span>
                <StatusBadge status={dispute.transaction.status} />
                <span className="text-gray-500">Séquestre</span>
                <span className="font-medium text-gray-700">
                  {format(new Date(dispute.transaction.escrowReleaseDate), 'dd MMM', { locale: fr })}
                </span>
              </div>
              <Separator />
              <div className="text-xs space-y-1">
                <p className="font-medium text-gray-700">{dispute.transaction.ticket.event.title}</p>
                <p className="text-gray-500">{dispute.transaction.ticket.event.venue}</p>
                <p className="text-gray-500">
                  {format(new Date(dispute.transaction.ticket.event.eventDate), 'dd MMM yyyy', { locale: fr })}
                </p>
                {dispute.transaction.ticket.section && (
                  <p className="text-gray-500">Section : {dispute.transaction.ticket.section}</p>
                )}
              </div>
              {dispute.transaction.ticket.pdfUrl && (
                <Button variant="outline" size="sm" className="w-full text-xs h-7 mt-1" asChild>
                  <a href={dispute.transaction.ticket.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Voir PDF billet
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal — Timeline */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Timeline — {dispute.messages.length} message{dispute.messages.length > 1 ? 's' : ''}
              </CardTitle>
              {/* Description initiale */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
                <p className="text-xs text-gray-500 mb-1 font-medium">Description du litige :</p>
                {dispute.description}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col px-4 pb-4">
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[480px] pr-1">
                {dispute.messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucun message pour l'instant</p>
                ) : (
                  dispute.messages.map((msg) => (
                    <TimelineMessage
                      key={msg.id}
                      msg={msg}
                      buyerId={dispute.transaction.buyer.id}
                      sellerId={dispute.transaction.seller.id}
                    />
                  ))
                )}
              </div>

              {!isResolved && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <Textarea
                    placeholder={isInternal ? 'Note interne (visible uniquement par l\'équipe admin)...' : 'Message aux parties (acheteur + vendeur)...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className={cn(isInternal ? 'border-yellow-300 bg-yellow-50' : '')}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="internal"
                        checked={isInternal}
                        onCheckedChange={(v) => setIsInternal(!!v)}
                      />
                      <Label htmlFor="internal" className="text-xs text-gray-600 cursor-pointer flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Note interne uniquement
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || newMessage.trim().length < 2}
                      className={cn(isInternal ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700')}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      {sendingMessage ? 'Envoi...' : isInternal ? 'Ajouter note' : 'Envoyer'}
                    </Button>
                  </div>
                </div>
              )}

              {isResolved && dispute.resolutionNotes && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 mb-1">Résolution :</p>
                  <p className="text-sm text-green-800">{dispute.resolutionNotes}</p>
                  {dispute.resolvedBy && (
                    <p className="text-xs text-green-600 mt-1">
                      Par {dispute.resolvedBy.name || dispute.resolvedBy.email} —{' '}
                      {dispute.resolvedAt && format(new Date(dispute.resolvedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar droite — Preuves + Actions */}
        <div className="lg:col-span-3 space-y-4">
          {/* Preuves */}
          <DisputeEvidenceGallery
            title="Preuves"
            urls={dispute.evidenceUrls}
          />

          {/* Impact Trust Score */}
          {!isResolved && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Impact Trust Score (simulation)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3 text-xs">
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Si remboursement acheteur :</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vendeur</span>
                    <span className="font-semibold">
                      {dispute.transaction.seller.trustScore}{' '}
                      <span className="text-red-600">→ {Math.max(0, dispute.transaction.seller.trustScore - 20)} (−20)</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Acheteur</span>
                    <span className="font-semibold">
                      {dispute.transaction.buyer.trustScore}{' '}
                      <span className="text-green-600">→ {Math.min(100, dispute.transaction.buyer.trustScore + 5)} (+5)</span>
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-gray-500 font-medium">Si libération vendeur :</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Scores</span>
                    <span className="text-green-600 font-semibold">Inchangés</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions résolution */}
          {!isResolved && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                  onClick={() => setResolveModal(true)}
                >
                  Rembourser l'acheteur
                </Button>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-sm"
                  onClick={() => setResolveModal(true)}
                >
                  Libérer le vendeur
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => setResolveModal(true)}
                >
                  Remboursement partiel
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsInternal(false);
                    document.querySelector('textarea')?.focus();
                  }}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Demander des infos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal résolution */}
      {resolveModal && (
        <DisputeResolutionModal
          dispute={dispute}
          onClose={() => setResolveModal(false)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
}
