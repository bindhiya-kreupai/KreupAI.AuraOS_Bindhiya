/**
 * Benefits Home Screen (#112)
 * Lists the employee's recent benefit claims with status chips.
 * Surfaces a CTA to submit a new claim — the mobile-side entry point for the
 * BenefitsClaimService state machine landed in #108.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import {
  benefitsService,
  type BenefitsClaim,
  type BenefitsClaimStatus,
} from '@/services/benefits.service';
import { BenefitsStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<BenefitsStackParamList, 'BenefitsHome'>;
};

const STATUS_COLOR = (status: BenefitsClaimStatus, theme: ReturnType<typeof useThemeStore>['theme']) => {
  switch (status) {
    case 'APPROVED':
    case 'PAID':
      return theme.colors.success;
    case 'PARTIALLY_APPROVED':
      return theme.colors.warning;
    case 'REJECTED':
      return theme.colors.error;
    case 'PENDING_INFO':
      return theme.colors.warning;
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    default:
      return theme.colors.textSecondary;
  }
};

const CATEGORY_ICON = (category: BenefitsClaim['claimType']) => {
  switch (category) {
    case 'MEDICAL':
      return 'medkit-outline';
    case 'DENTAL':
      return 'happy-outline';
    case 'VISION':
      return 'eye-outline';
    case 'WELLNESS':
      return 'fitness-outline';
    case 'LIFE':
    case 'DISABILITY':
      return 'shield-checkmark-outline';
    case 'RETIREMENT':
      return 'briefcase-outline';
    default:
      return 'document-outline';
  }
};

export function BenefitsHomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['benefits', 'claims', { limit: 20 }],
    queryFn: () => benefitsService.getClaims({ limit: 20 }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          {t('benefits.claims') ?? 'My Claims'}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('benefits.submitClaim') ?? 'Submit claim'}
          onPress={() => navigation.navigate('SubmitClaim')}
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={styles.submitBtnText}>
            {t('benefits.submit') ?? 'New claim'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : data?.items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('benefits.noClaims') ?? 'No claims yet.'}
        </Text>
      ) : (
        data?.items.map((claim) => (
          <TouchableOpacity
            key={claim.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ClaimDetails', { claimId: claim.id })}
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={styles.cardLeft}>
              <Ionicons
                name={CATEGORY_ICON(claim.claimType)}
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {claim.claimNumber}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {claim.claimType} · {format(new Date(claim.claimDate), 'MMM d, yyyy')}
              </Text>
              <Text style={[styles.cardAmount, { color: theme.colors.text }]}>
                {claim.claimAmount.toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: STATUS_COLOR(claim.status, theme) + '22' },
              ]}
            >
              <Text style={[styles.statusText, { color: STATUS_COLOR(claim.status, theme) }]}>
                {claim.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, minHeight: '100%' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: { fontSize: 22, fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  submitBtnText: { color: 'white', fontWeight: '600', marginLeft: 4 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 10,
  },
  cardLeft: { marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, marginTop: 2 },
  cardAmount: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
