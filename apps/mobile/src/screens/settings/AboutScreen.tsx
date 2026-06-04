/**
 * About Screen (#112)
 * App version + build info + legal links. Reads version from Expo's
 * Constants so the displayed number always matches what's actually
 * installed (no risk of stale hardcoded value).
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useThemeStore } from '@/stores/theme.store';

// Expo Constants is wrapped lazily so the screen still mounts in non-Expo
// test environments (e.g. running unit tests via vitest without expo-modules)
function getExpoVersion(): { app: string; build: string; sdk: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    return {
      app: Constants?.expoConfig?.version ?? '—',
      build:
        Constants?.expoConfig?.ios?.buildNumber ??
        Constants?.expoConfig?.android?.versionCode?.toString() ??
        '—',
      sdk: Constants?.expoConfig?.sdkVersion ?? '—',
    };
  } catch {
    return { app: '—', build: '—', sdk: '—' };
  }
}

const LEGAL_LINKS = [
  { id: 'privacy', label: 'Privacy Policy', url: 'https://kreup.ai/legal/privacy' },
  { id: 'terms', label: 'Terms of Service', url: 'https://kreup.ai/legal/terms' },
  { id: 'oss', label: 'Open-source licenses', url: 'https://kreup.ai/legal/oss' },
];

export function AboutScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const version = getExpoVersion();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.hero}>
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.colors.primaryLight ?? theme.colors.primary + '22' },
          ]}
        >
          <Ionicons name="business" size={36} color={theme.colors.primary} />
        </View>
        <Text style={[styles.appName, { color: theme.colors.text }]}>AuraOS</Text>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
          {t('about.tagline') ?? 'Enterprise HCM by KreupAI'}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Row theme={theme} label={t('about.appVersion') ?? 'App version'} value={version.app} />
        <Row theme={theme} label={t('about.buildNumber') ?? 'Build number'} value={version.build} />
        <Row theme={theme} label={t('about.sdkVersion') ?? 'Expo SDK'} value={version.sdk} />
      </View>

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>
        {t('about.legal') ?? 'Legal'}
      </Text>
      {LEGAL_LINKS.map((l) => (
        <TouchableOpacity
          key={l.id}
          accessibilityRole="link"
          onPress={() => Linking.openURL(l.url)}
          style={[
            styles.linkRow,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.linkText, { color: theme.colors.text }]}>{l.label}</Text>
          <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      ))}

      <Text style={[styles.copyright, { color: theme.colors.textSecondary }]}>
        © {new Date().getFullYear()} KreupAI Technologies
      </Text>
    </ScrollView>
  );
}

function Row({
  theme,
  label,
  value,
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}>
      <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  hero: { alignItems: 'center', marginVertical: 24 },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: 24, fontWeight: '700' },
  tagline: { fontSize: 13, marginTop: 4 },
  card: {
    padding: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 14, fontWeight: '600' },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  linkText: { fontSize: 14, fontWeight: '500' },
  copyright: { fontSize: 11, textAlign: 'center', marginTop: 24 },
});
