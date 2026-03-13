import React from 'react';
import { create } from 'zustand';

import {
  addRevisionEvent,
  deleteNote as deleteReaderNote,
  deleteProfile as removeProfileRecord,
  getAppDatabase,
  loadAyahGeometries,
  loadBookmarks,
  loadHighlights,
  loadNotes,
  loadProfiles,
  loadQuizStats,
  loadReaderPreferences,
  loadRevisionEvents,
  loadSettings,
  removeHighlight,
  saveHighlight,
  saveNote as persistReaderNote,
  saveProfile,
  saveQuizStats,
  saveReaderPreferences,
  saveSettings,
  toggleBookmark,
} from '@/lib/db/client';
import {
  buildHomeSummary,
  buildProgressSummary,
  buildQuizQuestion,
  createSurahParts,
  getFilteredTrackedSurahs,
  markSurahAsRevised,
  markSurahPartAsRevised,
  rateSurahDifficulty,
  setAllMemorization,
  toggleJuzMemorized,
  toggleSurahMemorized,
  type HomeFilter,
} from '@/lib/services/revision';
import {
  buildProfileFromSelection,
  createDefaultProfile,
  getAllSurahOccurrences,
  getReaderPageContext,
  getSurahOccurrencesByJuz,
  getStartPageForSurah,
  getSurahOccurrenceById,
  getTranslationSources,
  searchReaderVerses,
} from '@/lib/services/quranData';
import type {
  AppSettings,
  HomeSummary,
  ProgressSummary,
  QuizQuestion,
  QuizStats,
  ReaderAyahGeometry,
  ReaderHighlight,
  ReaderNote,
  ReaderPreferences,
  RevisionEvent,
  TrackedSurah,
  WirdProfile,
} from '@/types/domain';

type AppStatus = 'idle' | 'booting' | 'ready' | 'error';

type ReaderSelection = {
  pageNumber: number;
  highlightedReferenceKey?: string | null;
};

