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

function QuickStatCard({
  title,
  value,
  subtitle,
  color,
  icon,
  onPress,
}: QuickStatCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}24` }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

type QuickStatsGridViewProps = {
  streak: number;
  todayPages: number;
  allTimePages: number;
  onStreakPress?: () => void;
  onTodayPress?: () => void;
  onAllTimePress?: () => void;
};

export function QuickStatsGridView({
  streak,
  todayPages,
  allTimePages,
  onStreakPress,
  onTodayPress,
  onAllTimePress,
}: QuickStatsGridViewProps) {
  return (
    <View style={styles.grid}>
      <QuickStatCard
        title="Streak"
        value={String(streak)}
        subtitle="days"
        color={COLORS.gold}
        icon="flame"
        onPress={onStreakPress}
      />
      <QuickStatCard
        title="Today's Pages"
        value={todayPages.toFixed(1)}
        subtitle="pages"
        color={COLORS.forest}
        icon="book"
        onPress={onTodayPress}
      />
      <QuickStatCard
        title="All Time"
        value={allTimePages.toFixed(1)}
        subtitle="pages"
        color={COLORS.emerald}
        icon="bar-chart"
        onPress={onAllTimePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    minHeight: 124,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 12,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
  },
  title: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});
