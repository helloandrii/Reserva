import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastProvider } from '@/src/components/Toast';

// ─── Navigation guard ─────────────────────────────────────────────────────────

// TODO: set to false before release
const DEV_ALWAYS_SHOW_ONBOARDING = true;

function NavigationGuard() {
  const { loading, onboardingComplete, onboardingChecked } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // In dev mode: treat onboarding as not complete until the user explicitly
    // presses Skip or signs in (which calls completeOnboarding() → updates state).
    // onboardingChecked prevents acting before AsyncStorage has been read.
    if (loading || !onboardingChecked) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inLegal = segments[0] === 'legal';
    const inSettings = segments[0] === 'settings';
    const inTabs = segments[0] === '(tabs)';

    if (inLegal || inSettings) return;

    const passedOnboarding = DEV_ALWAYS_SHOW_ONBOARDING
      ? onboardingComplete   // in dev mode: only pass when user explicitly skipped/signed in
      : onboardingComplete;  // in prod: same — reads from AsyncStorage via AuthContext

    if (!passedOnboarding) {
      // Keep user inside onboarding flow
      if (!inOnboarding) router.replace('/onboarding' as any);
    } else {
      // Onboarding done — let them into the app
      if (!inTabs) router.replace('/(tabs)');
    }
  }, [loading, onboardingChecked, onboardingComplete, segments]);

  return null;
}

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  const colorScheme = useColorScheme();
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <NavigationGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen
            name="categories-sheet"
            options={{
              headerShown: false,
              presentation: 'formSheet',
              gestureEnabled: true,
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.5, 1],
              sheetInitialDetentIndex: 0,
              sheetLargestUndimmedDetentIndex: 0,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'card' }} />
        </Stack>
        <StatusBar style="light" />
      </ToastProvider>
    </ThemeProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function App() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
