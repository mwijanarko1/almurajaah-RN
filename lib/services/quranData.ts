import type {
  Difficulty,
  JuzState,
  NotificationPreferences,
  ReaderPageContext,
  ReaderVerse,
  SurahOccurrence,
  TranslationSource,
  WirdProfile,
} from '@/types/domain';

type RawVerse = {
  number: number;
  numberInSurah: number;
  arabicText: string;
  translation: string;
  indonesianTranslation: string;
  page: number;
  juz: number;
};

type RawSurah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  juzNumber: number;
  juzs: number[];
  pages: number[];
  verses: RawVerse[];
};

type QuranDataset = {
  metadata: {
    totalSurahs: number;
    totalPages: number;
  };
  surahs: RawSurah[];
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  notificationsEnabled: false,
  morning: { hour: 6, minute: 0, isEnabled: true },
  evening: { hour: 18, minute: 0, isEnabled: true },
};

const quranDataset = require('@/assets/quran/quran-complete.json') as QuranDataset;

const surahOccurrences = buildSurahOccurrences(quranDataset.surahs);
const occurrencesByJuz = new Map<number, SurahOccurrence[]>();
const pageContextMap = new Map<number, ReaderPageContext>();
const occurrenceById = new Map<string, SurahOccurrence>();

for (const occurrence of surahOccurrences) {
  occurrenceById.set(occurrence.id, occurrence);
  const current = occurrencesByJuz.get(occurrence.juzNumber) ?? [];
  current.push(occurrence);
  occurrencesByJuz.set(occurrence.juzNumber, current);
}

for (const surah of quranDataset.surahs) {
  for (const verse of surah.verses) {
    const referenceKey = `${surah.number}:${verse.numberInSurah}`;
    const page = pageContextMap.get(verse.page) ?? {
      pageNumber: verse.page,
      juzNumber: verse.juz,
      surahNames: [],
      verses: [],
    };

    if (!page.surahNames.includes(surah.englishName)) {
      page.surahNames.push(surah.englishName);
    }

    page.verses.push({
      referenceKey,
      surahNumber: surah.number,
      verseNumber: verse.numberInSurah,
      arabicText: verse.arabicText,
      translationText: verse.translation,
      pageNumber: verse.page,
      juzNumber: verse.juz,
      surahName: surah.name,
      englishSurahName: surah.englishName,
    });

    pageContextMap.set(verse.page, page);
  }
}

const translationSources: TranslationSource[] = [
  {
    id: 'en-saheeh',
    displayName: 'Saheeh International',
    language: 'English',
    isBundled: true,
  },
  {
    id: 'id-indonesian',
    displayName: 'Bahasa Indonesia',
    language: 'Indonesian',
    isBundled: true,
  },
];

export function getDefaultNotificationPreferences(): NotificationPreferences {
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export function getTranslationSources(): TranslationSource[] {
  return translationSources;
}

export function getAllSurahOccurrences(): SurahOccurrence[] {
  return surahOccurrences;
}

export function getSurahOccurrenceById(occurrenceId: string): SurahOccurrence | undefined {
  return occurrenceById.get(occurrenceId);
}

export function getSurahOccurrencesByJuz(juzNumber: number): SurahOccurrence[] {
  return occurrencesByJuz.get(juzNumber) ?? [];
}

export function getSurahOccurrencesBySurah(surahNumber: number): SurahOccurrence[] {
  return surahOccurrences.filter((occurrence) => occurrence.surahNumber === surahNumber);
}

export function getReaderPageContext(pageNumber: number, translationIds: string[]): ReaderPageContext {
  const context = pageContextMap.get(pageNumber);
  if (!context) {
    return {
      pageNumber,
      juzNumber: 1,
      surahNames: [],
      verses: [],
    };
  }

  if (translationIds.includes('id-indonesian')) {
    const localizedVerses = context.verses.map((verse) => {
      const rawSurah = quranDataset.surahs[verse.surahNumber - 1];
      const rawVerse = rawSurah?.verses.find((item) => item.numberInSurah === verse.verseNumber);
      return {
        ...verse,
        translationText: rawVerse?.indonesianTranslation ?? verse.translationText,
      };
    });

    return {
      ...context,
      verses: localizedVerses,
    };
  }

  return context;
}

export function searchReaderVerses(query: string): ReaderVerse[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return Array.from(pageContextMap.values())
    .flatMap((page) => page.verses)
    .filter((verse) => {
      return (
        verse.arabicText.includes(query) ||
        verse.translationText.toLowerCase().includes(normalized) ||
        verse.englishSurahName.toLowerCase().includes(normalized) ||
        verse.referenceKey.includes(normalized)
      );
    })
    .slice(0, 150);
}

export function getStartPageForSurah(surahNumber: number): number {
  return quranDataset.surahs[surahNumber - 1]?.pages[0] ?? 1;
}

export function getPageForVerse(surahNumber: number, verseNumber: number): number {
  const surah = quranDataset.surahs[surahNumber - 1];
  const verse = surah?.verses.find((item) => item.numberInSurah === verseNumber);
  return verse?.page ?? getStartPageForSurah(surahNumber);
}

export function getSurahName(surahNumber: number): string {
  return quranDataset.surahs[surahNumber - 1]?.englishName ?? `Surah ${surahNumber}`;
}

export function buildInitialJuzList(): JuzState[] {
  return Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    isMemorized: false,
    lastRevisedDate: null,
    difficulty: 'medium',
    revisionCycleDays: 7,
    memorizedSurahs: [],
    surahLastRevisedDates: {},
    surahRevisionCounts: {},
    surahCurrentStreaks: {},
    surahBestStreaks: {},
    surahParts: {},
    surahPartLastRevisedDates: {},
    surahPartRevisionCounts: {},
    surahPartCurrentStreaks: {},
    surahPartBestStreaks: {},
  }));
}

