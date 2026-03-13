import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { JuzCard } from '@/components/home/JuzCard';
import { QuranVerseCarousel } from '@/components/home/QuranVerseCarousel';
import { QuickStatCard } from '@/components/home/QuickStatCard';
import { SpacedReviewView } from '@/components/home/SpacedReviewView';
import { SurahCard } from '@/components/home/SurahCard';
import { Screen } from '@/components/ui/Screen';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { useActiveProfile, useAppStore, useHomeSummary, useTrackedSurahs } from '@/store/app';

type ViewMode = 'juz' | 'surah' | 'revise';

export default function HomeScreen() {
  const summary = useHomeSummary();
  const activeProfile = useActiveProfile();
  const trackedSurahs = useTrackedSurahs();
  const homeFilter = useAppStore((state) => state.homeFilter);
  const setHomeFilter = useAppStore((state) => state.setHomeFilter);
  const settings = useAppStore((state) => state.settings);
  const markOccurrenceRevised = useAppStore((state) => state.markOccurrenceRevised);
  const markJuzRevised = useAppStore((state) => state.markJuzRevised);
  const [viewMode, setViewMode] = React.useState<ViewMode>('juz');

  const { colors, isDark } = useThemeColors(settings?.appearanceMode);

  const groupedJuz = React.useMemo(() => {
    const juzMap = new Map<
      number,
      {
        juzNumber: number;
        trackedCount: number;
        relaxCount: number;
        needsRevisionCount: number;
        surahs: typeof trackedSurahs;
      }
    >();

    for (const surah of trackedSurahs.filter((item) => item.isMemorized)) {
      const entry = juzMap.get(surah.juzNumber) ?? {
        juzNumber: surah.juzNumber,
        trackedCount: 0,
        relaxCount: 0,
        needsRevisionCount: 0,
        surahs: [],
      };
      entry.trackedCount += 1;
      entry.relaxCount += surah.status === 'relax' ? 1 : 0;
      entry.needsRevisionCount += surah.status === 'needs-revision' ? 1 : 0;
      entry.surahs.push(surah);
      juzMap.set(surah.juzNumber, entry);
    }

    return Array.from(juzMap.values()).sort((left, right) => left.juzNumber - right.juzNumber);
  }, [trackedSurahs]);


  if (!summary || !activeProfile) {
    return null;
  }

  return (
    <Screen hideHeader>
      <View style={styles.welcomeHeader}>
        <Text style={[styles.welcomeEyebrow, { color: colors.textSecondary }]}>Assalamu alaikum,</Text>
        <Text style={[styles.welcomeName, { color: colors.text }]}>{summary.greetingName}</Text>
      </View>

      <QuranVerseCarousel
        juzStats={{
          type: 'juz',
          title: `Juz ${activeProfile.name} Progress`,
          totalCount: 30,
          memorizedCount: groupedJuz.length,
          relaxCount: groupedJuz.filter(j => j.relaxCount > 0).length,
          needRevisionCount: groupedJuz.filter(j => j.needsRevisionCount > 0).length,
          actionVerb: 'Memorized',
          needToVerb: 'Revise',
        }}
        surahStats={{
          type: 'surah',
          title: `Surah ${activeProfile.name} Progress`,
          totalCount: 114,
          memorizedCount: trackedSurahs.filter(s => s.isMemorized).length,
          relaxCount: trackedSurahs.filter(s => s.isMemorized && s.status === 'relax').length,
          needRevisionCount: trackedSurahs.filter(s => s.isMemorized && s.status === 'needs-revision').length,
          actionVerb: 'Memorized',
          needToVerb: 'Revise',
        }}
      />

      <View style={styles.quickStatsRow}>
        <QuickStatCard
          color={COLORS.gold}
          icon="flame"
          subtitle="days"
          title="Streak"
          value={`${summary.currentStreak}`}
        />
        <QuickStatCard
          color={COLORS.forest}
          icon="book"
          subtitle="pages"
          title="Today's Pages"
          value={summary.todayPages.toFixed(1)}
        />
        <QuickStatCard
          color={COLORS.emerald}
          icon="bar-chart"
          subtitle="pages"
          title="All Time"
          value={summary.allTimePages.toFixed(1)}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {([
            ['all', 'All'],
            ['needs-revision', 'Needs Revision'],
            ['hardest-first', 'Hardest First'],
            ['easiest-first', 'Easiest First'],
            ['last-revised-oldest', 'Oldest Revised'],
            ['least-revised', 'Least Revised'],
          ] as const).map(([filter, label]) => (
            <Pressable
              key={filter}
              onPress={() => setHomeFilter(filter)}
              style={[
                styles.filterChip,
                homeFilter === filter && [styles.filterChipActive, { borderColor: COLORS.forest, backgroundColor: COLORS.forest }],
                { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              ]}
            >
              <Text style={[styles.filterChipText, { color: homeFilter === filter ? COLORS.white : colors.text }]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.modeRow}>
        {([
          ['juz', 'Juz', 'grid' as const],
          ['surah', 'Surah', 'list' as const],
          ['revise', 'Revise', 'time' as const],
        ] as const).map(([mode, label, icon]) => (
          <Pressable
            key={mode}
            onPress={() => setViewMode(mode)}
            style={[
              styles.modeButton,
              { borderColor: colors.border, backgroundColor: colors.card },
              viewMode === mode && [styles.modeButtonActive, { backgroundColor: COLORS.forest, borderColor: COLORS.forest }],
            ]}
          >
            <Ionicons
              name={icon}
              size={16}
              color={viewMode === mode ? COLORS.white : colors.text}
              style={styles.modeIcon}
            />
            <Text style={[styles.modeButtonText, { color: viewMode === mode ? COLORS.white : colors.text }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {viewMode === 'juz' ? (
        <View style={styles.stack}>
          {groupedJuz.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No tracked juz</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add memorized surahs in Settings to see them here.</Text>
            </View>
          ) : (
            groupedJuz.map((juz) => (
              <JuzCard
                key={juz.juzNumber}
                juz={juz}
                onMarkJuzRevised={(n) => void markJuzRevised(n)}
              />
            ))
          )}
        </View>
      ) : null}

      {viewMode === 'surah' ? (
        <View style={styles.stack}>
          {trackedSurahs.filter((item) => item.isMemorized).length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No tracked surahs</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Add memorized surahs in Settings to see them here.</Text>
            </View>
          ) : (
            trackedSurahs.filter((item) => item.isMemorized).map((surah) => (
              <SurahCard
                key={surah.id}
                surah={surah}
                onMarkRevised={(id) => void markOccurrenceRevised(id)}
              />
            ))
          )}
        </View>
      ) : null}

      {viewMode === 'revise' ? (
        <SpacedReviewView
          surahs={trackedSurahs.filter((item) => item.isMemorized && item.status === 'needs-revision')}
          onRate={(id, rating) => {
            void markOccurrenceRevised(id);
            console.log('Rated:', id, rating);
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeHeader: {
    gap: 8,
    paddingHorizontal: 4,
  },
  welcomeEyebrow: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 22,
  },
  welcomeName: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 28,
    fontWeight: '800',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterScroll: {
    marginHorizontal: -4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: 4,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    // Colors set dynamically
  },
  filterChipText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
  },
  modeButtonActive: {
    // Colors set dynamically
  },
  modeButtonText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '700',
  },
  modeIcon: {
    marginRight: 2,
  },
  stack: {
    gap: 12,
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
