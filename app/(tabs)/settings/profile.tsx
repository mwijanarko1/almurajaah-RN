import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { useAppStore } from '@/store/app';

const PAGE_COUNTER_MODES = [
  {
    mode: 'separate' as const,
    label: 'Separate for each profile',
    description: 'Each profile tracks its own page counts independently',
  },
  {
    mode: 'shared' as const,
    label: 'Shared across all profiles',
    description: 'Page counts combine across all your profiles',
  },
];

export default function ProfileSettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const setPageCounterMode = useAppStore((state) => state.setPageCounterMode);
  const setUserName = useAppStore((state) => state.setUserName);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState(settings?.userName ?? '');

  if (!settings) {
    return null;
  }

  const userName = settings.userName || 'User';

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SettingsCard title="Profile" icon="person" iconColor="#2563EB">
        <Pressable
          onPress={() => {
            setNameInput(userName);
            setShowNameModal(true);
          }}
          style={({ pressed }) => [styles.chevronRow, pressed && styles.chevronRowPressed]}
        >
          <View style={styles.chevronContent}>
            <Text style={styles.chevronLabel}>Display Name</Text>
            <Text style={styles.chevronValue}>{userName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.modeSection}>
          <Text style={styles.modeSectionTitle}>Page Counter Mode</Text>
          <View style={styles.modeOptions}>
            {PAGE_COUNTER_MODES.map((item) => {
              const isSelected = settings.pageCounterMode === item.mode;
              return (
                <Pressable
                  key={item.mode}
                  onPress={() => void setPageCounterMode(item.mode)}
                  style={({ pressed }) => [
                    styles.modeRow,
                    pressed && styles.modeRowPressed,
                  ]}
                >
                  <View style={styles.modeCopy}>
                    <Text
                      style={[
                        styles.modeLabel,
                        isSelected && styles.modeLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.modeDescription}>{item.description}</Text>
                  </View>
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
        </View>
      </SettingsCard>

      <Modal visible={showNameModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNameModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Display Name</Text>
            <Text style={styles.modalMessage}>Enter your display name</Text>
            <TextInput
              autoFocus
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.muted}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                onPress={() => setShowNameModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <AppButton
                label="Save"
                onPress={() => {
                  const trimmed = nameInput.trim();
                  if (trimmed) {
                    void setUserName(trimmed);
                  }
                  setShowNameModal(false);
                }}
                style={styles.modalButton}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
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
  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronRowPressed: {
    opacity: 0.7,
  },
  chevronContent: {
    gap: 4,
  },
  chevronLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
  chevronValue: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  modeSection: {
    gap: 12,
  },
  modeSectionTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
  modeOptions: {
    backgroundColor: COLORS.sand,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modeRowPressed: {
    opacity: 0.7,
  },
  modeCopy: {
    flex: 1,
    gap: 4,
  },
  modeLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '500',
  },
  modeLabelSelected: {
    fontWeight: '700',
  },
  modeDescription: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
  },
  modalTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalMessage: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
