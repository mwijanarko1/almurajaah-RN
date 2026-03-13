import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { JuzDisclosureSection } from '@/components/home/JuzDisclosureSection';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type { HomeFilter } from '@/lib/services/revision';
import type { TrackedSurah } from '@/types/domain';

type JuzGroup = {
  juzNumber: number;
  trackedCount: number;
  relaxCount: number;
  needsRevisionCount: number;
  surahs: TrackedSurah[];
};

type FilteredJuzViewProps = {
  filter: HomeFilter;
  groupedJuz: JuzGroup[];
  onMarkRevised: (occurrenceId: string) => void;
};

export function FilteredJuzView({
  filter,
  groupedJuz,
  onMarkRevised,
}: FilteredJuzViewProps) {
  const [needsExpanded, setNeedsExpanded] = React.useState(true);
  const [relaxedExpanded, setRelaxedExpanded] = React.useState(false);
  const [filteredExpanded, setFilteredExpanded] = React.useState(true);

  const needsRevision = groupedJuz.filter((j) => j.needsRevisionCount > 0);
  const relaxed = groupedJuz.filter((j) => j.relaxCount > 0 && j.needsRevisionCount === 0);

  const sections =
    filter === 'all'
      ? [
          {
            title: 'Needs Revision',
            subtitle: 'Due now or overdue.',
            juzs: needsRevision,
            tint: '#B42318' as const,
            expanded: needsExpanded,
            onToggle: () => setNeedsExpanded((v) => !v),
          },
          {
            title: 'Recently Revised',
            subtitle: 'Tracked juz currently in a relaxed state.',
            juzs: relaxed,
            tint: '#1E8E5A' as const,
            expanded: relaxedExpanded,
            onToggle: () => setRelaxedExpanded((v) => !v),
          },
        ].filter((s) => s.juzs.length > 0)
      : [
          {
            title: getFilterTitle(filter),
            subtitle: getFilterSubtitle(filter),
            juzs: groupedJuz,
            tint: COLORS.forest,
            expanded: filteredExpanded,
            onToggle: () => setFilteredExpanded((v) => !v),
          },
        ];

  if (groupedJuz.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No tracked juz</Text>
        <Text style={styles.emptySubtitle}>
          Add memorized surahs in Settings to see them here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <JuzDisclosureSection
          key={section.title}
          title={section.title}
          subtitle={section.subtitle}
          juzs={section.juzs}
          tint={section.tint}
          isExpanded={section.expanded}
          onToggle={section.onToggle}
          onMarkRevised={onMarkRevised}
        />
      ))}
    </View>
  );
}

function getFilterTitle(filter: HomeFilter): string {
  switch (filter) {
    case 'all':
      return 'Tracked Juz';
    case 'needs-revision':
      return 'Needs Revision';
    case 'hardest-first':
      return 'Hardest First';
    case 'easiest-first':
      return 'Easiest First';
    case 'last-revised-oldest':
      return 'Oldest Revised';
    case 'least-revised':
      return 'Least Revised';
    default:
      return 'Tracked Juz';
  }
}

function getFilterSubtitle(filter: HomeFilter): string {
  switch (filter) {
    case 'all':
      return "All tracked ajza'.";
    case 'needs-revision':
      return 'Only the ajza\' that currently need attention.';
    case 'hardest-first':
      return 'Sorted by average surah difficulty.';
    case 'easiest-first':
      return "Start with the easiest tracked ajza'.";
    case 'last-revised-oldest':
      return 'Prioritizing the oldest revision dates.';
    case 'least-revised':
      return 'Sorted by total revision count.';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
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
    color: COLORS.ink,
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
