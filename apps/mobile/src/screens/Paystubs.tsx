/**
 * Paystubs Screen
 * View pay stubs and salary details
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

import { useThemeStore } from '@/stores/theme.store';

interface PayStub {
  id: string;
  period: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  deductions: number;
  taxes: number;
  status: 'paid' | 'pending';
}

const mockPaystubs: PayStub[] = [
  { id: '1', period: 'Jan 1 - Jan 15, 2026', payDate: 'Jan 20, 2026', grossPay: 5833.33, netPay: 4166.67, deductions: 583.33, taxes: 1083.33, status: 'paid' },
  { id: '2', period: 'Dec 16 - Dec 31, 2025', payDate: 'Jan 5, 2026', grossPay: 5833.33, netPay: 4166.67, deductions: 583.33, taxes: 1083.33, status: 'paid' },
  { id: '3', period: 'Dec 1 - Dec 15, 2025', payDate: 'Dec 20, 2025', grossPay: 5833.33, netPay: 4166.67, deductions: 583.33, taxes: 1083.33, status: 'paid' },
  { id: '4', period: 'Nov 16 - Nov 30, 2025', payDate: 'Dec 5, 2025', grossPay: 5833.33, netPay: 4166.67, deductions: 583.33, taxes: 1083.33, status: 'paid' },
  { id: '5', period: 'Nov 1 - Nov 15, 2025', payDate: 'Nov 20, 2025', grossPay: 5833.33, netPay: 4166.67, deductions: 583.33, taxes: 1083.33, status: 'paid' },
];

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Paystubs() {
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStub, setSelectedStub] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const latestStub = mockPaystubs[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>Pay Stubs</Text>

        {/* Latest Pay Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.summaryLabel}>Latest Net Pay</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(latestStub.netPay)}</Text>
          <Text style={styles.summaryPeriod}>{latestStub.period}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Gross</Text>
              <Text style={styles.summaryItemValue}>{formatCurrency(latestStub.grossPay)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Taxes</Text>
              <Text style={styles.summaryItemValue}>{formatCurrency(latestStub.taxes)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Deductions</Text>
              <Text style={styles.summaryItemValue}>{formatCurrency(latestStub.deductions)}</Text>
            </View>
          </View>
        </View>

        {/* Pay History */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pay History</Text>
        {mockPaystubs.map((stub) => (
          <TouchableOpacity
            key={stub.id}
            style={[styles.stubCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => setSelectedStub(selectedStub === stub.id ? null : stub.id)}
          >
            <View style={styles.stubHeader}>
              <View>
                <Text style={[styles.stubPeriod, { color: theme.colors.text }]}>{stub.period}</Text>
                <Text style={[styles.stubDate, { color: theme.colors.textSecondary }]}>Paid: {stub.payDate}</Text>
              </View>
              <View style={styles.stubRight}>
                <Text style={[styles.stubAmount, { color: theme.colors.text }]}>{formatCurrency(stub.netPay)}</Text>
                <Ionicons name={selectedStub === stub.id ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textSecondary} />
              </View>
            </View>

            {selectedStub === stub.id && (
              <View style={[styles.stubDetails, { borderTopColor: theme.colors.border }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Gross Pay</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatCurrency(stub.grossPay)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Taxes</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.error }]}>-{formatCurrency(stub.taxes)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Deductions</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.error }]}>-{formatCurrency(stub.deductions)}</Text>
                </View>
                <View style={[styles.detailRow, styles.netRow]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text, fontWeight: '700' }]}>Net Pay</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.success, fontWeight: '700' }]}>{formatCurrency(stub.netPay)}</Text>
                </View>
                <TouchableOpacity style={[styles.downloadBtn, { borderColor: theme.colors.border }]}>
                  <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.downloadText, { color: theme.colors.primary }]}>Download PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  summaryAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  summaryPeriod: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  summaryRow: { flexDirection: 'row', marginTop: 16, gap: 16 },
  summaryItem: { flex: 1 },
  summaryItemLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  summaryItemValue: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  stubCard: { borderRadius: 12, padding: 14, marginBottom: 8 },
  stubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stubPeriod: { fontSize: 13, fontWeight: '600' },
  stubDate: { fontSize: 11, marginTop: 2 },
  stubRight: { alignItems: 'flex-end', gap: 4 },
  stubAmount: { fontSize: 15, fontWeight: '700' },
  stubDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '500' },
  netRow: { paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e2e8f0' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 36, borderRadius: 8, borderWidth: 1, gap: 6, marginTop: 8 },
  downloadText: { fontSize: 13, fontWeight: '500' },
});
