/**
 * Leave Home Screen
 * View leave balances and requests
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
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { leaveService } from '@/services/leave.service';
import { LeaveStackParamList, LeaveRequest, LeaveBalance } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<LeaveStackParamList, 'LeaveHome'>;
};

export function LeaveHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch leave balances
  const { data: balances, refetch: refetchBalances } = useQuery({
    queryKey: ['leaveBalances'],
    queryFn: () => leaveService.getBalances(),
  });

  // Fetch recent requests
  const { data: requests, refetch: refetchRequests } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: () => leaveService.getRequests({ limit: 5 }),
  });

  // Fetch pending approvals (for managers)
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => leaveService.getPendingApprovals(),
    enabled: user?.role === 'manager' || user?.role === 'hr',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBalances(), refetchRequests()]);
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'annual':
        return 'sunny-outline';
      case 'sick':
        return 'medkit-outline';
      case 'emergency':
        return 'alert-circle-outline';
      case 'maternity':
      case 'paternity':
        return 'heart-outline';
      default:
        return 'calendar-outline';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Apply Leave Button */}
      <TouchableOpacity
        style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ApplyLeave')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.applyButtonText}>{t('leave.applyLeave')}</Text>
      </TouchableOpacity>

      {/* Pending Approvals (for managers) */}
      {pendingApprovals && pendingApprovals.length > 0 && (
        <TouchableOpacity
          style={[styles.approvalsCard, { backgroundColor: theme.colors.warning + '20' }]}
          onPress={() => navigation.navigate('LeaveApprovals')}
        >
          <View style={styles.approvalsContent}>
            <Ionicons name="hourglass-outline" size={24} color={theme.colors.warning} />
            <View style={styles.approvalsText}>
              <Text style={[styles.approvalsTitle, { color: theme.colors.text }]}>
                {t('leave.pendingApprovals')}
              </Text>
              <Text style={[styles.approvalsCount, { color: theme.colors.warning }]}>
                {pendingApprovals.length} {t('leave.requestsPending')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.warning} />
        </TouchableOpacity>
      )}

      {/* Leave Balances */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('leave.balances')}
      </Text>
      <View style={styles.balancesGrid}>
        {balances?.map((balance, index) => (
          <View
            key={index}
            style={[styles.balanceCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.balanceIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons
                name={getLeaveTypeIcon(balance.leaveType) as any}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.balanceType, { color: theme.colors.textSecondary }]}>
              {t(`leave.types.${balance.leaveType}`)}
            </Text>
            <View style={styles.balanceNumbers}>
              <Text style={[styles.balanceAvailable, { color: theme.colors.text }]}>
                {balance.available}
              </Text>
              <Text style={[styles.balanceTotal, { color: theme.colors.textSecondary }]}>
                /{balance.entitled}
              </Text>
            </View>
            {balance.pending > 0 && (
              <Text style={[styles.pendingText, { color: theme.colors.warning }]}>
                {balance.pending} {t('leave.pending')}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Recent Requests */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('leave.recentRequests')}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
            {t('common.viewAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {requests?.data && requests.data.length > 0 ? (
        requests.data.map((request, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.requestCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.requestLeft}>
              <View style={[styles.requestIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons
                  name={getLeaveTypeIcon(request.leaveType) as any}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.requestDetails}>
                <Text style={[styles.requestType, { color: theme.colors.text }]}>
                  {t(`leave.types.${request.leaveType}`)}
                </Text>
                <Text style={[styles.requestDates, { color: theme.colors.textSecondary }]}>
                  {format(new Date(request.startDate), 'MMM d')} -{' '}
                  {format(new Date(request.endDate), 'MMM d')}
                </Text>
                <Text style={[styles.requestDays, { color: theme.colors.textSecondary }]}>
                  {request.days} {t('common.days')}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(request.status)}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                {t(`leave.status.${request.status}`)}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('leave.noRequests')}
          </Text>
        </View>
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
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginBottom: 16,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  approvalsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  approvalsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalsText: {
    marginLeft: 12,
  },
  approvalsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  approvalsCount: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  balancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  balanceCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceType: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  balanceNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceAvailable: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceTotal: {
    fontSize: 14,
  },
  pendingText: {
    fontSize: 11,
    marginTop: 4,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestDates: {
    fontSize: 12,
    marginTop: 2,
  },
  requestDays: {
    fontSize: 11,
    marginTop: 2,
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
    padding: 32,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
