'use client';

import { motion } from 'framer-motion';
import { CATEGORY_ACCENT, CATEGORY_FILL_SELECTED, CATEGORY_STROKE_SELECTED } from './venue-sections-config';
import type { SectionCategory } from './types';

interface IPriceMarkerProps {
  x: number;
  y: number;
  sectionName: string;
  minPrice: number;
  maxPrice: number;
  ticketsCount: number;
  isHovered: boolean;
  isSelected: boolean;
  category: SectionCategory;
  animationDelay?: number;
  dimmed?: boolean;
}

const IS_VIP: Partial<Record<SectionCategory, true>> = {
  VIP_PREMIUM: true,
  VIP_LOGES:   true,
};

export function PriceMarker({
  x,
  y,
  sectionName,
  minPrice,
  maxPrice,
  ticketsCount,
  isHovered,
  isSelected,
  category,
  animationDelay = 0,
  dimmed = false,
}: IPriceMarkerProps) {
  const active    = isHovered || isSelected;
  const isUrgent  = ticketsCount > 0 && ticketsCount <= 3;
  const isVIP     = !!IS_VIP[category];

  // ── Colour logic ──────────────────────────────────────────────────────────
  let circleFill: string;
  let circleStroke: string;
  let textFill: string;

  if (isSelected) {
    circleFill   = CATEGORY_FILL_SELECTED[category];
    circleStroke = CATEGORY_STROKE_SELECTED[category];
    textFill     = '#FFFFFF';
  } else if (isUrgent) {
    circleFill   = '#FEE2E2'; // red-100
    circleStroke = '#EF4444'; // red-500
    textFill     = '#B91C1C'; // red-700
  } else if (isVIP) {
    circleFill   = '#FED7AA'; // orange-200
    circleStroke = '#F97316'; // orange-500
    textFill     = '#C2410C'; // orange-700
  } else if (isHovered) {
    circleFill   = '#F8FAFC';
    circleStroke = '#6B7280';
    textFill     = CATEGORY_ACCENT[category];
  } else {
    circleFill   = 'white';
    circleStroke = '#D1D5DB';
    textFill     = CATEGORY_ACCENT[category];
  }

  // ── Radius: slightly larger for VIP / urgent to convey importance ─────────
  const baseR   = 40;
  const radius  = isSelected ? baseR + 6 : isVIP || isUrgent ? baseR + 4 : baseR;

  const strokeW = isSelected ? 2.5 : isUrgent || isVIP ? 2 : 1.5;

  const animProps = {
    initial:    { scale: 0, opacity: 0 },
    animate:    { scale: dimmed ? 0.7 : 1, opacity: dimmed ? 0.25 : 1 },
    transition: { delay: animationDelay, duration: 0.32, type: 'spring' as const, stiffness: 280, damping: 22 },
    style:      { transformOrigin: `${x}px ${y}px`, pointerEvents: 'none' as const },
  };

  // ══════════════════ ACTIVE STATE — expanded pill ══════════════════════════
  if (active) {
    const pillW = 136;
    const pillH = 60;
    const pillR = 14;

    return (
      <motion.g {...animProps}>
        {/* Glow halo */}
        <rect
          x={x - pillW / 2 - 8} y={y - pillH / 2 - 8}
          width={pillW + 16}     height={pillH + 16}
          rx={pillR + 6}
          fill={isUrgent ? '#EF4444' : isVIP ? '#F97316' : CATEGORY_FILL_SELECTED[category]}
          opacity={0.1}
        />

        {/* Pill */}
        <rect
          x={x - pillW / 2} y={y - pillH / 2}
          width={pillW}      height={pillH}
          rx={pillR}
          fill={circleFill}
          stroke={circleStroke}
          strokeWidth={strokeW}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
        />

        {/* Category icon (urgent / VIP) */}
        {(isUrgent || isVIP) && (
          <text
            x={x} y={y - 16}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={12}
            fontFamily="Inter, system-ui, sans-serif"
            style={{ userSelect: 'none' }}
          >
            {isUrgent ? '⚠️' : '⭐'}
          </text>
        )}

        {/* Section name — compact */}
        <text
          x={x} y={y - 12}
          textAnchor="middle" dominantBaseline="middle"
          fill={isSelected ? 'rgba(255,255,255,0.72)' : '#6B7280'}
          fontSize={11} fontWeight="500"
          fontFamily="Inter, system-ui, sans-serif"
          style={{ userSelect: 'none' }}
        >
          {sectionName.length > 18 ? sectionName.slice(0, 17) + '…' : sectionName}
        </text>

        {/* Price — main */}
        <text
          x={x} y={y + 6}
          textAnchor="middle" dominantBaseline="middle"
          fill={textFill}
          fontSize={21} fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          style={{ userSelect: 'none' }}
        >
          {Math.round(minPrice)}{maxPrice > minPrice + 10 ? `–${Math.round(maxPrice)}€` : '€'}
        </text>

        {/* Ticket count */}
        <text
          x={x} y={y + 23}
          textAnchor="middle" dominantBaseline="middle"
          fill={isSelected ? 'rgba(255,255,255,0.55)' : isUrgent ? '#EF4444' : '#9CA3AF'}
          fontSize={11}
          fontFamily="Inter, system-ui, sans-serif"
          style={{ userSelect: 'none' }}
        >
          {isUrgent ? `⚡ ${ticketsCount} restant${ticketsCount > 1 ? 's' : ''}` : `${ticketsCount} dispo`}
        </text>
      </motion.g>
    );
  }

  // ══════════════════ REST STATE — compact circle ═══════════════════════════
  const hasRange    = maxPrice > minPrice + 10;
  const priceOffset = hasRange ? -7 : 2;

  return (
    <motion.g {...animProps}>
      {/* Outer glow for urgent/VIP */}
      {(isUrgent || isVIP) && (
        <circle cx={x} cy={y} r={radius + 8}
          fill={isUrgent ? '#EF4444' : '#F97316'} opacity={0.12} />
      )}

      <circle
        cx={x} cy={y} r={radius}
        fill={circleFill} stroke={circleStroke} strokeWidth={strokeW}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.10))' }}
      />

      {/* Urgent/VIP icon (small, above price) */}
      {(isUrgent || isVIP) && (
        <text x={x} y={y - 16} textAnchor="middle" dominantBaseline="middle"
          fontSize={10} fontFamily="Inter, system-ui, sans-serif" style={{ userSelect: 'none' }}>
          {isUrgent ? '⚠️' : '⭐'}
        </text>
      )}

      {/* Min price */}
      <text x={x} y={y + priceOffset}
        textAnchor="middle" dominantBaseline="middle"
        fill={textFill} fontSize={17} fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif" style={{ userSelect: 'none' }}>
        {Math.round(minPrice)}€
      </text>

      {/* Max price range (compact, below min) */}
      {hasRange && (
        <text x={x} y={y + 9}
          textAnchor="middle" dominantBaseline="middle"
          fill={isUrgent ? '#EF4444' : isVIP ? '#F97316' : '#9CA3AF'}
          fontSize={11} fontFamily="Inter, system-ui, sans-serif" style={{ userSelect: 'none' }}>
          -{Math.round(maxPrice)}€
        </text>
      )}
    </motion.g>
  );
}
