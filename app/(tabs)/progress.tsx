import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type {
  RevisionCycle,
  SurahNotRevisedInfo,
  SurahRevisionStatus,
  SurahSuggestion,
} from '@/types/domain';
import { useProgressSummary } from '@/store/app';

type CycleFilter = 'current' | 'previous' | 'all';

export default function ProgressScreen() {
  const summary = useProgressSummary();
  const [cycleFilter, setCycleFilter] = React.useState<CycleFilter>('current');
  const [expandedCompleted, setExpandedCompleted] = React.useState(false);
  const [expandedPending, setExpandedPending] = React.useState(false);

  if (!summary) {
    return null;
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Screen
      subtitle="Track the current cycle, due surahs, and steady coverage over time."
      title="Revision Cycle Tracker"
    >
      {/* Current Cycle Header - iOS CurrentCycleHeaderView */}
      <View style={styles.cycleHeader}>
        <View style={styles.cycleHeaderTop}>
          <View>
            <Text style={styles.cycleEyebrow}>Current Cycle</Text>
            <Text style={styles.cycleTitle}>Cycle #{summary.cycleNumber}</Text>
          </View>
          <CountdownTimer daysRemaining={summary.daysRemaining} />
        </View>

        <View style={styles.progressRing}>
          <View style={styles.progressRingTrack}>
            <View
              style={[
                styles.progressRingFill,
                { width: `${Math.min(100, summary.completionRatio * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.progressRingCenter}>
            <Text style={styles.progressRingValue}>
              {summary.completedSurahs}/{summary.totalMemorizedSurahs}
            </Text>
            <Text style={styles.progressRingLabel}>Surahs</Text>
            <Text style={styles.progressRingPct}>
              {Math.round(summary.completionRatio * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.cycleDates}>
          <View>
            <Text style={styles.cycleDateLabel}>Started</Text>
            <Text style={styles.cycleDateValue}>{formatDate(summary.cycleStartDate)}</Text>
          </View>
          <View style={styles.cycleDateRight}>
            <Text style={styles.cycleDateLabel}>Ends</Text>
            <Text style={styles.cycleDateValue}>{formatDate(summary.cycleEndDate)}</Text>
          </View>
        </View>
      </View>

      {/* Cycle Filter Picker - iOS CycleFilterPicker */}
      <View style={styles.filterPicker}>
        {(['current', 'previous', 'all'] as const).map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setCycleFilter(filter)}
            style={[styles.filterOption, cycleFilter === filter && styles.filterOptionActive]}
          >
            <Text
              style={[
                styles.filterOptionText,
                cycleFilter === filter && styles.filterOptionTextActive,
              ]}
            >
              {filter === 'current' ? 'Current' : filter === 'previous' ? 'Previous' : 'All Time'}
            </Text>
          </Pressable>
        ))}
      </View>

      {cycleFilter === 'current' && (
        <>
          {/* Current Cycle Dashboard - Status Cards + Sections */}
          <View style={styles.statusRow}>
            <StatusCard
              title="Completed"
              count={summary.completedThisCycle.length}
              color={COLORS.emerald}
              icon="✓"
            />
            <StatusCard
              title="Pending"
              count={summary.pendingThisCycle.length}
              color={COLORS.clay}
              icon="⏳"
            />
          </View>

          {summary.completedThisCycle.length > 0 && (
            <SurahStatusSection
              title="Completed This Cycle ✅"
              surahs={summary.completedThisCycle}
              isExpanded={expandedCompleted}
              onToggle={() => setExpandedCompleted((v) => !v)}
              sectionColor={COLORS.emerald}
            />
          )}

          {summary.pendingThisCycle.length > 0 && (
            <SurahStatusSection
              title="Pending Revision ⏳"
              surahs={summary.pendingThisCycle}
              isExpanded={expandedPending}
              onToggle={() => setExpandedPending((v) => !v)}
              sectionColor={COLORS.clay}
            />
          )}

          {/* Surahs Not Revised in a While - iOS SurahsNotRevisedInAWhileSection */}
          <SurahsNotRevisedSection surahs={summary.surahsNotRevisedInAWhile} />

          {/* Today's Suggested Revision - iOS TodaysSuggestedRevisionSection */}
          <TodaysSuggestedSection suggestions={summary.todaysSuggestions} />
        </>
      )}

      {cycleFilter === 'previous' && (
        <PreviousCycleDashboard cycles={summary.previousCycles} />
      )}

      {cycleFilter === 'all' && <AllTimeDashboard stats={summary.allTimeStats} />}
    </Screen>
  );
}

function CountdownTimer({ daysRemaining }: { daysRemaining: number }) {
  const isUrgent = daysRemaining <= 3;
  return (
    <View style={[styles.countdownCircle, isUrgent && styles.countdownCircleUrgent]}>
      <Text style={[styles.countdownValue, isUrgent && styles.countdownValueUrgent]}>
        {daysRemaining}
      </Text>
      <Text style={styles.countdownLabel}>
        {daysRemaining === 1 ? 'day left' : 'days left'}
      </Text>
    </View>
  );
}

function StatusCard({
  title,
  count,
  color,
  icon,
}: {
  title: string;
  count: number;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.statusCard, { borderColor: `${color}4D`, backgroundColor: `${color}1A` }]}>
      <Text style={[styles.statusCardIcon, { color }]}>{icon}</Text>
      <Text style={[styles.statusCardCount, { color }]}>{count}</Text>
      <Text style={styles.statusCardTitle}>{title}</Text>
    </View>
  );
}

function SurahStatusSection({
  title,
  surahs,
  isExpanded,
  onToggle,
  sectionColor,
}: {
  title: string;
  surahs: SurahRevisionStatus[];
  isExpanded: boolean;
  onToggle: () => void;
  sectionColor: string;
}) {
  return (
    <View style={[styles.surahSection, { borderColor: `${sectionColor}26` }]}>
      <Pressable onPress={onToggle} style={styles.surahSectionHeader}>
        <View style={[styles.surahSectionBar, { backgroundColor: sectionColor }]} />
        <View style={styles.surahSectionHeaderText}>
          <Text style={styles.surahSectionTitle}>{title}</Text>
          <Text style={[styles.surahSectionSubtitle, { color: sectionColor }]}>
            {surahs.length} {surahs.length === 1 ? 'surah' : 'surahs'}
          </Text>
        </View>
        <View style={[styles.surahSectionBadge, { backgroundColor: sectionColor }]}>
          <Text style={styles.surahSectionBadgeText}>{surahs.length}</Text>
        </View>
        <Text style={styles.surahSectionChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </Pressable>
      {isExpanded && (
        <View style={styles.surahSectionContent}>
          {surahs.map((s) => (
            <SurahStatusRow key={s.id} status={s} />
          ))}
        </View>
      )}
    </View>
  );
}

function SurahStatusRow({ status }: { status: SurahRevisionStatus }) {
  const statusText =
    status.status === 'completed'
      ? 'Completed'
      : status.status === 'pending'
        ? 'Pending'
        : 'Overdue';
  const statusColor =
    status.status === 'completed' ? COLORS.emerald : status.status === 'pending' ? COLORS.clay : COLORS.clay;
  return (
    <View style={styles.surahRow}>
      <View style={[styles.surahRowDot, { backgroundColor: statusColor }]} />
      <View style={styles.surahRowCopy}>
        <Text style={styles.surahRowTitle} numberOfLines={1}>
          {status.surah.name}
        </Text>
        <Text style={styles.surahRowSubtitle}>Juz {status.juzNumber}</Text>
      </View>
      <View style={styles.surahRowMeta}>
        <View style={[styles.surahRowBadge, { backgroundColor: `${statusColor}26` }]}>
          <Text style={[styles.surahRowBadgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
        {status.status === 'completed' && status.lastRevisedDate && (
          <Text style={styles.surahRowDate}>
            {new Date(status.lastRevisedDate).toLocaleDateString()}
          </Text>
        )}
        {status.status === 'overdue' && status.daysOverdue > 0 && (
          <Text style={styles.surahRowOverdue}>{status.daysOverdue} days overdue</Text>
        )}
      </View>
    </View>
  );
}

function SurahsNotRevisedSection({ surahs }: { surahs: SurahNotRevisedInfo[] }) {
  if (surahs.length === 0) {
    return (
      <SectionCard eyebrow="Attention" title="Surahs You Haven't Revised in a While">
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>✓</Text>
          <Text style={styles.emptyStateTitle}>Great job!</Text>
          <Text style={styles.emptyStateSubtitle}>
            All your memorized surahs have been revised within the cycle period.
          </Text>
        </View>
      </SectionCard>
    );
  }

  return (
    <SectionCard eyebrow="Attention" title="Surahs You Haven't Revised in a While">
      <Text style={styles.sectionHint}>These surahs need attention</Text>
      {surahs.map((s, i) => (
        <View key={s.id} style={styles.notRevisedRow}>
          <View style={[styles.notRevisedRank, { backgroundColor: rankColor(i + 1) }]}>
            <Text style={styles.notRevisedRankText}>{i + 1}</Text>
          </View>
          <View style={styles.notRevisedCopy}>
            <Text style={styles.notRevisedTitle}>{s.surah.name}</Text>
            <Text style={styles.notRevisedSubtitle}>Juz {s.juzNumber}</Text>
          </View>
          <View style={styles.notRevisedMeta}>
            {s.lastRevisedDate ? (
              <>
                <Text style={styles.notRevisedDays}>{s.daysSinceRevision} days ago</Text>
                <Text style={styles.notRevisedDate}>
                  {new Date(s.lastRevisedDate).toLocaleDateString()}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.notRevisedNever}>Never revised</Text>
                <Text style={styles.notRevisedDate}>No revision date</Text>
              </>
            )}
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

function rankColor(rank: number): string {
  switch (rank) {
    case 1:
      return COLORS.clay;
    case 2:
      return COLORS.clay;
    case 3:
      return COLORS.gold;
    default:
      return COLORS.muted;
  }
}

function TodaysSuggestedSection({ suggestions }: { suggestions: SurahSuggestion[] }) {
  if (suggestions.length === 0) {
    return (
      <SectionCard eyebrow="Today" title="Today's Suggested Revision">
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>✓</Text>
          <Text style={styles.emptyStateTitle}>All caught up!</Text>
          <Text style={styles.emptyStateSubtitle}>
            You're on track with your revision cycle. Check back tomorrow for new suggestions.
          </Text>
        </View>
      </SectionCard>
    );
  }

  return (
    <SectionCard eyebrow="Today" title="Today's Suggested Revision">
      <Text style={styles.sectionHint}>Stay on track with your cycle deadline</Text>
      {suggestions.map((s) => (
        <View key={s.id} style={styles.suggestionRow}>
          <View style={styles.suggestionCopy}>
            <Text style={styles.suggestionTitle}>{s.surah.englishName}</Text>
            <Text style={styles.suggestionSubtitle}>Juz {s.juzNumber}</Text>
            <Text style={styles.suggestionReason}>{s.reason}</Text>
          </View>
          <View style={[styles.suggestionBadge, { backgroundColor: priorityBg(s.priority) }]}>
            <Text style={[styles.suggestionBadgeText, { color: priorityColor(s.priority) }]}>
              {s.priority}
            </Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

function priorityBg(p: string): string {
  return p === 'high' ? `${COLORS.clay}1A` : p === 'medium' ? `${COLORS.gold}1A` : `${COLORS.muted}1A`;
}

function priorityColor(p: string): string {
  return p === 'high' ? COLORS.clay : p === 'medium' ? COLORS.gold : COLORS.muted;
}

function PreviousCycleDashboard({ cycles }: { cycles: RevisionCycle[] }) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (cycles.length === 0) {
    return (
      <SectionCard eyebrow="Previous" title="Previous Cycles">
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🕐</Text>
          <Text style={styles.emptyStateTitle}>No Previous Cycles Yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Complete your first revision cycle to see previous cycle analytics here.
          </Text>
        </View>
      </SectionCard>
    );
  }

  const mostRecent = cycles[0];
  return (
    <>
      <View style={styles.previousHeader}>
        <View>
          <Text style={styles.cycleEyebrow}>Previous Cycle</Text>
          <Text style={styles.cycleTitle}>Cycle #{mostRecent.cycleNumber}</Text>
        </View>
        <View style={styles.completionBadge}>
          <Text style={styles.completionBadgePct}>
            {Math.round(mostRecent.completionPercentage * 100)}%
          </Text>
          <Text style={styles.completionBadgeCount}>
            {mostRecent.completedSurahs}/{mostRecent.totalSurahs}
          </Text>
        </View>
      </View>
      <View style={styles.previousDates}>
        <View>
          <Text style={styles.cycleDateLabel}>Started</Text>
          <Text style={styles.cycleDateValue}>{formatDate(mostRecent.startDate)}</Text>
        </View>
        <View style={styles.cycleDateRight}>
          <Text style={styles.cycleDateLabel}>Ended</Text>
          <Text style={styles.cycleDateValue}>{formatDate(mostRecent.endDate)}</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <StatusCard
          title="Completed"
          count={mostRecent.completedSurahs}
          color={COLORS.emerald}
          icon="✓"
        />
        <StatusCard
          title="Overdue"
          count={mostRecent.totalSurahs - mostRecent.completedSurahs}
          color={COLORS.clay}
          icon="!"
        />
      </View>
    </>
  );
}

function AllTimeDashboard({
  stats,
}: {
  stats: {
    totalCycles: number;
    totalDaysActive: number;
    averageCompletionRate: number;
    bestCompletionStreak: number;
  };
}) {
  return (
    <View style={styles.allTimeGrid}>
      <Text style={styles.allTimeTitle}>All Time Statistics</Text>
      <View style={styles.allTimeRow}>
        <StatCard
          title="Total Cycles"
          value={String(stats.totalCycles)}
          subtitle="Since start"
          color={COLORS.forest}
          icon="↻"
        />
        <StatCard
          title="Avg Completion"
          value={`${Math.round(stats.averageCompletionRate * 100)}%`}
          subtitle="Per cycle"
          color={COLORS.emerald}
          icon="%"
        />
      </View>
      <View style={styles.allTimeRow}>
        <StatCard
          title="Days Active"
          value={String(stats.totalDaysActive)}
          subtitle="Since first memorization"
          color={COLORS.clay}
          icon="📅"
        />
        <StatCard
          title="Best Streak"
          value={String(stats.bestCompletionStreak)}
          subtitle="Days or cycles"
          color={COLORS.gold}
          icon="🔥"
        />
      </View>
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}4D`, backgroundColor: `${color}1A` }]}>
      <Text style={[styles.statCardIcon, { color }]}>{icon}</Text>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cycleHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cycleHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cycleEyebrow: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  cycleTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 22,
    fontWeight: '800',
  },
  countdownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(35,70,50,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  countdownCircleUrgent: {
    backgroundColor: 'rgba(197,98,66,0.15)',
  },
  countdownValue: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 28,
    fontWeight: '800',
  },
  countdownValueUrgent: {
    color: COLORS.clay,
  },
  countdownLabel: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
  },
  progressRing: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressRingTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressRingFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.forest,
  },
  progressRingCenter: {
    alignItems: 'center',
    gap: 2,
  },
  progressRingValue: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
  },
  progressRingLabel: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  progressRingPct: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '700',
  },
  cycleDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleDateRight: {
    alignItems: 'flex-end',
  },
  cycleDateLabel: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
  },
  cycleDateValue: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  filterPicker: {
    flexDirection: 'row',
    backgroundColor: COLORS.sand,
    borderRadius: 10,
    padding: 4,
  },
  filterOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterOptionActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterOptionText: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: COLORS.ink,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statusCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusCardIcon: {
    fontSize: 20,
  },
  statusCardCount: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 22,
    fontWeight: '800',
  },
  statusCardTitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  surahSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  surahSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  surahSectionBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  surahSectionHeaderText: {
    flex: 1,
    gap: 2,
  },
  surahSectionTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
  },
  surahSectionSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '500',
  },
  surahSectionBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahSectionBadgeText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '700',
  },
  surahSectionChevron: {
    color: COLORS.muted,
    fontSize: 12,
  },
  surahSectionContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  surahRowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  surahRowCopy: {
    flex: 1,
    gap: 4,
  },
  surahRowTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '500',
  },
  surahRowSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
  },
  surahRowMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  surahRowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  surahRowBadgeText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 10,
    fontWeight: '600',
  },
  surahRowDate: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 10,
  },
  surahRowOverdue: {
    color: COLORS.clay,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 10,
    fontWeight: '600',
  },
  sectionHint: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    textAlign: 'center',
  },
  notRevisedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  notRevisedRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notRevisedRankText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '700',
  },
  notRevisedCopy: {
    flex: 1,
    gap: 4,
  },
  notRevisedTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '500',
  },
  notRevisedSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  notRevisedMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  notRevisedDays: {
    color: COLORS.clay,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '600',
  },
  notRevisedDate: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
  },
  notRevisedNever: {
    color: COLORS.clay,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  suggestionCopy: {
    flex: 1,
    gap: 4,
  },
  suggestionTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  suggestionReason: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
    fontStyle: 'italic',
  },
  suggestionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  suggestionBadgeText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  previousHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  previousDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  completionBadge: {
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
    backgroundColor: 'rgba(47,109,79,0.1)',
    borderRadius: 999,
  },
  completionBadgePct: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '800',
  },
  completionBadgeCount: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  allTimeGrid: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  allTimeTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '700',
  },
  allTimeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statCardIcon: {
    fontSize: 20,
  },
  statCardValue: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
  },
  statCardTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '600',
  },
  statCardSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
  },
});
