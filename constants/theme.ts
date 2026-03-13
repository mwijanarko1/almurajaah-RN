export const COLORS = {
  /** Swift app brand colors - used for onboarding to match iOS */
  brandPrimary: '#1C2B31',
  brandSecondary: '#89BF9F',
  sand: '#F4EBDD',
  sandDeep: '#E5D1B0',
  ink: '#162218',
  forest: '#234632',
  emerald: '#2F6D4F',
  moss: '#7D9471',
  gold: '#B48A38',
  clay: '#C56242',
  cream: '#FCF8F1',
  muted: '#627160',
  border: '#D8C7AD',
  white: '#FFFFFF',
  night: '#0F1712',
  nightPanel: '#17211B',

  /**
   * Status colors - match deployed Swift app exactly
   * Used for revision status indicators across JuzCard, SurahCard, etc.
   */
  status: {
    /** On track / Easy - green */
    green: '#19a620',
    /** Approaching due / Medium - yellow */
    yellow: '#f5c82f',
    /** Needs attention / Hard - orange */
    orange: '#e87a09',
    /** Overdue / Again / Not memorized - red */
    red: '#a61f1f',
  },

  /**
   * Semantic aliases for status colors
   */
  success: '#19a620',
  warning: '#f5c82f',
  danger: '#a61f1f',
  info: '#e87a09',

  /**
   * Dark mode colors - match deployed Swift app
   * Use these for backgrounds, text, and surfaces in dark mode
   */
  dark: {
    /** Primary background - matches night */
    background: '#0F1712',
    /** Secondary/panel background - matches nightPanel */
    surface: '#17211B',
    /** Primary text color - cream for dark backgrounds */
    text: '#FCF8F1',
    /** Secondary text color - muted for dark backgrounds */
    textSecondary: '#7D9471',
    /** Border color for dark mode */
    border: '#2A3A31',
    /** Card background in dark mode */
    card: '#17211B',
  },
} as const;

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const FONT_FAMILIES = {
  display: 'Archivo Black',
  body: 'Inter',
  quran: 'KFGQPC Uthmanic Script HAFS Regular',
  indoPak: 'AlQuran-IndoPak-by-QuranWBW.v.4.2.2-WL',
} as const;
