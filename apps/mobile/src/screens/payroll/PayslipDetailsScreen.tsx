/**
 * Payslip Details Screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { useThemeStore } from '@/stores/theme.store';
import { payrollService } from '@/services/payroll.service';
import { PayrollStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<PayrollStackParamList, 'PayslipDetails'>;
  route: RouteProp<PayrollStackParamList, 'PayslipDetails'>;
};

export function PayslipDetailsScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { payslipId } = route.params;

  const { data: payslip, isLoading } = useQuery({
    queryKey: ['payslip', payslipId],
    queryFn: () => payrollService.getPayslip(payslipId),
  });

  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownload = async () => {
    try {
      const result = await payrollService.downloadPayslip(payslipId);
      // In production, open the PDF or download
      Share.share({
        url: result.url,
        title: `Payslip ${payslip?.month} ${payslip?.year}`,
      });
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!payslip) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>{t('payroll.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerMonth}>
          {payslip.month} {payslip.year}
        </Text>
        <Text style={styles.headerNet}>
          {formatCurrency(payslip.netPay, payslip.currency)}
        </Text>
        <Text style={styles.headerLabel}>{t('payroll.netPay')}</Text>
        {payslip.paymentDate && (
          <Text style={styles.headerDate}>
            {t('payroll.paidOn')} {format(new Date(payslip.paymentDate), 'MMM d, yyyy')}
          </Text>
        )}
      </View>

      {/* Earnings */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="add-circle" size={20} color={theme.colors.success} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('payroll.earnings')}
          </Text>
        </View>

        {payslip.earnings.map((item, index) => (
          <View
            key={index}
            style={[styles.lineItem, { borderBottomColor: theme.colors.border }]}
          >
            <Text style={[styles.lineItemName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.lineItemAmount, { color: theme.colors.success }]}>
              {formatCurrency(item.amount, payslip.currency)}
            </Text>
          </View>
        ))}

        <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            {t('payroll.grossPay')}
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.success }]}>
            {formatCurrency(payslip.grossPay, payslip.currency)}
          </Text>
        </View>
      </View>

      {/* Deductions */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="remove-circle" size={20} color={theme.colors.error} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('payroll.deductions')}
          </Text>
        </View>

        {payslip.deductions.map((item, index) => (
          <View
            key={index}
            style={[styles.lineItem, { borderBottomColor: theme.colors.border }]}
          >
            <Text style={[styles.lineItemName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.lineItemAmount, { color: theme.colors.error }]}>
              -{formatCurrency(item.amount, payslip.currency)}
            </Text>
          </View>
        ))}

        <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            {t('payroll.totalDeductions')}
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.error }]}>
            -{formatCurrency(payslip.totalDeductions, payslip.currency)}
          </Text>
        </View>
      </View>

      {/* Net Pay */}
      <View style={[styles.netPayCard, { backgroundColor: theme.colors.primaryLight }]}>
        <Text style={[styles.netPayLabel, { color: theme.colors.primary }]}>
          {t('payroll.netPay')}
        </Text>
        <Text style={[styles.netPayAmount, { color: theme.colors.primary }]}>
          {formatCurrency(payslip.netPay, payslip.currency)}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{t('payroll.downloadPdf')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() =>
            Share.share({
              message: `Payslip for ${payslip.month} ${payslip.year} - Net Pay: ${formatCurrency(payslip.netPay, payslip.currency)}`,
            })
          }
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            {t('common.share')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerMonth: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  headerNet: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  headerDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lineItemName: {
    fontSize: 14,
  },
  lineItemAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  netPayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  netPayLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  netPayAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
