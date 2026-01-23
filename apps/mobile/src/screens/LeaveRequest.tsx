/**
 * Leave Request Screen
 * Submit leave requests with date selection and type picker
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { leaveService } from '@/services/leave.service';

const LEAVE_TYPES = [
  { id: 'annual', label: 'Annual Leave', icon: 'sunny-outline', color: '#f59e0b' },
  { id: 'sick', label: 'Sick Leave', icon: 'medkit-outline', color: '#ef4444' },
  { id: 'personal', label: 'Personal Leave', icon: 'person-outline', color: '#6366f1' },
  { id: 'maternity', label: 'Maternity/Paternity', icon: 'heart-outline', color: '#ec4899' },
  { id: 'unpaid', label: 'Unpaid Leave', icon: 'wallet-outline', color: '#6b7280' },
];

export function LeaveRequest() {
  const { theme } = useThemeStore();
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a leave type');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter start and end dates');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.applyLeave({
        leaveType: selectedType,
        startDate,
        endDate,
        reason,
      });
      Alert.alert('Success', 'Leave request submitted successfully');
      setSelectedType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Request Leave</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Submit a new leave request for approval
        </Text>

        {/* Leave Type Selection */}
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Leave Type</Text>
        <View style={styles.typeGrid}>
          {LEAVE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                { backgroundColor: theme.colors.surface, borderColor: selectedType === type.id ? type.color : theme.colors.border },
                selectedType === type.id && { borderWidth: 2 },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons name={type.icon as any} size={24} color={type.color} />
              <Text style={[styles.typeLabel, { color: theme.colors.text }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Inputs */}
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Dates</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Start Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>End Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        {/* Reason */}
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Reason (Optional)</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
          placeholder="Enter reason for leave..."
          placeholderTextColor={theme.colors.textSecondary}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitText}>Submit Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: { width: '48%', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  typeLabel: { fontSize: 12, marginTop: 6, textAlign: 'center', fontWeight: '500' },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  fieldLabel: { fontSize: 12, marginBottom: 4 },
  input: { height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, borderWidth: 1 },
  textArea: { height: 100, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, marginTop: 24, gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
