import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type { Difficulty } from '@/types/domain';
import { useActiveProfile, useAppStore } from '@/store/app';

type RateDifficultyModalProps = {
  visible: boolean;
  onDismiss: () => void;
};

const DIFFICULTY_CONFIG: { key: Difficulty; label: string; desc: string; color: string }[] = [
  { key: 'easy', label: 'Easy', desc: 'Very comfortable', color: COLORS.status.green },
  { key: 'medium', label: 'Medium', desc: 'Standard pace', color: COLORS.status.yellow },
  { key: 'hard', label: 'Hard', desc: 'Needs focus', color: COLORS.status.orange },
  { key: 'very-hard', label: 'Very Hard', desc: 'Very challenging', color: COLORS.status.red },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function RateDifficultyModal({ visible, onDismiss }: RateDifficultyModalProps) {
  const insets = useSafeAreaInsets();
  const profile = useActiveProfile();
  const rateJuzDifficulty = useAppStore((state) => state.rateJuzDifficulty);

  const memorizedJuz = profile?.juzList.filter((juz) => juz.isMemorized) ?? [];
  const [selectedJuzId, setSelectedJuzId] = useState<number | null>(
    memorizedJuz[0]?.id ?? null
  );

  React.useEffect(() => {
    if (visible && memorizedJuz.length > 0 && selectedJuzId === null) {
      setSelectedJuzId(memorizedJuz[0].id);
    }
  }, [visible, memorizedJuz, selectedJuzId]);

  const selectedJuz = memorizedJuz.find((j) => j.id === selectedJuzId);

  const handleRate = (difficulty: Difficulty) => {
    if (!selectedJuz) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void rateJuzDifficulty(selectedJuz.id, difficulty);
    const idx = memorizedJuz.findIndex((j) => j.id === selectedJuz.id);
    const next = memorizedJuz[idx + 1] ?? memorizedJuz[0];
    setSelectedJuzId(next?.id ?? null);
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
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Surah Difficulty</Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleDismiss}
            style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {memorizedJuz.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="star" size={60} color="#FF9500" />
              <Text style={styles.emptyTitle}>No Memorized Surahs</Text>
              <Text style={styles.emptySubtitle}>
                Start memorizing surahs to rate their difficulty
              </Text>
            </View>
          ) : (
            <>
              {memorizedJuz.length > 1 && (
                <View style={styles.pickerRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pickerScroll}
                  >
                    {memorizedJuz.map((juz) => (
                      <Pressable
                        key={juz.id}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          setSelectedJuzId(juz.id);
                        }}
                        style={[
                          styles.pickerBtn,
                          selectedJuzId === juz.id && styles.pickerBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerBtnText,
                            selectedJuzId === juz.id && styles.pickerBtnTextActive,
                          ]}
                        >
                          Juz {juz.id}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {selectedJuz && (
                <>
                  <View style={styles.surahCard}>
                    <Text style={styles.surahName}>Juz {selectedJuz.id}</Text>
                    <Text style={styles.surahMeta}>
                      {selectedJuz.memorizedSurahs.length} surah
                      {selectedJuz.memorizedSurahs.length !== 1 ? 's' : ''} memorized
                    </Text>
                  </View>

                  <View style={styles.currentSection}>
                    <Text style={styles.sectionLabel}>Current Difficulty</Text>
                    <View
                      style={[
                        styles.currentBadge,
                        {
                          backgroundColor: hexToRgba(
                            DIFFICULTY_CONFIG.find((d) => d.key === selectedJuz.difficulty)
                              ?.color ?? COLORS.muted,
                            0.15
                          ),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currentText,
                          {
                            color:
                              DIFFICULTY_CONFIG.find((d) => d.key === selectedJuz.difficulty)
                                ?.color ?? COLORS.muted,
                          },
                        ]}
                      >
                        {DIFFICULTY_CONFIG.find((d) => d.key === selectedJuz.difficulty)?.label ??
                          selectedJuz.difficulty}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingTitle}>Rate Difficulty</Text>
                    <View style={styles.ratingGrid}>
                      {DIFFICULTY_CONFIG.map(({ key, label, desc, color }) => (
                        <Pressable
                          key={key}
                          onPress={() => handleRate(key)}
                          style={({ pressed }) => [
                            styles.ratingBtn,
                            {
                              backgroundColor: hexToRgba(color, 0.15),
                              borderColor: hexToRgba(color, 0.4),
                            },
                            pressed && styles.ratingBtnPressed,
                          ]}
                        >
                          <Text style={[styles.ratingLabel, { color }]}>{label}</Text>
                          <Text style={[styles.ratingDesc, { color: hexToRgba(color, 0.85) }]}>
                            {desc}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  doneText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.forest,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
  },
  pickerRow: {
    marginBottom: SPACING.lg,
  },
  pickerScroll: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  pickerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  pickerBtnActive: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  pickerBtnText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.ink,
  },
  pickerBtnTextActive: {
    color: COLORS.white,
  },
  surahCard: {
    backgroundColor: COLORS.emerald,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: 24,
  },
  surahName: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  surahMeta: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  currentSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.muted,
  },
  currentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  currentText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '700',
  },
  ratingSection: {
    gap: 16,
  },
  ratingTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ratingBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: '47%',
    alignItems: 'center',
    gap: 6,
  },
  ratingBtnPressed: {
    opacity: 0.85,
  },
  ratingLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '600',
  },
  ratingDesc: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
});
