/**
 * @module ThemeStore
 * @description Store for managing theme state (light/dark/system) with persistence
 * @project AURA HCM Platform
 */

'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aura_theme';

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemPreference();
  return theme;
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Initialize from localStorage and apply
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initial = stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
      setThemeState(initial);
      const resolved = resolveTheme(initial);
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    } catch {
      const resolved = resolveTheme('system');
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    }
  }, []);

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyThemeToDOM(newResolved);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Silently fail
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === 'dark';

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, resolvedTheme, setTheme, toggleTheme, isDark } },
    children
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
