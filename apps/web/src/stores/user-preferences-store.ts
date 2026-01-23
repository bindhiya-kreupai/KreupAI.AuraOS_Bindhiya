import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'hi' | 'ja' | 'zh';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

type UserPreferencesState = {
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timezone: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  setLanguage: (language: Language) => void;
  setDateFormat: (format: DateFormat) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setTimezone: (timezone: string) => void;
  setCompactMode: (compact: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  resetPreferences: () => void;
};

const defaultPreferences = {
  language: 'en' as Language,
  dateFormat: 'MM/DD/YYYY' as DateFormat,
  timeFormat: '12h' as TimeFormat,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  compactMode: false,
  animationsEnabled: true,
  emailNotifications: true,
  pushNotifications: true,
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setLanguage: (language) => set({ language }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setTimezone: (timezone) => set({ timezone }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      resetPreferences: () => set(defaultPreferences),
    }),
    { name: 'aura-user-preferences' }
  )
);
