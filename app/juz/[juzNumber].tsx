import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SurahCard } from '@/components/home/SurahCard';
import { Screen } from '@/components/ui/Screen';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { getSurahOccurrencesByJuz } from '@/lib/services/quranData';
import { useActiveProfile, useAppStore } from '@/store/app';
import { getTrackedSurahs } from '@/lib/services/revision';

export default function JuzDetailScreen() {
  const params = useLocalSearchParams<{ juzNumber: string }>();
  const juzNumber = Number(params.juzNumber);
  const activeProfile = useActiveProfile();
  const markOccurrenceRevised = useAppStore((state) => state.markOccurrenceRevised);
  const markJuzRevised = useAppStore((state) => state.markJuzRevised);

  const occurrences = React.useMemo(
    () => getSurahOccurrencesByJuz(juzNumber),
    [juzNumber]
  );
  const trackedSurahs = React.useMemo(() => {
    if (!activeProfile) return [];
    return getTrackedSurahs(activeProfile).filter(
      (s) => s.juzNumber === juzNumber && s.isMemorized
    );
  }, [activeProfile, juzNumber]);

  const totalPages = React.useMemo(
    () => occurrences.reduce((sum, o) => sum + o.pages, 0),
    [occurrences]
  );

  const juz = activeProfile?.juzList.find((j) => j.id === juzNumber);
  const cycleDays = juz?.revisionCycleDays ?? 7;

  const lastRevisedDates = React.useMemo(() => {
    if (!juz) return [];
    return Object.values(juz.surahLastRevisedDates);
  }, [juz]);
  const mostRecentDate = lastRevisedDates.length > 0
    ? lastRevisedDates.sort().reverse()[0]
    : null;
  const daysSinceMostRecent = mostRecentDate
    ? Math.floor(
        (Date.now() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;
  const lastRevisedText =
    daysSinceMostRecent !== null ? `${daysSinceMostRecent} days ago` : 'Never';

  const difficultyLabels: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    'very-hard': 'Very Hard',
  };
  const hardestDifficulty = trackedSurahs.length > 0
    ? trackedSurahs.reduce((max, s) =>
        ['easy', 'medium', 'hard', 'very-hard'].indexOf(s.difficulty) >
        ['easy', 'medium', 'hard', 'very-hard'].indexOf(max.difficulty)
          ? s
          : max
      )
    : null;
  const difficultyText = hardestDifficulty
    ? difficultyLabels[hardestDifficulty.difficulty] ?? 'Medium'
    : '—';

  const needsRevisionCount = trackedSurahs.filter((s) => s.status === 'needs-revision').length;
  const statusText = needsRevisionCount > 0 ? 'REVISE NOW' : 'Relax';

  const handleMarkJuzRevised = () => {
    void markJuzRevised(juzNumber);
    router.back();
  };

  if (Number.isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
    return null;
  }

  return (
    <Screen title={`Juz ${juzNumber}`} subtitle="Juz Details">
      <View style={styles.statusCard}>
        <Text style={styles.pages}>{totalPages.toFixed(1)} pages</Text>
        <View style={styles.statusRow}>
          <StatusLabel title="Status" value={statusText} color={needsRevisionCount > 0 ? COLORS.status.red : COLORS.status.green} />
          <StatusLabel title="Difficulty" value={difficultyText} color={COLORS.ink} />
          <StatusLabel title="Last Revised" value={lastRevisedText} color={COLORS.muted} />
        </View>
        <AppButton
          label="Mark revised"
          onPress={handleMarkJuzRevised}
          style={styles.markBtn}
        />
      </View>

      <Text style={styles.sectionTitle}>Surahs in this Juz</Text>
      <View style={styles.surahList}>
        {trackedSurahs.map((surah) => (
          <SurahCard
            key={surah.id}
            surah={surah}
            onMarkRevised={(id) => void markOccurrenceRevised(id)}
          />
        ))}
      </View>
    </Screen>
  );
}

function StatusLabel({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statusLabel}>
      <Text style={styles.statusLabelTitle}>{title}</Text>
      <Text style={[styles.statusLabelValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: 'rgba(34, 70, 50, 0.1)',
    borderRadius: 15,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  pages: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statusLabel: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusLabelTitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  statusLabelValue: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '700',
  },
  markBtn: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '800',
  },
  surahList: {
    gap: 12,
  },
});
