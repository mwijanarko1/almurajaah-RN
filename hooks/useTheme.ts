import { useColorScheme } from 'react-native';

import { COLORS } from '@/constants/theme';
import type { AppearanceMode } from '@/types/domain';

/**
 * Computes the effective color scheme based on user preference and system setting.
 * Matches the behavior of the deployed Swift app's ThemeManager.
 *
 * - 'system' -> follows device setting
 * - 'light' -> forces light mode
 * - 'dark' -> forces dark mode
 */
export function useEffectiveColorScheme(appearanceMode: AppearanceMode | null | undefined): 'light' | 'dark' {
  const systemColorScheme = useColorScheme();

  if (appearanceMode === 'light') {
    return 'light';
  }

  if (appearanceMode === 'dark') {
    return 'dark';
  }

  // Default to system preference or light if undefined
  return systemColorScheme ?? 'light';
}

/**
 * Returns theme-aware colors based on the effective color scheme.
 * Use this hook in components that need to adapt to dark/light mode.
 */
export function useThemeColors(appearanceMode: AppearanceMode | null | undefined) {
  const colorScheme = useEffectiveColorScheme(appearanceMode);
  const isDark = colorScheme === 'dark';

  return {
    colorScheme,
    isDark,
    colors: {
      // Background colors
      background: isDark ? COLORS.dark.background : COLORS.cream,
      surface: isDark ? COLORS.dark.surface : COLORS.white,
      card: isDark ? COLORS.dark.card : COLORS.white,

      // Text colors
      text: isDark ? COLORS.dark.text : COLORS.ink,
      textSecondary: isDark ? COLORS.dark.textSecondary : COLORS.muted,

      // Border colors
      border: isDark ? COLORS.dark.border : COLORS.border,

      // Status bar
      statusBar: isDark ? 'light' : 'dark' as 'light' | 'dark' | 'auto',

      // Keep the original COLORS available for status colors, etc.
      ...COLORS,
    },
  };
}
