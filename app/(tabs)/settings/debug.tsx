import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { getAllSurahOccurrences } from '@/lib/services/quranData';
import { useActiveProfile, useAppStore } from '@/store/app';

import Constants from 'expo-constants';

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagRow}>
      <Text style={styles.diagLabel}>{label}</Text>
      <Text style={styles.diagValue}>{value}</Text>
    </View>
  );
}

export default function DebugSettingsScreen() {
  const profile = useActiveProfile();
  const settings = useAppStore((state) => state.settings);
  const revisionEvents = useAppStore((state) => state.revisionEvents);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!settings || !profile) {
    return null;
  }

  const surahCount = new Set(getAllSurahOccurrences().map((o) => o.surahNumber)).size;
  const memorizedJuzCount = profile.juzList.filter((j) => j.isMemorized).length;

  async function handleGenerateLogs() {
    setIsGenerating(true);
    const diagnostic = {
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version ?? '1.0.0',
      surahEntries: surahCount,
      mushafPages: 604,
      memorizedJuz: `${memorizedJuzCount}/30`,
      revisionEventsCount: revisionEvents.length,
      settings: settings,
      activeProfile: profile.name,
      surahCount: profile.selectedSurahIds.length,
    };
    const report = JSON.stringify(diagnostic, null, 2);
    await Share.share({
      message: report,
      title: "Al Muraja'ah Debug Logs",
    });
    setIsGenerating(false);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SettingsCard title="Diagnostic Information" icon="medkit" iconColor="#2563EB">
        <DiagnosticRow label="Platform" value={Platform.OS} />
        <DiagnosticRow label="App Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
        <DiagnosticRow label="Surah Entries" value={String(surahCount)} />
        <DiagnosticRow label="Mushaf Pages" value="604" />
        <DiagnosticRow label="Memorized Juz" value={`${memorizedJuzCount}/30`} />
        <DiagnosticRow label="Revision Events" value={String(revisionEvents.length)} />
      </SettingsCard>

      <SettingsCard title="Share Debug Information" icon="share-social" iconColor="#16A34A">
        <Text style={styles.shareHint}>
          If you're experiencing any issues, you can share your debug information with our support team.
        </Text>
        <AppButton
          label={isGenerating ? 'Generating…' : 'Generate Logs'}
          onPress={handleGenerateLogs}
          disabled={isGenerating}
        />
        <Text style={styles.shareFootnote}>
          This will open the share sheet with diagnostic data. Send to: almurajaahapp@gmail.com
        </Text>
      </SettingsCard>

      <SettingsCard title="Debug Actions" icon="construct" iconColor="#EA580C">
        <AppButton
          label="Replay onboarding"
          onPress={async () => {
            await resetOnboarding();
            router.replace('/onboarding');
          }}
          variant="secondary"
        />
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
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  diagLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '500',
  },
  diagValue: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
  },
  shareHint: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  shareFootnote: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    marginTop: SPACING.sm,
  },
});
