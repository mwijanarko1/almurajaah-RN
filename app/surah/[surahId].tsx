import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { getAllSurahOccurrences } from '@/lib/services/quranData';
import { useAppStore } from '@/store/app';

export default function SurahDetailScreen() {
  const params = useLocalSearchParams<{ surahId: string }>();
  const occurrences = React.useMemo(
    () => getAllSurahOccurrences().filter((occurrence) => occurrence.surahNumber === Number(params.surahId)),
    [params.surahId]
  );
  const toggleOccurrenceMemorized = useAppStore((state) => state.toggleOccurrenceMemorized);

  if (occurrences.length === 0) {
    return null;
  }

  const base = occurrences[0];

  return (
    <Screen subtitle={`${base.englishNameTranslation} • ${base.revelationType}`} title={base.englishName}>
      <SectionCard eyebrow="Arabic" title={base.name}>
        <Text style={styles.meta}>
          {base.numberOfAyahs} ayahs • starts on page {base.pageNumbers[0]}
        </Text>
      </SectionCard>

      <SectionCard eyebrow="Tracked portions" title="Juz breakdown">
        {occurrences.map((occurrence) => (
          <View key={occurrence.id} style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.title}>Juz {occurrence.juzNumber}</Text>
              <Text style={styles.subtitle}>
                Verses {occurrence.startVerse} - {occurrence.endVerse} • {occurrence.pages.toFixed(1)} pages
              </Text>
            </View>
            <View style={styles.actions}>
              <AppButton
                label="Track"
                onPress={() => void toggleOccurrenceMemorized(occurrence.id)}
                variant="secondary"
              />
              <AppButton
                label="Reader"
                onPress={() => router.push(`/reader/${occurrence.pageNumbers[0]}?highlight=${occurrence.surahNumber}:${occurrence.startVerse}`)}
              />
            </View>
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
  },
  row: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  copy: {
    gap: 4,
  },
  title: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
