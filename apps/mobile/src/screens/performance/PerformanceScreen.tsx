/**
 * Performance Screen
 * View goals and performance reviews
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useThemeStore } from '@/stores/theme.store';

export function PerformanceScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  // Mock data for goals
  const goals = [
    { id: '1', title: 'Complete Q4 Project', progress: 75, status: 'in_progress' },
    { id: '2', title: 'Improve Customer Satisfaction', progress: 50, status: 'in_progress' },
    { id: '3', title: 'Team Training Initiative', progress: 100, status: 'completed' },
    { id: '4', title: 'Process Documentation', progress: 25, status: 'in_progress' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.primary;
      case 'not_started':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Overview Card */}
      <View style={[styles.overviewCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.overviewTitle}>{t('performance.currentRating')}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingValue}>4.2</Text>
          <Text style={styles.ratingMax}>/5</Text>
        </View>
        <Text style={styles.ratingLabel}>Meets Expectations</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>{t('performance.goals')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>{t('performance.completed')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Q4</Text>
            <Text style={styles.statLabel}>{t('performance.reviewDue')}</Text>
          </View>
        </View>
      </View>

      {/* Goals Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('performance.myGoals')}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.addGoal, { color: theme.colors.primary }]}>
            + {t('performance.addGoal')}
          </Text>
        </TouchableOpacity>
      </View>

      {goals.map((goal) => (
        <TouchableOpacity
          key={goal.id}
          style={[styles.goalCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
              {goal.title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(goal.status) + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(goal.status) }]}>
                {t(`performance.status.${goal.status}`)}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${goal.progress}%`,
                    backgroundColor: getStatusColor(goal.status),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {goal.progress}%
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Upcoming Reviews */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
        {t('performance.upcomingReviews')}
      </Text>
      <View style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.reviewIcon, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.reviewContent}>
          <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>
            Q4 2024 Performance Review
          </Text>
          <Text style={[styles.reviewDate, { color: theme.colors.textSecondary }]}>
            Due: December 31, 2024
          </Text>
        </View>
        <View
          style={[styles.reviewBadge, { backgroundColor: theme.colors.warning + '20' }]}
        >
          <Text style={[styles.reviewBadgeText, { color: theme.colors.warning }]}>
            Pending
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Self Assessment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            View History
          </Text>
        </TouchableOpacity>
      </View>
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
  overviewCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  overviewTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  ratingValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  ratingMax: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 24,
  },
  ratingLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addGoal: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 13,
    marginTop: 2,
  },
  reviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
