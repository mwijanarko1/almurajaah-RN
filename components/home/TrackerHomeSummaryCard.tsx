import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProfileSelector } from '@/components/home/ProfileSelector';
import { COLORS, FONT_FAMILIES } from '@/constants/theme';
import type { ProgressSummary } from '@/types/domain';

type TrackerHomeSummaryCardProps = {
  greetingName: string;
  activeProfileName: string;
  subtitle: string;
  streakCount: number;
  cycleStats: ProgressSummary;
  memorizedSurahCount: number;
  onProfilePress?: () => void;
};

export function TrackerHomeSummaryCard({
  greetingName,
  activeProfileName,
  subtitle,
  streakCount,
  cycleStats,
  memorizedSurahCount,
  onProfilePress,
}: TrackerHomeSummaryCardProps) {
  const completionPct = Math.round(cycleStats.completionRatio * 100);
  const pendingCount = cycleStats.pendingThisCycle.length;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.eyebrow}>Assalamu alaikum,</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {greetingName}
          </Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{activeProfileName}</Text>
          </View>
        </View>
        <View style={styles.rightBlock}>
          <ProfileSelector activeProfileName={activeProfileName} onPress={onProfilePress} />
          <View style={styles.streakBadge}>
            <View style={[styles.streakDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.streakLabel}>Streak</Text>
            <Text style={styles.streakValue}>{streakCount}d</Text>
          </View>
        </View>
      </View>

      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricCaption}>Cycle</Text>
          <Text style={styles.metricValue}>{completionPct}%</Text>
          <Text style={styles.metricSub}>completion</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricCaption}>Pending</Text>
          <Text style={styles.metricValue}>{pendingCount}</Text>
          <Text style={styles.metricSub}>surahs</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricCaption}>Tracked</Text>
          <Text style={styles.metricValue}>{memorizedSurahCount}</Text>
          <Text style={styles.metricSub}>surahs</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(4, completionPct)}%` },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Cycle {cycleStats.cycleNumber}</Text>
          <Text style={styles.progressLabel}>
            {cycleStats.daysRemaining} days left
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 18,
    gap: 18,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  greetingBlock: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.muted,
  },
  greetingName: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
  },
  profileBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${COLORS.forest}20`,
  },
  profileBadgeText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.forest,
  },
  rightBlock: {
    alignItems: 'flex-end',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.sand,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  streakLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  streakValue: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.muted,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: `${COLORS.forest}14`,
    gap: 6,
  },
  metricCaption: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  metricValue: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.ink,
  },
  metricSub: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
  },
  progressBlock: {
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.sand,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.forest,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
});
