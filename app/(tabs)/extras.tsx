import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ExtrasCard } from '@/components/extras/ExtrasCard';
import { RateDifficultyModal } from '@/components/extras/RateDifficultyModal';
import { QuranQuizModal } from '@/components/extras/QuranQuizModal';
import { Screen } from '@/components/ui/Screen';
import { useActiveProfile } from '@/store/app';

const ORANGE = '#FF9500';
const PURPLE = '#9C27B0';

export default function ExtrasScreen() {
  const profile = useActiveProfile();
  const [showRateDifficulty, setShowRateDifficulty] = useState(false);
  const [showQuranQuiz, setShowQuranQuiz] = useState(false);

  const memorizedCount = profile?.juzList.flatMap((j) => j.memorizedSurahs).length ?? 0;
  const quizUnlocked = memorizedCount >= 4;

  return (
    <Screen title="Extras" scroll={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <ExtrasCard
              title="Rate Difficulty"
              subtitle="Rate surah difficulty"
              icon="star"
              color={ORANGE}
              onPress={() => setShowRateDifficulty(true)}
            />
          </View>
          <View style={styles.gridItem}>
            <ExtrasCard
              title="Quran Quiz"
              subtitle="Test your knowledge"
              icon="help-circle"
              color={PURPLE}
              isDisabled={!quizUnlocked}
              onPress={() => setShowQuranQuiz(true)}
            />
          </View>
        </View>
      </ScrollView>

      <RateDifficultyModal
        visible={showRateDifficulty}
        onDismiss={() => setShowRateDifficulty(false)}
      />
      <QuranQuizModal
        visible={showQuranQuiz}
        onDismiss={() => setShowQuranQuiz(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    flex: 1,
    minWidth: 140,
  },
});
