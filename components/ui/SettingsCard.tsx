import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';

type SettingsCardProps = {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children: ReactNode;
};

export function SettingsCard({
  title,
  icon,
  iconColor = COLORS.forest,
  children,
}: SettingsCardProps) {
  return (
    <View style={styles.card}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon ? (
            <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />
          ) : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: {
    marginRight: 4,
  },
  title: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    gap: SPACING.md,
  },
});
