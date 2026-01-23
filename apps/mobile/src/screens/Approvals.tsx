/**
 * Approvals Screen
 * Approve or reject pending requests (leave, expenses, etc.)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore } from '@/stores/theme.store';

interface ApprovalItem {
  id: string;
  type: 'leave' | 'expense' | 'timesheet' | 'overtime';
  employeeName: string;
  employeeAvatar?: string;
  description: string;
  date: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockApprovals: ApprovalItem[] = [
  { id: '1', type: 'leave', employeeName: 'Sarah Johnson', description: 'Annual Leave', date: 'Jan 25 - Jan 28', details: '4 days', status: 'pending' },
  { id: '2', type: 'leave', employeeName: 'Michael Chen', description: 'Sick Leave', date: 'Jan 23', details: '1 day', status: 'pending' },
  { id: '3', type: 'expense', employeeName: 'Emily Davis', description: 'Travel Expense', date: 'Jan 20', details: '$1,250.00', status: 'pending' },
  { id: '4', type: 'overtime', employeeName: 'James Wilson', description: 'Overtime Request', date: 'Jan 22', details: '3 hours', status: 'pending' },
  { id: '5', type: 'timesheet', employeeName: 'Lisa Anderson', description: 'Timesheet Correction', date: 'Jan 18', details: 'Week 3', status: 'pending' },
];

const typeIcons: Record<string, { icon: string; color: string }> = {
  leave: { icon: 'calendar-outline', color: '#6366f1' },
  expense: { icon: 'receipt-outline', color: '#f59e0b' },
  timesheet: { icon: 'time-outline', color: '#10b981' },
  overtime: { icon: 'alarm-outline', color: '#ef4444' },
};

export function Approvals() {
  const { theme } = useThemeStore();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(mockApprovals);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'leave' | 'expense' | 'timesheet' | 'overtime'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const handleApprove = (id: string) => {
    Alert.alert('Approve', 'Are you sure you want to approve this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => setApprovals(approvals.map((a) => a.id === id ? { ...a, status: 'approved' } : a)),
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => setApprovals(approvals.map((a) => a.id === id ? { ...a, status: 'rejected' } : a)),
      },
    ]);
  };

  const filtered = filter === 'all' ? approvals : approvals.filter((a) => a.type === filter);
  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Approvals</Text>
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>{pendingCount}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {['all', 'leave', 'expense', 'timesheet', 'overtime'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && { backgroundColor: theme.colors.primary }]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.colors.textSecondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Approval List */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.map((item) => {
          const typeConfig = typeIcons[item.type];
          return (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: typeConfig.color + '20' }]}>
                  <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: theme.colors.text }]}>{item.employeeName}</Text>
                  <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>{item.description}</Text>
                </View>
                {item.status !== 'pending' && (
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? '#10b98120' : '#ef444420' }]}>
                    <Text style={{ fontSize: 11, color: item.status === 'approved' ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardDetails}>
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.date}</Text>
                <Text style={[styles.detailText, { color: theme.colors.text, fontWeight: '600' }]}>{item.details}</Text>
              </View>
              {item.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.rejectBtn, { borderColor: theme.colors.border }]}
                    onPress={() => handleReject(item.id)}
                  >
                    <Ionicons name="close" size={16} color={theme.colors.error} />
                    <Text style={[styles.rejectText, { color: theme.colors.error }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.approveBtn, { backgroundColor: theme.colors.success }]}
                    onPress={() => handleApprove(item.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: 'bold' },
  badge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  filterRow: { paddingHorizontal: 16, marginBottom: 12, maxHeight: 40 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8, backgroundColor: '#f1f5f9' },
  filterText: { fontSize: 13, fontWeight: '500' },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600' },
  cardDesc: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e2e8f0' },
  detailText: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 36, borderRadius: 8, borderWidth: 1, gap: 4 },
  rejectText: { fontSize: 13, fontWeight: '600' },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 36, borderRadius: 8, gap: 4 },
  approveText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
