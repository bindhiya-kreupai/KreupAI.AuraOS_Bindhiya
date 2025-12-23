/**
 * Theme Store
 * Zustand store for theme/appearance management
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ColorScheme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    secondary: '#6366F1',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#60A5FA',
    primaryLight: '#1E3A5F',
    secondary: '#818CF8',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  fontSize: lightTheme.fontSize,
};

interface ThemeStore {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'app_theme_mode';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'system',
  colorScheme: Appearance.getColorScheme() || 'light',
  theme: Appearance.getColorScheme() === 'dark' ? darkTheme : lightTheme,

  setMode: async (mode: ThemeMode) => {
    let colorScheme: ColorScheme;

    if (mode === 'system') {
      colorScheme = Appearance.getColorScheme() || 'light';
    } else {
      colorScheme = mode;
    }

    const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);

    set({ mode, colorScheme, theme });
  },

  loadTheme: async () => {
    try {
      const savedMode = (await AsyncStorage.getItem(THEME_STORAGE_KEY)) as ThemeMode | null;
      const mode = savedMode || 'system';

      let colorScheme: ColorScheme;
      if (mode === 'system') {
        colorScheme = Appearance.getColorScheme() || 'light';
      } else {
        colorScheme = mode;
      }

      const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

      set({ mode, colorScheme, theme });

      // Listen for system theme changes
      Appearance.addChangeListener(({ colorScheme: systemScheme }) => {
        if (get().mode === 'system') {
          const newScheme = systemScheme || 'light';
          const newTheme = newScheme === 'dark' ? darkTheme : lightTheme;
          set({ colorScheme: newScheme, theme: newTheme });
        }
      });
    } catch {
      // Use default
    }
  },
}));
