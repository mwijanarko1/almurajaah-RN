import { describe, expect, it } from '@jest/globals';

import {
  buildProfileFromSelection,
  getSurahOccurrencesByJuz,
} from '@/lib/services/quranData';
import {
  createSurahParts,
  markSurahAsRevised,
  markSurahPartAsRevised,
  toggleSurahMemorized,
} from '@/lib/services/revision';

describe('revision logic', () => {
  it('marks a memorized surah as revised and adds its pages', () => {
    const profile = buildProfileFromSelection('Revision', [1]);
    const occurrence = getSurahOccurrencesByJuz(1).find((item) => item.surahNumber === 1);

    expect(occurrence).toBeDefined();

    const { profile: nextProfile, event } = markSurahAsRevised(profile, occurrence!);

    expect(event.pages).toBe(1);
    expect(nextProfile.todayPages).toBe(1);
    expect(nextProfile.allTimePages).toBe(1);
    expect(nextProfile.juzList[0].surahLastRevisedDates[1]).toBeDefined();
  });

  it('can toggle a surah occurrence as memorized', () => {
    const profile = buildProfileFromSelection('Revision', []);
    const occurrence = getSurahOccurrencesByJuz(1).find((item) => item.surahNumber === 2);

    const nextProfile = toggleSurahMemorized(profile, occurrence!);

    expect(nextProfile.selectedSurahIds).toContain(2);
    expect(nextProfile.juzList[0].memorizedSurahs).toContain(2);
  });

  it('does not double count when all parts of a surah are revised', () => {
    const profile = buildProfileFromSelection('Revision', [2]);
    const occurrence = getSurahOccurrencesByJuz(1).find((item) => item.surahNumber === 2);
    const withParts = createSurahParts(profile, occurrence!, 2);

    const firstPartId = `${occurrence!.surahNumber}-1`;
    const secondPartId = `${occurrence!.surahNumber}-2`;

    const afterFirst = markSurahPartAsRevised(withParts, occurrence!.juzNumber, firstPartId);
    const afterSecond = markSurahPartAsRevised(afterFirst.profile, occurrence!.juzNumber, secondPartId);

    expect(afterFirst.profile.todayPages).toBeGreaterThan(0);
    expect(afterSecond.profile.todayPages).toBeCloseTo(occurrence!.pages, 1);
    expect(afterSecond.profile.juzList[0].surahLastRevisedDates[2]).toBeDefined();
  });

  it('revising a split surah directly uses the sum of part pages once', () => {
    const profile = buildProfileFromSelection('Revision', [2]);
    const occurrence = getSurahOccurrencesByJuz(1).find((item) => item.surahNumber === 2);
    const withParts = createSurahParts(profile, occurrence!, 2);

    const result = markSurahAsRevised(withParts, occurrence!);

    expect(result.profile.todayPages).toBeCloseTo(occurrence!.pages, 1);
  });
});
