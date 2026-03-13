import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';

type QuickStatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
};

export function QuickStatCard({ title, value, subtitle, color, icon, onPress }: QuickStatCardProps) {
  const content = (
    <View style={[styles.card, { borderColor: `${color}33`, backgroundColor: `${color}1A` }]}>
      <Ionicons name={icon} size={24} color={color} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    marginBottom: 4,
  },
  title: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 32,
    fontWeight: '800',
    paddingVertical: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
});
