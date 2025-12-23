/**
 * Attendance History Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { attendanceService } from '@/services/attendance.service';
import { AttendanceRecord, AttendanceStatus } from '@/types';

export function AttendanceHistoryScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendanceHistory', selectedMonth],
    queryFn: () =>
      attendanceService.getHistory({
        startDate: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(selectedMonth), 'yyyy-MM-dd'),
      }),
  });

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return theme.colors.success;
      case 'absent':
        return theme.colors.error;
      case 'late':
        return theme.colors.warning;
      case 'on_leave':
        return theme.colors.info;
      case 'holiday':
      case 'weekend':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={[styles.recordItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.dateColumn}>
        <Text style={[styles.dateDay, { color: theme.colors.text }]}>
          {format(new Date(item.date), 'd')}
        </Text>
        <Text style={[styles.dateMonth, { color: theme.colors.textSecondary }]}>
          {format(new Date(item.date), 'MMM')}
        </Text>
      </View>

      <View style={styles.detailsColumn}>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Ionicons name="log-in-outline" size={16} color={theme.colors.success} />
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {item.checkIn?.time ? format(new Date(item.checkIn.time), 'HH:mm') : '--:--'}
            </Text>
          </View>
          <View style={styles.timeItem}>
            <Ionicons name="log-out-outline" size={16} color={theme.colors.error} />
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {item.checkOut?.time ? format(new Date(item.checkOut.time), 'HH:mm') : '--:--'}
            </Text>
          </View>
        </View>
        <Text style={[styles.workHours, { color: theme.colors.textSecondary }]}>
          {item.workHours ? `${item.workHours.toFixed(1)} hours` : '-'}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(item.status)}20` },
        ]}
      >
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {t(`attendance.status.${item.status}`)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Month Selector */}
      <View style={[styles.monthSelector, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          style={styles.monthArrow}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: theme.colors.text }]}>
          {format(selectedMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            const nextMonth = new Date(selectedMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            if (nextMonth <= new Date()) {
              setSelectedMonth(nextMonth);
            }
          }}
          style={styles.monthArrow}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('attendance.noRecords')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
  },
  monthArrow: {
    padding: 4,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  dateColumn: {
    width: 50,
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateMonth: {
    fontSize: 12,
  },
  detailsColumn: {
    flex: 1,
    marginLeft: 12,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  workHours: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});
