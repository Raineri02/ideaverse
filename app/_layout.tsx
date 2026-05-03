import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { theme } from '../src/lib/theme';
import { ToastProvider } from '../src/components/ToastProvider';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { hasSeenOnboarding } from '../src/utils/onboarding';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    async function navigate() {
      if (!session) {
        const seen = await hasSeenOnboarding();
        router.replace(seen ? '/auth/login' : '/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
    navigate();
  }, [session, loading]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bgCard },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: theme.font.semibold, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding"        options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="auth"              options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"            options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]"      options={{ title: '', headerTransparent: true }} />
      <Stack.Screen name="project/new"       options={{ title: 'Novo Projeto', presentation: 'modal' }} />
      <Stack.Screen name="project/edit/[id]" options={{ title: 'Editar', presentation: 'modal' }} />
      <Stack.Screen name="profile"           options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Sora-Regular':   require('../assets/fonts/Sora-Regular.ttf'),
    'Sora-SemiBold':  require('../assets/fonts/Sora-SemiBold.ttf'),
    'Sora-Bold':      require('../assets/fonts/Sora-Bold.ttf'),
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium':  require('../assets/fonts/DMSans-Medium.ttf'),
  });

  useEffect(() => { if (fontsLoaded) SplashScreen.hideAsync(); }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <StatusBar style="light" />
        <RootNavigator />
        <ToastProvider />
      </View>
    </AuthProvider>
  );
}
