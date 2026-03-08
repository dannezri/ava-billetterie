'use client';

import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Clock, Armchair, AlertTriangle } from 'lucide-react';
import { CardClean } from '@/components/ui/card-clean';
import { ButtonClean } from '@/components/ui/button-clean';
import type { IVenueTicket } from './types';

interface IVenueTicketCardProps {
  ticket:        IVenueTicket;
  eventId:       string;
  isHighlighted: boolean;
  onMouseEnter:  () => void;
  onMouseLeave:  () => void;
}

function sellerGradient(id: string): string {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-700',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-cyan-600',
  ];
  return gradients[id.charCodeAt(0) % gradients.length];
}

function TrustRing({ score }: { score: number }) {
  const pct    = Math.min(100, Math.max(0, score));
  const color  = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444';
  const r      = 9;
  const circ   = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0">
      <circle cx="13" cy="13" r={r} fill="none" stroke="#E5E7EB" strokeWidth="3" />
      <circle
        cx="13" cy="13" r={r}
        fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 13 13)"
      />
      <text x="13" y="17" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={color}>
        {pct}
      </text>
    </svg>
  );
}

/** Pill showing stock urgency if low */
function StockBadge({ count }: { count: number }) {
  if (count > 5) return null;
  if (count <= 2) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-200">
      <AlertTriangle className="h-2.5 w-2.5" /> {count} restant{count > 1 ? 's' : ''}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 ring-1 ring-orange-200">
      {count} restant{count > 1 ? 's' : ''}
    </span>
  );
}

export function VenueTicketCard({
  ticket,
  eventId,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
}: IVenueTicketCardProps) {
  const { seller } = ticket;

  const initial     = seller.name?.charAt(0).toUpperCase() ?? '?';
  const firstName   = seller.name?.split(' ')[0] ?? 'Vendeur';
  const lastInit    = seller.name?.split(' ').slice(1).map((n) => n[0]).join('') ?? '';
  const gradient    = sellerGradient(seller.id);
  const isVerified  = seller.verifiedIdentity || seller.kycStatus === 'VERIFIED';
  const isRejected  = seller.kycStatus === 'REJECTED';

  // Derive a rough ticket count from the section (not available here — use 99 as default)
  const approxCount = 99; // VenueTicketCard doesn't know total per section

  return (
    <CardClean
      data-section-id={ticket.resolved_section_id ?? ticket.section}
      className={[
        'cursor-default transition-all duration-200',
        isHighlighted
          ? 'ring-2 ring-blue-400 border-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.15)]'
          : 'hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)]',
      ].join(' ')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 4-column grid ── */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1.6fr_1.8fr_auto_auto] sm:items-center sm:gap-5">

        {/* Col 1 — Section + Seat */}
        <div className="min-w-0">
          <p className="mb-0.5 truncate text-[11px] font-bold uppercase tracking-widest text-blue-600">
            {ticket.section ?? 'Section non précisée'}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {ticket.row && (
              <span className="text-sm text-gray-600">
                Rang <span className="font-semibold text-gray-900">{ticket.row}</span>
              </span>
            )}
            {ticket.seatNumber && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Armchair className="h-3 w-3 text-gray-400" />
                Place <span className="font-semibold text-gray-900">{ticket.seatNumber}</span>
              </span>
            )}
            {!ticket.row && !ticket.seatNumber && (
              <span className="text-sm italic text-gray-400">Placement libre</span>
            )}
          </div>
        </div>

        {/* Col 2 — Seller */}
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className={`relative h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
            {initial}
            <span className={[
              'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white',
              isVerified ? 'bg-emerald-500' : !isRejected ? 'bg-amber-400' : 'bg-gray-300',
            ].join(' ')} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-gray-900">
              {firstName} <span className="font-normal text-gray-400">{lastInit}.</span>
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {isVerified ? (
                <>
                  <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600">Vérifié</span>
                  <span className="text-[11px] text-gray-400">· {seller.trustScore}/100</span>
                </>
              ) : isRejected ? (
                <>
                  <ShieldAlert className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="text-[11px] text-gray-400">Non vérifié</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 shrink-0 text-amber-500" />
                  <span className="text-[11px] font-medium text-amber-600">Vérification…</span>
                </>
              )}
            </div>
          </div>

          <TrustRing score={seller.trustScore} />
        </div>

        {/* Col 3 — Price */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
          <p className="text-2xl font-bold leading-none text-gray-900">
            {Number(ticket.price).toFixed(0)}<span className="text-base font-medium">€</span>
          </p>
        </div>

        {/* Col 4 — CTA */}
        <div className="flex justify-end">
          <Link href={`/events/${eventId}/tickets/${ticket.id}`}>
            <ButtonClean size="sm" className="whitespace-nowrap">Acheter</ButtonClean>
          </Link>
        </div>
      </div>
    </CardClean>
  );
}
