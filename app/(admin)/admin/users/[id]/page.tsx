'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  kycStatus: string;
  kycProviderId: string | null;
  verifiedIdentity: boolean;
  stripeAccountId: string | null;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
  ticketsForSale: {
    id: string;
    status: string;
    price: number;
    originalPrice: number | null;
    createdAt: string;
    event: { title: string; eventDate: string; city: string };
  }[];
  purchases: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    ticket: { event: { title: string; eventDate: string } };
  }[];
  sales: {
    id: string;
    amount: number;
    platformFee: number;
    status: string;
    createdAt: string;
    ticket: { event: { title: string; eventDate: string } };
  }[];
  disputes: {
    id: string;
    reason: string;
    status: string;
    description: string;
    createdAt: string;
  }[];
  _count: {
    ticketsForSale: number;
    purchases: number;
    sales: number;
    disputes: number;
  };
}

const KYC_COLORS: Record<string, string> = {
  VERIFIED: 'border-green-300 text-green-700 bg-green-50',
  PENDING: 'border-amber-300 text-amber-700 bg-amber-50',
  REJECTED: 'border-red-300 text-red-700 bg-red-50',
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-700 bg-green-50',
  PENDING_VALIDATION: 'text-amber-700 bg-amber-50',
  SOLD: 'text-blue-700 bg-blue-50',
  CANCELLED: 'text-gray-500 bg-gray-100',
  REJECTED: 'text-red-700 bg-red-50',
  DRAFT: 'text-gray-600 bg-gray-100',
  FLAGGED: 'text-red-700 bg-red-100',
};

const TX_STATUS_COLORS: Record<string, string> = {
  ESCROWED: 'text-blue-700 bg-blue-50',
  RELEASED: 'text-green-700 bg-green-50',
  PENDING: 'text-amber-700 bg-amber-50',
  REFUNDED: 'text-gray-600 bg-gray-100',
  DISPUTED: 'text-red-700 bg-red-50',
};

const TrustScoreBar = ({ score }: { score: number }) => {
  const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-8">{score}</span>
    </div>
  );
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (res.status === 404) {
          toast({ title: 'Introuvable', description: 'Cet utilisateur n\'existe pas.', variant: 'destructive' });
          router.push('/admin/users');
          return;
        }
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();
        setUser(data.user);
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger l\'utilisateur', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router, toast]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl space-y-5">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">
                {user.name || 'Sans nom'}
              </h1>
              <Badge variant="outline" className={cn('text-xs', KYC_COLORS[user.kycStatus] || '')}>
                KYC: {user.kycStatus}
              </Badge>
              {user.verifiedIdentity && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" /> Identité vérifiée
                </Badge>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
              {user.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {user.phone}
                </p>
              )}
              <p className="text-xs text-gray-400">
                ID: <span className="font-mono">{user.id}</span>
              </p>
            </div>
          </div>
          {user.stripeAccountId && (
            <a
              href={`https://dashboard.stripe.com/connect/accounts/${user.stripeAccountId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="shrink-0">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Stripe Connect
                <ExternalLink className="h-3 w-3 ml-1.5 text-gray-400" />
              </Button>
            </a>
          )}
        </div>

        <Separator className="my-5" />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user._count.ticketsForSale}</p>
            <p className="text-xs text-gray-500 mt-0.5">Billets mis en vente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user._count.purchases}</p>
            <p className="text-xs text-gray-500 mt-0.5">Achats</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user._count.sales}</p>
            <p className="text-xs text-gray-500 mt-0.5">Ventes</p>
          </div>
          <div className="text-center">
            <p className={cn('text-2xl font-bold', user._count.disputes > 0 ? 'text-red-600' : 'text-gray-900')}>
              {user._count.disputes}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Litiges</p>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Trust score */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Trust Score
          </p>
          <TrustScoreBar score={user.trustScore} />
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span>Inscrit le {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
          <span>·</span>
          <span>Mis à jour le {format(new Date(user.updatedAt), 'dd MMMM yyyy', { locale: fr })}</span>
        </div>
      </div>

      {/* Tickets */}
      {user.ticketsForSale.length > 0 && (
        <Section
          title="Billets mis en vente"
          count={user._count.ticketsForSale}
          icon={<Clock className="h-4 w-4" />}
        >
          <div className="divide-y divide-gray-100">
            {user.ticketsForSale.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.event.title}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(ticket.event.eventDate), 'dd MMM yyyy', { locale: fr })} · {ticket.event.city}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-sm font-semibold">{Number(ticket.price).toFixed(2)}€</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      TICKET_STATUS_COLORS[ticket.status] || 'text-gray-600 bg-gray-100'
                    )}
                  >
                    {ticket.status}
                  </span>
                  <Link
                    href={`/admin/tickets/${ticket.id}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Purchases */}
      {user.purchases.length > 0 && (
        <Section title="Achats récents" count={user._count.purchases} icon={<CreditCard className="h-4 w-4" />}>
          <div className="divide-y divide-gray-100">
            {user.purchases.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tx.ticket.event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(tx.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-sm font-semibold">{Number(tx.amount).toFixed(2)}€</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      TX_STATUS_COLORS[tx.status] || 'text-gray-600 bg-gray-100'
                    )}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Sales */}
      {user.sales.length > 0 && (
        <Section title="Ventes récentes" count={user._count.sales} icon={<CreditCard className="h-4 w-4" />}>
          <div className="divide-y divide-gray-100">
            {user.sales.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tx.ticket.event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(tx.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{Number(tx.amount).toFixed(2)}€</p>
                    <p className="text-xs text-gray-400">
                      Frais: {Number(tx.platformFee).toFixed(2)}€
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      TX_STATUS_COLORS[tx.status] || 'text-gray-600 bg-gray-100'
                    )}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Disputes */}
      {user.disputes.length > 0 && (
        <Section
          title="Litiges"
          count={user._count.disputes}
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
        >
          <div className="divide-y divide-gray-100">
            {user.disputes.map((dispute) => (
              <div key={dispute.id} className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                      {dispute.reason}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        dispute.status === 'OPEN'
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-gray-600 bg-gray-100'
                      )}
                    >
                      {dispute.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(dispute.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{dispute.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Empty state */}
      {user._count.ticketsForSale === 0 &&
        user._count.purchases === 0 &&
        user._count.sales === 0 &&
        user._count.disputes === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Aucune activité enregistrée pour cet utilisateur.</p>
          </div>
        )}
    </div>
  );
}

function Section({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        {icon}
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{count} au total</span>
      </div>
      {children}
    </div>
  );
}
