import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerLargeTitle: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings', headerLargeTitle: true }} />
      <Stack.Screen name="appearance" options={{ title: 'Appearance' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="profiles" options={{ title: 'Wird Profiles' }} />
      <Stack.Screen name="juz-selection" options={{ title: 'Juz/Surah Selection' }} />
      <Stack.Screen name="debug" options={{ title: 'Debug & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
