/**
 * Team View Screen (#112)
 * Manager glance at their direct reports: today's attendance, pending
 * leave count, recent perf rating. Falls back gracefully on missing data.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';

interface TeamMember {
  id: string;
  name: string;
  designation?: string;
  todayStatus?: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'REMOTE' | 'UNKNOWN';
  pendingLeaveCount: number;
  pendingExpenseCount: number;
  lastRating?: 'EXCEEDS' | 'MEETS' | 'BELOW' | null;
}

const STATUS_ICON = (s?: TeamMember['todayStatus']): keyof typeof Ionicons.glyphMap => {
  switch (s) {
    case 'PRESENT':
      return 'checkmark-circle';
    case 'REMOTE':
      return 'wifi';
    case 'LEAVE':
      return 'sunny-outline';
    case 'ABSENT':
      return 'close-circle';
    default:
      return 'help-circle-outline';
  }
};

const STATUS_COLOR = (
  s?: TeamMember['todayStatus'],
  theme?: ReturnType<typeof useThemeStore>['theme']
) => {
  if (!theme) return undefined;
  switch (s) {
    case 'PRESENT':
    case 'REMOTE':
      return theme.colors.success;
    case 'ABSENT':
      return theme.colors.error;
    case 'LEAVE':
      return theme.colors.warning;
    default:
      return theme.colors.textSecondary;
  }
};

const RATING_COLOR = (
  r: TeamMember['lastRating'],
  theme: ReturnType<typeof useThemeStore>['theme']
) => {
  switch (r) {
    case 'EXCEEDS':
      return theme.colors.success;
    case 'MEETS':
      return theme.colors.primary;
    case 'BELOW':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

export function TeamViewScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['team', 'view'],
    queryFn: () => apiService.get<{ items: TeamMember[] }>(`/v1/team/manager-view`),
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
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('team.title') ?? 'My Team'}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : data?.items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('team.empty') ?? 'No direct reports.'}
        </Text>
      ) : (
        data?.items.map((m) => (
          <View
            key={m.id}
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.left}>
                <Ionicons
                  name={STATUS_ICON(m.todayStatus)}
                  size={22}
                  color={STATUS_COLOR(m.todayStatus, theme)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                  {m.name}
                </Text>
                {m.designation ? (
                  <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                    {m.designation}
                  </Text>
                ) : null}
              </View>
              {m.lastRating ? (
                <View
                  style={[
                    styles.ratingChip,
                    { backgroundColor: RATING_COLOR(m.lastRating, theme) + '22' },
                  ]}
                >
                  <Text
                    style={[styles.ratingText, { color: RATING_COLOR(m.lastRating, theme) }]}
                  >
                    {m.lastRating}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.statsRow}>
              {m.pendingLeaveCount > 0 ? (
                <View style={styles.stat}>
                  <Ionicons name="sunny-outline" size={14} color={theme.colors.warning} />
                  <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                    {m.pendingLeaveCount} {t('team.pendingLeave') ?? 'pending leave'}
                  </Text>
                </View>
              ) : null}
              {m.pendingExpenseCount > 0 ? (
                <View style={styles.stat}>
                  <Ionicons name="cash-outline" size={14} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                    {m.pendingExpenseCount} {t('team.pendingExpense') ?? 'pending expense'}
                  </Text>
                </View>
              ) : null}
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
    marginTop: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  left: { marginRight: 12 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  ratingChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  ratingText: { fontSize: 10, fontWeight: '700' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11 },
});
