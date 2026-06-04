/**
 * Onboarding Tasks Screen (#112)
 * New-joiner checklist. Pulls from /v1/onboarding/me and exposes a single
 * "mark complete" action per task. Progress bar at top summarises.
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
import { apiService } from '@/services/api.service';

interface OnboardingTask {
  id: string;
  title: string;
  description?: string;
  category: 'PAPERWORK' | 'IT' | 'TRAINING' | 'INTRODUCTION' | 'OTHER';
  dueDate?: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
}

interface OnboardingPayload {
  items: OnboardingTask[];
  totalTasks: number;
  completedTasks: number;
  startedAt?: string;
  expectedCompletion?: string;
}

const CATEGORY_ICON = (c: OnboardingTask['category']): keyof typeof Ionicons.glyphMap => {
  switch (c) {
    case 'PAPERWORK':
      return 'document-text-outline';
    case 'IT':
      return 'laptop-outline';
    case 'TRAINING':
      return 'school-outline';
    case 'INTRODUCTION':
      return 'people-outline';
    default:
      return 'checkmark-circle-outline';
  }
};

export function OnboardingTasksScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['onboarding', 'me'],
    queryFn: () => apiService.get<OnboardingPayload>(`/v1/onboarding/me`),
  });

  const complete = useMutation({
    mutationFn: (id: string) => apiService.post(`/v1/onboarding/tasks/${id}/complete`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
    onError: (err) =>
      Alert.alert(
        t('onboarding.actionFailed') ?? 'Action failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const pct = data && data.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('onboarding.title') ?? 'Welcome aboard'}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('onboarding.subtitle') ?? 'Complete these to finish your onboarding.'}
      </Text>

      {data ? (
        <View
          style={[
            styles.progressCard,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            {t('onboarding.progress') ?? 'Your progress'}
          </Text>
          <Text style={[styles.progressNum, { color: theme.colors.text }]}>
            {data.completedTasks}/{data.totalTasks} ({pct}%)
          </Text>
          <View style={[styles.bar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${pct}%`,
                  backgroundColor:
                    pct === 100 ? theme.colors.success : theme.colors.primary,
                },
              ]}
            />
          </View>
          {data.expectedCompletion ? (
            <Text style={[styles.expected, { color: theme.colors.textSecondary }]}>
              {t('onboarding.dueBy') ?? 'Due by'}{' '}
              {format(new Date(data.expectedCompletion), 'PP')}
            </Text>
          ) : null}
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : !data || data.items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('onboarding.empty') ?? 'Nothing on your checklist.'}
        </Text>
      ) : (
        data.items.map((task) => (
          <TouchableOpacity
            key={task.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            disabled={task.completed || complete.isPending}
            onPress={() => complete.mutate(task.id)}
            style={[
              styles.taskCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: task.completed ? theme.colors.success : theme.colors.border,
                opacity: task.completed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name={task.completed ? 'checkmark-circle' : CATEGORY_ICON(task.category)}
              size={22}
              color={task.completed ? theme.colors.success : theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <View style={styles.taskBody}>
              <Text
                style={[
                  styles.taskTitle,
                  {
                    color: theme.colors.text,
                    textDecorationLine: task.completed ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.description ? (
                <Text style={[styles.taskDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {task.description}
                </Text>
              ) : null}
              <View style={styles.taskMeta}>
                {task.required ? (
                  <View
                    style={[styles.tag, { backgroundColor: theme.colors.error + '22' }]}
                  >
                    <Text style={[styles.tagText, { color: theme.colors.error }]}>
                      {t('onboarding.required') ?? 'Required'}
                    </Text>
                  </View>
                ) : null}
                {task.dueDate ? (
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {t('onboarding.dueBy') ?? 'Due'} {format(new Date(task.dueDate), 'PP')}
                  </Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 16, lineHeight: 18 },
  progressCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  progressLabel: { fontSize: 12 },
  progressNum: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  bar: { height: 8, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%' },
  expected: { fontSize: 11, marginTop: 10 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  taskCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 8,
  },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600' },
  taskDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tagText: { fontSize: 10, fontWeight: '700' },
  metaText: { fontSize: 11 },
});