type AppState = {
  status: AppStatus;
  errorMessage: string | null;
  settings: AppSettings | null;
  profiles: WirdProfile[];
  revisionEvents: RevisionEvent[];
  readerPreferences: ReaderPreferences | null;
  readerBookmarks: number[];
  readerHighlights: ReaderHighlight[];
  readerNotes: ReaderNote[];
  quizStats: QuizStats | null;
  activeQuizQuestion: QuizQuestion | null;
  homeFilter: HomeFilter;
  selectedReader: ReaderSelection | null;
  initialize: () => Promise<void>;
  setHomeFilter: (filter: HomeFilter) => void;
  completeOnboarding: (payload: { userName: string; memorizedSurahIds: number[]; revisionCycleDays?: number }) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  setAppearanceMode: (mode: AppSettings['appearanceMode']) => Promise<void>;
  setPageCounterMode: (mode: AppSettings['pageCounterMode']) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationPeriodEnabled: (period: 'morning' | 'evening', enabled: boolean) => Promise<void>;
  setNotificationTime: (
    period: 'morning' | 'evening',
    patch: Partial<AppSettings['notifications']['morning']>
  ) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  createProfile: (name: string) => Promise<void>;
  renameProfile: (profileId: string, name: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  toggleOccurrenceMemorized: (occurrenceId: string) => Promise<void>;
  toggleJuzSelection: (juzNumber: number) => Promise<void>;
  setAllJuzSelection: (selectAll: boolean) => Promise<void>;
  setGlobalRevisionCycleDays: (days: number) => Promise<void>;
  markOccurrenceRevised: (occurrenceId: string) => Promise<void>;
  markJuzRevised: (juzNumber: number) => Promise<void>;
  rateJuzDifficulty: (juzNumber: number, difficulty: TrackedSurah['difficulty']) => Promise<void>;
  splitOccurrenceIntoParts: (occurrenceId: string, partCount: number) => Promise<void>;
  markPartRevised: (juzNumber: number, partId: string) => Promise<void>;
  updateReaderPreferences: (patch: Partial<ReaderPreferences>) => Promise<void>;
  toggleReaderBookmark: (pageNumber: number) => Promise<void>;
  saveReaderHighlight: (highlight: ReaderHighlight) => Promise<void>;
  removeReaderHighlight: (referenceKey: string) => Promise<void>;
  saveReaderNote: (note: ReaderNote) => Promise<void>;
  deleteReaderNote: (referenceKey: string) => Promise<void>;
  setReaderPage: (pageNumber: number, highlightedReferenceKey?: string | null) => void;
  buildNextQuizQuestion: () => void;
  submitQuizAnswer: (answer: string) => Promise<boolean>;
};

export const useAppStore = create<AppState>((set, get) => ({
  status: 'idle',
  errorMessage: null,
  settings: null,
  profiles: [],
  revisionEvents: [],
  readerPreferences: null,
  readerBookmarks: [],
  readerHighlights: [],
  readerNotes: [],
  quizStats: null,
  activeQuizQuestion: null,
  homeFilter: 'all',
  selectedReader: null,
  initialize: async () => {
    if (get().status === 'ready' || get().status === 'booting') {
      return;
    }

    set({ status: 'booting', errorMessage: null });

    try {
      const database = await getAppDatabase();
      let profiles = await loadProfiles(database);
      const settings = await loadSettings(database);
      const revisionEvents = await loadRevisionEvents(database);
      const readerPreferences = await loadReaderPreferences(database);
      const readerBookmarks = (await loadBookmarks(database)).map((item) => item.pageNumber);
      const readerHighlights = await loadHighlights(database);
      const readerNotes = await loadNotes(database);
      const quizStats = await loadQuizStats(database);
      await loadAyahGeometries(1);

      if (profiles.length === 0) {
        const defaultProfile = createDefaultProfile('Revision');
        profiles = [defaultProfile];
        await saveProfile(database, defaultProfile);

        await saveSettings(database, {
          ...settings,
          activeProfileId: defaultProfile.id,
        });
      }

      const activeProfileId = settings.activeProfileId ?? profiles[0]?.id ?? null;

      set({
        status: 'ready',
        settings: {
          ...settings,
          activeProfileId,
        },
        profiles,
        revisionEvents,
        readerPreferences,
        readerBookmarks,
        readerHighlights,
        readerNotes,
        quizStats,
        selectedReader: {
          pageNumber: readerPreferences.lastPage ?? 1,
          highlightedReferenceKey: null,
        },
      });
    } catch (error) {
      set({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to initialize the app.',
      });
    }
  },
  setHomeFilter: (filter) => set({ homeFilter: filter }),
  resetOnboarding: async () => {
    const database = await getAppDatabase();
    const nextSettings = {
      ...ensureSettings(get()),
      hasCompletedOnboarding: false,
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  completeOnboarding: async ({ userName, memorizedSurahIds, revisionCycleDays }) => {
    const database = await getAppDatabase();
    const profile = buildProfileFromSelection('Revision', memorizedSurahIds);
    // Set revision cycle days if provided
    if (revisionCycleDays && revisionCycleDays > 0) {
      profile.globalRevisionCycleDays = revisionCycleDays;
    }
    const nextSettings = ensureSettings(get());
    const nextProfiles = [profile];

    await saveProfile(database, profile);
    await saveSettings(database, {
      ...nextSettings,
      hasCompletedOnboarding: true,
      userName,
      activeProfileId: profile.id,
    });

    set({
      profiles: nextProfiles,
      settings: {
        ...nextSettings,
        hasCompletedOnboarding: true,
        userName,
        activeProfileId: profile.id,
      },
    });
  },
  setAppearanceMode: async (mode) => {
    const database = await getAppDatabase();
    const nextSettings = {
      ...ensureSettings(get()),
      appearanceMode: mode,
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  setPageCounterMode: async (mode) => {
    const database = await getAppDatabase();
    const nextSettings = {
      ...ensureSettings(get()),
      pageCounterMode: mode,
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  setUserName: async (name) => {
    const database = await getAppDatabase();
    const nextSettings = {
      ...ensureSettings(get()),
      userName: name,
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  setNotificationsEnabled: async (enabled) => {
    const database = await getAppDatabase();
    const nextSettings = {
      ...ensureSettings(get()),
      notifications: {
        ...ensureSettings(get()).notifications,
        notificationsEnabled: enabled,
      },
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  setNotificationPeriodEnabled: async (period, enabled) => {
    const database = await getAppDatabase();
    const base = ensureSettings(get()).notifications;
    const nextSettings = {
      ...ensureSettings(get()),
      notifications: {
        ...base,
        [period]: { ...base[period], isEnabled: enabled },
      },
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  setNotificationTime: async (period, patch) => {
    const database = await getAppDatabase();
    const baseSettings = ensureSettings(get());
    const nextSettings = {
      ...baseSettings,
      notifications: {
        ...baseSettings.notifications,
        [period]: {
          ...baseSettings.notifications[period],
          ...patch,
        },
      },
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  switchProfile: async (profileId) => {
    const database = await getAppDatabase();
    const nextSettings = {
      ...ensureSettings(get()),
      activeProfileId: profileId,
    };
    await saveSettings(database, nextSettings);
    set({ settings: nextSettings });
  },
  createProfile: async (name) => {
    const database = await getAppDatabase();
    const profile = createDefaultProfile(name);
    await saveProfile(database, profile);
    const nextProfiles = [profile, ...get().profiles];
    const nextSettings = {
      ...ensureSettings(get()),
      activeProfileId: profile.id,
    };
    await saveSettings(database, nextSettings);
    set({
      profiles: nextProfiles,
      settings: nextSettings,
    });
  },
  renameProfile: async (profileId, name) => {
    const database = await getAppDatabase();
    const nextProfiles = get().profiles.map((profile) =>
      profile.id === profileId
        ? {
            ...profile,
            name,
            lastUsedDate: new Date().toISOString(),
          }
        : profile
    );

    const updatedProfile = nextProfiles.find((profile) => profile.id === profileId);
    if (updatedProfile) {
      await saveProfile(database, updatedProfile);
    }
    set({ profiles: nextProfiles });
  },
  deleteProfile: async (profileId) => {
    const database = await getAppDatabase();
    const currentProfiles = get().profiles;
    const nextProfiles = currentProfiles.filter((profile) => profile.id !== profileId);
    if (nextProfiles.length === 0) {
      return;
    }

    await removeProfileRecord(database, profileId);
    const currentSettings = ensureSettings(get());
    const nextSettings = {
      ...currentSettings,
      activeProfileId:
        currentSettings.activeProfileId === profileId ? nextProfiles[0].id : currentSettings.activeProfileId,
    };
    await saveSettings(database, nextSettings);
    set({
      profiles: nextProfiles,
      settings: nextSettings,
      revisionEvents: get().revisionEvents.filter((event) => event.profileId !== profileId),
    });
  },
  toggleOccurrenceMemorized: async (occurrenceId) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const occurrence = getSurahOccurrenceById(occurrenceId);
    if (!occurrence) {
      return;
    }

    const updatedProfile = toggleSurahMemorized(activeProfile, occurrence);
    await saveProfile(database, updatedProfile);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
    });
  },
  toggleJuzSelection: async (juzNumber) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const updatedProfile = toggleJuzMemorized(activeProfile, juzNumber);
    await saveProfile(database, updatedProfile);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
    });
  },
  setAllJuzSelection: async (selectAll) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const updatedProfile = setAllMemorization(activeProfile, selectAll);
    await saveProfile(database, updatedProfile);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
    });
  },
  setGlobalRevisionCycleDays: async (days) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const updatedProfile = {
      ...activeProfile,
      globalRevisionCycleDays: days,
    };
    await saveProfile(database, updatedProfile);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
    });
  },
  markOccurrenceRevised: async (occurrenceId) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const occurrence = getSurahOccurrenceById(occurrenceId);
    if (!occurrence) {
      return;
    }

    const { profile: updatedProfile, event } = markSurahAsRevised(activeProfile, occurrence);
    await saveProfile(database, updatedProfile);
    await addRevisionEvent(database, event);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
      revisionEvents: [event, ...get().revisionEvents],
    });
  },
  markJuzRevised: async (juzNumber) => {
    const activeProfile = ensureActiveProfile(get());
    const juz = activeProfile.juzList.find((j) => j.id === juzNumber);
    if (!juz) return;

    const occurrences = getSurahOccurrencesByJuz(juzNumber).filter((o) =>
      juz.memorizedSurahs.includes(o.surahNumber)
    );
    for (const occurrence of occurrences) {
      await get().markOccurrenceRevised(occurrence.id);
    }
  },
  rateJuzDifficulty: async (juzNumber, difficulty) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const updatedProfile = rateSurahDifficulty(activeProfile, juzNumber, difficulty);
    await saveProfile(database, updatedProfile);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
    });
  },
  splitOccurrenceIntoParts: async (occurrenceId, partCount) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const occurrence = getSurahOccurrenceById(occurrenceId);
    if (!occurrence) {
      return;
    }

    const updatedProfile = createSurahParts(activeProfile, occurrence, partCount);
    await saveProfile(database, updatedProfile);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
    });
  },
  markPartRevised: async (juzNumber, partId) => {
    const database = await getAppDatabase();
    const activeProfile = ensureActiveProfile(get());
    const { profile: updatedProfile, event } = markSurahPartAsRevised(activeProfile, juzNumber, partId);
    await saveProfile(database, updatedProfile);
    await addRevisionEvent(database, event);
    set({
      profiles: replaceProfile(get().profiles, updatedProfile),
      revisionEvents: [event, ...get().revisionEvents],
    });
  },
  updateReaderPreferences: async (patch) => {
    const database = await getAppDatabase();
    const current = ensureReaderPreferences(get());
    const nextPreferences = {
      ...current,
      ...patch,
    };
    await saveReaderPreferences(database, nextPreferences);
    set({
      readerPreferences: nextPreferences,
      selectedReader: get().selectedReader
        ? {
            ...get().selectedReader,
            pageNumber: patch.lastPage ?? get().selectedReader?.pageNumber ?? 1,
          }
        : {
            pageNumber: patch.lastPage ?? 1,
            highlightedReferenceKey: null,
          },
    });
  },
  toggleReaderBookmark: async (pageNumber) => {
    const database = await getAppDatabase();
    const bookmarks = await toggleBookmark(database, pageNumber);
    set({
      readerBookmarks: bookmarks.map((item) => item.pageNumber),
    });
  },
  saveReaderHighlight: async (highlight) => {
    const database = await getAppDatabase();
    const highlights = await saveHighlight(database, highlight);
    set({ readerHighlights: highlights });
  },
  removeReaderHighlight: async (referenceKey) => {
    const database = await getAppDatabase();
    const highlights = await removeHighlight(database, referenceKey);
    set({ readerHighlights: highlights });
  },
  saveReaderNote: async (note) => {
    const database = await getAppDatabase();
    const notes = await persistReaderNote(database, note);
    set({ readerNotes: notes });
  },
  deleteReaderNote: async (referenceKey) => {
    const database = await getAppDatabase();
    const notes = await deleteReaderNote(database, referenceKey);
    set({ readerNotes: notes });
  },
  setReaderPage: (pageNumber, highlightedReferenceKey = null) => {
    set({
      selectedReader: {
        pageNumber,
        highlightedReferenceKey,
      },
    });

    void get().updateReaderPreferences({ lastPage: pageNumber });
  },
  buildNextQuizQuestion: () => {
    const profile = ensureActiveProfile(get());
    const question = buildQuizQuestion(profile);
    set({ activeQuizQuestion: question });
  },
  submitQuizAnswer: async (answer) => {
    const database = await getAppDatabase();
    const question = get().activeQuizQuestion;
    const currentStats = get().quizStats;
    if (!question || !currentStats) {
      return false;
    }

    const isCorrect = answer === question.answer;
    const nextStats = {
      ...currentStats,
      sessionsPlayed: currentStats.sessionsPlayed + 1,
      correctAnswers: currentStats.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: currentStats.wrongAnswers + (isCorrect ? 0 : 1),
      highScore: isCorrect ? Math.max(currentStats.highScore, currentStats.correctAnswers + 1) : currentStats.highScore,
    };

    await saveQuizStats(database, nextStats);
    set({ quizStats: nextStats });
    get().buildNextQuizQuestion();
    return isCorrect;
  },
}));

