import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { useAppStore } from '@/store/app';

const APPEARANCE_MODES = [
  { mode: 'system' as const, label: 'System', icon: 'phone-portrait-outline' as const },
  { mode: 'light' as const, label: 'Light', icon: 'sunny' as const },
  { mode: 'dark' as const, label: 'Dark', icon: 'moon' as const },
];

export default function AppearanceSettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const setAppearanceMode = useAppStore((state) => state.setAppearanceMode);
  const appearanceMode = settings?.appearanceMode ?? 'system';
  const { colors } = useThemeColors(settings?.appearanceMode);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <SettingsCard title="Appearance" icon="contrast" iconColor="#8B5CF6">
        <View style={styles.options}>
          {APPEARANCE_MODES.map((item) => {
            const isSelected = appearanceMode === item.mode;
            return (
              <Pressable
                key={item.mode}
                onPress={() => void setAppearanceMode(item.mode)}
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionRowPressed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={colors.text}
                  style={styles.optionIcon}
                />
                <Text style={[styles.optionLabel, { color: colors.text }]}>{item.label}</Text>
                {isSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={COLORS.forest}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </SettingsCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.xl,
  },
  options: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionRowPressed: {
    opacity: 0.7,
  },
  optionIcon: {
    width: 28,
    marginRight: SPACING.sm,
  },
  optionLabel: {
    flex: 1,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '500',
  },
});
