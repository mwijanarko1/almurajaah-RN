import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type { TrackedSurah } from '@/types/domain';

type FilteredSurahGridViewProps = {
  surahs: TrackedSurah[];
  onMarkRevised: (occurrenceId: string) => void;
  onSplitOccurrence: (occurrenceId: string, partCount: number) => void;
};

const CARD_GAP = 12;
const PADDING = 20;

export function FilteredSurahGridView({
  surahs,
  onMarkRevised,
  onSplitOccurrence,
}: FilteredSurahGridViewProps) {
  const { width } = Dimensions.get('window');
  const contentWidth = width - PADDING * 2 - 20; // 20 = horizontal padding from parent
  const cardWidth = (contentWidth - CARD_GAP) / 2;

  if (surahs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No tracked surahs</Text>
        <Text style={styles.emptySubtitle}>
          Add memorized surahs in Settings to see them here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {surahs.slice(0, 24).map((surah) => (
        <View key={surah.id} style={[styles.card, { width: cardWidth }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {surah.englishName}
              </Text>
              <Text style={styles.cardSubtitle}>
                Juz {surah.juzNumber} • {surah.pages.toFixed(1)} pages
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push(
                  `/reader/${surah.pageNumbers[0]}?highlight=${surah.surahNumber}:${surah.startVerse}`
                )
              }
              style={styles.openBtn}
            >
              <Text style={styles.openBtnText}>Open</Text>
            </Pressable>
          </View>
          <View style={styles.actions}>
            <AppButton
              label="Mark revised"
              onPress={() => onMarkRevised(surah.id)}
              style={styles.actionBtn}
            />
            {surah.parts.length === 0 && surah.pages >= 6 && (
              <AppButton
                label="Split in 2"
                onPress={() => onSplitOccurrence(surah.id, 2)}
                variant="secondary"
                style={styles.actionBtn}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cream,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  openBtn: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: COLORS.forest,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  openBtnText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
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