export function useActiveProfile(): WirdProfile | null {
  const settings = useAppStore((state) => state.settings);
  const profiles = useAppStore((state) => state.profiles);
  return React.useMemo(
    () => profiles.find((profile) => profile.id === settings?.activeProfileId) ?? profiles[0] ?? null,
    [profiles, settings?.activeProfileId]
  );
}

export function useHomeSummary(): HomeSummary | null {
  const settings = useAppStore((state) => state.settings);
  const profiles = useAppStore((state) => state.profiles);
  const revisionEvents = useAppStore((state) => state.revisionEvents);

  return React.useMemo(() => {
    const activeProfile = profiles.find((profile) => profile.id === settings?.activeProfileId) ?? profiles[0];
    if (!settings || !activeProfile) {
      return null;
    }

    return buildHomeSummary(
      profiles,
      activeProfile,
      settings.userName,
      settings.pageCounterMode,
      revisionEvents
    );
  }, [profiles, revisionEvents, settings]);
}

export function useProgressSummary(): ProgressSummary | null {
  const settings = useAppStore((state) => state.settings);
  const profiles = useAppStore((state) => state.profiles);
  const revisionEvents = useAppStore((state) => state.revisionEvents);

  return React.useMemo(() => {
    const activeProfile = profiles.find((profile) => profile.id === settings?.activeProfileId) ?? profiles[0];
    if (!settings || !activeProfile) {
      return null;
    }

    return buildProgressSummary(profiles, activeProfile, settings.pageCounterMode, revisionEvents);
  }, [profiles, revisionEvents, settings]);
}

