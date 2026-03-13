import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type { TrackedSurah } from '@/types/domain';

type JuzGroup = {
  juzNumber: number;
  trackedCount: number;
  relaxCount: number;
  needsRevisionCount: number;
  surahs: TrackedSurah[];
};

type JuzDisclosureSectionProps = {
  title: string;
  subtitle: string;
  juzs: JuzGroup[];
  tint: string;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkRevised: (occurrenceId: string) => void;
};

export function JuzDisclosureSection({
  title,
  subtitle,
  juzs,
  tint,
  isExpanded,
  onToggle,
  onMarkRevised,
}: JuzDisclosureSectionProps) {
  return (
    <View style={styles.section}>
      <Pressable onPress={onToggle} style={styles.header}>
        <View style={[styles.dot, { backgroundColor: tint }]} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        <Text style={[styles.count, { color: tint }]}>{juzs.length}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.muted}
        />
      </Pressable>
      {isExpanded && (
        <View style={styles.content}>
          {juzs.map((juz) => (
            <View key={juz.juzNumber} style={styles.juzCard}>
              <View style={styles.juzHeader}>
                <View style={styles.juzCopy}>
                  <Text style={styles.juzTitle}>Juz {juz.juzNumber}</Text>
                  <Text style={styles.juzSubtitle}>{juz.trackedCount} tracked surahs</Text>
                </View>
                <Text style={styles.juzMeta}>{juz.needsRevisionCount} due</Text>
              </View>
              <View style={styles.juzBadges}>
                <Text style={styles.badgeRelax}>Relax {juz.relaxCount}</Text>
                <Text style={styles.badgeNeeds}>Need Revision {juz.needsRevisionCount}</Text>
              </View>
              {juz.surahs.slice(0, 5).map((s) => (
                <View key={s.id} style={styles.surahRow}>
                  <Text style={styles.surahName}>{s.englishName}</Text>
                  <AppButton
                    label="Mark revised"
                    onPress={() => onMarkRevised(s.id)}
                    style={styles.reviseBtn}
                  />
                </View>
              ))}
              {juz.surahs.length > 5 && (
                <Text style={styles.moreHint}>+{juz.surahs.length - 5} more</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  headerTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    color: COLORS.muted,
  },
  count: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    gap: 12,
  },
  juzCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    gap: 12,
  },
  juzHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  juzCopy: {
    flex: 1,
    gap: 4,
  },
  juzTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '800',
  },
  juzSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
  },
  juzMeta: {
    color: COLORS.status.red,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '700',
  },
  juzBadges: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  badgeRelax: {
    color: COLORS.status.green,
    backgroundColor: `${COLORS.status.green}1A`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeNeeds: {
    color: COLORS.status.red,
    backgroundColor: `${COLORS.status.red}1A`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '700',
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  surahName: {
    flex: 1,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  reviseBtn: {
    minWidth: 100,
  },
  moreHint: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
  },
});
