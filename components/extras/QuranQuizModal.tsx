import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useActiveProfile, useAppStore } from '@/store/app';

type QuranQuizModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

type QuizPhase = 'loading' | 'playing' | 'unlock';

export function QuranQuizModal({ visible, onDismiss }: QuranQuizModalProps) {
  const insets = useSafeAreaInsets();
  const profile = useActiveProfile();
  const activeQuizQuestion = useAppStore((state) => state.activeQuizQuestion);
  const buildNextQuizQuestion = useAppStore((state) => state.buildNextQuizQuestion);
  const submitQuizAnswer = useAppStore((state) => state.submitQuizAnswer);

  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);

  const memorizedCount =
    profile?.juzList.flatMap((j) => j.memorizedSurahs).length ?? 0;
  const canPlay = memorizedCount >= 4;

  useEffect(() => {
    if (visible) {
      if (!canPlay) {
        setPhase('unlock');
        return;
      }
      setPhase('loading');
      setSelectedAnswer(null);
      setShowFeedback(false);
      setSessionCorrect(0);
      setSessionAnswered(0);
      buildNextQuizQuestion();
    }
  }, [visible, canPlay, buildNextQuizQuestion]);

  useEffect(() => {
    if (visible && canPlay && activeQuizQuestion) {
      setPhase('playing');
    }
  }, [visible, canPlay, activeQuizQuestion]);

  const handleAnswer = async (option: string) => {
    if (!activeQuizQuestion || showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);
    const isCorrect = await submitQuizAnswer(option);
    setSessionCorrect((c) => c + (isCorrect ? 1 : 0));
    setSessionAnswered((t) => t + 1);
    void Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      buildNextQuizQuestion();
    }, 800);
  };

  const handleDismiss = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  if (!profile) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {phase === 'unlock' && (
          <View style={styles.unlock}>
            <View style={styles.header}>
              <Pressable onPress={handleDismiss} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={COLORS.ink} />
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            </View>
            <View style={styles.unlockBody}>
              <Ionicons name="lock-closed" size={60} color={COLORS.muted} />
              <Text style={styles.unlockTitle}>Quiz Locked</Text>
              <Text style={styles.unlockSubtitle}>
                Memorize at least four surahs to unlock the quiz.
              </Text>
            </View>
          </View>
        )}

        {phase === 'loading' && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#9C27B0" />
            <Text style={styles.loadingTitle}>Loading Quiz...</Text>
            <Text style={styles.loadingSubtitle}>
              Preparing questions from your memorized surahs
            </Text>
          </View>
        )}

        {phase === 'playing' && activeQuizQuestion && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable onPress={handleDismiss} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={COLORS.white} />
                <Text style={[styles.backText, { color: COLORS.white }]}>Back</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statsLabel}>
                  Question {sessionAnswered + 1}
                </Text>
              </View>
              <View style={styles.statsRight}>
                <Text style={styles.statsLabel}>Score: {sessionCorrect}</Text>
              </View>
            </View>

            <Text style={styles.prompt}>{activeQuizQuestion.prompt}</Text>

            <View style={styles.optionsGrid}>
              {activeQuizQuestion.options.map((option) => (
                <QuizOptionButton
                  key={option}
                  option={option}
                  correctAnswer={activeQuizQuestion.answer}
                  selectedAnswer={selectedAnswer}
                  showFeedback={showFeedback}
                  onPress={() => handleAnswer(option)}
                />
              ))}
            </View>
          </ScrollView>
        )}

      </View>
    </Modal>
  );
}

type QuizOptionButtonProps = {
  option: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  showFeedback: boolean;
  onPress: () => void;
};

function QuizOptionButton({
  option,
  correctAnswer,
  selectedAnswer,
  showFeedback,
  onPress,
}: QuizOptionButtonProps) {
  const isCorrect = option === correctAnswer;
  const isWrong = option === selectedAnswer && selectedAnswer !== correctAnswer;
  const bgColor = showFeedback
    ? isCorrect
      ? COLORS.emerald
      : isWrong
        ? '#FF3B30'
        : '#F2F2F7'
    : '#F2F2F7';
  const borderColor = showFeedback
    ? isCorrect
      ? COLORS.emerald
      : isWrong
        ? '#FF3B30'
        : 'transparent'
    : 'transparent';
  const textColor = showFeedback && (isCorrect || isWrong) ? COLORS.white : COLORS.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={showFeedback}
      style={({ pressed }) => [
        styles.optionBtn,
        { backgroundColor: bgColor, borderColor },
        pressed && !showFeedback && styles.optionPressed,
      ]}
    >
      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  prompt: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 26,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  optionBtn: {
    flex: 1,
    minWidth: '45%',
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: SPACING.xl,
  },
  loadingTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  loadingSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  unlock: {
    flex: 1,
  },
  unlockBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: SPACING.xl,
  },
  unlockTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
  },
  unlockSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
