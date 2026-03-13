import type {
  Difficulty,
  HomeSummary,
  JuzState,
  PageCounterMode,
  ProgressSummary,
  QuizQuestion,
  QuizStats,
  RevisionCycle,
  RevisionEvent,
  RevisionStatus,
  SurahNotRevisedInfo,
  SurahOccurrence,
  SurahPart,
  SurahRevisionStatus,
  SurahSuggestion,
  TrackedSurah,
  WirdProfile,
} from '@/types/domain';
import { getSurahOccurrencesByJuz } from '@/lib/services/quranData';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.7,
  medium: 1,
  hard: 1.5,
  'very-hard': 2,
};

export type HomeFilter =
  | 'all'
  | 'needs-revision'
  | 'hardest-first'
  | 'easiest-first'
  | 'last-revised-oldest'
  | 'least-revised';

export function getTrackedSurahs(profile: WirdProfile): TrackedSurah[] {
  return profile.juzList.flatMap((juz) => {
    const occurrences = getSurahOccurrencesByJuz(juz.id);
    return occurrences.map((occurrence) => toTrackedSurah(occurrence, juz));
  });
}

export function getFilteredTrackedSurahs(profile: WirdProfile, filter: HomeFilter): TrackedSurah[] {
  const tracked = getTrackedSurahs(profile);

  switch (filter) {
    case 'needs-revision':
      return tracked.filter((item) => item.status === 'needs-revision' && item.isMemorized);
    case 'hardest-first':
      return tracked
        .filter((item) => item.isMemorized)
        .sort((left, right) => right.dueScore - left.dueScore);
    case 'easiest-first':
      return tracked
        .filter((item) => item.isMemorized)
        .sort((left, right) => left.dueScore - right.dueScore);
    case 'last-revised-oldest':
      return tracked
        .filter((item) => item.isMemorized)
        .sort((left, right) => {
          const leftTime = left.lastRevisedDate ? new Date(left.lastRevisedDate).getTime() : 0;
          const rightTime = right.lastRevisedDate ? new Date(right.lastRevisedDate).getTime() : 0;
          return leftTime - rightTime;
        });
    case 'least-revised':
      return tracked
        .filter((item) => item.isMemorized)
        .sort((left, right) => left.revisionCount - right.revisionCount);
    case 'all':
    default:
      return tracked;
  }
}

export function toTrackedSurah(occurrence: SurahOccurrence, juz: JuzState): TrackedSurah {
  const isMemorized = juz.memorizedSurahs.includes(occurrence.surahNumber);
  const lastRevisedDate = juz.surahLastRevisedDates[occurrence.surahNumber] ?? null;
  const revisionCount = juz.surahRevisionCounts[occurrence.surahNumber] ?? 0;
  const daysSinceLastRevision = lastRevisedDate
    ? diffInDays(lastRevisedDate, new Date().toISOString())
    : Number.MAX_SAFE_INTEGER;
  const difficulty = juz.difficulty;
  const dueScore =
    isMemorized && lastRevisedDate
      ? daysSinceLastRevision * DIFFICULTY_MULTIPLIER[difficulty]
      : isMemorized
        ? 999
        : 0;
  const status = computeRevisionStatus(isMemorized, lastRevisedDate, juz.revisionCycleDays);
  const parts = Object.values(juz.surahParts).filter((part) => part.surahId === occurrence.surahNumber);

  return {
    ...occurrence,
    difficulty,
    isMemorized,
    revisionCount,
    lastRevisedDate,
    daysSinceLastRevision,
    dueScore,
    status,
    parts,
  };
}

export function computeRevisionStatus(
  isMemorized: boolean,
  lastRevisedDate: string | null,
  cycleDays: number
): RevisionStatus {
  if (!isMemorized) {
    return 'not-memorized';
  }

  if (!lastRevisedDate) {
    return 'needs-revision';
  }

  return diffInDays(lastRevisedDate, new Date().toISOString()) >= cycleDays ? 'needs-revision' : 'relax';
}

