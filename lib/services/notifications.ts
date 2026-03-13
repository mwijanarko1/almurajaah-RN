import * as Notifications from 'expo-notifications';

import type { NotificationPreferences } from '@/types/domain';

export async function prepareNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function scheduleRevisionNotifications(payload: {
  preferences: NotificationPreferences;
  todayPages: number;
  dueCount: number;
}): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!payload.preferences.notificationsEnabled) {
    return;
  }

  const isAllowed = await requestNotificationPermissions();
  if (!isAllowed) {
    return;
  }

  if (payload.preferences.morning.isEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Al Muraja'ah",
        body: `Start strong today. ${payload.dueCount} tracked surahs are waiting for revision.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: payload.preferences.morning.hour,
        minute: payload.preferences.morning.minute,
      },
    });
  }

  if (payload.preferences.evening.isEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Al Muraja'ah",
        body:
          payload.todayPages > 0
            ? `You revised ${payload.todayPages.toFixed(1)} pages today. Keep the streak alive.`
            : `You still have time to revise today. ${payload.dueCount} surahs need attention.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: payload.preferences.evening.hour,
        minute: payload.preferences.evening.minute,
      },
    });
  }
}
