/**
 * Theme Provider
 * Context for theme management
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '@/stores/theme.store';

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

const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Helper hook for common styles
 */
export function useThemedStyles() {
  const { theme } = useThemeStore();

  return {
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    button: {
      primary: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        height: 52,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 52,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
    },
    text: {
      title: {
        color: theme.colors.text,
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold' as const,
      },
      subtitle: {
        color: theme.colors.text,
        fontSize: theme.fontSize.lg,
        fontWeight: '600' as const,
      },
      body: {
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
      },
      caption: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
      },
    },
    input: {
      container: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: 52,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      },
      text: {
        flex: 1,
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
      },
    },
  };
}
