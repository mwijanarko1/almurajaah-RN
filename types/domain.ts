export type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';
export type RevisionStatus = 'not-memorized' | 'needs-revision' | 'relax';
export type PageCounterMode = 'shared' | 'separate';
export type AppearanceMode = 'system' | 'light' | 'dark';
export type ReaderMode = 'mushaf' | 'translation';
export type ReaderWordTextType = 'arabic' | 'translation';
export type QuizQuestionType = 'ayah-count' | 'juz-match' | 'opening-page';

export interface SurahPart {
  id: string;
  surahId: number;
  juzNumber: number;
  name: string;
  pages: number;
  verses: number;
  order: number;
  lastRevisedDate?: string | null;
  revisionCount: number;
  isFullyMemorized: boolean;
}

export interface JuzState {
  id: number;
  isMemorized: boolean;
  lastRevisedDate?: string | null;
  difficulty: Difficulty;
  revisionCycleDays: number;
  memorizedSurahs: number[];
  surahLastRevisedDates: Record<number, string>;
  surahRevisionCounts: Record<number, number>;
  surahCurrentStreaks: Record<number, number>;
  surahBestStreaks: Record<number, number>;
  surahParts: Record<string, SurahPart>;
  surahPartLastRevisedDates: Record<string, string>;
  surahPartRevisionCounts: Record<string, number>;
  surahPartCurrentStreaks: Record<string, number>;
  surahPartBestStreaks: Record<string, number>;
}

export interface SurahOccurrence {
  id: string;
  surahNumber: number;
  juzNumber: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  startVerse: number;
  endVerse: number;
  numberOfAyahs: number;
  pages: number;
  pageNumbers: number[];
}

export interface TrackedSurah extends SurahOccurrence {
  difficulty: Difficulty;
  isMemorized: boolean;
  revisionCount: number;
  lastRevisedDate?: string | null;
  daysSinceLastRevision: number;
  dueScore: number;
  status: RevisionStatus;
  parts: SurahPart[];
}

export interface WirdProfile {
  id: string;
  name: string;
  isDefault: boolean;
  createdDate: string;
  lastUsedDate: string;
  juzList: JuzState[];
  todayPages: number;
  allTimePages: number;
  lastPageResetDate?: string | null;
  lastAppOpenDate?: string | null;
  globalRevisionCycleDays: number;
  selectedJuzIds: number[];
  selectedSurahIds: number[];
  cycleDays: number;
}

export interface RevisionEvent {
  id: string;
  profileId: string;
  juzId: number;
  surahId: number;
  partId?: string | null;
  pages: number;
  createdAt: string;
}

export interface NotificationTime {
  hour: number;
  minute: number;
  isEnabled: boolean;
}

export interface NotificationPreferences {
  notificationsEnabled: boolean;
  morning: NotificationTime;
  evening: NotificationTime;
}

export interface ReaderPreferences {
  mode: ReaderMode;
  arabicFontSize: number;
  translationFontSize: number;
  selectedFontKey: string;
  selectedTranslationIds: string[];
  twoPagesEnabled: boolean;
  verticalScrollingEnabled: boolean;
  wordPointerEnabled: boolean;
  wordPointerTextType: ReaderWordTextType;
  audioEndRange: 'selection' | 'page';
  lastPage?: number | null;
}

export interface ReaderBookmark {
  pageNumber: number;
  createdAt: string;
}

export interface ReaderHighlight {
  referenceKey: string;
  surahNumber: number;
  verseNumber: number;
  colorHex: string;
  createdAt: string;
}

export interface ReaderNote {
  referenceKey: string;
  references: string[];
  text: string;
  createdAt: string;
}

export interface ReaderVerse {
  referenceKey: string;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  translationText: string;
  pageNumber: number;
  juzNumber: number;
  surahName: string;
  englishSurahName: string;
}

export interface ReaderPageContext {
  pageNumber: number;
  juzNumber: number;
  surahNames: string[];
  verses: ReaderVerse[];
}