export function useTrackedSurahs(): TrackedSurah[] {
  const settings = useAppStore((state) => state.settings);
  const profiles = useAppStore((state) => state.profiles);
  const homeFilter = useAppStore((state) => state.homeFilter);

  return React.useMemo(() => {
    const activeProfile = profiles.find((profile) => profile.id === settings?.activeProfileId) ?? profiles[0];
    if (!activeProfile) {
      return [];
    }

    return getFilteredTrackedSurahs(activeProfile, homeFilter);
  }, [homeFilter, profiles, settings?.activeProfileId]);
}

export function useReaderData(pageNumber: number): {
  context: ReturnType<typeof getReaderPageContext>;
  geometries: ReaderAyahGeometry[];
} {
  const preferences = useAppStore((state) => state.readerPreferences);
  const [context, setContext] = React.useState(() =>
    getReaderPageContext(pageNumber, preferences?.selectedTranslationIds ?? ['en-saheeh'])
  );
  const [geometries, setGeometries] = React.useState<ReaderAyahGeometry[]>([]);

  React.useEffect(() => {
    setContext(getReaderPageContext(pageNumber, preferences?.selectedTranslationIds ?? ['en-saheeh']));
    let cancelled = false;

    void loadAyahGeometries(pageNumber).then((nextGeometries) => {
      if (!cancelled) {
        setGeometries(nextGeometries);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pageNumber, preferences?.selectedTranslationIds]);

  return { context, geometries };
}

export function useReaderSearchResults(query: string) {
  return React.useMemo(() => searchReaderVerses(query), [query]);
}

export function useAllSurahOccurrences() {
  return React.useMemo(() => getAllSurahOccurrences(), []);
}

export function useTranslationSources() {
  return React.useMemo(() => getTranslationSources(), []);
}

export function getCurrentReaderPage(): number {
  return useAppStore.getState().selectedReader?.pageNumber ?? useAppStore.getState().readerPreferences?.lastPage ?? 1;
}

export function getReaderStartPageForSurah(surahNumber: number): number {
  return getStartPageForSurah(surahNumber);
}

function replaceProfile(profiles: WirdProfile[], updatedProfile: WirdProfile): WirdProfile[] {
  return profiles.map((profile) => (profile.id === updatedProfile.id ? updatedProfile : profile));
}

function ensureSettings(state: AppState): AppSettings {
  if (!state.settings) {
    throw new Error('App settings are not loaded yet.');
  }

  return state.settings;
}

function ensureActiveProfile(state: AppState): WirdProfile {
  const activeProfile =
    state.profiles.find((profile) => profile.id === state.settings?.activeProfileId) ?? state.profiles[0];

  if (!activeProfile) {
    throw new Error('No active profile is available.');
  }

  return activeProfile;
}

function ensureReaderPreferences(state: AppState): ReaderPreferences {
  if (!state.readerPreferences) {
    throw new Error('Reader preferences are not loaded yet.');
  }

  return state.readerPreferences;
}
