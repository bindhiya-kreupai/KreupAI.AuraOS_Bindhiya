/**
 * Tax Summary Screen (#112)
 * Year-to-date tax view across IN (Form 16 / TDS), AE (none — informational
 * only), and KSA (GOSI). The TaxSummaryDTO returned by the backend collapses
 * jurisdiction-specific fields under canonical names so the UI can stay
 * country-agnostic.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';

interface TaxSummary {
  fiscalYear: string;
  countryCode: 'AE' | 'SA' | 'IN' | string;
  currency: string;
  grossYTD: number;
  taxableYTD: number;
  taxPaidYTD: number;
  netYTD: number;
  projectedAnnualTax?: number;
  deductionBreakdown?: Array<{ code: string; label: string; amount: number }>;
  notes?: string[];
}

export function TaxSummaryScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [year, setYear] = React.useState<string>(() => {
    const d = new Date();
    return d.getMonth() >= 3
      ? `${d.getFullYear()}-${d.getFullYear() + 1}`
      : `${d.getFullYear() - 1}-${d.getFullYear()}`;
  });
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['tax-summary', year],
    queryFn: () =>
      apiService.get<TaxSummary>(`/v1/payroll/tax-summary?fiscalYear=${year}`),
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
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          {t('payroll.taxSummary') ?? 'Tax summary'}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('payroll.changeYear') ?? 'Change year'}
          style={[styles.yearChip, { borderColor: theme.colors.border }]}
          onPress={() => {
            const [a, b] = year.split('-').map(Number);
            setYear(`${a - 1}-${b - 1}`);
          }}
        >
          <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, marginLeft: 6, fontSize: 12 }}>
            FY {year}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : !data ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('payroll.noTaxData') ?? 'No tax data for this year.'}
        </Text>
      ) : (
        <>
          <View
            style={[
              styles.bigCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>
              {t('payroll.taxPaid') ?? 'Tax paid YTD'}
            </Text>
            <Text style={[styles.bigNumber, { color: theme.colors.text }]}>
              {data.currency} {data.taxPaidYTD.toLocaleString()}
            </Text>
            {data.projectedAnnualTax ? (
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {t('payroll.projectedAnnual') ?? 'Projected annual'}: {data.currency}{' '}
                {data.projectedAnnualTax.toLocaleString()}
              </Text>
            ) : null}
          </View>

          <View style={styles.gridRow}>
            <SummaryTile
              theme={theme}
              label={t('payroll.gross') ?? 'Gross YTD'}
              value={`${data.currency} ${data.grossYTD.toLocaleString()}`}
            />
            <SummaryTile
              theme={theme}
              label={t('payroll.net') ?? 'Net YTD'}
              value={`${data.currency} ${data.netYTD.toLocaleString()}`}
            />
          </View>
          <View style={styles.gridRow}>
            <SummaryTile
              theme={theme}
              label={t('payroll.taxable') ?? 'Taxable YTD'}
              value={`${data.currency} ${data.taxableYTD.toLocaleString()}`}
            />
            <SummaryTile
              theme={theme}
              label={t('payroll.country') ?? 'Country'}
              value={data.countryCode}
            />
          </View>

          {data.deductionBreakdown && data.deductionBreakdown.length > 0 ? (
            <>
              <Text style={[styles.section, { color: theme.colors.textSecondary }]}>
                {t('payroll.deductions') ?? 'Deductions'}
              </Text>
              {data.deductionBreakdown.map((d) => (
                <View
                  key={d.code}
                  style={[styles.dedRow, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.dedLabel, { color: theme.colors.text }]}>{d.label}</Text>
                  <Text style={[styles.dedAmt, { color: theme.colors.text }]}>
                    {data.currency} {d.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {data.notes?.length ? (
            <>
              <Text style={[styles.section, { color: theme.colors.textSecondary }]}>
                {t('payroll.notes') ?? 'Notes'}
              </Text>
              {data.notes.map((n, i) => (
                <Text
                  key={i}
                  style={[styles.note, { color: theme.colors.textSecondary }]}
                >
                  • {n}
                </Text>
              ))}
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function SummaryTile({
  theme,
  label,
  value,
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  label: string;
  value: string;
}) {
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.tileLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.tileValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: { fontSize: 22, fontWeight: '700' },
  yearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  bigCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  cardLabel: { fontSize: 12, fontWeight: '500' },
  bigNumber: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  cardMeta: { fontSize: 12, marginTop: 4 },
  gridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tile: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileLabel: { fontSize: 11 },
  tileValue: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  dedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dedLabel: { fontSize: 13 },
  dedAmt: { fontSize: 13, fontWeight: '600' },
  note: { fontSize: 12, marginTop: 4, lineHeight: 16 },
});
