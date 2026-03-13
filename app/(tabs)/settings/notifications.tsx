import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { scheduleRevisionNotifications } from '@/lib/services/notifications';
import { useActiveProfile, useAppStore } from '@/store/app';

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function padTime(value: number): string {
  return value.toString().padStart(2, '0');
}

export default function NotificationSettingsScreen() {
  const profile = useActiveProfile();
  const settings = useAppStore((state) => state.settings);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const setNotificationTime = useAppStore((state) => state.setNotificationTime);
  const setNotificationPeriodEnabled = useAppStore((state) => state.setNotificationPeriodEnabled);

  const [editingPeriod, setEditingPeriod] = useState<'morning' | 'evening' | null>(null);

  if (!settings || !profile) {
    return null;
  }

  const prefs = settings.notifications;

  async function reschedule(nextPrefs = prefs) {
    await scheduleRevisionNotifications({
      preferences: nextPrefs,
      todayPages: profile.todayPages,
      dueCount: profile.selectedSurahIds.length,
    });
  }

  function adjustTime(period: 'morning' | 'evening', deltaMinutes: number) {
    const current = prefs[period];
    let totalMinutes = current.hour * 60 + current.minute + deltaMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const next = { ...current, hour, minute };
    const nextPrefs = { ...prefs, [period]: next };
    void setNotificationTime(period, next).then(() => reschedule(nextPrefs));
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SettingsCard>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Enable Daily Reminders</Text>
          <Switch
            value={prefs.notificationsEnabled}
            onValueChange={(value) => {
              void setNotificationsEnabled(value).then(() => reschedule());
            }}
            trackColor={{ false: COLORS.border, true: COLORS.forest }}
            thumbColor={COLORS.white}
          />
        </View>

        <Text style={styles.sectionTitle}>Reminder Types</Text>

        <View style={styles.reminderBlock}>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>Yesterday's Pages</Text>
            <View style={styles.reminderRight}>
              <Pressable
                onPress={() => prefs.morning.isEnabled && setEditingPeriod('morning')}
                style={[
                  styles.timeButton,
                  !prefs.morning.isEnabled && styles.timeButtonDisabled,
                ]}
              >
                <Ionicons name="time" size={14} color={COLORS.forest} />
                <Text
                  style={[
                    styles.timeButtonText,
                    !prefs.morning.isEnabled && styles.timeButtonTextDisabled,
                  ]}
                >
                  {formatTime(prefs.morning.hour, prefs.morning.minute)}
                </Text>
                <Ionicons name="chevron-forward" size={12} color={COLORS.muted} />
              </Pressable>
              <Switch
                value={prefs.morning.isEnabled}
                onValueChange={(value) => {
                  const next = {
                    ...prefs,
                    morning: { ...prefs.morning, isEnabled: value },
                  };
                  void setNotificationPeriodEnabled('morning', value).then(() =>
                    reschedule(next)
                  );
                }}
                trackColor={{ false: COLORS.border, true: COLORS.forest }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>Today's Pages</Text>
            <View style={styles.reminderRight}>
              <Pressable
                onPress={() => prefs.evening.isEnabled && setEditingPeriod('evening')}
                style={[
                  styles.timeButton,
                  !prefs.evening.isEnabled && styles.timeButtonDisabled,
                ]}
              >
                <Ionicons name="time" size={14} color={COLORS.forest} />
                <Text
                  style={[
                    styles.timeButtonText,
                    !prefs.evening.isEnabled && styles.timeButtonTextDisabled,
                  ]}
                >
                  {formatTime(prefs.evening.hour, prefs.evening.minute)}
                </Text>
                <Ionicons name="chevron-forward" size={12} color={COLORS.muted} />
              </Pressable>
              <Switch
                value={prefs.evening.isEnabled}
                onValueChange={(value) => {
                  const next = {
                    ...prefs,
                    evening: { ...prefs.evening, isEnabled: value },
                  };
                  void setNotificationPeriodEnabled('evening', value).then(() =>
                    reschedule(next)
                  );
                }}
                trackColor={{ false: COLORS.border, true: COLORS.forest }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>
      </SettingsCard>

      {editingPeriod && (
        <Modal visible transparent animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditingPeriod(null)}
          >
            <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
              <Text style={styles.pickerTitle}>
                {editingPeriod === 'morning'
                  ? 'Morning Notification Time'
                  : 'Evening Notification Time'}
              </Text>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeDisplayText}>
                  {padTime(prefs[editingPeriod].hour)}:{padTime(prefs[editingPeriod].minute)}
                </Text>
              </View>
              <View style={styles.timeAdjustRow}>
                <AppButton
                  label="-15 min"
                  onPress={() => adjustTime(editingPeriod, -15)}
                  variant="secondary"
                  style={styles.timeAdjustButton}
                />
                <AppButton
                  label="+15 min"
                  onPress={() => adjustTime(editingPeriod, 15)}
                  variant="secondary"
                  style={styles.timeAdjustButton}
                />
              </View>
              <Pressable
                style={styles.pickerButtonPrimary}
                onPress={() => setEditingPeriod(null)}
              >
                <Text style={[styles.pickerButtonText, styles.pickerButtonTextPrimary]}>
                  Done
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  reminderBlock: {
    marginTop: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  reminderLabel: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '500',
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(34, 70, 50, 0.1)',
    borderRadius: 8,
  },
  timeButtonDisabled: {
    opacity: 0.5,
  },
  timeButtonText: {
    color: COLORS.forest,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  timeButtonTextDisabled: {
    color: COLORS.muted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  pickerTitle: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  timeDisplay: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  timeDisplayText: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 32,
    fontWeight: '800',
  },
  timeAdjustRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.md,
  },
  timeAdjustButton: {
    flex: 1,
  },
  pickerButtonPrimary: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: COLORS.forest,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: COLORS.ink,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerButtonTextPrimary: {
    color: COLORS.white,
  },
});
