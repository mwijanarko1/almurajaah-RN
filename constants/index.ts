/**
 * Theme constants for Al Muraja'ah app
 * All colors and design tokens are centralized here to match the deployed Swift app
 */

export { COLORS, FONT_FAMILIES, SPACING } from './theme';

/**
 * Font size tokens
 */
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/**
 * Status color aliases - matches the deployed Swift app revision status colors
 * Use these for semantic clarity when indicating revision state
 */
export const STATUS_COLORS = {
  /** On track / Easy - green */
  onTrack: '#19a620',
  /** Approaching due / Medium - yellow */
  approaching: '#f5c82f',
  /** Needs attention / Hard - orange */
  attention: '#e87a09',
  /** Overdue / Again - red */
  overdue: '#a61f1f',
} as const;
