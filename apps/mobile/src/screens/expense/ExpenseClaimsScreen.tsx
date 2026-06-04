/**
 * Expense Claims Screen (#112)
 * Employee-side expense claim list with submit CTA. Closes the §15.2 mobile
 * happy path missing surface — together with the new ExpenseApprovalsScreen
 * it covers both sides of the workflow.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import {
  expenseService,
  type Expense,
  type ExpenseStatus,
} from '@/services/expense.service';
import { ExpenseStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<ExpenseStackParamList, 'ExpenseHome'>;
};

const STATUS_COLOR = (s: ExpenseStatus, theme: ReturnType<typeof useThemeStore>['theme']) => {
  switch (s) {
    case 'APPROVED':
    case 'PAID':
      return theme.colors.success;
    case 'REJECTED':
      return theme.colors.error;
    case 'PENDING':
    default:
      return theme.colors.warning;
  }
};

const CATEGORY_ICON = (c: Expense['category']): keyof typeof Ionicons.glyphMap => {
  switch (c) {
    case 'TRAVEL':
      return 'airplane-outline';
    case 'MEALS':
      return 'restaurant-outline';
    case 'ACCOMMODATION':
      return 'bed-outline';
    case 'OFFICE':
      return 'briefcase-outline';
    case 'TRAINING':
      return 'school-outline';
    default:
      return 'cash-outline';
  }
};

export function ExpenseClaimsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['expenses', 'mine'],
    queryFn: () => expenseService.list(),
  });

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
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          {t('expenses.title') ?? 'My Expenses'}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('expenses.new') ?? 'New expense'}
          onPress={() => navigation.navigate('SubmitExpense')}
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={styles.submitBtnText}>{t('expenses.new') ?? 'New'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : !data || data.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('expenses.empty') ?? 'No expense claims yet.'}
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
            <Ionicons
              name={CATEGORY_ICON(e.category)}
              size={22}
              color={theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {e.title}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {e.category} · {format(new Date(e.date), 'PP')}
              </Text>
              <Text style={[styles.cardAmount, { color: theme.colors.text }]}>
                {e.currency} {e.amount.toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                { backgroundColor: STATUS_COLOR(e.status, theme) + '22' },
              ]}
            >
              <Text style={[styles.chipText, { color: STATUS_COLOR(e.status, theme) }]}>
                {e.status}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: { fontSize: 22, fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  submitBtnText: { color: 'white', fontWeight: '600', marginLeft: 4 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, marginTop: 2 },
  cardAmount: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '700' },
});
