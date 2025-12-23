/**
 * More Home Screen
 * Settings and additional options menu
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { MoreStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreHome'>;
};

interface MenuItem {
  icon: string;
  label: string;
  screen?: keyof MoreStackParamList;
  action?: () => void;
  color?: string;
}

export function MoreHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t('settings.account'),
      items: [
        { icon: 'person-outline', label: t('settings.profile'), screen: 'Profile' },
        { icon: 'shield-checkmark-outline', label: t('settings.security'), screen: 'Security' },
        { icon: 'notifications-outline', label: t('settings.notifications') },
      ],
    },
    {
      title: t('settings.work'),
      items: [
        { icon: 'trophy-outline', label: t('settings.performance'), screen: 'Performance' },
        { icon: 'document-outline', label: t('settings.documents'), screen: 'Documents' },
        { icon: 'people-outline', label: t('settings.myTeam') },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        { icon: 'language-outline', label: t('settings.language'), screen: 'Language' },
        { icon: 'moon-outline', label: t('settings.appearance'), screen: 'Settings' },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        { icon: 'help-circle-outline', label: t('settings.help'), screen: 'Help' },
        { icon: 'information-circle-outline', label: t('settings.about'), screen: 'About' },
        { icon: 'chatbubble-outline', label: t('settings.feedback') },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out-outline',
          label: t('settings.logout'),
          action: logout,
          color: theme.colors.error,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* User Card */}
      <TouchableOpacity
        style={[styles.userCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.name}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>
          <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
            {user?.designation} • {user?.department}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.title && (
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
          )}
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex < section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                onPress={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.screen) {
                    navigation.navigate(item.screen);
                  }
                }}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: (item.color || theme.colors.primary) + '20' },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color || theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: item.color || theme.colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* App Version */}
      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
        AuraOS HR v1.0.0
      </Text>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
