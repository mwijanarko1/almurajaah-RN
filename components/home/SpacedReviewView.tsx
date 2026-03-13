import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type { TrackedSurah } from '@/types/domain';

type SpacedReviewRating = 'again' | 'hard' | 'medium' | 'easy';

type SpacedReviewViewProps = {
  surahs: TrackedSurah[];
  onRate: (surahId: string, rating: SpacedReviewRating) => void;
};

export function SpacedReviewView({ surahs, onRate }: SpacedReviewViewProps) {
  const sortedSurahs = React.useMemo(
    () =>
      [...surahs].sort((a, b) => {
        if (a.surahNumber === b.surahNumber) {
          return a.juzNumber - b.juzNumber;
        }
        return a.surahNumber - b.surahNumber;
      }),
    [surahs]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  const selectedSurah = sortedSurahs[selectedIndex];
  const remainingCount = sortedSurahs.length - selectedIndex;

  const handleRate = (rating: SpacedReviewRating) => {
    if (!selectedSurah) return;
    onRate(selectedSurah.id, rating);
    setIsFlipped(false);
    if (selectedIndex < sortedSurahs.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  if (sortedSurahs.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="checkmark-circle" size={60} color="#19a620" />
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>No surahs need review at this time</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Surah Picker */}
      <Pressable style={styles.picker}>
        <Text style={styles.pickerText}>Select Surah</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.white} />
      </Pressable>

      {/* Progress */}
      <Text style={styles.remaining}>{remainingCount} surahs remaining</Text>

      {/* Card */}
      <View style={styles.cardContainer}>
        {!isFlipped ? (
          <Pressable style={styles.cardFront} onPress={() => setIsFlipped(true)}>
            <Text style={styles.cardName}>{selectedSurah?.englishName}</Text>
            <Text style={styles.cardSubtitle}>
              Juz {selectedSurah?.juzNumber} • {selectedSurah?.pages.toFixed(1)} pages
            </Text>
          </Pressable>
        ) : (
          <Pressable style={styles.cardBack} onPress={() => setIsFlipped(false)}>
            <Text style={styles.rateTitle}>Rate your revision</Text>
            <View style={styles.ratingGrid}>
              <RatingButton
                color="#a61f1f"
                daysText="Now"
                onPress={() => handleRate('again')}
                title="Again"
              />
              <RatingButton
                color="#e87a09"
                daysText={getDaysText('hard', selectedSurah)}
                onPress={() => handleRate('hard')}
                title="Hard"
              />
              <RatingButton
                color="#f5c82f"
                daysText={getDaysText('medium', selectedSurah)}
                onPress={() => handleRate('medium')}
                title="Medium"
              />
              <RatingButton
                color="#19a620"
                daysText={getDaysText('easy', selectedSurah)}
                onPress={() => handleRate('easy')}
                title="Easy"
              />
            </View>
          </Pressable>
        )}
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {isFlipped ? 'Tap card to return' : 'Tap card to rate'}
      </Text>
    </View>
  );
}

function RatingButton({
  title,
  daysText,
  color,
  onPress,
}: {
  title: string;
  daysText: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.ratingButton, { borderColor: `${color}66` }]}>
      <Text style={[styles.ratingTitle, { color }]}>{title}</Text>
      <Text style={[styles.ratingDays, { color }]}>{daysText}</Text>
    </Pressable>
  );
}

function getDaysText(rating: SpacedReviewRating, surah?: TrackedSurah): string {
  if (!surah) return '';
  const cycleDays = 7; // Default cycle days from juz
  const daysMap: Record<SpacedReviewRating, number> = {
    again: 0,
    hard: Math.round(cycleDays * 0.67),
    medium: cycleDays,
    easy: Math.round(cycleDays * 1.33),
  };
  const days = daysMap[rating];
  return days === 0 ? 'Now' : `${days}d`;
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 8,
  },
  empty: {
    alignItems: 'center',
    gap: 16,
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    color: COLORS.muted,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.forest,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: SPACING.lg,
  },
  pickerText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
  remaining: {
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    color: COLORS.muted,
  },
  cardContainer: {
    height: 220,
    marginHorizontal: SPACING.lg,
  },
  cardFront: {
    flex: 1,
    backgroundColor: '#19a620',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBack: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#19a620',
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardName: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  rateTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    backgroundColor: `${COLORS.sand}80`,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  ratingButton: {
    width: '47%',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ratingTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingDays: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
  },
  instruction: {
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    color: COLORS.muted,
  },
});
