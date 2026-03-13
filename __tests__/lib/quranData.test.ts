import { describe, expect, it } from '@jest/globals';

import {
  buildProfileFromSelection,
  getReaderPageContext,
  getStartPageForSurah,
  searchReaderVerses,
} from '@/lib/services/quranData';

describe('quranData', () => {
  it('builds a profile from memorized surah selections', () => {
    const profile = buildProfileFromSelection('Revision', [1, 2, 18]);

    expect(profile.selectedSurahIds).toEqual([1, 2, 18]);
    expect(profile.juzList[0].memorizedSurahs).toEqual(expect.arrayContaining([1, 2]));
    expect(profile.juzList[14].memorizedSurahs).toEqual(expect.arrayContaining([18]));
  });

  it('returns reader page context from bundled quran data', () => {
    const page = getReaderPageContext(1, ['en-saheeh']);

    expect(page.pageNumber).toBe(1);
    expect(page.verses.length).toBeGreaterThan(0);
    expect(page.verses[0].referenceKey).toBe('1:1');
  });

  it('searches verses offline by translation and reference', () => {
    const translationResults = searchReaderVerses('Entirely Merciful');
    const referenceResults = searchReaderVerses('2:255');

    expect(translationResults.length).toBeGreaterThan(0);
    expect(referenceResults.some((item) => item.referenceKey === '2:255')).toBe(true);
  });

  it('finds a surah start page', () => {
    expect(getStartPageForSurah(1)).toBe(1);
    expect(getStartPageForSurah(2)).toBeGreaterThan(1);
  });
});