export function markSurahAsRevised(
  profile: WirdProfile,
  occurrence: SurahOccurrence
): {
  profile: WirdProfile;
  event: RevisionEvent;
} {
  const nextProfile = cloneProfile(profile);
  const juz = nextProfile.juzList.find((item) => item.id === occurrence.juzNumber);

  if (!juz) {
    throw new Error('Juz not found for selected surah.');
  }

  const now = new Date().toISOString();
  const partEntries = Object.values(juz.surahParts).filter((part) => part.surahId === occurrence.surahNumber);
  const pages = partEntries.length > 0 ? sumPartPages(partEntries) : occurrence.pages;

  if (!juz.memorizedSurahs.includes(occurrence.surahNumber)) {
    juz.memorizedSurahs.push(occurrence.surahNumber);
  }

  juz.isMemorized = juz.memorizedSurahs.length > 0;
  juz.lastRevisedDate = now;
  juz.surahLastRevisedDates[occurrence.surahNumber] = now;
  juz.surahRevisionCounts[occurrence.surahNumber] = (juz.surahRevisionCounts[occurrence.surahNumber] ?? 0) + 1;
  updateStreaks(juz, occurrence.surahNumber, now);

  for (const part of partEntries) {
    juz.surahPartLastRevisedDates[part.id] = now;
    juz.surahPartRevisionCounts[part.id] = (juz.surahPartRevisionCounts[part.id] ?? 0) + 1;
    updatePartStreaks(juz, part.id, now);
  }

  nextProfile.todayPages += pages;
  nextProfile.allTimePages += pages;
  nextProfile.lastAppOpenDate = now;

  return {
    profile: nextProfile,
    event: {
      id: `event-${occurrence.id}-${now}`,
      profileId: nextProfile.id,
      juzId: occurrence.juzNumber,
      surahId: occurrence.surahNumber,
      partId: null,
      pages,
      createdAt: now,
    },
  };
}

export function markSurahPartAsRevised(
  profile: WirdProfile,
  juzNumber: number,
  partId: string
): {
  profile: WirdProfile;
  event: RevisionEvent;
} {
  const nextProfile = cloneProfile(profile);
  const juz = nextProfile.juzList.find((item) => item.id === juzNumber);
  const part = juz?.surahParts[partId];

  if (!juz || !part) {
    throw new Error('Surah part not found.');
  }

  const now = new Date().toISOString();

  if (!juz.memorizedSurahs.includes(part.surahId)) {
    juz.memorizedSurahs.push(part.surahId);
  }

  juz.isMemorized = true;
  juz.surahPartLastRevisedDates[part.id] = now;
  juz.surahPartRevisionCounts[part.id] = (juz.surahPartRevisionCounts[part.id] ?? 0) + 1;
  updatePartStreaks(juz, part.id, now);

  const allPartsForSurah = Object.values(juz.surahParts)
    .filter((item) => item.surahId === part.surahId)
    .sort((left, right) => left.order - right.order);

  const allPartsRevised = allPartsForSurah.every((item) => Boolean(juz.surahPartLastRevisedDates[item.id]));

  if (allPartsRevised) {
    juz.surahLastRevisedDates[part.surahId] = now;
    juz.surahRevisionCounts[part.surahId] = (juz.surahRevisionCounts[part.surahId] ?? 0) + 1;
    updateStreaks(juz, part.surahId, now);
  }

  nextProfile.todayPages += part.pages;
  nextProfile.allTimePages += part.pages;

  return {
    profile: nextProfile,
    event: {
      id: `event-part-${part.id}-${now}`,
      profileId: nextProfile.id,
      juzId: juzNumber,
      surahId: part.surahId,
      partId,
      pages: part.pages,
      createdAt: now,
    },
  };
}

export function rateSurahDifficulty(
  profile: WirdProfile,
  juzNumber: number,
  difficulty: Difficulty
): WirdProfile {
  const nextProfile = cloneProfile(profile);
  const juz = nextProfile.juzList.find((item) => item.id === juzNumber);

  if (!juz) {
    return nextProfile;
  }

  juz.difficulty = difficulty;
  juz.revisionCycleDays = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 7 : difficulty === 'hard' ? 4 : 3;
  return nextProfile;
}

export function toggleSurahMemorized(
  profile: WirdProfile,
  occurrence: SurahOccurrence
): WirdProfile {
  const nextProfile = cloneProfile(profile);
  const juz = nextProfile.juzList.find((item) => item.id === occurrence.juzNumber);

  if (!juz) {
    return nextProfile;
  }

  const isAlreadyMemorized = juz.memorizedSurahs.includes(occurrence.surahNumber);
  juz.memorizedSurahs = isAlreadyMemorized
    ? juz.memorizedSurahs.filter((item) => item !== occurrence.surahNumber)
    : [...juz.memorizedSurahs, occurrence.surahNumber];
  juz.isMemorized = juz.memorizedSurahs.length > 0;

  nextProfile.selectedSurahIds = Array.from(
    new Set(
      nextProfile.juzList.flatMap((item) => item.memorizedSurahs)
    )
  ).sort((left, right) => left - right);
  nextProfile.selectedJuzIds = nextProfile.juzList.filter((item) => item.isMemorized).map((item) => item.id);

  return nextProfile;
}

