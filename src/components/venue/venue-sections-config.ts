/**
 * Fallback statique : sections génériques utilisées quand aucun seatmap
 * n'est disponible en base de données pour la salle de l'événement.
 *
 * Les seatmaps réalistes sont dans prisma/seed-venues.ts
 * (Accor Arena, Stade de France, Zénith).
 */
import type { IVenueSection, SectionCategory } from './types';

export const FALLBACK_SECTIONS: IVenueSection[] = [
  {
    section_id: 'scene-fallback',
    name: 'Scène',
    category: 'STAGE',
    svg_path: 'M 180,18 Q 400,6 620,18 L 610,72 Q 400,62 190,72 Z',
    fill_rule: 'nonzero',
    label_x: 400,
    label_y: 44,
    aliases: ['scene', 'stage'],
  },
  {
    section_id: 'fosse',
    name: 'Fosse Debout',
    category: 'STANDING_PIT',
    svg_path: 'M 155,115 L 645,115 L 645,270 L 155,270 Z',
    fill_rule: 'nonzero',
    label_x: 400,
    label_y: 193,
    aliases: ['fosse', 'fosse debout', 'pit', 'standing', 'ga', 'debout', 'parterre'],
  },
  {
    section_id: 'balcon-ouest',
    name: 'Balcon Ouest',
    category: 'LOWER_TIER',
    svg_path: 'M 20,115 L 140,115 L 140,335 L 20,335 Z',
    fill_rule: 'nonzero',
    label_x: 80,
    label_y: 225,
    aliases: ['balcon ouest', 'ouest', 'left', 'gauche'],
  },
  {
    section_id: 'balcon-est',
    name: 'Balcon Est',
    category: 'LOWER_TIER',
    svg_path: 'M 660,115 L 780,115 L 780,335 L 660,335 Z',
    fill_rule: 'nonzero',
    label_x: 720,
    label_y: 225,
    aliases: ['balcon est', 'est', 'right', 'droite'],
  },
  {
    section_id: 'vip',
    name: 'Carré Or / VIP',
    category: 'VIP_PREMIUM',
    svg_path: 'M 260,285 L 540,285 L 540,375 L 260,375 Z',
    fill_rule: 'nonzero',
    label_x: 400,
    label_y: 330,
    aliases: ['vip', 'carré or', 'carre or', 'or', 'golden circle', 'premium'],
  },
  {
    section_id: 'gradin',
    name: 'Gradin Supérieur',
    category: 'UPPER_TIER',
    svg_path: 'M 20,390 L 780,390 L 780,470 L 20,470 Z',
    fill_rule: 'nonzero',
    label_x: 400,
    label_y: 430,
    aliases: ['gradin', 'gradin supérieur', 'upper', 'haut', 'hauteur'],
  },
];

