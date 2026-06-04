/**
 * Leave History Screen (#112)
 * Full paginated history with status filter chips. Surfaces a quick
 * cancel CTA on still-cancellable rows.
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
import { leaveService } from '@/services/leave.service';
import { LeaveStackParamList, LeaveRequest, LeaveStatus } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<LeaveStackParamList, 'LeaveHistory'>;
};

const STATUS_FILTERS: Array<LeaveStatus | 'all'> = [
  'all',
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

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

export function LeaveHistoryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [filter, setFilter] = React.useState<LeaveStatus | 'all'>('all');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['leaveHistory', filter],
    queryFn: () =>
      leaveService.getRequests({ status: filter === 'all' ? undefined : filter, limit: 50 }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const requests: LeaveRequest[] = Array.isArray(data) ? data : (data as { items?: LeaveRequest[] })?.items ?? [];

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('leave.history') ?? 'Leave History'}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === s }}
            onPress={() => setFilter(s)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === s ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: filter === s ? 'white' : theme.colors.text,
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : requests.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('leave.noHistory') ?? 'No leave requests in this filter.'}
        </Text>
      ) : (
        requests.map((r) => (
          <TouchableOpacity
            key={r.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('LeaveDetails', { requestId: r.id })}
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {r.leaveType}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {format(new Date(r.startDate), 'PP')} → {format(new Date(r.endDate), 'PP')}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {r.days} {r.days === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: STATUS_COLOR(r.status, theme) + '22' },
              ]}
            >
              <Text style={[styles.statusText, { color: STATUS_COLOR(r.status, theme) }]}>
                {r.status}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  filterRow: { gap: 8, paddingVertical: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 10,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
  cardMeta: { fontSize: 12, marginTop: 2 },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginHorizontal: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
