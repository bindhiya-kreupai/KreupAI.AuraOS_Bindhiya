/**
 * Claim Details Screen (#112)
 * Shows a single benefits claim with full EOB breakdown + manager actions
 * (approve / reject / request-info / mark-paid). Action visibility is gated
 * by user role — employees see the read-only view; managers + HR get CTAs.
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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  benefitsService,
  type BenefitsClaim,
  type BenefitsClaimStatus,
} from '@/services/benefits.service';
import { BenefitsStackParamList } from '@/types';

type Props = NativeStackScreenProps<BenefitsStackParamList, 'ClaimDetails'>;

const STATUS_COLOR = (
  status: BenefitsClaimStatus,
  theme: ReturnType<typeof useThemeStore>['theme']
) => {
  switch (status) {
    case 'APPROVED':
    case 'PAID':
      return theme.colors.success;
    case 'PARTIALLY_APPROVED':
    case 'PENDING_INFO':
      return theme.colors.warning;
    case 'REJECTED':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

export function ClaimDetailsScreen({ route, navigation }: Props) {
  const { claimId } = route.params;
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const [refreshing, setRefreshing] = React.useState(false);

  const { data: claim, refetch, isLoading } = useQuery({
    queryKey: ['benefits', 'claim', claimId],
    queryFn: async () => {
      // The list endpoint returns the full record; we filter to this id.
      // Production would expose GET /benefits/claims/[id] but the list
      // response is currently the canonical surface.
      const list = await benefitsService.getClaims({ limit: 200 });
      return list.items.find((c) => c.id === claimId);
    },
  });

  const transition = useMutation({
    mutationFn: (input: {
      action: 'approve' | 'reject' | 'requestInfo' | 'markPaid';
      payload?: Record<string, unknown>;
    }) => benefitsService.transitionClaim(claimId, input.action, input.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      refetch();
    },
    onError: (err) =>
      Alert.alert(
        t('benefits.actionFailed') ?? 'Action failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>
          {t('benefits.claimNotFound') ?? 'Claim not found.'}
        </Text>
      </View>
    );
  }

  const promptApprove = () => {
    Alert.prompt(
      t('benefits.approveTitle') ?? 'Approve claim',
      t('benefits.approveSubtitle') ?? 'Enter approved amount',
      [
        { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') ?? 'Confirm',
          onPress: (value?: string) => {
            const amount = Number(value);
            if (!Number.isFinite(amount) || amount <= 0) {
              Alert.alert(t('benefits.invalidAmount') ?? 'Invalid amount');
              return;
            }
            transition.mutate({
              action: 'approve',
              payload: { approvedAmount: amount },
            });
          },
        },
      ],
      'plain-text',
      String(claim.claimAmount)
    );
  };

  const promptReject = () => {
    Alert.prompt(
      t('benefits.rejectTitle') ?? 'Reject claim',
      t('benefits.rejectSubtitle') ?? 'Reason (≥ 5 chars)',
      [
        { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') ?? 'Confirm',
          style: 'destructive',
          onPress: (reason?: string) => {
            if (!reason || reason.trim().length < 5) {
              Alert.alert(t('benefits.reasonRequired') ?? 'Reason ≥ 5 chars required');
              return;
            }
            transition.mutate({ action: 'reject', payload: { reason } });
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.claimNo, { color: theme.colors.text }]}>
          {claim.claimNumber}
        </Text>
        <View
          style={[
            styles.chip,
            { backgroundColor: STATUS_COLOR(claim.status, theme) + '22' },
          ]}
        >
          <Text style={[styles.chipText, { color: STATUS_COLOR(claim.status, theme) }]}>
            {claim.status}
          </Text>
        </View>
      </View>

      <Row theme={theme} label={t('benefits.category') ?? 'Category'} value={claim.claimType} />
      <Row
        theme={theme}
        label={t('benefits.claimDate') ?? 'Claim date'}
        value={format(new Date(claim.claimDate), 'PP')}
      />
      <Row
        theme={theme}
        label={t('benefits.serviceDate') ?? 'Service date'}
        value={format(new Date(claim.serviceDate), 'PP')}
      />
      {claim.providerName ? (
        <Row theme={theme} label={t('benefits.provider') ?? 'Provider'} value={claim.providerName} />
      ) : null}
      <Row
        theme={theme}
        label={t('benefits.amount') ?? 'Claim amount'}
        value={claim.claimAmount.toLocaleString()}
      />
      {claim.approvedAmount !== undefined && claim.approvedAmount !== null ? (
        <Row
          theme={theme}
          label={t('benefits.approvedAmount') ?? 'Approved amount'}
          value={claim.approvedAmount.toLocaleString()}
        />
      ) : null}
      {claim.paidAmount !== undefined && claim.paidAmount !== null ? (
        <Row
          theme={theme}
          label={t('benefits.paidAmount') ?? 'Paid amount'}
          value={claim.paidAmount.toLocaleString()}
        />
      ) : null}
      {claim.rejectionReason ? (
        <Row
          theme={theme}
          label={t('benefits.rejectionReason') ?? 'Rejection reason'}
          value={claim.rejectionReason}
        />
      ) : null}

      {isManager && claim.status === 'SUBMITTED' ? (
        <View style={styles.actionRow}>
          <ActionButton
            theme={theme}
            icon="play"
            label={t('benefits.startReview') ?? 'Start review'}
            onPress={() => transition.mutate({ action: 'requestInfo' as never, payload: {} })}
            color={theme.colors.primary}
          />
        </View>
      ) : null}

      {isManager && (claim.status === 'UNDER_REVIEW' || claim.status === 'PENDING_INFO') ? (
        <View style={styles.actionRow}>
          <ActionButton
            theme={theme}
            icon="checkmark"
            label={t('benefits.approve') ?? 'Approve'}
            onPress={promptApprove}
            color={theme.colors.success}
          />
          <ActionButton
            theme={theme}
            icon="close"
            label={t('benefits.reject') ?? 'Reject'}
            onPress={promptReject}
            color={theme.colors.error}
          />
        </View>
      ) : null}

      {isManager &&
      (claim.status === 'APPROVED' || claim.status === 'PARTIALLY_APPROVED') ? (
        <View style={styles.actionRow}>
          <ActionButton
            theme={theme}
            icon="cash-outline"
            label={t('benefits.markPaid') ?? 'Mark paid'}
            onPress={() =>
              transition.mutate({
                action: 'markPaid',
                payload: { paymentMethod: 'BANK_TRANSFER' },
              })
            }
            color={theme.colors.primary}
          />
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
  value: string | number;
}) {
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}>
      <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text }]}>{String(value)}</Text>
    </View>
  );
}

function ActionButton({
  theme,
  icon,
  label,
  onPress,
  color,
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.actionBtn, { backgroundColor: color }]}
    >
      <Ionicons name={icon} size={16} color="white" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
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
  claimNo: { fontSize: 18, fontWeight: '700' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 14, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: { color: 'white', fontWeight: '600', marginLeft: 6 },
});
