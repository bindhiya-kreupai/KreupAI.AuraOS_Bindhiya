/**
 * Attendance Details Screen (#112)
 * Drill-down from the history list. Shows clock-in/out times, breaks,
 * worked hours, and any regularization comments on the record.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';
import { AttendanceStackParamList } from '@/types';

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workedHours?: number;
  breakMinutes?: number;
  overtimeHours?: number;
  status: string;
  regularizationStatus?: string;
  regularizationReason?: string;
  comments?: string;
}

type Props = NativeStackScreenProps<AttendanceStackParamList, 'AttendanceDetails'>;

const STATUS_COLOR = (status: string, theme: ReturnType<typeof useThemeStore>['theme']) => {
  switch (status.toLowerCase()) {
    case 'present':
      return theme.colors.success;
    case 'absent':
    case 'leave':
      return theme.colors.error;
    case 'half_day':
    case 'late':
      return theme.colors.warning;
    default:
      return theme.colors.textSecondary;
  }
};

export function AttendanceDetailsScreen({ route }: Props) {
  const { recordId } = route.params;
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const { data: record, isLoading } = useQuery({
    queryKey: ['attendance', 'detail', recordId],
    queryFn: () =>
      apiService.get<AttendanceRecord>(`/v1/attendance/records/${recordId}`),
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>
          {t('attendance.notFound') ?? 'Record not found.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {format(new Date(record.date), 'PPP')}
        </Text>
        <View
          style={[
            styles.chip,
            { backgroundColor: STATUS_COLOR(record.status, theme) + '22' },
          ]}
        >
          <Text style={[styles.chipText, { color: STATUS_COLOR(record.status, theme) }]}>
            {record.status}
          </Text>
        </View>
      </View>

      <Row
        theme={theme}
        label={t('attendance.clockIn') ?? 'Clock in'}
        value={record.clockIn ? format(new Date(record.clockIn), 'p') : '—'}
      />
      <Row
        theme={theme}
        label={t('attendance.clockOut') ?? 'Clock out'}
        value={record.clockOut ? format(new Date(record.clockOut), 'p') : '—'}
      />
      <Row
        theme={theme}
        label={t('attendance.workedHours') ?? 'Worked hours'}
        value={record.workedHours?.toFixed(2) ?? '—'}
      />
      <Row
        theme={theme}
        label={t('attendance.breakMinutes') ?? 'Break minutes'}
        value={record.breakMinutes != null ? String(record.breakMinutes) : '—'}
      />
      {record.overtimeHours != null && record.overtimeHours > 0 ? (
        <Row
          theme={theme}
          label={t('attendance.overtime') ?? 'Overtime hours'}
          value={record.overtimeHours.toFixed(2)}
        />
      ) : null}
      {record.regularizationStatus ? (
        <Row
          theme={theme}
          label={t('attendance.regularization') ?? 'Regularization'}
          value={record.regularizationStatus}
        />
      ) : null}
      {record.regularizationReason ? (
        <Row
          theme={theme}
          label={t('attendance.regularizationReason') ?? 'Reason'}
          value={record.regularizationReason}
        />
      ) : null}
      {record.comments ? (
        <Row
          theme={theme}
          label={t('attendance.comments') ?? 'Comments'}
          value={record.comments}
        />
      ) : null}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 14, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
});
