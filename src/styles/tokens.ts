/**
 * Design Tokens - AVA Platform
 * 
 * Système de design centralisé pour une cohérence visuelle et une maintenance facilitée.
 * Ces tokens définissent les valeurs fondamentales utilisées dans toute l'application.
 */

// ============================
// 🎨 COULEURS
// ============================

/**
 * Palette de couleurs principale
 * Basée sur Trust Blue (primaire) et Accent Green (secondaire)
 */
export const colors = {
  // Trust Blue - Couleur primaire
  trustBlue: {
    50: '#EBF5FF',
    100: '#D6EBFF',
    200: '#B3D9FF',
    300: '#80C1FF',
    400: '#4DA8FF',
    500: '#2B87E3', // Couleur principale
    600: '#1A6FCC',
    700: '#0F54A3',
    800: '#083D7A',
    900: '#042952',
  },

  // Accent Green - Couleur secondaire
  accentGreen: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Couleur principale
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Nuances de gris
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Couleurs sémantiques
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // États spécifiques à la plateforme
  status: {
    // Statuts de billets
    active: '#10B981',
    pending: '#F59E0B',
    sold: '#6B7280',
    rejected: '#EF4444',
    reserved: '#3B82F6',

    // Statuts de transactions
    escrowed: '#2B87E3',
    released: '#10B981',
    disputed: '#EF4444',
  },

  // Overlays et ombres
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
} as const;

// ============================
// 📝 TYPOGRAPHIE
// ============================

/**
 * Système typographique basé sur une échelle modulaire
 */
export const typography = {
  // Familles de polices
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'Fira Code',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ].join(', '),
  },

  // Tailles de police (échelle modulaire - ratio 1.25)
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  // Poids de police
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Espacement des lettres
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================
// 📏 SPACING
// ============================

/**
 * Système d'espacement basé sur une échelle de 4px
 * Utilisez ces valeurs pour padding, margin, gap, etc.
 */
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
} as const;

// ============================
// 🔲 BORDURES
// ============================

/**
 * Système de bordures et rayons
 */
export const borders = {
  // Largeurs de bordure
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },

  // Rayons de bordure
  radius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
} as const;

// ============================
// 🌓 OMBRES
// ============================

/**
 * Système d'ombres pour profondeur et hiérarchie
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Ombres spécifiques au design system
  focus: '0 0 0 3px rgba(43, 135, 227, 0.2)', // Trust Blue
  focusGreen: '0 0 0 3px rgba(16, 185, 129, 0.2)', // Accent Green
} as const;

// ============================
// ⏱️ TRANSITIONS
// ============================

/**
 * Durées et timings d'animation
 */
export const transitions = {
  // Durées
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Timings
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================
// 📱 BREAKPOINTS
// ============================

/**
 * Points de rupture pour le responsive design
 */
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================
// 🔢 Z-INDEX
// ============================

/**
 * Échelle de z-index pour gérer l'empilement
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ============================
// 📐 LAYOUT
// ============================

/**
 * Valeurs de layout communes
 */
export const layout = {
  // Largeurs de conteneur
  container: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },

  // Hauteurs communes
  header: '64px',
  footer: '80px',
  sidebar: '280px',
} as const;

// ============================
// 🎯 EXPORT PAR DÉFAUT
// ============================

/**
 * Export groupé de tous les tokens
 */
export const tokens = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  layout,
} as const;

export default tokens;
