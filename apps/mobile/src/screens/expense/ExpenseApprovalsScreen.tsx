/**
 * Expense Approvals Screen (#112)
 * Manager-side queue for pending expense claims. Approve / reject inline.
 * Reject enforces a ≥ 5 char reason to match the service contract.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { expenseService, type Expense } from '@/services/expense.service';

export function ExpenseApprovalsScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['expenses', 'pending'],
    queryFn: () => expenseService.list({ status: 'PENDING' }),
  });

  const approve = useMutation({
    mutationFn: (id: string) => expenseService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    onError: (err) =>
      Alert.alert(
        t('expenses.actionFailed') ?? 'Action failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const reject = useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      expenseService.reject(input.id, input.reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    onError: (err) =>
      Alert.alert(
        t('expenses.actionFailed') ?? 'Action failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const promptReject = (expense: Expense) => {
    Alert.prompt(
      t('expenses.reject') ?? 'Reject expense',
      `${expense.title} · ${expense.currency} ${expense.amount}`,
      [
        { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') ?? 'Confirm',
          style: 'destructive',
          onPress: (reason?: string) => {
            if (!reason || reason.trim().length < 5) {
              Alert.alert(t('expenses.reasonRequired') ?? 'Reason ≥ 5 chars required');
              return;
            }
            reject.mutate({ id: expense.id, reason });
          },
        },
      ],
      'plain-text'
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('expenses.pending') ?? 'Pending approvals'}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : !data || data.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('expenses.empty') ?? 'Nothing waiting for approval.'}
        </Text>
      ) : (
        data.map((e) => (
          <View
            key={e.id}
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                  {e.title}
                </Text>
                <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                  {e.category} · {format(new Date(e.date), 'PP')}
                </Text>
              </View>
              <Text style={[styles.amount, { color: theme.colors.text }]}>
                {e.currency} {e.amount.toLocaleString()}
              </Text>
            </View>
            {e.description ? (
              <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {e.description}
              </Text>
            ) : null}
            <View style={styles.actionRow}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => approve.mutate(e.id)}
                disabled={approve.isPending}
                style={[styles.actionBtn, { backgroundColor: theme.colors.success }]}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.actionText}>{t('common.approve') ?? 'Approve'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => promptReject(e)}
                disabled={reject.isPending}
                style={[styles.actionBtn, { backgroundColor: theme.colors.error }]}
              >
                <Ionicons name="close" size={16} color="white" />
                <Text style={styles.actionText}>{t('common.reject') ?? 'Reject'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 12, marginTop: 8, lineHeight: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: { color: 'white', fontWeight: '600', marginLeft: 6 },
});
