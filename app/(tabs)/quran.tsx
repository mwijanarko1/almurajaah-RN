import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { SectionCard } from '@/components/ui/SectionCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useAllSurahOccurrences, useReaderSearchResults } from '@/store/app';

export default function QuranScreen() {
  const [query, setQuery] = React.useState('');
  const occurrences = useAllSurahOccurrences();
  const results = useReaderSearchResults(query);

  const uniqueSurahs = React.useMemo(() => {
    const seen = new Set<number>();
    return occurrences.filter((occurrence) => {
      if (seen.has(occurrence.surahNumber)) {
        return false;
      }
      seen.add(occurrence.surahNumber);
      return true;
    });
  }, [occurrences]);

  return (
    <Screen subtitle="Browse surahs, jump into the bundled mushaf, or search verses offline." title="Quran">
      <SectionCard eyebrow="Search" title="Offline verse content">
        <TextInput
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Search Arabic, translation, or 2:255"
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
          value={query}
        />
        {query.trim().length > 0
          ? results.slice(0, 25).map((verse) => (
              <Pressable
                key={`${verse.referenceKey}-${verse.pageNumber}`}
                onPress={() => router.push(`/reader/${verse.pageNumber}?highlight=${verse.referenceKey}`)}
                style={styles.resultRow}
              >
                <Text style={styles.resultTitle}>{verse.referenceKey}</Text>
                <Text numberOfLines={2} style={styles.resultBody}>
                  {verse.translationText}
                </Text>
              </Pressable>
            ))
          : null}
      </SectionCard>

      <SectionCard eyebrow="Browse" title="Surah library">
        {uniqueSurahs.slice(0, 40).map((surah) => (
          <Pressable
            key={surah.surahNumber}
            onPress={() => router.push(`/surah/${surah.surahNumber}`)}
            style={styles.surahRow}
          >
            <View style={styles.surahCopy}>
              <Text style={styles.surahTitle}>{surah.englishName}</Text>
              <Text style={styles.surahSubtitle}>{surah.name}</Text>
            </View>
            <Text style={styles.surahMeta}>Page {surah.pageNumbers[0]}</Text>
          </Pressable>
        ))}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
  },
  resultRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    gap: 6,
  },
  resultTitle: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '700',
  },
  resultBody: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    lineHeight: 20,
  },
  surahRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    gap: 12,
  },
  surahCopy: {
    flex: 1,
    gap: 4,
  },
  surahTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '800',
  },
  surahSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.quran,
    fontSize: 20,
  },
  surahMeta: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '700',
  },
});
