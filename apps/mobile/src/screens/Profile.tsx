/**
 * Profile Screen
 * View and edit employee profile information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';

interface ProfileField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
  icon: string;
}

export function Profile() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState<ProfileField[]>([
    { key: 'name', label: 'Full Name', value: user?.name || 'John Doe', editable: true, icon: 'person-outline' },
    { key: 'email', label: 'Email', value: user?.email || 'john.doe@company.com', editable: false, icon: 'mail-outline' },
    { key: 'phone', label: 'Phone', value: '+1 555-0123', editable: true, icon: 'call-outline' },
    { key: 'department', label: 'Department', value: 'Engineering', editable: false, icon: 'business-outline' },
    { key: 'position', label: 'Position', value: 'Senior Engineer', editable: false, icon: 'briefcase-outline' },
    { key: 'employeeId', label: 'Employee ID', value: 'EMP-001', editable: false, icon: 'id-card-outline' },
    { key: 'joinDate', label: 'Join Date', value: 'March 15, 2021', editable: false, icon: 'calendar-outline' },
    { key: 'location', label: 'Office Location', value: 'San Francisco, CA', editable: false, icon: 'location-outline' },
    { key: 'manager', label: 'Reporting To', value: 'Jane Smith', editable: false, icon: 'people-outline' },
    { key: 'emergency', label: 'Emergency Contact', value: '+1 555-9999', editable: true, icon: 'alert-circle-outline' },
  ]);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const updateField = (key: string, value: string) => {
    setFields(fields.map((f) => f.key === key ? { ...f, value } : f));
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(fields[0].value)}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{fields[0].value}</Text>
          <Text style={[styles.role, { color: theme.colors.textSecondary }]}>
            {fields.find((f) => f.key === 'position')?.value} - {fields.find((f) => f.key === 'department')?.value}
          </Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: isEditing ? theme.colors.success : theme.colors.primary }]}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={16} color="#fff" />
            <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Fields */}
        <View style={[styles.fieldsCard, { backgroundColor: theme.colors.surface }]}>
          {fields.map((field, index) => (
            <View
              key={field.key}
              style={[styles.fieldRow, index < fields.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
            >
              <View style={styles.fieldLeft}>
                <Ionicons name={field.icon as any} size={18} color={theme.colors.primary} />
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{field.label}</Text>
              </View>
              {isEditing && field.editable ? (
                <TextInput
                  style={[styles.fieldInput, { color: theme.colors.text, borderColor: theme.colors.primary }]}
                  value={field.value}
                  onChangeText={(val) => updateField(field.key, val)}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: theme.colors.text }]}>{field.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>My Documents</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: 'bold' },
  role: { fontSize: 14, marginTop: 4 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  editButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  fieldsCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  fieldLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldLabel: { fontSize: 13 },
  fieldValue: { fontSize: 13, fontWeight: '500', maxWidth: '50%', textAlign: 'right' },
  fieldInput: { fontSize: 13, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, minWidth: 120, textAlign: 'right' },
  actionsSection: { gap: 8 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12 },
  actionText: { flex: 1, fontSize: 14, fontWeight: '500' },
});
