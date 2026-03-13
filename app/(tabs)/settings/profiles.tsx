import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useAppStore } from '@/store/app';

export default function WirdProfilesSettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const profiles = useAppStore((state) => state.profiles);
  const switchProfile = useAppStore((state) => state.switchProfile);
  const createProfile = useAppStore((state) => state.createProfile);
  const deleteProfile = useAppStore((state) => state.deleteProfile);
  const [newProfileName, setNewProfileName] = useState('');

  if (!settings) {
    return null;
  }

  const activeProfileId = settings.activeProfileId;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SettingsCard title="Wird Profiles" icon="people" iconColor="#2563EB">
        {profiles.map((item) => (
          <View key={item.id} style={styles.profileRow}>
            <View style={styles.profileCopy}>
              <Text style={styles.profileTitle}>{item.name}</Text>
              <Text style={styles.profileMeta}>
                {item.id === activeProfileId
                  ? 'Active profile'
                  : `${item.selectedSurahIds.length} selected surahs`}
              </Text>
            </View>
            <View style={styles.profileActions}>
              <AppButton
                label="Use"
                onPress={() => void switchProfile(item.id)}
                variant={item.id === activeProfileId ? 'primary' : 'secondary'}
              />
              {!item.isDefault ? (
                <AppButton
                  label="Delete"
                  onPress={() => void deleteProfile(item.id)}
                  variant="ghost"
                />
              ) : null}
            </View>
          </View>
        ))}
        <TextInput
          value={newProfileName}
          onChangeText={setNewProfileName}
          placeholder="New profile name"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        <AppButton
          label="Create profile"
          onPress={() => {
            if (!newProfileName.trim()) return;
            void createProfile(newProfileName.trim());
            setNewProfileName('');
          }}
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
  profileRow: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  profileCopy: {
    gap: 4,
  },
  profileTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '800',
  },
  profileMeta: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
  },
  profileActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
  },
});
