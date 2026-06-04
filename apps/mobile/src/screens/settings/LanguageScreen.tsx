/**
 * Language Screen (#112)
 * EN / AR / HI locale picker — the three locales the platform supports for
 * v1.0 (matches the bilingual-RTL E2E matrix from PR #123).
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';

const LOCALES: Array<{ code: 'en' | 'ar' | 'hi'; label: string; nativeLabel: string }> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const current = (i18n.language || user?.preferences?.language || 'en') as 'en' | 'ar' | 'hi';

  const setLocale = async (code: 'en' | 'ar' | 'hi') => {
    await i18n.changeLanguage(code);
    // Persist on the user preferences endpoint
    try {
      // Lazy import to keep the screen loadable in stories
      const { apiService } = await import('@/services/api.service');
      await apiService.put('/v1/me/preferences', { language: code });
    } catch {
      // Best-effort — local switch already succeeded
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('settings.language') ?? 'Language'}
      </Text>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        {t('settings.languageHint') ?? 'Affects all text + report layouts. Arabic switches the app to right-to-left.'}
      </Text>

      {LOCALES.map((l) => {
        const selected = current === l.code;
        return (
          <TouchableOpacity
            key={l.code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setLocale(l.code)}
            style={[
              styles.row,
              {
                backgroundColor: theme.colors.card,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <View>
              <Text style={[styles.label, { color: theme.colors.text }]}>{l.label}</Text>
              <Text style={[styles.native, { color: theme.colors.textSecondary }]}>
                {l.nativeLabel}
              </Text>
            </View>
            {selected ? (
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
            ) : (
              <Ionicons name="ellipse-outline" size={22} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700' },
  hint: { fontSize: 13, marginTop: 6, marginBottom: 16, lineHeight: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  label: { fontSize: 16, fontWeight: '600' },
  native: { fontSize: 12, marginTop: 2 },
});
