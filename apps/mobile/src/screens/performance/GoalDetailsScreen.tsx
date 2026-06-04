/**
 * Goal Details Screen (#112)
 * Drill-down from the Performance screen. Shows a single goal with progress,
 * key results, manager comments, and a self-update CTA for the progress %.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';
import { MoreStackParamList } from '@/types';

interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  weight?: number;
  progressPct: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  keyResults?: Array<{ id: string; title: string; achieved: boolean }>;
  managerComments?: string;
}

type Props = NativeStackScreenProps<MoreStackParamList, 'GoalDetails'>;

const STATUS_COLOR = (s: Goal['status'], theme: ReturnType<typeof useThemeStore>['theme']) => {
  switch (s) {
    case 'COMPLETED':
      return theme.colors.success;
    case 'IN_PROGRESS':
      return theme.colors.primary;
    case 'AT_RISK':
      return theme.colors.warning;
    case 'CANCELLED':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

export function GoalDetailsScreen({ route }: Props) {
  const { goalId } = route.params;
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => apiService.get<Goal>(`/v1/performance/goals/${goalId}`),
  });

  const updateProgress = useMutation({
    mutationFn: (pct: number) =>
      apiService.put(`/v1/performance/goals/${goalId}`, { progressPct: pct }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['performance'] });
    },
    onError: (err) =>
      Alert.alert(
        t('performance.updateFailed') ?? 'Update failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const promptUpdate = () => {
    Alert.prompt(
      t('performance.updateProgress') ?? 'Update progress',
      t('performance.updateProgressHint') ?? 'Enter percentage (0-100)',
      [
        { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') ?? 'Confirm',
          onPress: (value?: string) => {
            const pct = Number(value);
            if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
              Alert.alert(t('performance.invalidPct') ?? 'Enter 0-100');
              return;
            }
            updateProgress.mutate(Math.round(pct));
          },
        },
      ],
      'plain-text',
      String(goal?.progressPct ?? 0)
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>
          {t('performance.notFound') ?? 'Goal not found.'}
        </Text>
      </View>
    );
  }

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
        <Text style={[styles.title, { color: theme.colors.text }]}>{goal.title}</Text>
        <View
          style={[
            styles.chip,
            { backgroundColor: STATUS_COLOR(goal.status, theme) + '22' },
          ]}
        >
          <Text style={[styles.chipText, { color: STATUS_COLOR(goal.status, theme) }]}>
            {goal.status}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.progressCard,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
          {t('performance.progress') ?? 'Progress'}
        </Text>
        <Text style={[styles.progressValue, { color: theme.colors.text }]}>
          {goal.progressPct}%
        </Text>
        <View style={[styles.bar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, Math.max(0, goal.progressPct))}%`,
                backgroundColor: STATUS_COLOR(goal.status, theme),
              },
            ]}
          />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={promptUpdate}
          style={[styles.updateBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="pencil" size={14} color="white" />
          <Text style={styles.updateText}>
            {t('performance.update') ?? 'Update progress'}
          </Text>
        </TouchableOpacity>
      </View>

      {goal.description ? (
        <Section theme={theme} title={t('performance.description') ?? 'Description'}>
          <Text style={[styles.bodyText, { color: theme.colors.text }]}>
            {goal.description}
          </Text>
        </Section>
      ) : null}

      {goal.dueDate ? (
        <Row
          theme={theme}
          label={t('performance.dueDate') ?? 'Due date'}
          value={format(new Date(goal.dueDate), 'PP')}
        />
      ) : null}
      {goal.category ? (
        <Row theme={theme} label={t('performance.category') ?? 'Category'} value={goal.category} />
      ) : null}
      {goal.weight != null ? (
        <Row theme={theme} label={t('performance.weight') ?? 'Weight'} value={`${goal.weight}%`} />
      ) : null}

      {goal.keyResults?.length ? (
        <Section theme={theme} title={t('performance.keyResults') ?? 'Key results'}>
          {goal.keyResults.map((kr) => (
            <View key={kr.id} style={styles.krRow}>
              <Ionicons
                name={kr.achieved ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={kr.achieved ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[styles.krText, { color: theme.colors.text }]}>{kr.title}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      {goal.managerComments ? (
        <Section theme={theme} title={t('performance.managerComments') ?? 'Manager comments'}>
          <Text style={[styles.bodyText, { color: theme.colors.text }]}>
            {goal.managerComments}
          </Text>
        </Section>
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

function Section({
  theme,
  title,
  children,
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>{title}</Text>
      {children}
    </>
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
    marginBottom: 14,
  },
  title: { fontSize: 17, fontWeight: '700', maxWidth: '70%' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '700' },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  bar: { height: 8, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%' },
  updateBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  updateText: { color: 'white', fontWeight: '600', fontSize: 13 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: { fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 14, fontWeight: '600' },
  krRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  krText: { fontSize: 14, flex: 1 },
});