export function toggleJuzMemorized(profile: WirdProfile, juzNumber: number): WirdProfile {
  const nextProfile = cloneProfile(profile);
  const juz = nextProfile.juzList.find((item) => item.id === juzNumber);

  if (!juz) {
    return nextProfile;
  }

  const occurrences = getSurahOccurrencesByJuz(juzNumber);
  const nextValue = !juz.isMemorized;
  juz.isMemorized = nextValue;
  juz.memorizedSurahs = nextValue ? Array.from(new Set(occurrences.map((item) => item.surahNumber))) : [];

  nextProfile.selectedSurahIds = Array.from(new Set(nextProfile.juzList.flatMap((item) => item.memorizedSurahs))).sort(
    (left, right) => left - right
  );
  nextProfile.selectedJuzIds = nextProfile.juzList.filter((item) => item.isMemorized).map((item) => item.id);

  return nextProfile;
}

export function setAllMemorization(profile: WirdProfile, isMemorized: boolean): WirdProfile {
  const nextProfile = cloneProfile(profile);
  for (const juz of nextProfile.juzList) {
    juz.isMemorized = isMemorized;
    if (!isMemorized) {
      juz.memorizedSurahs = [];
    } else {
      const occurrences = getSurahOccurrencesByJuz(juz.id);
      juz.memorizedSurahs = Array.from(new Set(occurrences.map((item) => item.surahNumber)));
    }
  }
  nextProfile.selectedSurahIds = Array.from(
    new Set(nextProfile.juzList.flatMap((item) => item.memorizedSurahs))
  ).sort((left, right) => left - right);
  nextProfile.selectedJuzIds = nextProfile.juzList.filter((item) => item.isMemorized).map((item) => item.id);
  return nextProfile;
}

export function createSurahParts(
  profile: WirdProfile,
  occurrence: SurahOccurrence,
  partCount: number
): WirdProfile {
  const nextProfile = cloneProfile(profile);
  const juz = nextProfile.juzList.find((item) => item.id === occurrence.juzNumber);

  if (!juz || partCount < 2) {
    return nextProfile;
  }

  const averagePages = Math.max(1, Number((occurrence.pages / partCount).toFixed(1)));
  const averageVerses = Math.max(1, Math.floor((occurrence.endVerse - occurrence.startVerse + 1) / partCount));

  for (let index = 0; index < partCount; index += 1) {
    const id = `${occurrence.surahNumber}-${index + 1}`;
    juz.surahParts[id] = {
      id,
      surahId: occurrence.surahNumber,
      juzNumber: occurrence.juzNumber,
      name: `${occurrence.englishName} Part ${index + 1}`,
      pages: index === partCount - 1 ? Number((occurrence.pages - averagePages * index).toFixed(1)) : averagePages,
      verses: index === partCount - 1 ? Math.max(1, occurrence.endVerse - occurrence.startVerse + 1 - averageVerses * index) : averageVerses,
      order: index + 1,
      lastRevisedDate: null,
      revisionCount: 0,
      isFullyMemorized: index === partCount - 1,
    };
  }

  return nextProfile;
}

