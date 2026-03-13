import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { useAppStore } from '@/store/app';

type SectionCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  const settings = useAppStore((state) => state.settings);
  const { colors } = useThemeColors(settings?.appearanceMode);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  eyebrow: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    gap: SPACING.md,
  },
});
