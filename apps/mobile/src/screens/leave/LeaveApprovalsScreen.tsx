/**
 * Leave Approvals Screen (for managers)
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { leaveService } from '@/services/leave.service';
import { LeaveRequest } from '@/types';

export function LeaveApprovalsScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const { data: pendingApprovals, isLoading, refetch } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => leaveService.getPendingApprovals(),
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => leaveService.approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      Alert.alert(t('leave.success'), t('leave.requestApproved'));
    },
    onError: (error) => {
      Alert.alert(t('leave.error'), error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      leaveService.rejectRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      Alert.alert(t('leave.success'), t('leave.requestRejected'));
    },
    onError: (error) => {
      Alert.alert(t('leave.error'), error.message);
    },
  });

  const handleApprove = (request: LeaveRequest) => {
    Alert.alert(t('leave.confirmApprove'), t('leave.confirmApproveMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.approve'), onPress: () => approveMutation.mutate(request.id) },
    ]);
  };

  const handleReject = (request: LeaveRequest) => {
    Alert.prompt(
      t('leave.confirmReject'),
      t('leave.enterRejectionReason'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.reject'),
          style: 'destructive',
          onPress: (reason) => {
            if (reason) {
              rejectMutation.mutate({ requestId: request.id, reason });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderItem = ({ item }: { item: LeaveRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.requestHeader}>
        <View style={styles.employeeInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {(item as any).employeeName?.charAt(0) || 'E'}
            </Text>
          </View>
          <View>
            <Text style={[styles.employeeName, { color: theme.colors.text }]}>
              {(item as any).employeeName || 'Employee'}
            </Text>
            <Text style={[styles.leaveType, { color: theme.colors.textSecondary }]}>
              {t(`leave.types.${item.leaveType}`)}
            </Text>
          </View>
        </View>
        <Text style={[styles.appliedDate, { color: theme.colors.textSecondary }]}>
          {format(new Date(item.appliedOn), 'MMM d')}
        </Text>
      </View>

      <View style={styles.dateInfo}>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {format(new Date(item.startDate), 'MMM d')} -{' '}
            {format(new Date(item.endDate), 'MMM d, yyyy')}
          </Text>
        </View>
        <Text style={[styles.daysText, { color: theme.colors.primary }]}>
          {item.days} {t('common.days')}
        </Text>
      </View>

      {item.reason && (
        <Text style={[styles.reason, { color: theme.colors.textSecondary }]}>
          "{item.reason}"
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.rejectButton, { borderColor: theme.colors.error }]}
          onPress={() => handleReject(item)}
          disabled={rejectMutation.isPending}
        >
          <Ionicons name="close" size={18} color={theme.colors.error} />
          <Text style={[styles.rejectText, { color: theme.colors.error }]}>
            {t('common.reject')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveButton, { backgroundColor: theme.colors.success }]}
          onPress={() => handleApprove(item)}
          disabled={approveMutation.isPending}
        >
          {approveMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.approveText}>{t('common.approve')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      data={pendingApprovals || []}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshing={isLoading}
      onRefresh={refetch}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.success} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {t('leave.allCaughtUp')}
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('leave.noPendingApprovals')}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  leaveType: {
    fontSize: 12,
    marginTop: 2,
  },
  appliedDate: {
    fontSize: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reason: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
  },
  approveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
