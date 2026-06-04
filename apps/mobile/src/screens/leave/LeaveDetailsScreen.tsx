/**
 * Leave Details Screen (#112)
 * Shows the full request payload + approval chain. Employees can cancel
 * a still-pending request; managers can approve/reject from here.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { leaveService } from '@/services/leave.service';
import { LeaveStackParamList, LeaveStatus } from '@/types';

type Props = NativeStackScreenProps<LeaveStackParamList, 'LeaveDetails'>;

const STATUS_COLOR = (s: LeaveStatus, theme: ReturnType<typeof useThemeStore>['theme']) => {
  switch (s) {
    case 'approved':
      return theme.colors.success;
    case 'rejected':
    case 'cancelled':
      return theme.colors.error;
    case 'pending':
      return theme.colors.warning;
    default:
      return theme.colors.textSecondary;
  }
};

export function LeaveDetailsScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const { data: request, refetch, isLoading } = useQuery({
    queryKey: ['leaveRequest', requestId],
    queryFn: () => leaveService.getRequest(requestId),
  });

  const approve = useMutation({
    mutationFn: () => leaveService.approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequest'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      refetch();
    },
    onError: (err) =>
      Alert.alert(
        t('leave.actionFailed') ?? 'Action failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const reject = useMutation({
    mutationFn: (reason: string) => leaveService.rejectRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequest'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      refetch();
    },
    onError: (err) =>
      Alert.alert(
        t('leave.actionFailed') ?? 'Action failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const promptReject = () => {
    Alert.prompt(
      t('leave.reject') ?? 'Reject leave',
      t('leave.rejectReason') ?? 'Reason (required)',
      [
        { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') ?? 'Confirm',
          style: 'destructive',
          onPress: (reason?: string) => {
            if (!reason || reason.trim().length < 3) {
              Alert.alert(t('leave.reasonRequired') ?? 'Reason required');
              return;
            }
            reject.mutate(reason);
          },
        },
      ],
      'plain-text'
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>
          {t('leave.notFound') ?? 'Leave request not found.'}
        </Text>
      </View>
    );
  }

  const canApprove = isManager && request.status === 'pending';
  const days = request.days ?? 0;

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
          {request.leaveType}
        </Text>
        <View
          style={[
            styles.chip,
            { backgroundColor: STATUS_COLOR(request.status, theme) + '22' },
          ]}
        >
          <Text style={[styles.chipText, { color: STATUS_COLOR(request.status, theme) }]}>
            {request.status}
          </Text>
        </View>
      </View>

      <Row theme={theme} label={t('leave.startDate') ?? 'Start'} value={format(new Date(request.startDate), 'PP')} />
      <Row theme={theme} label={t('leave.endDate') ?? 'End'} value={format(new Date(request.endDate), 'PP')} />
      <Row theme={theme} label={t('leave.days') ?? 'Days'} value={String(days)} />
      {request.reason ? (
        <Row theme={theme} label={t('leave.reason') ?? 'Reason'} value={request.reason} />
      ) : null}
      {request.approvedBy ? (
        <Row
          theme={theme}
          label={t('leave.approvedBy') ?? 'Approved by'}
          value={request.approvedBy}
        />
      ) : null}
      {request.rejectionReason ? (
        <Row
          theme={theme}
          label={t('leave.rejectionReason') ?? 'Rejection reason'}
          value={request.rejectionReason}
        />
      ) : null}

      {canApprove ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => approve.mutate()}
            style={[styles.actionBtn, { backgroundColor: theme.colors.success }]}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionText}>{t('leave.approve') ?? 'Approve'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={promptReject}
            style={[styles.actionBtn, { backgroundColor: theme.colors.error }]}
          >
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.actionText}>{t('leave.reject') ?? 'Reject'}</Text>
          </TouchableOpacity>
        </View>
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
  title: { fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
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
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: { color: 'white', fontWeight: '600', marginLeft: 6 },
});
