import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const WHATS_NEW = [
  'Streak Activity Calendar: Visual calendar with streak history',
  "All-Time Pages Tracker: Calendar view of all pages revised",
  "Various bug fixes and improvements for better stability",
  'Recover lost streaks by completing 10 pages of revision',
];

export default function AboutSettingsScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Image
          contentFit="contain"
          source={require("@/assets/Al Muraja'ah Logo.png")}
          style={styles.logo}
        />
      </View>
      <SettingsCard title="About" icon="information-circle" iconColor="#2563EB">
        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Version</Text>
          <Text style={styles.versionValue}>{APP_VERSION}</Text>
        </View>
        <Text style={styles.description}>
          Your companion for Quran memorization and revision tracking.
        </Text>
        <View style={styles.divider} />
        <View style={styles.whatsNew}>
          <View style={styles.whatsNewHeader}>
            <Ionicons name="sparkles" size={18} color={COLORS.forest} />
            <Text style={styles.whatsNewTitle}>What's New in Version {APP_VERSION}:</Text>
          </View>
          <View style={styles.whatsNewList}>
            {WHATS_NEW.map((item, index) => (
              <View key={index} style={styles.whatsNewItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.whatsNewText}>{item}</Text>
              </View>
            ))}
          </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logo: {
    width: 80,
    height: 80,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '600',
  },
  versionValue: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
  },
  description: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  whatsNew: {
    gap: 12,
  },
  whatsNewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatsNewTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '800',
  },
  whatsNewList: {
    gap: 8,
  },
  whatsNewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
  },
  whatsNewText: {
    flex: 1,
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
