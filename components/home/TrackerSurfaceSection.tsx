import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES } from '@/constants/theme';

type TrackerSurfaceSectionProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function TrackerSurfaceSection({
  title,
  subtitle,
  children,
}: TrackerSurfaceSectionProps) {
  return (
    <View style={styles.surface}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 14,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    color: COLORS.muted,
  },
});
