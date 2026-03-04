'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronRight, Plus, Scale } from 'lucide-react';

type DisputeItem = {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transaction: {
    ticket: {
      event: {
        title: string;
        eventDate: string;
      };
    };
  };
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  OPEN: { label: 'Ouvert', variant: 'destructive' },
  INVESTIGATING: { label: 'En analyse', variant: 'default' },
  RESOLVED_REFUND: { label: 'Remboursé', variant: 'outline' },
  RESOLVED_RELEASE: { label: 'Libéré', variant: 'outline' },
  CLOSED: { label: 'Fermé', variant: 'secondary' },
};

const REASON_LABELS: Record<string, string> = {
  FAKE_TICKET: 'Billet refusé à l\'entrée',
  DUPLICATE: 'Code-barres dupliqué',
  NO_ACCESS: 'Pas d\'accès à l\'événement',
  EVENT_CANCELLED: 'Événement annulé',
  WRONG_TICKET: 'Billet incorrect',
  SELLER_NO_RESPONSE: 'Vendeur non réactif',
  OTHER: 'Autre',
};

export function DisputesList() {
  const { data, isLoading, error } = useQuery<{ disputes: DisputeItem[]; count: number }>({
    queryKey: ['disputes'],
    queryFn: async () => {
      const res = await fetch('/api/disputes');
      if (!res.ok) throw new Error('Failed to fetch disputes');
      const json = await res.json();
      return json.data;
    },
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger vos litiges. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const disputes = data?.disputes ?? [];

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Scale className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun litige</h2>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore ouvert de litige.
          </p>
          <Button asChild>
            <Link href="/disputes/create">
              <Plus className="mr-2 h-4 w-4" />
              Ouvrir un litige
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => {
        const status = STATUS_CONFIG[dispute.status] ?? { label: dispute.status, variant: 'outline' as const };
        const isOpen = dispute.status === 'OPEN' || dispute.status === 'INVESTIGATING';

        return (
          <Link key={dispute.id} href={`/disputes/${dispute.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">
                        {dispute.transaction.ticket.event.title}
                      </h3>
                      <Badge variant={status.variant} className="shrink-0">
                        {status.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {REASON_LABELS[dispute.reason] ?? dispute.reason}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Ouvert le{' '}
                        {format(new Date(dispute.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                      {isOpen && (
                        <span>
                          Mis à jour{' '}
                          {format(new Date(dispute.updatedAt ?? dispute.createdAt), 'dd MMM, HH:mm', { locale: fr })}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
