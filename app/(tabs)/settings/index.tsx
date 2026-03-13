import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { useAppStore } from '@/store/app';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: 'contrast' as const, iconColor: '#8B5CF6' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' as const, iconColor: '#2563EB' },
  { id: 'profile', label: 'Profile', icon: 'person' as const, iconColor: '#2563EB' },
  { id: 'profiles', label: 'Wird Profiles', icon: 'people' as const, iconColor: '#2563EB' },
  { id: 'juz-selection', label: 'Juz/Surah Selection', icon: 'book' as const, iconColor: '#16A34A' },
  { id: 'debug', label: 'Debug & Support', icon: 'construct' as const, iconColor: '#EA580C' },
  { id: 'about', label: 'About', icon: 'information-circle' as const, iconColor: '#2563EB' },
] as const;

export default function SettingsIndexScreen() {
  const settings = useAppStore((state) => state.settings);
  const { colors, isDark } = useThemeColors(settings?.appearanceMode);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SECTIONS.map((section, index) => (
          <Pressable
            key={section.id}
            onPress={() => router.push(`/settings/${section.id}`)}
            style={({ pressed }) => [
              styles.row,
              index === SECTIONS.length - 1 && styles.rowLast,
              pressed && [styles.rowPressed, { backgroundColor: isDark ? COLORS.nightPanel : COLORS.sand }],
              { borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.rowContent}>
              <Ionicons
                name={section.icon}
                size={22}
                color={section.iconColor}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{section.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
  list: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    // Background color set dynamically
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: SPACING.sm,
  },
  rowLabel: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
});
