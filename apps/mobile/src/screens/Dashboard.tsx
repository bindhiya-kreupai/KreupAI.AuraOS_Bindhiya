/**
 * Dashboard Screen
 * Mobile home screen with key metrics and quick actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';

interface QuickAction {
  icon: string;
  label: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { icon: 'log-in-outline', label: 'Clock In', color: '#10b981' },
  { icon: 'calendar-outline', label: 'Leave', color: '#6366f1' },
  { icon: 'document-text-outline', label: 'Payslip', color: '#f59e0b' },
  { icon: 'people-outline', label: 'Directory', color: '#8b5cf6' },
  { icon: 'checkmark-circle-outline', label: 'Approvals', color: '#ef4444' },
  { icon: 'stats-chart-outline', label: 'Performance', color: '#06b6d4' },
];

export function Dashboard() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <View>
            <Text style={[styles.greetingText, { color: theme.colors.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
            <View style={[styles.notifBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.text }]}>Today&apos;s Status</Text>
          <Text style={[styles.statusDate, { color: theme.colors.textSecondary }]}>{format(new Date(), 'EEEE, MMM d')}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons name="log-in-outline" size={20} color={theme.colors.success} />
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Check In</Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>09:02</Text>
            </View>
            <View style={[styles.statusDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statusItem}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Check Out</Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>--:--</Text>
            </View>
            <View style={[styles.statusDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statusItem}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Hours</Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>5h 30m</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leave Balances */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Leave Balances</Text>
        <View style={styles.leaveRow}>
          {[
            { type: 'Annual', balance: 12, color: '#6366f1' },
            { type: 'Sick', balance: 8, color: '#ef4444' },
            { type: 'Personal', balance: 3, color: '#f59e0b' },
          ].map((leave, idx) => (
            <View key={idx} style={[styles.leaveCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.leaveBalance, { color: leave.color }]}>{leave.balance}</Text>
              <Text style={[styles.leaveType, { color: theme.colors.textSecondary }]}>{leave.type}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming</Text>
        <View style={[styles.upcomingCard, { backgroundColor: theme.colors.surface }]}>
          {[
            { title: 'Team Meeting', date: 'Today, 2:00 PM', icon: 'people-outline', color: '#6366f1' },
            { title: 'Performance Review', date: 'Jan 28, 10:00 AM', icon: 'bar-chart-outline', color: '#f59e0b' },
            { title: 'Holiday - Republic Day', date: 'Jan 26', icon: 'flag-outline', color: '#10b981' },
          ].map((event, idx) => (
            <View key={idx} style={[styles.upcomingItem, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border }]}>
              <Ionicons name={event.icon as any} size={18} color={event.color} />
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingTitle, { color: theme.colors.text }]}>{event.title}</Text>
                <Text style={[styles.upcomingDate, { color: theme.colors.textSecondary }]}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  statusCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  statusTitle: { fontSize: 15, fontWeight: '600' },
  statusDate: { fontSize: 12, marginTop: 2, marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusItem: { flex: 1, alignItems: 'center', gap: 4 },
  statusDivider: { width: 1, height: 40 },
  statusLabel: { fontSize: 11 },
  statusValue: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  actionCard: { width: '31%', padding: 14, borderRadius: 12, alignItems: 'center' },
  actionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  leaveRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  leaveCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  leaveBalance: { fontSize: 24, fontWeight: 'bold' },
  leaveType: { fontSize: 11, marginTop: 2 },
  upcomingCard: { borderRadius: 12, padding: 14, marginBottom: 24 },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: 13, fontWeight: '500' },
  upcomingDate: { fontSize: 11, marginTop: 2 },
});
