'use client';

import { motion } from 'framer-motion';
import {
  CATEGORY_FILL,
  CATEGORY_FILL_HOVER,
  CATEGORY_FILL_SELECTED,
  CATEGORY_STROKE,
  CATEGORY_STROKE_SELECTED,
} from './venue-sections-config';
import type { IVenueSection } from './types';

interface IVenueSectionProps {
  section: IVenueSection;
  isHovered: boolean;
  isSelected: boolean;
  hasTickets: boolean;
  ticketsCount?: number;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

/** Availability tint applied on top of the base fill color (low stock = warm orange, high = calm green) */
function getAvailabilityFill(count: number, baseFill: string): string {
  if (count <= 2)  return '#FEE2E2'; // red-100 — urgent
  if (count <= 5)  return '#FFEDD5'; // orange-100
  if (count <= 10) return '#FEF9C3'; // yellow-50
  return baseFill;                    // normal
}

export function VenueSection({
  section,
  isHovered,
  isSelected,
  hasTickets,
  ticketsCount = 0,
  onHover,
  onLeave,
  onClick,
}: IVenueSectionProps) {
  const isStage = section.category === 'STAGE';

  const getFillColor = (): string => {
    if (isStage)     return CATEGORY_FILL[section.category];
    if (!hasTickets) return CATEGORY_FILL[section.category];
    if (isSelected)  return CATEGORY_FILL_SELECTED[section.category];
    if (isHovered)   return CATEGORY_FILL_HOVER[section.category];
    return getAvailabilityFill(ticketsCount, CATEGORY_FILL[section.category]);
  };

  const getStrokeColor = (): string => {
    if (isStage)                  return '#D1D5DB';
    if (isSelected)               return CATEGORY_STROKE_SELECTED[section.category];
    if (isHovered && hasTickets)  return CATEGORY_STROKE[section.category];
    if (hasTickets)               return CATEGORY_STROKE[section.category];
    return '#E5E7EB';
  };

  const getStrokeWidth = (): number => {
    if (isSelected) return 3;
    if (isHovered && hasTickets) return 2;
    return 1.5;
  };

  return (
    <g aria-label={section.name}>
      <motion.path
        d={section.svg_path}
        fill={getFillColor()}
        fillRule={section.fill_rule === 'evenodd' ? 'evenodd' : 'nonzero'}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        opacity={!hasTickets && !isStage ? 0.35 : 1}
        animate={{ scale: isSelected ? 1.025 : isHovered && hasTickets ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24, duration: 0.2 }}
        style={{
          transformOrigin: `${section.label_x}px ${section.label_y}px`,
          transition: 'fill 160ms ease, stroke 160ms ease, opacity 160ms ease',
          cursor: isStage ? 'default' : hasTickets ? 'pointer' : 'default',
        }}
        onMouseEnter={!isStage ? onHover : undefined}
        onMouseLeave={!isStage ? onLeave : undefined}
        onClick={!isStage && hasTickets ? onClick : undefined}
      />
    </g>
  );
}
