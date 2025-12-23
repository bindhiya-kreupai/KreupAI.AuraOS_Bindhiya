/**
 * Payroll Home Screen
 * View payslips and salary information
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { payrollService } from '@/services/payroll.service';
import { PayrollStackParamList, Payslip } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<PayrollStackParamList, 'PayrollHome'>;
};

export function PayrollHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch payroll summary
  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['payrollSummary'],
    queryFn: () => payrollService.getSummary(),
  });

  // Fetch payslips
  const { data: payslips, refetch: refetchPayslips } = useQuery({
    queryKey: ['payslips'],
    queryFn: () => payrollService.getPayslips({ limit: 6 }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchPayslips()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Current Month Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.summaryTitle}>{t('payroll.currentMonth')}</Text>
        <Text style={styles.netPay}>
          {formatCurrency(summary?.currentMonth.netPay || 0, summary?.currency)}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('payroll.gross')}</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.currentMonth.grossPay || 0, summary?.currency)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('payroll.deductions')}</Text>
            <Text style={styles.summaryValue}>
              -{formatCurrency(summary?.currentMonth.deductions || 0, summary?.currency)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                summary?.currentMonth.status === 'paid'
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.2)',
            },
          ]}
        >
          <Text style={styles.statusText}>
            {t(`payroll.status.${summary?.currentMonth.status || 'pending'}`)}
          </Text>
        </View>
      </View>

      {/* YTD Summary */}
      <View style={[styles.ytdCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('payroll.yearToDate')}
        </Text>
        <View style={styles.ytdGrid}>
          <View style={styles.ytdItem}>
            <Text style={[styles.ytdValue, { color: theme.colors.text }]}>
              {formatCurrency(summary?.ytd.grossPay || 0, summary?.currency)}
            </Text>
            <Text style={[styles.ytdLabel, { color: theme.colors.textSecondary }]}>
              {t('payroll.grossPay')}
            </Text>
          </View>
          <View style={styles.ytdItem}>
            <Text style={[styles.ytdValue, { color: theme.colors.text }]}>
              {formatCurrency(summary?.ytd.netPay || 0, summary?.currency)}
            </Text>
            <Text style={[styles.ytdLabel, { color: theme.colors.textSecondary }]}>
              {t('payroll.netPay')}
            </Text>
          </View>
          <View style={styles.ytdItem}>
            <Text style={[styles.ytdValue, { color: theme.colors.error }]}>
              {formatCurrency(summary?.ytd.deductions || 0, summary?.currency)}
            </Text>
            <Text style={[styles.ytdLabel, { color: theme.colors.textSecondary }]}>
              {t('payroll.deductions')}
            </Text>
          </View>
          <View style={styles.ytdItem}>
            <Text style={[styles.ytdValue, { color: theme.colors.warning }]}>
              {formatCurrency(summary?.ytd.tax || 0, summary?.currency)}
            </Text>
            <Text style={[styles.ytdLabel, { color: theme.colors.textSecondary }]}>
              {t('payroll.tax')}
            </Text>
          </View>
        </View>
      </View>

      {/* Payslips History */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('payroll.payslips')}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
            {t('common.viewAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {payslips?.data?.map((payslip, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.payslipCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('PayslipDetails', { payslipId: payslip.id })}
        >
          <View style={styles.payslipLeft}>
            <View style={[styles.payslipIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.payslipMonth, { color: theme.colors.text }]}>
                {payslip.month} {payslip.year}
              </Text>
              <Text style={[styles.payslipDate, { color: theme.colors.textSecondary }]}>
                {payslip.paymentDate
                  ? format(new Date(payslip.paymentDate), 'MMM d, yyyy')
                  : t('payroll.pending')}
              </Text>
            </View>
          </View>
          <View style={styles.payslipRight}>
            <Text style={[styles.payslipAmount, { color: theme.colors.text }]}>
              {formatCurrency(payslip.netPay, payslip.currency)}
            </Text>
            <View
              style={[
                styles.payslipStatus,
                {
                  backgroundColor:
                    payslip.status === 'paid'
                      ? `${theme.colors.success}20`
                      : `${theme.colors.warning}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.payslipStatusText,
                  {
                    color:
                      payslip.status === 'paid'
                        ? theme.colors.success
                        : theme.colors.warning,
                  },
                ]}
              >
                {t(`payroll.status.${payslip.status}`)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('TaxSummary')}
        >
          <Ionicons name="receipt-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
            {t('payroll.taxSummary')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="cash-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
            {t('payroll.salaryStructure')}
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
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  netPay: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  summaryItem: {
    marginRight: 24,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  ytdCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  ytdGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ytdItem: {
    width: '50%',
    paddingVertical: 8,
  },
  ytdValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ytdLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  payslipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  payslipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payslipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payslipMonth: {
    fontSize: 14,
    fontWeight: '600',
  },
  payslipDate: {
    fontSize: 12,
    marginTop: 2,
  },
  payslipRight: {
    alignItems: 'flex-end',
  },
  payslipAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  payslipStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  payslipStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    marginLeft: 12,
  },
});
