import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  UIManager,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { getSurahOccurrencesByJuz } from '@/lib/services/quranData';
import { useActiveProfile, useAppStore } from '@/store/app';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CYCLE_PRESETS = [
  { days: 3, subtitle: 'Intensive' },
  { days: 7, subtitle: 'Balanced' },
  { days: 10, subtitle: 'Relaxed' },
  { days: 14, subtitle: 'Minimal' },
] as const;

function JuzSection({
  juzNumber,
  surahs,
  isExpanded,
  onToggleExpand,
  isJuzSelected,
  onJuzToggle,
  surahSelections,
  onSurahToggle,
}: {
  juzNumber: number;
  surahs: { id: string; surahNumber: number; englishName: string }[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  isJuzSelected: boolean;
  onJuzToggle: (value: boolean) => void;
  surahSelections: Record<number, boolean>;
  onSurahToggle: (occurrenceId: string) => void;
}) {
  return (
    <View style={styles.juzSection}>
      <Pressable
        onPress={onToggleExpand}
        style={({ pressed }) => [styles.juzHeader, pressed && styles.juzHeaderPressed]}
      >
        <Ionicons
          name="chevron-forward"
          size={16}
          color={COLORS.forest}
          style={[styles.juzChevron, isExpanded && styles.juzChevronExpanded]}
        />
        <Text style={styles.juzTitle}>Juz {juzNumber}</Text>
        <View style={styles.juzSpacer} />
        <Switch
          value={isJuzSelected}
          onValueChange={onJuzToggle}
          trackColor={{ false: COLORS.border, true: COLORS.forest }}
          thumbColor={COLORS.white}
        />
      </Pressable>
      {isExpanded && (
        <View style={styles.surahList}>
          {surahs.map((surah) => {
            const isSelected = surahSelections[surah.surahNumber] ?? false;
            return (
              <View key={surah.id} style={styles.surahRow}>
                <Ionicons
                  name="book"
                  size={16}
                  color={COLORS.muted}
                  style={styles.surahIcon}
                />
                <Text style={styles.surahName} numberOfLines={1}>
                  {surah.englishName}
                </Text>
                <Switch
                  value={isSelected}
                  onValueChange={() => onSurahToggle(surah.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.forest }}
                  thumbColor={COLORS.white}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function JuzSelectionSettingsScreen() {
  const profile = useActiveProfile();
  const toggleJuzSelection = useAppStore((state) => state.toggleJuzSelection);
  const toggleOccurrenceMemorized = useAppStore((state) => state.toggleOccurrenceMemorized);
  const setAllJuzSelection = useAppStore((state) => state.setAllJuzSelection);
  const setGlobalRevisionCycleDays = useAppStore((state) => state.setGlobalRevisionCycleDays);

  const [expandedJuz, setExpandedJuz] = useState<Set<number>>(new Set());
  const [isSelectingAll, setIsSelectingAll] = useState(false);

  if (!profile) {
    return null;
  }

  const cycleDays = profile.globalRevisionCycleDays;
  const hasAnySelected = profile.juzList.some((j) => j.isMemorized);

  function toggleExpand(juzId: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedJuz((prev) => {
      const next = new Set(prev);
      if (next.has(juzId)) next.delete(juzId);
      else next.add(juzId);
      return next;
    });
  }

  function handleSelectAll() {
    const next = !hasAnySelected;
    setIsSelectingAll(next);
    void setAllJuzSelection(next);
  }

  const juzWithSurahs = profile.juzList.map((juz) => ({
    juz,
    surahs: getSurahOccurrencesByJuz(juz.id).map((o) => ({
      id: o.id,
      surahNumber: o.surahNumber,
      englishName: o.englishName,
    })),
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SettingsCard title="Cycle Length" icon="time" iconColor="#2563EB">
        <Text style={styles.cycleLabel}>Complete portion cycle every</Text>
        <View style={styles.presetGrid}>
          {CYCLE_PRESETS.map(({ days, subtitle }) => {
            const isSelected = cycleDays === days;
            return (
              <Pressable
                key={days}
                onPress={() => void setGlobalRevisionCycleDays(days)}
                style={[
                  styles.presetButton,
                  isSelected && styles.presetButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.presetDays,
                    isSelected && styles.presetDaysSelected,
                  ]}
                >
                  {days}
                </Text>
                <Text
                  style={[
                    styles.presetUnit,
                    isSelected && styles.presetUnitSelected,
                  ]}
                >
                  {days === 1 ? 'day' : 'days'}
                </Text>
                <Text
                  style={[
                    styles.presetSubtitle,
                    isSelected && styles.presetSubtitleSelected,
                  ]}
                >
                  {subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SettingsCard>

      <SettingsCard title="Juz/Surah Tracker" icon="book" iconColor="#16A34A">
        <View style={styles.trackerHeader}>
          <Text style={styles.trackerHint}>
            Select portions of the Quran to track
          </Text>
          <Pressable onPress={handleSelectAll} style={styles.selectAllButton}>
            <Ionicons
              name={hasAnySelected ? 'square-outline' : 'checkbox'}
              size={18}
              color={COLORS.forest}
            />
            <Text style={styles.selectAllText}>
              {hasAnySelected ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.juzList}>
          {juzWithSurahs.map(({ juz, surahs }) => {
            const surahSelections: Record<number, boolean> = {};
            for (const s of surahs) {
              surahSelections[s.surahNumber] = juz.memorizedSurahs.includes(
                s.surahNumber
              );
            }
            return (
              <JuzSection
                key={juz.id}
                juzNumber={juz.id}
                surahs={surahs}
                isExpanded={expandedJuz.has(juz.id)}
                onToggleExpand={() => toggleExpand(juz.id)}
                isJuzSelected={juz.isMemorized}
                onJuzToggle={(value) => {
                  if (value !== juz.isMemorized) {
                    void toggleJuzSelection(juz.id);
                  }
                }}
                surahSelections={surahSelections}
                onSurahToggle={(id) => void toggleOccurrenceMemorized(id)}
              />
            );
          })}
        </View>
      </SettingsCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.xl,
  },
  cycleLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    gap: 4,
  },
  presetButtonSelected: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  presetDays: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
  },
  presetDaysSelected: {
    color: COLORS.white,
  },
  presetUnit: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
  },
  presetUnitSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  presetSubtitle: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 11,
    fontWeight: '600',
  },
  presetSubtitleSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trackerHint: {
    flex: 1,
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectAllText: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  juzList: {
    gap: 12,
  },
  juzSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  juzHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  juzHeaderPressed: {
    opacity: 0.8,
  },
  juzChevron: {
    marginRight: 8,
  },
  juzChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  juzTitle: {
    flex: 1,
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '700',
  },
  juzSpacer: {
    flex: 1,
  },
  surahList: {
    marginTop: 12,
    marginLeft: 24,
    gap: 4,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  surahIcon: {
    marginRight: 8,
  },
  surahName: {
    flex: 1,
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
  },
});