export const FALLBACK_SEATMAP = {
  id: 'fallback',
  stageSetup: 'FRONTAL' as const,
  configurationName: 'Plan générique',
  viewboxWidth: 800,
  viewboxHeight: 500,
  sections: FALLBACK_SECTIONS,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Résout le `section_id` d'un ticket à partir de son champ `section` (texte libre).
 * Utilise d'abord les sections du seatmap actif, puis le fallback.
 */
export function resolveSectionId(
  ticketSection: string | null,
  sections: IVenueSection[]
): string | null {
  if (!ticketSection) return null;

  const norm = normalize(ticketSection);

  for (const s of sections) {
    if (normalize(s.section_id) === norm) return s.section_id;
    if (normalize(s.name) === norm) return s.section_id;
    for (const alias of s.aliases) {
      if (normalize(alias) === norm) return s.section_id;
      if (norm.includes(normalize(alias)) || normalize(alias).includes(norm)) {
        return s.section_id;
      }
    }
  }

  return null;
}

// ─── Color maps per category ─────────────────────────────────────────────────

// ─── Resting fill (distinct per category) ────────────────────────────────────
export const CATEGORY_FILL: Record<SectionCategory, string> = {
  STAGE:        '#E5E7EB', // grey — non-interactive
  STANDING_PIT: '#DBEAFE', // blue-100   Fosse
  SEATED_FLOOR: '#F3F4F6', // gray-100   Parterre assis
  LOWER_TIER:   '#EDE9FE', // violet-100 Tribunes basses
  MIDDLE_TIER:  '#F5F3FF', // violet-50  Tribunes hautes
  UPPER_TIER:   '#F0FDF4', // green-50   Gradins hauts
  VIP_PREMIUM:  '#FED7AA', // orange-200 Carré Or / VIP
  VIP_LOGES:    '#FEF08A', // yellow-200 Loges
  ACCESSIBLE:   '#DCFCE7', // green-100  PMR
};

// ─── Hover fill ───────────────────────────────────────────────────────────────
export const CATEGORY_FILL_HOVER: Record<SectionCategory, string> = {
  STAGE:        '#E5E7EB',
  STANDING_PIT: '#93C5FD', // blue-300
  SEATED_FLOOR: '#D1D5DB', // gray-300
  LOWER_TIER:   '#C4B5FD', // violet-300
  MIDDLE_TIER:  '#DDD6FE', // violet-200
  UPPER_TIER:   '#86EFAC', // green-300
  VIP_PREMIUM:  '#FDBA74', // orange-300
  VIP_LOGES:    '#FCD34D', // yellow-300
  ACCESSIBLE:   '#86EFAC', // green-300
};

// ─── Selected fill ────────────────────────────────────────────────────────────
export const CATEGORY_FILL_SELECTED: Record<SectionCategory, string> = {
  STAGE:        '#E5E7EB',
  STANDING_PIT: '#2563EB', // blue-600
  SEATED_FLOOR: '#6B7280', // gray-500
  LOWER_TIER:   '#7C3AED', // violet-600
  MIDDLE_TIER:  '#6D28D9', // violet-700
  UPPER_TIER:   '#16A34A', // green-600
  VIP_PREMIUM:  '#EA580C', // orange-600
  VIP_LOGES:    '#CA8A04', // yellow-600
  ACCESSIBLE:   '#15803D', // green-700
};

// ─── Resting stroke (subtle, distinct per category) ───────────────────────────
export const CATEGORY_STROKE: Record<SectionCategory, string> = {
  STAGE:        '#D1D5DB',
  STANDING_PIT: '#93C5FD', // blue-300
  SEATED_FLOOR: '#D1D5DB', // gray-300
  LOWER_TIER:   '#C4B5FD', // violet-300
  MIDDLE_TIER:  '#DDD6FE', // violet-200
  UPPER_TIER:   '#86EFAC', // green-300
  VIP_PREMIUM:  '#FB923C', // orange-400
  VIP_LOGES:    '#FACC15', // yellow-400
  ACCESSIBLE:   '#4ADE80', // green-400
};

// ─── Selected stroke ──────────────────────────────────────────────────────────
export const CATEGORY_STROKE_SELECTED: Record<SectionCategory, string> = {
  STAGE:        '#D1D5DB',
  STANDING_PIT: '#1D4ED8', // blue-700
  SEATED_FLOOR: '#374151', // gray-700
  LOWER_TIER:   '#6D28D9', // violet-700
  MIDDLE_TIER:  '#5B21B6', // violet-800
  UPPER_TIER:   '#15803D', // green-700
  VIP_PREMIUM:  '#C2410C', // orange-700
  VIP_LOGES:    '#A16207', // yellow-700
  ACCESSIBLE:   '#166534', // green-800
};

// ─── Accent (text / icon color on price markers) ──────────────────────────────
export const CATEGORY_ACCENT: Record<SectionCategory, string> = {
  STAGE:        '#9CA3AF',
  STANDING_PIT: '#1D4ED8',
  SEATED_FLOOR: '#374151',
  LOWER_TIER:   '#7C3AED',
  MIDDLE_TIER:  '#6D28D9',
  UPPER_TIER:   '#15803D',
  VIP_PREMIUM:  '#C2410C',
  VIP_LOGES:    '#A16207',
  ACCESSIBLE:   '#15803D',
};
