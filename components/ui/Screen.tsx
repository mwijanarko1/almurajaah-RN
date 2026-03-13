import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { useAppStore } from '@/store/app';

type ScreenProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  rightSlot?: ReactNode;
  /** When true, hides the title/subtitle header row (e.g. for home with custom layout) */
  hideHeader?: boolean;
};

export function Screen({ title, subtitle, children, scroll = true, rightSlot, hideHeader }: ScreenProps) {
  const settings = useAppStore((state) => state.settings);
  const { colors } = useThemeColors(settings?.appearanceMode);

  const body = (
    <View style={styles.content}>
      {!hideHeader && (title || subtitle || rightSlot) ? (
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
          </View>
          {rightSlot}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <View style={[styles.gradient, { backgroundColor: colors.background }]}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
        collapsable={false}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: FONT_FAMILIES.display,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FONT_FAMILIES.body,
  },
});
