/**
 * AuraOS HR Mobile App
 * React Native / Expo Application
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import i18n from '@/utils/i18n';
import { ThemeProvider } from '@/utils/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  const { checkAuth } = useAuthStore();
  const { theme, colorScheme } = useThemeStore();

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <NavigationContainer>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <RootNavigator />
              </NavigationContainer>
            </ThemeProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
