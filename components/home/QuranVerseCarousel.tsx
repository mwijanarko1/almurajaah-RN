import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';

type QuranVerse = {
  arabicText: string;
  translation: string;
  reference: string;
};

const quranVerses: QuranVerse[] = [
  {
    arabicText: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ',
    translation: 'This is the Book about which there is no doubt, a guidance for those conscious of Allāh',
    reference: 'Surah Al-Baqarah: 2',
  },
  {
    arabicText: 'هَـٰذَا بَيَانٌۭ لِّلنَّاسِ وَهُدًۭى وَمَوْعِظَةٌۭ لِّلْمُتَّقِينَ',
    translation: 'This [Qur\'ān] is a clear statement to [all] the people and a guidance and instruction for those conscious of Allāh.',
    reference: 'Surah Ali \'Imran: 138',
  },
  {
    arabicText: 'وَهَـٰذَا كِتَـٰبٌ أَنزَلْنَـٰهُ مُبَارَكٌۭ فَٱتَّبِعُوهُ وَٱتَّقُوا۟ لَعَلَّكُمْ تُرْحَمُونَ',
    translation: 'And this [Qur\'ān] is a Book We have revealed [which is] blessed, so follow it and fear Allāh that you may receive mercy.',
    reference: 'Surah Al-An\'am: 155',
  },
  {
    arabicText: 'يَـٰٓأَيُّهَا ٱلنَّاسُ قَدْ جَآءَتْكُم مَّوْعِظَةٌۭ مِّن رَّبِّكُمْ وَشِفَآءٌۭ لِّمَا فِى ٱلصُّدُورِ وَهُدًۭى وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ',
    translation: 'O mankind, there has come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers.',
    reference: 'Surah Yunus: 57',
  },
  {
    arabicText: 'كِتَـٰبٌ أُحْكِمَتْ ءَايَـٰتُهُۥ ثُمَّ فُصِّلَتْ مِن لَّدُنْ حَكِيمٍ خَبِيرٍ',
    translation: 'Alif, Lām, Rā. [This is] a Book whose verses are perfected and then presented in detail from [one who is] Wise and Aware',
    reference: 'Surah Hud: 1',
  },
  {
    arabicText: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌۭ وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ ۙ وَلَا يَزِيدُ ٱلظَّـٰلِمِينَ إِلَّا خَسَارًۭا',
    translation: 'And We send down of the Qur\'ān that which is healing and mercy for the believers, but it does not increase the wrongdoers except in loss.',
    reference: 'Surah Al-Isra: 82',
  },
  {
    arabicText: 'وَكَذَٰلِكَ أَنزَلْنَـٰهُ ءَايَـٰتٍۭ بَيِّنَـٰتٍۢ وَأَنَّ ٱللَّهَ يَهْدِى مَن يُرِيدُ',
    translation: 'And thus have We sent it [i.e., the Qur\'ān] down as verses of clear evidence and because Allāh guides whom He intends.',
    reference: 'Surah Al-Hajj: 16',
  },
  {
    arabicText: 'كِتَـٰبٌ أَنزَلْنَـٰهُ إِلَيْكَ مُبَـٰرَكٌۭ لِّيَدَّبَّرُوٓا۟ ءَايَـٰتِهِۦ وَلِيَتَذَكَّرَ أُو۟لُوا۟ ٱلْأَلْبَـٰبِ',
    translation: '[This is] a blessed Book which We have revealed to you, [O Muḥammad], that they might reflect upon its verses and that those of understanding would be reminded.',
    reference: 'Surah Sad: 29',
  },
  {
    arabicText: 'كِتَـٰبٌۭ فُصِّلَتْ ءَايَـٰتُهُۥ قُرْءَانًا عَرَبِيًّۭا لِّقَوْمٍۢ يَعْلَمُونَ',
    translation: 'A Book whose verses have been detailed, an Arabic Qur\'ān for a people who know',
    reference: 'Surah Fussilat: 3',
  },
  {
    arabicText: 'هَـٰذَا بَصَـٰٓئِرُ لِلنَّاسِ وَهُدًۭى وَرَحْمَةٌۭ لِّقَوْمٍۢ يُوقِنُونَ',
    translation: 'This [Qur\'ān] is enlightenment for mankind and guidance and mercy for a people who are certain [in faith].',
    reference: 'Surah Al-Jathiyah: 20',
  },
  {
    arabicText: 'وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍۢ',
    translation: 'And We have certainly made the Qur\'ān easy for remembrance, so is there any who will remember?',
    reference: 'Surah Al-Qamar: 17',
  },
];

