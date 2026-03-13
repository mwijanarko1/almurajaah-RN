import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

import type {
  AppSettings,
  ReaderAyahGeometry,
  ReaderBookmark,
  ReaderHighlight,
  ReaderNote,
  ReaderPreferences,
  RevisionEvent,
  QuizStats,
  WirdProfile,
} from '@/types/domain';
import { getDefaultNotificationPreferences } from '@/lib/services/quranData';

const APP_DATABASE_NAME = 'almurajaah.db';
const GEOMETRY_DATABASE_NAME = 'ayahinfo_1920.db';

let appDatabasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let geometryDatabasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

type SettingKey = keyof AppSettings | 'readerPreferences' | 'quizStats';

export async function getAppDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!appDatabasePromise) {
    appDatabasePromise = initializeAppDatabase();
  }

  return appDatabasePromise;
}

export async function getGeometryDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!geometryDatabasePromise) {
    geometryDatabasePromise = initializeGeometryDatabase();
  }

  return geometryDatabasePromise;
}

async function initializeAppDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(APP_DATABASE_NAME);

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS revision_events (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      juz_id INTEGER NOT NULL,
      surah_id INTEGER NOT NULL,
      part_id TEXT,
      pages REAL NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reader_bookmarks (
      page_number INTEGER PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reader_highlights (
      reference_key TEXT PRIMARY KEY NOT NULL,
      surah_number INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      color_hex TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reader_notes (
      reference_key TEXT PRIMARY KEY NOT NULL,
      references_json TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const defaultSettings: AppSettings = {
    hasCompletedOnboarding: false,
    userName: '',
    activeProfileId: null,
    pageCounterMode: 'separate',
    appearanceMode: 'system',
    notifications: getDefaultNotificationPreferences(),
  };

  const defaultReaderPreferences: ReaderPreferences = {
    mode: 'mushaf',
    arabicFontSize: 30,
    translationFontSize: 18,
    selectedFontKey: 'KFGQPC Uthmanic Script HAFS Regular',
    selectedTranslationIds: ['en-saheeh'],
    twoPagesEnabled: true,
    verticalScrollingEnabled: false,
    wordPointerEnabled: false,
    wordPointerTextType: 'arabic',
    audioEndRange: 'selection',
    lastPage: 1,
  };

  const defaultQuizStats: QuizStats = {
    highScore: 0,
    sessionsPlayed: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  };

  await upsertSetting(database, 'hasCompletedOnboarding', JSON.stringify(defaultSettings.hasCompletedOnboarding), true);
  await upsertSetting(database, 'userName', JSON.stringify(defaultSettings.userName), true);
  await upsertSetting(database, 'activeProfileId', JSON.stringify(defaultSettings.activeProfileId), true);
  await upsertSetting(database, 'pageCounterMode', JSON.stringify(defaultSettings.pageCounterMode), true);
  await upsertSetting(database, 'appearanceMode', JSON.stringify(defaultSettings.appearanceMode), true);
  await upsertSetting(database, 'notifications', JSON.stringify(defaultSettings.notifications), true);
  await upsertSetting(database, 'readerPreferences', JSON.stringify(defaultReaderPreferences), true);
  await upsertSetting(database, 'quizStats', JSON.stringify(defaultQuizStats), true);

  return database;
}

async function initializeGeometryDatabase(): Promise<SQLite.SQLiteDatabase> {
  const sqliteDirectory = new Directory(Paths.document, 'reader-db');
  if (!sqliteDirectory.exists) {
    sqliteDirectory.create({ idempotent: true, intermediates: true });
  }

  const destination = new File(sqliteDirectory, GEOMETRY_DATABASE_NAME);
  if (!destination.exists) {
    const asset = Asset.fromModule(require('@/assets/quran/ayahinfo_1920.db'));
    await asset.downloadAsync();
    const source = new File(asset.localUri ?? asset.uri);
    source.copy(destination);
  }

  return SQLite.openDatabaseAsync(GEOMETRY_DATABASE_NAME, undefined, sqliteDirectory.uri);
}

export async function loadSettings(database: SQLite.SQLiteDatabase): Promise<AppSettings> {
  const rows = await database.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const values = Object.fromEntries(rows.map((row) => [row.key, JSON.parse(row.value)])) as Record<SettingKey, unknown>;

  return {
    hasCompletedOnboarding: Boolean(values.hasCompletedOnboarding),
    userName: String(values.userName ?? ''),
    activeProfileId: (values.activeProfileId as string | null) ?? null,
    pageCounterMode: (values.pageCounterMode as AppSettings['pageCounterMode']) ?? 'separate',
    appearanceMode: (values.appearanceMode as AppSettings['appearanceMode']) ?? 'system',
    notifications: (values.notifications as AppSettings['notifications']) ?? getDefaultNotificationPreferences(),
  };
}

export async function saveSettings(database: SQLite.SQLiteDatabase, settings: AppSettings): Promise<void> {
  await upsertSetting(database, 'hasCompletedOnboarding', JSON.stringify(settings.hasCompletedOnboarding));
  await upsertSetting(database, 'userName', JSON.stringify(settings.userName));
  await upsertSetting(database, 'activeProfileId', JSON.stringify(settings.activeProfileId));
  await upsertSetting(database, 'pageCounterMode', JSON.stringify(settings.pageCounterMode));
  await upsertSetting(database, 'appearanceMode', JSON.stringify(settings.appearanceMode));
  await upsertSetting(database, 'notifications', JSON.stringify(settings.notifications));
}

export async function loadReaderPreferences(database: SQLite.SQLiteDatabase): Promise<ReaderPreferences> {
  return loadSetting(database, 'readerPreferences');
}

export async function saveReaderPreferences(
  database: SQLite.SQLiteDatabase,
  preferences: ReaderPreferences
): Promise<void> {
  await upsertSetting(database, 'readerPreferences', JSON.stringify(preferences));
}

export async function loadQuizStats(database: SQLite.SQLiteDatabase): Promise<QuizStats> {
  return loadSetting(database, 'quizStats');
}

export async function saveQuizStats(database: SQLite.SQLiteDatabase, stats: QuizStats): Promise<void> {
  await upsertSetting(database, 'quizStats', JSON.stringify(stats));
}

export async function loadProfiles(database: SQLite.SQLiteDatabase): Promise<WirdProfile[]> {
  const rows = await database.getAllAsync<{ data: string }>('SELECT data FROM profiles ORDER BY updated_at DESC');
  return rows.map((row) => JSON.parse(row.data) as WirdProfile);
}

export async function saveProfile(database: SQLite.SQLiteDatabase, profile: WirdProfile): Promise<void> {
  await database.runAsync(
    `
      INSERT INTO profiles (id, name, is_default, updated_at, data)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        is_default = excluded.is_default,
        updated_at = excluded.updated_at,
        data = excluded.data
    `,
    profile.id,
    profile.name,
    profile.isDefault ? 1 : 0,
    new Date().toISOString(),
    JSON.stringify(profile)
  );
}

export async function deleteProfile(database: SQLite.SQLiteDatabase, profileId: string): Promise<void> {
  await database.runAsync('DELETE FROM profiles WHERE id = ?', profileId);
  await database.runAsync('DELETE FROM revision_events WHERE profile_id = ?', profileId);
}

export async function loadRevisionEvents(database: SQLite.SQLiteDatabase): Promise<RevisionEvent[]> {
  const rows = await database.getAllAsync<RevisionEvent>(
    `
      SELECT
        id as id,
        profile_id as profileId,
        juz_id as juzId,
        surah_id as surahId,
        part_id as partId,
        pages as pages,
        created_at as createdAt
      FROM revision_events
      ORDER BY created_at DESC
    `
  );

  return rows;
}

export async function addRevisionEvent(database: SQLite.SQLiteDatabase, event: RevisionEvent): Promise<void> {
  await database.runAsync(
    `
      INSERT OR REPLACE INTO revision_events (id, profile_id, juz_id, surah_id, part_id, pages, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    event.id,
    event.profileId,
    event.juzId,
    event.surahId,
    event.partId ?? null,
    event.pages,
    event.createdAt
  );
}

export async function loadBookmarks(database: SQLite.SQLiteDatabase): Promise<ReaderBookmark[]> {
  return database.getAllAsync<ReaderBookmark>(
    'SELECT page_number as pageNumber, created_at as createdAt FROM reader_bookmarks ORDER BY page_number ASC'
  );
}

export async function toggleBookmark(database: SQLite.SQLiteDatabase, pageNumber: number): Promise<ReaderBookmark[]> {
  const existing = await database.getFirstAsync<{ pageNumber: number }>(
    'SELECT page_number as pageNumber FROM reader_bookmarks WHERE page_number = ?',
    pageNumber
  );

  if (existing) {
    await database.runAsync('DELETE FROM reader_bookmarks WHERE page_number = ?', pageNumber);
  } else {
    await database.runAsync(
      'INSERT INTO reader_bookmarks (page_number, created_at) VALUES (?, ?)',
      pageNumber,
      new Date().toISOString()
    );
  }

  return loadBookmarks(database);
}

export async function loadHighlights(database: SQLite.SQLiteDatabase): Promise<ReaderHighlight[]> {
  return database.getAllAsync<ReaderHighlight>(
    `
      SELECT
        reference_key as referenceKey,
        surah_number as surahNumber,
        verse_number as verseNumber,
        color_hex as colorHex,
        created_at as createdAt
      FROM reader_highlights
      ORDER BY created_at DESC
    `
  );
}

export async function saveHighlight(
  database: SQLite.SQLiteDatabase,
  highlight: ReaderHighlight
): Promise<ReaderHighlight[]> {
  await database.runAsync(
    `
      INSERT INTO reader_highlights (reference_key, surah_number, verse_number, color_hex, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(reference_key) DO UPDATE SET
        surah_number = excluded.surah_number,
        verse_number = excluded.verse_number,
        color_hex = excluded.color_hex,
        created_at = excluded.created_at
    `,
    highlight.referenceKey,
    highlight.surahNumber,
    highlight.verseNumber,
    highlight.colorHex,
    highlight.createdAt
  );

  return loadHighlights(database);
}

export async function removeHighlight(
  database: SQLite.SQLiteDatabase,
  referenceKey: string
): Promise<ReaderHighlight[]> {
  await database.runAsync('DELETE FROM reader_highlights WHERE reference_key = ?', referenceKey);
  return loadHighlights(database);
}

export async function loadNotes(database: SQLite.SQLiteDatabase): Promise<ReaderNote[]> {
  const rows = await database.getAllAsync<{
    referenceKey: string;
    referencesJson: string;
    text: string;
    createdAt: string;
  }>(
    `
      SELECT
        reference_key as referenceKey,
        references_json as referencesJson,
        text as text,
        created_at as createdAt
      FROM reader_notes
      ORDER BY created_at DESC
    `
  );

  return rows.map((row) => ({
    referenceKey: row.referenceKey,
    references: JSON.parse(row.referencesJson) as string[],
    text: row.text,
    createdAt: row.createdAt,
  }));
}

export async function saveNote(database: SQLite.SQLiteDatabase, note: ReaderNote): Promise<ReaderNote[]> {
  await database.runAsync(
    `
      INSERT INTO reader_notes (reference_key, references_json, text, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(reference_key) DO UPDATE SET
        references_json = excluded.references_json,
        text = excluded.text,
        created_at = excluded.created_at
    `,
    note.referenceKey,
    JSON.stringify(note.references),
    note.text,
    note.createdAt
  );

  return loadNotes(database);
}

export async function deleteNote(database: SQLite.SQLiteDatabase, referenceKey: string): Promise<ReaderNote[]> {
  await database.runAsync('DELETE FROM reader_notes WHERE reference_key = ?', referenceKey);
  return loadNotes(database);
}

export async function loadAyahGeometries(
  pageNumber: number
): Promise<ReaderAyahGeometry[]> {
  try {
    const database = await getGeometryDatabase();
    const rows = await database.getAllAsync<{
      surahNumber: number;
      verseNumber: number;
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    }>(
      `
        SELECT
          sura_number as surahNumber,
          ayah_number as verseNumber,
          MIN(min_x) as minX,
          MAX(max_x) as maxX,
          MIN(min_y) as minY,
          MAX(max_y) as maxY
        FROM glyphs
        WHERE page_number = ?
        GROUP BY sura_number, ayah_number
        ORDER BY sura_number, ayah_number
      `,
      pageNumber
    );

    return rows.map((row) => ({
      pageNumber,
      referenceKey: `${row.surahNumber}:${row.verseNumber}`,
      surahNumber: row.surahNumber,
      verseNumber: row.verseNumber,
      x: row.minX / 1920,
      y: row.minY / 3070,
      width: (row.maxX - row.minX) / 1920,
      height: (row.maxY - row.minY) / 3070,
    }));
  } catch {
    return [];
  }
}

async function upsertSetting(
  database: SQLite.SQLiteDatabase,
  key: SettingKey,
  value: string,
  skipIfExists = false
): Promise<void> {
  if (skipIfExists) {
    const existing = await database.getFirstAsync<{ key: string }>('SELECT key FROM settings WHERE key = ?', key);
    if (existing) {
      return;
    }
  }

  await database.runAsync(
    `
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    key,
    value
  );
}

async function loadSetting<T>(database: SQLite.SQLiteDatabase, key: SettingKey): Promise<T> {
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  if (!row) {
    throw new Error(`Missing database setting for ${key}`);
  }

  return JSON.parse(row.value) as T;
}
