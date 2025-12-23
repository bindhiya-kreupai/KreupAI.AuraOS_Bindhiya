/**
 * Profile Screen
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const profileFields = [
    { label: t('profile.employeeId'), value: user?.employeeId, icon: 'id-card-outline' },
    { label: t('profile.email'), value: user?.email, icon: 'mail-outline' },
    { label: t('profile.department'), value: user?.department, icon: 'business-outline' },
    { label: t('profile.designation'), value: user?.designation, icon: 'briefcase-outline' },
    { label: t('profile.role'), value: user?.role, icon: 'shield-outline' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.avatarLarge, { backgroundColor: theme.colors.primaryLight }]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          )}
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.name}
        </Text>
        <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
          {user?.designation}
        </Text>

        <TouchableOpacity style={[styles.editButton, { borderColor: theme.colors.border }]}>
          <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.editText, { color: theme.colors.primary }]}>
            {t('profile.editProfile')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Details */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {t('profile.details')}
      </Text>
      <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
        {profileFields.map((field, index) => (
          <View
            key={index}
            style={[
              styles.fieldItem,
              index < profileFields.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.fieldIcon}>
              <Ionicons name={field.icon as any} size={20} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                {field.label}
              </Text>
              <Text style={[styles.fieldValue, { color: theme.colors.text }]}>
                {field.value || '-'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="key-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            {t('profile.changePassword')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            {t('profile.documents')}
          </Text>
        </TouchableOpacity>
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
  headerCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editText: {
    fontSize: 14,
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  detailsCard: {
    borderRadius: 12,
    marginBottom: 24,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  fieldIcon: {
    width: 32,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
  },
  fieldValue: {
    fontSize: 15,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
