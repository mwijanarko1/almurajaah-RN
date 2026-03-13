import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/app';

export default function IndexScreen() {
  const status = useAppStore((state) => state.status);
  const hasCompletedOnboarding = useAppStore((state) => state.settings?.hasCompletedOnboarding);

  if (status !== 'ready') {
    return null;
  }

  return hasCompletedOnboarding ? <Redirect href="/(tabs)" /> : <Redirect href="/onboarding" />;
}
