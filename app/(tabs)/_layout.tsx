import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

import { COLORS } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { useAppStore } from '@/store/app';

function iosTabLabelColor(isDark: boolean) {
  if (Platform.OS !== 'ios') return undefined;
  return DynamicColorIOS({ light: COLORS.ink, dark: COLORS.cream });
}

function iosSelectedTint(isDark: boolean) {
  if (Platform.OS !== 'ios') return undefined;
  return DynamicColorIOS({ light: COLORS.forest, dark: COLORS.white });
}

export default function TabsLayout() {
  const settings = useAppStore((state) => state.settings);
  const { colorScheme, isDark, colors } = useThemeColors(settings?.appearanceMode);
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <NativeTabs
        backgroundColor="transparent"
        badgeBackgroundColor={COLORS.gold}
        iconColor={isDark ? COLORS.dark.textSecondary : COLORS.muted}
        tintColor={Platform.OS === 'ios' ? iosSelectedTint(isDark) : (isDark ? COLORS.white : COLORS.forest)}
        labelStyle={{
          color: Platform.OS === 'ios' ? iosTabLabelColor(isDark) : (isDark ? COLORS.white : COLORS.ink),
          fontSize: 12,
          ...(Platform.OS === 'android' ? { fontWeight: '700' as const } : null),
        }}
      >
        <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: 'transparent' }}>
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="home"
            sf={{ default: 'house', selected: 'house.fill' }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="quran" contentStyle={{ backgroundColor: 'transparent' }}>
          <NativeTabs.Trigger.Label>Quran</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="menu_book"
            sf={{ default: 'book', selected: 'book.fill' }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="progress" contentStyle={{ backgroundColor: 'transparent' }}>
          <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="bar_chart"
            sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="extras" contentStyle={{ backgroundColor: 'transparent' }}>
          <NativeTabs.Trigger.Label>Extras</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="auto_awesome"
            sf={{ default: 'sparkles', selected: 'sparkles' }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings" contentStyle={{ backgroundColor: 'transparent' }}>
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="settings"
            sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
