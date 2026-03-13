import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { getSurahOccurrencesByJuz } from '@/lib/services/quranData';
import { useActiveProfile } from '@/store/app';
import type { TrackedSurah } from '@/types/domain';

type JuzGroup = {
  juzNumber: number;
  trackedCount: number;
  relaxCount: number;
  needsRevisionCount: number;
  surahs: TrackedSurah[];
};

const CARD_COLORS = {
  green: COLORS.status.green,
  yellow: COLORS.status.yellow,
  orange: COLORS.status.orange,
  red: COLORS.status.red,
} as const;

function getStatusText(juz: JuzGroup, cycleDays: number): string {
  if (juz.needsRevisionCount > 0) {
    return 'REVISE NOW';
  }
  if (juz.relaxCount === 0) {
    return 'Not memorized';
  }
  const daysLeftList = juz.surahs
    .filter((s) => s.status === 'relax' && s.lastRevisedDate)
    .map((s) => {
      const daysLeft = cycleDays - s.daysSinceLastRevision;
      return Math.max(daysLeft, 1);
    });
  const minDaysLeft = daysLeftList.length > 0 ? Math.min(...daysLeftList) : cycleDays;
  return `Revise in ${minDaysLeft}d`;
}

function getCardColor(juz: JuzGroup, cycleDays: number): string {
  if (juz.needsRevisionCount > 0) {
    return CARD_COLORS.red;
  }
  if (juz.relaxCount === 0) {
    return COLORS.muted;
  }
  const progressValues = juz.surahs
    .filter((s) => s.isMemorized && s.lastRevisedDate)
    .map((s) => s.daysSinceLastRevision / cycleDays);
  const maxProgress = progressValues.length > 0 ? Math.max(...progressValues) : 0;
  if (maxProgress < 0.5) return CARD_COLORS.green;
  if (maxProgress < 0.75) return CARD_COLORS.yellow;
  if (maxProgress < 1) return CARD_COLORS.orange;
  return CARD_COLORS.red;
}

type JuzCardProps = {
  juz: JuzGroup;
  onMarkJuzRevised: (juzNumber: number) => void;
};

export function JuzCard({ juz, onMarkJuzRevised }: JuzCardProps) {
  const activeProfile = useActiveProfile();
  const cycleDays = activeProfile?.juzList.find((j) => j.id === juz.juzNumber)?.revisionCycleDays ?? 7;
  const totalInJuz = getSurahOccurrencesByJuz(juz.juzNumber).length;
  const memorizedPercentage = totalInJuz > 0 ? Math.round((juz.trackedCount / totalInJuz) * 100) : 0;

  const statusText = getStatusText(juz, cycleDays);
  const cardColor = getCardColor(juz, cycleDays);

  const handlePress = () => {
    router.push(`/juz/${juz.juzNumber}`);
  };

  const handleMarkRevised = (e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    onMarkJuzRevised(juz.juzNumber);
  };

  return (
    <Pressable onPress={handlePress} style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Juz {juz.juzNumber}</Text>
        <Text style={styles.percentage}>{memorizedPercentage}%</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>{statusText}</Text>
        <Pressable onPress={handleMarkRevised} style={styles.markBtn}>
          <Text style={styles.markBtnText}>Mark revised</Text>
        </Pressable>
      </View>
      <Pressable onPress={handlePress} style={styles.viewRow}>
        <Text style={styles.viewText}>View Surahs</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.9)" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '800',
  },
  percentage: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statusText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  markBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  markBtnText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '600',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
});
