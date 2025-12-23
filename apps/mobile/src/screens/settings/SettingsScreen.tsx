/**
 * Settings Screen
 * App appearance and preferences
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useThemeStore, ThemeMode } from '@/stores/theme.store';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, mode, setMode } = useThemeStore();

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: t('settings.light'), icon: 'sunny-outline' },
    { value: 'dark', label: t('settings.dark'), icon: 'moon-outline' },
    { value: 'system', label: t('settings.system'), icon: 'phone-portrait-outline' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {t('settings.appearance')}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {themeOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              index < themeOptions.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
            onPress={() => setMode(option.value)}
          >
            <View style={styles.optionLeft}>
              <Ionicons name={option.icon as any} size={22} color={theme.colors.text} />
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
            </View>
            {mode === option.value && (
              <Ionicons name="checkmark" size={22} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {t('settings.notifications')}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.switchItem}>
          <View style={styles.optionLeft}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
              {t('settings.pushNotifications')}
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
        <View
          style={[styles.switchItem, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="mail-outline" size={22} color={theme.colors.text} />
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
              {t('settings.emailNotifications')}
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      {/* Security */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {t('settings.security')}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.switchItem}>
          <View style={styles.optionLeft}>
            <Ionicons name="finger-print-outline" size={22} color={theme.colors.text} />
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
              {t('settings.biometricLogin')}
            </Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 15,
    marginLeft: 12,
  },
});
