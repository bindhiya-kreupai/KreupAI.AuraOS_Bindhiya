/**
 * Attendance Home Screen
 * View attendance status and check in/out
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { attendanceService } from '@/services/attendance.service';
import { AttendanceStackParamList, AttendanceStatus } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<AttendanceStackParamList, 'AttendanceHome'>;
};

export function AttendanceHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's attendance
  const { data: todayAttendance, refetch } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => attendanceService.getTodayAttendance(),
  });

  // Fetch monthly summary
  const { data: monthlySummary } = useQuery({
    queryKey: ['attendanceSummary', currentTime.getMonth() + 1, currentTime.getFullYear()],
    queryFn: () =>
      attendanceService.getSummary(currentTime.getMonth() + 1, currentTime.getFullYear()),
  });

  // Check in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        location = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy || undefined,
        };
      }
      return attendanceService.checkIn({ location, method: 'app' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      Alert.alert(t('attendance.success'), t('attendance.checkedIn'));
    },
    onError: (error) => {
      Alert.alert(t('attendance.error'), error.message);
    },
  });

  // Check out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        location = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy || undefined,
        };
      }
      return attendanceService.checkOut({ location, method: 'app' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      Alert.alert(t('attendance.success'), t('attendance.checkedOut'));
    },
    onError: (error) => {
      Alert.alert(t('attendance.error'), error.message);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCheckedOut = !!todayAttendance?.checkOut;
  const canCheckIn = !todayAttendance?.checkIn;
  const isLoading = checkInMutation.isPending || checkOutMutation.isPending;

  const handleCheckAction = () => {
    if (isLoading) return;

    if (canCheckIn) {
      checkInMutation.mutate();
    } else if (isCheckedIn) {
      Alert.alert(
        t('attendance.confirmCheckOut'),
        t('attendance.confirmCheckOutMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.confirm'), onPress: () => checkOutMutation.mutate() },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Clock Display */}
      <View style={[styles.clockCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.currentTime}>{format(currentTime, 'HH:mm:ss')}</Text>
        <Text style={styles.currentDate}>{format(currentTime, 'EEEE, MMMM d, yyyy')}</Text>

        {/* Check In/Out Button */}
        {!isCheckedOut && (
          <TouchableOpacity
            style={[styles.checkButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleCheckAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : (
              <>
                <Ionicons
                  name={isCheckedIn ? 'log-out' : 'log-in'}
                  size={28}
                  color="#3B82F6"
                />
                <Text style={styles.checkButtonText}>
                  {isCheckedIn ? t('attendance.checkOut') : t('attendance.checkIn')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isCheckedOut && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.completedText}>{t('attendance.dayCompleted')}</Text>
          </View>
        )}
      </View>

      {/* Today's Record */}
      <View style={[styles.todayCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('attendance.todayRecord')}
        </Text>

        <View style={styles.recordRow}>
          <View style={styles.recordItem}>
            <View style={[styles.recordIcon, { backgroundColor: `${theme.colors.success}20` }]}>
              <Ionicons name="log-in" size={20} color={theme.colors.success} />
            </View>
            <Text style={[styles.recordLabel, { color: theme.colors.textSecondary }]}>
              {t('attendance.checkIn')}
            </Text>
            <Text style={[styles.recordValue, { color: theme.colors.text }]}>
              {todayAttendance?.checkIn?.time
                ? format(new Date(todayAttendance.checkIn.time), 'HH:mm')
                : '--:--'}
            </Text>
          </View>

          <View style={styles.recordItem}>
            <View style={[styles.recordIcon, { backgroundColor: `${theme.colors.error}20` }]}>
              <Ionicons name="log-out" size={20} color={theme.colors.error} />
            </View>
            <Text style={[styles.recordLabel, { color: theme.colors.textSecondary }]}>
              {t('attendance.checkOut')}
            </Text>
            <Text style={[styles.recordValue, { color: theme.colors.text }]}>
              {todayAttendance?.checkOut?.time
                ? format(new Date(todayAttendance.checkOut.time), 'HH:mm')
                : '--:--'}
            </Text>
          </View>

          <View style={styles.recordItem}>
            <View style={[styles.recordIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.recordLabel, { color: theme.colors.textSecondary }]}>
              {t('attendance.workHours')}
            </Text>
            <Text style={[styles.recordValue, { color: theme.colors.text }]}>
              {todayAttendance?.workHours
                ? `${todayAttendance.workHours.toFixed(1)}h`
                : '--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Monthly Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('attendance.monthlySummary')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AttendanceHistory')}>
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
              {t('common.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryItem
            label={t('attendance.present')}
            value={monthlySummary?.present || 0}
            color={theme.colors.success}
            theme={theme}
          />
          <SummaryItem
            label={t('attendance.absent')}
            value={monthlySummary?.absent || 0}
            color={theme.colors.error}
            theme={theme}
          />
          <SummaryItem
            label={t('attendance.late')}
            value={monthlySummary?.late || 0}
            color={theme.colors.warning}
            theme={theme}
          />
          <SummaryItem
            label={t('attendance.onLeave')}
            value={monthlySummary?.onLeave || 0}
            color={theme.colors.info}
            theme={theme}
          />
        </View>

        <View style={[styles.hoursRow, { borderTopColor: theme.colors.border }]}>
          <View style={styles.hoursItem}>
            <Text style={[styles.hoursLabel, { color: theme.colors.textSecondary }]}>
              {t('attendance.totalHours')}
            </Text>
            <Text style={[styles.hoursValue, { color: theme.colors.text }]}>
              {monthlySummary?.totalHours?.toFixed(1) || '0'}h
            </Text>
          </View>
          <View style={styles.hoursItem}>
            <Text style={[styles.hoursLabel, { color: theme.colors.textSecondary }]}>
              {t('attendance.overtime')}
            </Text>
            <Text style={[styles.hoursValue, { color: theme.colors.success }]}>
              {monthlySummary?.overtime?.toFixed(1) || '0'}h
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SummaryItem({
  label,
  value,
  color,
  theme,
}: {
  label: string;
  value: number;
  color: string;
  theme: any;
}) {
  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: color }]} />
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  clockCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 20,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  todayCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordItem: {
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  hoursItem: {
    flex: 1,
    alignItems: 'center',
  },
  hoursLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  hoursValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});
