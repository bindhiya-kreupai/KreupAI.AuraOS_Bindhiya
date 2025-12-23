/**
 * Apply Leave Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, addDays } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { leaveService } from '@/services/leave.service';
import { LeaveStackParamList, LeaveType } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<LeaveStackParamList, 'ApplyLeave'>;
};

const LEAVE_TYPES: LeaveType[] = ['annual', 'sick', 'emergency', 'unpaid'];

export function ApplyLeaveScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const days = differenceInDays(endDate, startDate) + 1;

  const applyMutation = useMutation({
    mutationFn: () =>
      leaveService.applyLeave({
        leaveType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      Alert.alert(t('leave.success'), t('leave.requestSubmitted'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      Alert.alert(t('leave.error'), error.message);
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert(t('leave.error'), t('leave.reasonRequired'));
      return;
    }
    if (days < 1) {
      Alert.alert(t('leave.error'), t('leave.invalidDates'));
      return;
    }
    applyMutation.mutate();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Leave Type */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('leave.leaveType')}
      </Text>
      <View style={styles.typeGrid}>
        {LEAVE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeCard,
              {
                backgroundColor:
                  leaveType === type ? theme.colors.primary : theme.colors.surface,
                borderColor: leaveType === type ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setLeaveType(type)}
          >
            <Text
              style={[
                styles.typeText,
                { color: leaveType === type ? '#fff' : theme.colors.text },
              ]}
            >
              {t(`leave.types.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Selection */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('leave.dates')}
      </Text>
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.dateCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
            {t('leave.startDate')}
          </Text>
          <Text style={[styles.dateValue, { color: theme.colors.text }]}>
            {format(startDate, 'MMM d, yyyy')}
          </Text>
        </TouchableOpacity>

        <Ionicons name="arrow-forward" size={20} color={theme.colors.textSecondary} />

        <TouchableOpacity
          style={[styles.dateCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
            {t('leave.endDate')}
          </Text>
          <Text style={[styles.dateValue, { color: theme.colors.text }]}>
            {format(endDate, 'MMM d, yyyy')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Days Summary */}
      <View style={[styles.daysCard, { backgroundColor: theme.colors.primaryLight }]}>
        <Text style={[styles.daysLabel, { color: theme.colors.primary }]}>
          {t('leave.totalDays')}
        </Text>
        <Text style={[styles.daysValue, { color: theme.colors.primary }]}>
          {days} {t('common.days')}
        </Text>
      </View>

      {/* Reason */}
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {t('leave.reason')}
      </Text>
      <TextInput
        style={[
          styles.reasonInput,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder={t('leave.reasonPlaceholder')}
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
        disabled={applyMutation.isPending}
      >
        {applyMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{t('leave.submit')}</Text>
        )}
      </TouchableOpacity>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) {
              setStartDate(date);
              if (date > endDate) {
                setEndDate(date);
              }
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={startDate}
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) {
              setEndDate(date);
            }
          }}
        />
      )}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  typeCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  daysLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 24,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