export function buildHomeSummary(
  profiles: WirdProfile[],
  activeProfile: WirdProfile,
  userName: string,
  pageCounterMode: PageCounterMode,
  revisionEvents: RevisionEvent[]
): HomeSummary {
  const tracked = getTrackedSurahs(activeProfile);
  const pages = getDisplayPageTotals(profiles, activeProfile, pageCounterMode);
  const streaks = getStreaks(revisionEvents, activeProfile.id, pageCounterMode);

  return {
    greetingName: userName.trim() || activeProfile.name,
    activeProfileName: activeProfile.name,
    memorizedSurahCount: tracked.filter((item) => item.isMemorized).length,
    memorizedJuzCount: activeProfile.juzList.filter((item) => item.isMemorized).length,
    needRevisionSurahCount: tracked.filter((item) => item.status === 'needs-revision' && item.isMemorized).length,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    todayPages: pages.todayPages,
    allTimePages: pages.allTimePages,
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function buildProgressSummary(
  profiles: WirdProfile[],
  activeProfile: WirdProfile,
  pageCounterMode: PageCounterMode,
  revisionEvents?: RevisionEvent[]
): ProgressSummary {
  const memorized = getTrackedSurahs(activeProfile).filter((item) => item.isMemorized);
  const createdAt = activeProfile.createdDate ?? new Date().toISOString();
  const cycleDays = Math.max(1, activeProfile.cycleDays || activeProfile.globalRevisionCycleDays || 7);
  const today = new Date().toISOString();
  const daysSinceStart = Math.max(0, diffInDays(createdAt, today));
  const cycleNumber = Math.max(1, Math.floor(daysSinceStart / cycleDays) + 1);
  const daysRemaining = Math.max(0, cycleDays - (daysSinceStart % cycleDays));
  const cycleStartDate = addDays(createdAt, (cycleNumber - 1) * cycleDays);
  const cycleEndDate = addDays(cycleStartDate, cycleDays);
  const cycleStartOnly = toDateOnly(cycleStartDate);
  const cycleEndOnly = toDateOnly(cycleEndDate);
  const todayOnly = toDateOnly(today);

  const dueToday = memorized
    .filter((item) => item.status === 'needs-revision')
    .sort((left, right) => right.dueScore - left.dueScore);
  const completed = memorized.length - dueToday.length;
  const completionRatio = memorized.length === 0 ? 0 : completed / memorized.length;
  const displayTotals = getDisplayPageTotals(profiles, activeProfile, pageCounterMode);

  const completedThisCycle: SurahRevisionStatus[] = [];
  const pendingThisCycle: SurahRevisionStatus[] = [];

  for (const item of memorized) {
    const lastRevised = item.lastRevisedDate ?? null;
    const revisedInCycle =
      lastRevised && toDateOnly(lastRevised) >= cycleStartOnly && toDateOnly(lastRevised) <= cycleEndOnly;
    const status: SurahRevisionStatus['status'] = revisedInCycle ? 'completed' : 'pending';
    const entry: SurahRevisionStatus = {
      id: `${item.id}-${item.juzNumber}`,
      surah: item,
      juzNumber: item.juzNumber,
      status,
      lastRevisedDate: lastRevised,
      daysOverdue: 0,
    };
    if (status === 'completed') {
      completedThisCycle.push(entry);
    } else {
      pendingThisCycle.push(entry);
    }
  }

  const surahsNotRevisedInAWhile: SurahNotRevisedInfo[] = memorized
    .map((item) => ({
      id: `nra-${item.id}-${item.juzNumber}`,
      surah: item,
      juzNumber: item.juzNumber,
      lastRevisedDate: item.lastRevisedDate ?? null,
      daysSinceRevision:
        item.lastRevisedDate === null
          ? Number.MAX_SAFE_INTEGER
          : diffInDays(item.lastRevisedDate, today),
    }))
    .sort((a, b) => b.daysSinceRevision - a.daysSinceRevision)
    .slice(0, 5);

  const todaysSuggestions: SurahSuggestion[] = dueToday.slice(0, 10).map((item, i) => ({
    id: `sug-${item.id}-${item.juzNumber}`,
    surah: item,
    juzNumber: item.juzNumber,
    reason:
      item.lastRevisedDate === null
        ? 'Never revised in current cycle'
        : `${item.daysSinceLastRevision} days since last revision`,
    priority: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
  }));

  const previousCycles: RevisionCycle[] = [];
  for (let c = 1; c < cycleNumber; c++) {
    const start = addDays(createdAt, (c - 1) * cycleDays);
    const end = addDays(start, cycleDays);
    if (toDateOnly(end) < todayOnly) {
      let completedInCycle = 0;
      for (const item of memorized) {
        const lr = item.lastRevisedDate;
        if (lr && toDateOnly(lr) >= toDateOnly(start) && toDateOnly(lr) <= toDateOnly(end)) {
          completedInCycle++;
        }
      }
      previousCycles.push({
        cycleNumber: c,
        startDate: start,
        endDate: end,
        totalSurahs: memorized.length,
        completedSurahs: completedInCycle,
        daysRemaining: 0,
        completionPercentage: memorized.length === 0 ? 0 : completedInCycle / memorized.length,
      });
    }
  }
  previousCycles.reverse();
  previousCycles.splice(10);

  const allTimeStats = computeAllTimeStats(
    activeProfile,
    revisionEvents ?? [],
    cycleDays,
    createdAt
  );

  return {
    cycleNumber,
    cycleDays,
    completedSurahs: completed,
    totalMemorizedSurahs: memorized.length,
    completionRatio,
    daysRemaining,
    cycleStartDate,
    cycleEndDate,
    dueToday: dueToday.slice(0, 10),
    previousDue: memorized
      .filter((item) => item.status === 'relax')
      .sort((left, right) => right.revisionCount - left.revisionCount)
      .slice(0, Math.max(4, Math.ceil(displayTotals.todayPages || 1))),
    completedThisCycle,
    pendingThisCycle,
    surahsNotRevisedInAWhile,
    todaysSuggestions,
    previousCycles,
    allTimeStats,
  };
}

function computeAllTimeStats(
  profile: WirdProfile,
  events: RevisionEvent[],
  cycleDays: number,
  firstDate: string
): ProgressSummary['allTimeStats'] {
  const today = new Date().toISOString();
  const totalDaysActive = Math.max(1, diffInDays(firstDate, today) + 1);
  const totalCycles = Math.max(1, Math.floor(totalDaysActive / cycleDays));
  const relevantEvents = events.filter((e) => e.profileId === profile.id);
  const uniqueDates = new Set(relevantEvents.map((e) => e.createdAt.slice(0, 10)));
  const streaks = getStreaks(events, profile.id, 'separate');
  const completionRates: number[] = [];
  for (let c = 1; c < totalCycles; c++) {
    const cycleStart = addDays(firstDate, (c - 1) * cycleDays);
    const cycleEnd = addDays(cycleStart, cycleDays);
    if (toDateOnly(cycleEnd) >= toDateOnly(today)) continue;
    const memorized = getTrackedSurahs(profile).filter((i) => i.isMemorized);
    let completed = 0;
    for (const item of memorized) {
      const lr = item.lastRevisedDate;
      if (lr && toDateOnly(lr) >= toDateOnly(cycleStart) && toDateOnly(lr) <= toDateOnly(cycleEnd)) {
        completed++;
      }
    }
    completionRates.push(memorized.length === 0 ? 0 : completed / memorized.length);
  }
  const averageCompletionRate =
    completionRates.length === 0 ? 0 : completionRates.reduce((a, b) => a + b, 0) / completionRates.length;

  return {
    totalCycles,
    totalDaysActive,
    averageCompletionRate,
    bestCompletionStreak: Math.max(streaks.best, 1),
  };
}

export function getDisplayPageTotals(
  profiles: WirdProfile[],
  activeProfile: WirdProfile,
  pageCounterMode: PageCounterMode
): { todayPages: number; allTimePages: number } {
  if (pageCounterMode === 'shared') {
    return profiles.reduce(
      (accumulator, profile) => {
        accumulator.todayPages += profile.todayPages;
        accumulator.allTimePages += profile.allTimePages;
        return accumulator;
      },
      { todayPages: 0, allTimePages: 0 }
    );
  }

  return {
    todayPages: activeProfile.todayPages,
    allTimePages: activeProfile.allTimePages,
  };
}

export function getStreaks(
  events: RevisionEvent[],
  activeProfileId: string,
  pageCounterMode: PageCounterMode
): { current: number; best: number } {
  const relevant = pageCounterMode === 'shared' ? events : events.filter((item) => item.profileId === activeProfileId);
  const byDate = Array.from(
    new Set(
      relevant
        .map((item) => item.createdAt.slice(0, 10))
        .sort((left, right) => (left > right ? 1 : -1))
    )
  );

  if (byDate.length === 0) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let streak = 1;

  for (let index = 1; index < byDate.length; index += 1) {
    const previous = new Date(byDate[index - 1]);
    const current = new Date(byDate[index]);
    const diff = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    streak = diff === 1 ? streak + 1 : 1;
    best = Math.max(best, streak);
  }

  let current = 1;
  const today = new Date();
  let cursor = new Date(byDate[byDate.length - 1]);
  const isEndingTodayOrYesterday =
    diffInDays(cursor.toISOString(), today.toISOString()) <= 1;

  if (!isEndingTodayOrYesterday) {
    current = 0;
  } else {
    for (let index = byDate.length - 2; index >= 0; index -= 1) {
      const previous = new Date(byDate[index]);
      const diff = Math.round((cursor.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        current += 1;
        cursor = previous;
      } else {
        break;
      }
    }
  }

  return { current, best };
}

export function buildQuizQuestion(profile: WirdProfile): QuizQuestion | null {
  const memorized = getTrackedSurahs(profile).filter((item) => item.isMemorized);

  if (memorized.length < 4) {
    return null;
  }

  const target = memorized[Math.floor(Math.random() * memorized.length)];
  const distractors = memorized
    .filter((item) => item.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const questionTypes: QuizQuestion['type'][] = ['ayah-count', 'juz-match', 'opening-page'];
  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  if (type === 'ayah-count') {
    const options = shuffleOptions([
      String(target.numberOfAyahs),
      ...distractors.map((item) => String(item.numberOfAyahs)),
    ]);

    return {
      id: `quiz-${target.id}-ayah-count`,
      type,
      prompt: `How many ayahs are in ${target.englishName}?`,
      answer: String(target.numberOfAyahs),
      options,
      meta: {
        surahNumber: target.surahNumber,
        juzNumber: target.juzNumber,
      },
    };
  }

  if (type === 'opening-page') {
    const options = shuffleOptions([
      String(target.pageNumbers[0]),
      ...distractors.map((item) => String(item.pageNumbers[0])),
    ]);

    return {
      id: `quiz-${target.id}-opening-page`,
      type,
      prompt: `What page does ${target.englishName} begin on in your mushaf reader?`,
      answer: String(target.pageNumbers[0]),
      options,
      meta: {
        surahNumber: target.surahNumber,
        juzNumber: target.juzNumber,
      },
    };
  }

  const options = shuffleOptions([String(target.juzNumber), ...distractors.map((item) => String(item.juzNumber))]);

  return {
    id: `quiz-${target.id}-juz-match`,
    type,
    prompt: `Which juz contains the tracked portion of ${target.englishName}?`,
    answer: String(target.juzNumber),
    options,
    meta: {
      surahNumber: target.surahNumber,
      juzNumber: target.juzNumber,
    },
  };
}

export function updateQuizStats(
  stats: QuizStats,
  isCorrect: boolean
): QuizStats {
  return {
    highScore: stats.highScore,
    sessionsPlayed: stats.sessionsPlayed,
    correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
    wrongAnswers: stats.wrongAnswers + (isCorrect ? 0 : 1),
  };
}

function updateStreaks(juz: JuzState, surahNumber: number, now: string): void {
  const previous = juz.surahLastRevisedDates[surahNumber];
  if (!previous) {
    juz.surahCurrentStreaks[surahNumber] = 1;
    juz.surahBestStreaks[surahNumber] = Math.max(1, juz.surahBestStreaks[surahNumber] ?? 0);
    return;
  }

  const diff = diffInDays(previous, now);
  const nextStreak = diff <= 1 ? (juz.surahCurrentStreaks[surahNumber] ?? 0) + 1 : 1;
  juz.surahCurrentStreaks[surahNumber] = nextStreak;
  juz.surahBestStreaks[surahNumber] = Math.max(juz.surahBestStreaks[surahNumber] ?? 0, nextStreak);
}

function updatePartStreaks(juz: JuzState, partId: string, now: string): void {
  const previous = juz.surahPartLastRevisedDates[partId];
  if (!previous) {
    juz.surahPartCurrentStreaks[partId] = 1;
    juz.surahPartBestStreaks[partId] = Math.max(1, juz.surahPartBestStreaks[partId] ?? 0);
    return;
  }

  const diff = diffInDays(previous, now);
  const nextStreak = diff <= 1 ? (juz.surahPartCurrentStreaks[partId] ?? 0) + 1 : 1;
  juz.surahPartCurrentStreaks[partId] = nextStreak;
  juz.surahPartBestStreaks[partId] = Math.max(juz.surahPartBestStreaks[partId] ?? 0, nextStreak);
}

function sumPartPages(parts: SurahPart[]): number {
  return Number(parts.reduce((accumulator, part) => accumulator + part.pages, 0).toFixed(1));
}

function shuffleOptions(options: string[]): string[] {
  return [...options].sort(() => Math.random() - 0.5);
}

function diffInDays(previousIso: string, nextIso: string): number {
  const previous = new Date(previousIso);
  const next = new Date(nextIso);
  return Math.floor((stripTime(next).getTime() - stripTime(previous).getTime()) / (1000 * 60 * 60 * 24));
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function cloneProfile(profile: WirdProfile): WirdProfile {
  return JSON.parse(JSON.stringify(profile)) as WirdProfile;
}
