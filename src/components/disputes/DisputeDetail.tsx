'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  User,
  Video,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DisputeMessage = {
  id: string;
  message: string;
  attachments: string[] | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
};

type DisputeDetail = {
  id: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  resolutionNotes: string | null;
  refundAmount: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string | null; email: string };
  transaction: {
    id: string;
    amount: number;
    platformFee: number;
    ticket: {
      event: {
        title: string;
        eventDate: string;
        venue: string;
        city: string;
      };
    };
    buyer: { id: string; name: string | null };
    seller: { id: string; name: string | null };
  };
  messages: DisputeMessage[];
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  OPEN: { label: 'Ouvert', variant: 'destructive', icon: <Clock className="h-4 w-4" /> },
  INVESTIGATING: { label: 'En cours d\'analyse', variant: 'default', icon: <Clock className="h-4 w-4" /> },
  RESOLVED_REFUND: { label: 'Résolu — Remboursement', variant: 'outline', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
  RESOLVED_RELEASE: { label: 'Résolu — Libération vendeur', variant: 'outline', icon: <CheckCircle2 className="h-4 w-4 text-blue-600" /> },
  CLOSED: { label: 'Fermé', variant: 'secondary', icon: <XCircle className="h-4 w-4" /> },
};

const REASON_LABELS: Record<string, string> = {
  FAKE_TICKET: 'Billet refusé à l\'entrée',
  DUPLICATE: 'Code-barres déjà scanné (doublon)',
  NO_ACCESS: 'Pas d\'accès à l\'événement',
  EVENT_CANCELLED: 'Événement annulé',
  WRONG_TICKET: 'Billet ne correspond pas à la description',
  SELLER_NO_RESPONSE: 'Vendeur ne répond pas',
  OTHER: 'Autre raison',
};

function EvidenceItem({ url }: { url: string }) {
  const lowerUrl = url.toLowerCase();
  const isImage = /\.(jpg|jpeg|png|gif|webp)/.test(lowerUrl);
  const isVideo = /\.(mp4|mov|mpeg|webm)/.test(lowerUrl);

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Preuve" className="object-cover w-full h-full" />
          <div className="absolute inset-0 flex items-end justify-end p-1 opacity-0 hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4 text-white drop-shadow" />
          </div>
        </div>
      </a>
    );
  }

  if (isVideo) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 hover:bg-muted transition-colors"
      >
        <Video className="h-5 w-5 text-purple-500 shrink-0" />
        <span className="text-sm truncate">Vidéo</span>
        <ExternalLink className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 hover:bg-muted transition-colors"
    >
      <FileText className="h-5 w-5 text-orange-500 shrink-0" />
      <span className="text-sm truncate">Document PDF</span>
      <Download className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground" />
    </a>
  );
}