export function createDefaultProfile(name = 'Revision'): WirdProfile {
  const now = new Date().toISOString();

  return {
    id: `profile-${name.toLowerCase()}-${now}`,
    name,
    isDefault: true,
    createdDate: now,
    lastUsedDate: now,
    juzList: buildInitialJuzList(),
    todayPages: 0,
    allTimePages: 0,
    lastPageResetDate: now,
    lastAppOpenDate: now,
    globalRevisionCycleDays: 7,
    selectedJuzIds: Array.from({ length: 30 }, (_, index) => index + 1),
    selectedSurahIds: [],
    cycleDays: 7,
  };
}

export function buildProfileFromSelection(
  name: string,
  selectedSurahIds: number[],
  difficulty: Difficulty = 'medium'
): WirdProfile {
  const profile = createDefaultProfile(name);
  const selectedSet = new Set(selectedSurahIds);

  profile.juzList = profile.juzList.map((juz) => {
    const occurrences = getSurahOccurrencesByJuz(juz.id);
    const memorizedSurahs = Array.from(
      new Set(
        occurrences
          .filter((occurrence) => selectedSet.has(occurrence.surahNumber))
          .map((occurrence) => occurrence.surahNumber)
      )
    );

    return {
      ...juz,
      isMemorized: memorizedSurahs.length > 0,
      difficulty,
      memorizedSurahs,
    };
  });

  profile.selectedSurahIds = selectedSurahIds;
  profile.selectedJuzIds = profile.juzList.filter((item) => item.isMemorized).map((item) => item.id);

  return profile;
}

function buildSurahOccurrences(surahs: RawSurah[]): SurahOccurrence[] {
  const occurrences: SurahOccurrence[] = [];

  for (const surah of surahs) {
    const groupedByJuz = new Map<number, RawVerse[]>();

    for (const verse of surah.verses) {
      const current = groupedByJuz.get(verse.juz) ?? [];
      current.push(verse);
      groupedByJuz.set(verse.juz, current);
    }

    for (const [juzNumber, verses] of groupedByJuz.entries()) {
      const verseNumbers = verses.map((verse) => verse.numberInSurah).sort((left, right) => left - right);
      const pages = Array.from(new Set(verses.map((verse) => verse.page))).sort((left, right) => left - right);

      occurrences.push({
        id: `${surah.number}-${juzNumber}-${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`,
        surahNumber: surah.number,
        juzNumber,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        revelationType: surah.revelationType,
        startVerse: verseNumbers[0],
        endVerse: verseNumbers[verseNumbers.length - 1],
        numberOfAyahs: surah.numberOfAyahs,
        pages: pages.length,
        pageNumbers: pages,
      });
    }
  }

  return occurrences.sort((left, right) => {
    if (left.juzNumber !== right.juzNumber) {
      return left.juzNumber - right.juzNumber;
    }

    if (left.pageNumbers[0] !== right.pageNumbers[0]) {
      return left.pageNumbers[0] - right.pageNumbers[0];
    }

    return left.surahNumber - right.surahNumber;
  });
}
