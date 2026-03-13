import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useActiveProfile } from '@/store/app';
import type { TrackedSurah } from '@/types/domain';

const CARD_COLORS = {
  green: COLORS.status.green,
  yellow: COLORS.status.yellow,
  orange: COLORS.status.orange,
  red: COLORS.status.red,
} as const;

function getStatusText(surah: TrackedSurah, cycleDays: number): string {
  if (!surah.isMemorized) {
    return 'Not memorized';
  }
  if (surah.status === 'needs-revision') {
    return 'REVISE NOW';
  }
  if (surah.lastRevisedDate) {
    const daysLeft = cycleDays - surah.daysSinceLastRevision;
    if (daysLeft <= 0) return 'REVISE NOW';
    return `Revise in ${daysLeft}d`;
  }
  return 'Not Revised';
}

function getCardColor(surah: TrackedSurah, cycleDays: number): string {
  if (!surah.isMemorized || !surah.lastRevisedDate) {
    return CARD_COLORS.red;
  }
  const progress = surah.daysSinceLastRevision / cycleDays;
  if (progress < 0.5) return CARD_COLORS.green;
  if (progress < 0.75) return CARD_COLORS.yellow;
  if (progress < 1) return CARD_COLORS.orange;
  return CARD_COLORS.red;
}

type SurahCardProps = {
  surah: TrackedSurah;
  onMarkRevised: (occurrenceId: string) => void;
};

export function SurahCard({ surah, onMarkRevised }: SurahCardProps) {
  const activeProfile = useActiveProfile();
  const cycleDays = activeProfile?.juzList.find((j) => j.id === surah.juzNumber)?.revisionCycleDays ?? 7;

  const statusText = getStatusText(surah, cycleDays);
  const cardColor = getCardColor(surah, cycleDays);
  const pagesDisplay = surah.pages >= 1 ? `${surah.pages.toFixed(1)} pages` : '1 page';

  const handlePress = () => {
    router.push(`/surah/${surah.surahNumber}`);
  };

  const handleMarkRevised = (e: { stopPropagation?: () => void }) => {
    e.stopPropagation?.();
    onMarkRevised(surah.id);
  };

  return (
    <Pressable onPress={handlePress} style={[styles.card, { backgroundColor: cardColor }]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {surah.englishName}
        </Text>
        <Text style={styles.pages}>{pagesDisplay}</Text>
      </View>
      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>Surah {surah.surahNumber}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.subtitleText}>Juz {surah.juzNumber}</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>{statusText}</Text>
        <Pressable onPress={handleMarkRevised} style={styles.markBtn}>
          <Text style={styles.markBtnText}>Mark revised</Text>
        </Pressable>
      </View>
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
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '800',
  },
  pages: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  dot: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
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
});