function TimelineMessage({
  msg,
  currentUserId,
}: {
  msg: DisputeMessage;
  currentUserId?: string;
}) {
  const isCurrentUser = msg.author.id === currentUserId;
  const authorName = msg.author.name || msg.author.email.split('@')[0];

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <div className="shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className={`flex-1 max-w-[85%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{isCurrentUser ? 'Vous' : authorName}</span>
          <span>·</span>
          <span>{format(new Date(msg.createdAt), 'dd MMM, HH:mm', { locale: fr })}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{msg.message}</p>
        </div>
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {msg.attachments.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                Pièce jointe {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DisputeDetail({
  disputeId,
  currentUserId,
}: {
  disputeId: string;
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');

  const { data, isLoading, error } = useQuery<{ dispute: DisputeDetail }>({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      const res = await fetch(`/api/disputes/${disputeId}`);
      if (!res.ok) throw new Error('Failed to fetch dispute');
      const json = await res.json();
      return { dispute: json.data };
    },
    refetchInterval: 30000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`/api/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Erreur envoi');
      }
      return res.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      toast({ title: 'Message envoyé' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger ce litige.{' '}
          <Link href="/disputes" className="underline">
            Retour à mes litiges
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const { dispute } = data;
  const statusConfig = STATUS_CONFIG[dispute.status] ?? { label: dispute.status, variant: 'outline' as const, icon: null };
  const isResolved = dispute.status === 'RESOLVED_REFUND' || dispute.status === 'RESOLVED_RELEASE';
  const isClosed = dispute.status === 'CLOSED';
  const isOpen = !isResolved && !isClosed;

  const images = dispute.evidenceUrls.filter((u) =>
    /\.(jpg|jpeg|png|gif|webp)/i.test(u)
  );
  const otherFiles = dispute.evidenceUrls.filter(
    (u) => !/\.(jpg|jpeg|png|gif|webp)/i.test(u)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/disputes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">Litige #{dispute.id.substring(0, 8).toUpperCase()}</h1>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1.5">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {REASON_LABELS[dispute.reason] ?? dispute.reason}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Timeline messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message initial (description) */}
              <div className="flex gap-3">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-medium">Vous</span>
                    <span>·</span>
                    <span>
                      Ouvert le {format(new Date(dispute.createdAt), 'dd MMM yyyy, HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed">
                    <p className="whitespace-pre-wrap">{dispute.description}</p>
                  </div>
                </div>
              </div>

              {/* Messages de la timeline */}
              {dispute.messages.map((msg) => (
                <TimelineMessage key={msg.id} msg={msg} currentUserId={currentUserId} />
              ))}

              {dispute.messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  En attente de réponse du support (délai &lt; 2h)
                </p>
              )}

              {/* Résolution en timeline */}
              {isResolved && (
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium">Support</span>
                      <span>·</span>
                      <span>
                        {dispute.resolvedAt
                          ? format(new Date(dispute.resolvedAt), 'dd MMM yyyy, HH:mm', { locale: fr })
                          : 'Résolu'}
                      </span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-green-200 bg-green-50 px-4 py-2.5 text-sm">
                      {dispute.status === 'RESOLVED_REFUND' ? (
                        <p>
                          ✅ Litige résolu en votre faveur.{' '}
                          {dispute.refundAmount && (
                            <strong>Remboursement de {Number(dispute.refundAmount).toFixed(2)} € en cours.</strong>
                          )}
                        </p>
                      ) : (
                        <p>Litige résolu. Les fonds ont été libérés au vendeur.</p>
                      )}
                      {dispute.resolutionNotes && (
                        <p className="mt-1 text-muted-foreground">{dispute.resolutionNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Zone saisie message */}
              {isOpen && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ajouter une information ou un commentaire..."
                      className="resize-none min-h-[90px]"
                      disabled={sendMessageMutation.isPending}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          if (newMessage.trim().length < 2) {
                            toast({ title: 'Message trop court', variant: 'destructive' });
                            return;
                          }
                          sendMessageMutation.mutate(newMessage.trim());
                        }}
                        disabled={sendMessageMutation.isPending || newMessage.trim().length < 2}
                        size="sm"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section résolution (si résolu) */}
          {isResolved && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Résolution du litige
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Décision</p>
                    <p className="font-medium">
                      {dispute.status === 'RESOLVED_REFUND'
                        ? '✅ Remboursement acheteur'
                        : '➡️ Libération vendeur'}
                    </p>
                  </div>
                  {dispute.refundAmount && (
                    <div>
                      <p className="text-muted-foreground">Montant remboursé</p>
                      <p className="font-bold text-green-700">
                        {Number(dispute.refundAmount).toFixed(2)} €
                      </p>
                    </div>
                  )}
                  {dispute.resolvedAt && (
                    <div>
                      <p className="text-muted-foreground">Résolu le</p>
                      <p className="font-medium">
                        {format(new Date(dispute.resolvedAt), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
                {dispute.resolutionNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Notes de résolution</p>
                      <p className="text-sm">{dispute.resolutionNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Informations litige */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Événement</p>
                <p className="font-medium">{dispute.transaction.ticket.event.title}</p>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {format(
                    new Date(dispute.transaction.ticket.event.eventDate),
                    'dd MMMM yyyy',
                    { locale: fr }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {dispute.transaction.ticket.event.venue},{' '}
                  {dispute.transaction.ticket.event.city}
                </span>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-0.5">Montant de la transaction</p>
                <p className="font-medium">{Number(dispute.transaction.amount).toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Ouvert le</p>
                <p className="font-medium">
                  {format(new Date(dispute.createdAt), 'dd MMM yyyy, HH:mm', { locale: fr })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preuves */}
          {dispute.evidenceUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4" />
                  Preuves ({dispute.evidenceUrls.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((url, i) => (
                      <EvidenceItem key={i} url={url} />
                    ))}
                  </div>
                )}
                {otherFiles.map((url, i) => (
                  <EvidenceItem key={i} url={url} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Besoin d'aide ?</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/help">
                  Contacter le support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
