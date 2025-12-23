/**
 * Dashboard Home Screen
 * Main dashboard with key metrics and quick actions
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { attendanceService } from '@/services/attendance.service';
import { leaveService } from '@/services/leave.service';
import { DashboardStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>;
};

export function DashboardHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  // Fetch today's attendance
  const {
    data: todayAttendance,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => attendanceService.getTodayAttendance(),
  });

  // Fetch leave balances
  const {
    data: leaveBalances,
    isLoading: leaveLoading,
    refetch: refetchLeave,
  } = useQuery({
    queryKey: ['leaveBalances'],
    queryFn: () => leaveService.getBalances(),
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAttendance(), refetchLeave()]);
    setRefreshing(false);
  };

  const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCheckedOut = !!todayAttendance?.checkOut;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <View>
            <Text style={[styles.greetingText, { color: theme.colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <View style={[styles.notificationBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Today's Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              {t('dashboard.todayStatus')}
            </Text>
            <Text style={[styles.statusDate, { color: theme.colors.textSecondary }]}>
              {format(new Date(), 'EEEE, MMM d')}
            </Text>
          </View>

          <View style={styles.statusContent}>
            <View style={styles.timeCard}>
              <Ionicons name="log-in-outline" size={24} color={theme.colors.success} />
              <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
                {t('attendance.checkIn')}
              </Text>
              <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                {todayAttendance?.checkIn?.time || '--:--'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.timeCard}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
              <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
                {t('attendance.checkOut')}
              </Text>
              <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                {todayAttendance?.checkOut?.time || '--:--'}
              </Text>
            </View>
          </View>

          {/* Quick Check In/Out Button */}
          {!isCheckedOut && (
            <TouchableOpacity
              style={[
                styles.checkButton,
                { backgroundColor: isCheckedIn ? theme.colors.error : theme.colors.success },
              ]}
            >
              <Ionicons
                name={isCheckedIn ? 'log-out' : 'log-in'}
                size={20}
                color="#fff"
              />
              <Text style={styles.checkButtonText}>
                {isCheckedIn ? t('attendance.checkOut') : t('attendance.checkIn')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('dashboard.quickActions')}
        </Text>
        <View style={styles.quickActions}>
          {[
            { icon: 'calendar-outline', label: t('dashboard.applyLeave'), screen: 'ApplyLeave' },
            { icon: 'document-text-outline', label: t('dashboard.viewPayslip'), screen: 'PayrollHome' },
            { icon: 'time-outline', label: t('dashboard.attendance'), screen: 'AttendanceHome' },
            { icon: 'people-outline', label: t('dashboard.myTeam'), screen: 'TeamView' },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name={action.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leave Balances */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('dashboard.leaveBalances')}
        </Text>
        <View style={styles.leaveBalances}>
          {leaveBalances?.slice(0, 4).map((balance, index) => (
            <View
              key={index}
              style={[styles.leaveCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.leaveType, { color: theme.colors.textSecondary }]}>
                {t(`leave.types.${balance.leaveType}`)}
              </Text>
              <Text style={[styles.leaveBalance, { color: theme.colors.text }]}>
                {balance.available}
              </Text>
              <Text style={[styles.leaveDays, { color: theme.colors.textSecondary }]}>
                {t('common.days')}
              </Text>
            </View>
          ))}
        </View>

        {/* Upcoming */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('dashboard.upcoming')}
        </Text>
        <View style={[styles.upcomingCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.upcomingItem}>
            <View style={[styles.upcomingDot, { backgroundColor: theme.colors.warning }]} />
            <View style={styles.upcomingContent}>
              <Text style={[styles.upcomingTitle, { color: theme.colors.text }]}>
                Performance Review
              </Text>
              <Text style={[styles.upcomingDate, { color: theme.colors.textSecondary }]}>
                Dec 25, 2024
              </Text>
            </View>
          </View>
          <View style={styles.upcomingItem}>
            <View style={[styles.upcomingDot, { backgroundColor: theme.colors.success }]} />
            <View style={styles.upcomingContent}>
              <Text style={[styles.upcomingTitle, { color: theme.colors.text }]}>
                Christmas Holiday
              </Text>
              <Text style={[styles.upcomingDate, { color: theme.colors.textSecondary }]}>
                Dec 25, 2024
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDate: {
    fontSize: 14,
  },
  statusContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeCard: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  leaveBalances: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  leaveCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  leaveType: {
    fontSize: 12,
    marginBottom: 4,
  },
  leaveBalance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  leaveDays: {
    fontSize: 12,
  },
  upcomingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingDate: {
    fontSize: 12,
    marginTop: 2,
  },
});
