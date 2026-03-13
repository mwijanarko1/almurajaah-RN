import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { COLORS, FONT_FAMILIES } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useTheme';
import { prepareNotifications } from '@/lib/services/notifications';
import { useAppStore } from '@/store/app';

export default function RootLayout() {
  const status = useAppStore((state) => state.status);
  const errorMessage = useAppStore((state) => state.errorMessage);
  const settings = useAppStore((state) => state.settings);
  const initialize = useAppStore((state) => state.initialize);

  const { colors, isDark } = useThemeColors(settings?.appearanceMode);

  const [fontsLoaded] = useFonts({
    [FONT_FAMILIES.display]: require('@/assets/fonts/ArchivoBlack-Regular.ttf'),
    [FONT_FAMILIES.body]: require('@/assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    [FONT_FAMILIES.quran]: require('@/assets/fonts/KFGQPC Uthmanic Script HAFS Regular.otf'),
    [FONT_FAMILIES.indoPak]: require('@/assets/fonts/AlQuran-IndoPak-by-QuranWBW.v.4.2.2-WL.ttf'),
  });

  React.useEffect(() => {
    void prepareNotifications();
    void initialize();
  }, [initialize]);

  if (!fontsLoaded || status === 'booting' || status === 'idle') {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
          <SafeAreaProvider>
            <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
              <Ionicons color={COLORS.forest} name="book" size={42} />
              <Text style={[styles.loadingTitle, { color: colors.text }]}>{"Al Muraja'ah"}</Text>
              <ActivityIndicator color={COLORS.forest} size="small" />
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  if (status === 'error') {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
          <SafeAreaProvider>
            <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
              <Ionicons color={COLORS.clay} name="alert-circle" size={42} />
              <Text style={[styles.loadingTitle, { color: colors.text }]}>Unable to start the app</Text>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>{errorMessage}</Text>
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reader/[page]" />
            <Stack.Screen name="surah/[surahId]" />
            <Stack.Screen name="juz/[juzNumber]" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    fontFamily: FONT_FAMILIES.display,
    fontSize: 26,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