type ProgressStats = {
  type: 'juz' | 'surah';
  title: string;
  totalCount: number;
  memorizedCount: number;
  relaxCount: number;
  needRevisionCount: number;
  actionVerb: string;
  needToVerb: string;
};

type CarouselItem =
  | { type: 'progress'; stats: ProgressStats }
  | { type: 'verse'; verse: QuranVerse };

type QuranVerseCarouselProps = {
  juzStats: ProgressStats;
  surahStats: ProgressStats;
};

export function QuranVerseCarousel({ juzStats, surahStats }: QuranVerseCarouselProps) {
  const { width } = Dimensions.get('window');
  const cardWidth = width - SPACING.lg * 2;

  const items: CarouselItem[] = [
    { type: 'progress', stats: juzStats },
    { type: 'progress', stats: surahStats },
    ...quranVerses.map((verse) => ({ type: 'verse' as const, verse })),
  ];

  const [currentPage, setCurrentPage] = React.useState(0);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={cardWidth}
        decelerationRate="fast"
      >
        {items.map((item, index) => (
          <View key={index} style={[styles.card, { width: cardWidth }]}>
            {item.type === 'progress' ? (
              <ProgressCard stats={item.stats} />
            ) : (
              <VerseCard verse={item.verse} />
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentPage && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

function ProgressCard({ stats }: { stats: ProgressStats }) {
  const relaxProgress = stats.relaxCount / stats.totalCount;
  const needRevisionProgress = stats.needRevisionCount / stats.totalCount;
  const totalProgress = stats.memorizedCount / stats.totalCount;

  return (
    <View style={styles.progressCard}>
      <Text style={styles.progressTitle}>{stats.title}</Text>
      <View style={styles.progressColumns}>
        {/* Relax Column */}
        <View style={styles.progressColumn}>
          <Text style={[styles.progressCount, { color: '#19a620' }]}>{stats.relaxCount}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${relaxProgress * 100}%`, backgroundColor: '#19a620' }]} />
          </View>
          <Text style={styles.progressLabel}>{stats.actionVerb}</Text>
        </View>

        {/* Need Revision Column */}
        <View style={styles.progressColumn}>
          <Text style={[styles.progressCount, { color: '#a61f1f' }]}>{stats.needRevisionCount}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${needRevisionProgress * 100}%`, backgroundColor: '#a61f1f' }]} />
          </View>
          <Text style={styles.progressLabel}>Need to {stats.needToVerb}</Text>
        </View>

        {/* Total Progress Column */}
        <View style={styles.progressColumn}>
          <Text style={[styles.progressCount, { color: '#2563EB' }]}>{stats.memorizedCount}/{stats.totalCount}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${totalProgress * 100}%`, backgroundColor: '#2563EB' }]} />
          </View>
          <Text style={styles.progressLabel}>Progress</Text>
        </View>
      </View>
    </View>
  );
}

function VerseCard({ verse }: { verse: QuranVerse }) {
  return (
    <View style={styles.verseCard}>
      <Text style={styles.arabicText}>{verse.arabicText}</Text>
      <Text style={styles.translation}>{verse.translation}</Text>
      <Text style={styles.reference}>{verse.reference}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    paddingHorizontal: SPACING.lg,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${COLORS.border}`,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: 20,
    minHeight: 180,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    textAlign: 'center',
  },
  progressColumns: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  progressColumn: {
    alignItems: 'center',
    gap: 8,
  },
  progressCount: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 28,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  verseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${COLORS.border}`,
    padding: SPACING.lg,
    gap: 12,
    minHeight: 180,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  arabicText: {
    fontFamily: FONT_FAMILIES.quran,
    fontSize: 22,
    color: COLORS.ink,
    textAlign: 'center',
  },
  translation: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    color: COLORS.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  reference: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${COLORS.muted}50`,
  },
  activeDot: {
    backgroundColor: COLORS.forest,
    width: 16,
  },
});