export interface ReaderAyahGeometry {
  pageNumber: number;
  referenceKey: string;
  surahNumber: number;
  verseNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TranslationSource {
  id: string;
  displayName: string;
  language: string;
  isBundled: boolean;
}

export interface QuizStats {
  highScore: number;
  sessionsPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  answer: string;
  options: string[];
  meta: {
    surahNumber: number;
    juzNumber: number;
  };
}

export interface AppSettings {
  hasCompletedOnboarding: boolean;
  userName: string;
  activeProfileId: string | null;
  pageCounterMode: PageCounterMode;
  appearanceMode: AppearanceMode;
  notifications: NotificationPreferences;
}

export interface AppSnapshot {
  settings: AppSettings;
  profiles: WirdProfile[];
  revisionEvents: RevisionEvent[];
  readerPreferences: ReaderPreferences;
  readerBookmarks: ReaderBookmark[];
  readerHighlights: ReaderHighlight[];
  readerNotes: ReaderNote[];
  quizStats: QuizStats;
}

export interface HomeSummary {
  greetingName: string;
  activeProfileName: string;
  memorizedSurahCount: number;
  memorizedJuzCount: number;
  needRevisionSurahCount: number;
  currentStreak: number;
  bestStreak: number;
  todayPages: number;
  allTimePages: number;
}

export interface RevisionCycle {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  totalSurahs: number;
  completedSurahs: number;
  daysRemaining: number;
  completionPercentage: number;
}

export interface SurahRevisionStatus {
  id: string;
  surah: SurahOccurrence;
  juzNumber: number;
  status: 'completed' | 'pending' | 'overdue';
  lastRevisedDate: string | null;
  daysOverdue: number;
}

export interface SurahNotRevisedInfo {
  id: string;
  surah: SurahOccurrence;
  juzNumber: number;
  lastRevisedDate: string | null;
  daysSinceRevision: number;
}

export interface SurahSuggestion {
  id: string;
  surah: SurahOccurrence;
  juzNumber: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProgressSummary {
  cycleNumber: number;
  cycleDays: number;
  completedSurahs: number;
  totalMemorizedSurahs: number;
  completionRatio: number;
  daysRemaining: number;
  cycleStartDate: string;
  cycleEndDate: string;
  dueToday: TrackedSurah[];
  previousDue: TrackedSurah[];
  completedThisCycle: SurahRevisionStatus[];
  pendingThisCycle: SurahRevisionStatus[];
  surahsNotRevisedInAWhile: SurahNotRevisedInfo[];
  todaysSuggestions: SurahSuggestion[];
  previousCycles: RevisionCycle[];
  allTimeStats: {
    totalCycles: number;
    totalDaysActive: number;
    averageCompletionRate: number;
    bestCompletionStreak: number;
  };
}

export interface RevisionRepository {
  getRevisionEvents(): Promise<RevisionEvent[]>;
  addRevisionEvent(event: RevisionEvent): Promise<void>;
}

export interface ProfileRepository {
  getProfiles(): Promise<WirdProfile[]>;
  saveProfile(profile: WirdProfile): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}

export interface ReaderRepository {
  getReaderPreferences(): Promise<ReaderPreferences>;
  saveReaderPreferences(preferences: ReaderPreferences): Promise<void>;
  getBookmarks(): Promise<ReaderBookmark[]>;
  toggleBookmark(pageNumber: number): Promise<ReaderBookmark[]>;
  getHighlights(): Promise<ReaderHighlight[]>;
  saveHighlight(highlight: ReaderHighlight): Promise<ReaderHighlight[]>;
  removeHighlight(referenceKey: string): Promise<ReaderHighlight[]>;
  getNotes(): Promise<ReaderNote[]>;
  saveNote(note: ReaderNote): Promise<ReaderNote[]>;
  deleteNote(referenceKey: string): Promise<ReaderNote[]>;
  getAyahGeometries(pageNumber: number): Promise<ReaderAyahGeometry[]>;
}

export interface QuranRepository {
  getSurahOccurrences(): SurahOccurrence[];
  getSurahOccurrencesByJuz(juzNumber: number): SurahOccurrence[];
  getPageContext(pageNumber: number, translationIds: string[]): ReaderPageContext;
  getStartPageForSurah(surahNumber: number): number;
  getPageForVerse(surahNumber: number, verseNumber: number): number;
  searchVerses(query: string): ReaderVerse[];
}

export interface QuizRepository {
  getQuizStats(): Promise<QuizStats>;
  saveQuizStats(stats: QuizStats): Promise<void>;
}

export interface NotificationScheduler {
  scheduleNotifications(summary: {
    todayPages: number;
    dueCount: number;
    preferences: NotificationPreferences;
  }): Promise<void>;
}
