/**
 * Notifications Screen
 * Notification center with categories and actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore } from '@/stores/theme.store';

interface Notification {
  id: string;
  title: string;
  body: string;
  category: 'leave' | 'attendance' | 'payroll' | 'approval' | 'announcement';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Leave Approved', body: 'Your annual leave request for Jan 25-28 has been approved by your manager.', category: 'leave', timestamp: '2 min ago', isRead: false },
  { id: '2', title: 'Attendance Reminder', body: "Don't forget to check in! Your shift starts in 15 minutes.", category: 'attendance', timestamp: '15 min ago', isRead: false },
  { id: '3', title: 'Payslip Available', body: 'Your payslip for the period Jan 1-15 is now available.', category: 'payroll', timestamp: '1 hour ago', isRead: false },
  { id: '4', title: 'Pending Approval', body: 'Sarah Johnson has submitted a leave request that needs your approval.', category: 'approval', timestamp: '2 hours ago', isRead: true },
  { id: '5', title: 'Company Update', body: 'Annual company retreat dates have been announced. Check details.', category: 'announcement', timestamp: '5 hours ago', isRead: true },
  { id: '6', title: 'Overtime Approved', body: 'Your overtime request for 3 hours on Jan 22 has been approved.', category: 'attendance', timestamp: 'Yesterday', isRead: true },
  { id: '7', title: 'Performance Review', body: 'Your Q4 performance review is due in 7 days. Please complete self-assessment.', category: 'announcement', timestamp: 'Yesterday', isRead: true },
  { id: '8', title: 'Leave Balance Update', body: 'Your carry-forward leave days have been credited. New balance: 18 days.', category: 'leave', timestamp: '2 days ago', isRead: true },
];

const categoryConfig: Record<string, { icon: string; color: string }> = {
  leave: { icon: 'calendar', color: '#6366f1' },
  attendance: { icon: 'time', color: '#10b981' },
  payroll: { icon: 'wallet', color: '#f59e0b' },
  approval: { icon: 'checkmark-circle', color: '#ef4444' },
  announcement: { icon: 'megaphone', color: '#8b5cf6' },
};

export function Notifications() {
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.category === filter);

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = categoryConfig[item.category];
    return (
      <TouchableOpacity
        style={[styles.notifCard, { backgroundColor: item.isRead ? theme.colors.surface : theme.colors.primary + '08' }]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
          </View>
          <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={[styles.notifTime, { color: theme.colors.textSecondary }]}>{item.timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadLabel, { color: theme.colors.textSecondary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAllText, { color: theme.colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={['all', 'leave', 'attendance', 'payroll', 'approval', 'announcement']}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && { backgroundColor: theme.colors.primary }]}
            onPress={() => setFilter(item)}
          >
            <Text style={{ fontSize: 12, fontWeight: '500', color: filter === item ? '#fff' : theme.colors.textSecondary }}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Notification List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  unreadLabel: { fontSize: 12, marginTop: 2 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  filterList: { maxHeight: 36, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 6 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#f1f5f9' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  notifCard: { flexDirection: 'row', padding: 12, borderRadius: 12, gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifBody: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 8 },
});
