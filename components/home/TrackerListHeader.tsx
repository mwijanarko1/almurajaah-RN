import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES } from '@/constants/theme';

type TrackerListHeaderProps = {
  title: string;
  subtitle: string;
};

export function TrackerListHeader({ title, subtitle }: TrackerListHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  title: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    color: COLORS.muted,
  },
});
