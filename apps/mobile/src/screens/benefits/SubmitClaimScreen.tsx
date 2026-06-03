/**
 * Submit Benefits Claim Screen (#112)
 * Minimal capture form mapped to BenefitsClaimService.submit (#108).
 * Numeric input is validated locally; date pickers fall through to platform.
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import {
  benefitsService,
  type BenefitCategory,
} from '@/services/benefits.service';
import { BenefitsStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<BenefitsStackParamList, 'SubmitClaim'>;
};

const CATEGORIES: BenefitCategory[] = [
  'MEDICAL',
  'DENTAL',
  'VISION',
  'WELLNESS',
  'OTHER',
];

export function SubmitClaimScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const [enrollmentId, setEnrollmentId] = React.useState('');
  const [claimType, setClaimType] = React.useState<BenefitCategory>('MEDICAL');
  const [providerName, setProviderName] = React.useState('');
  const [claimDate, setClaimDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [serviceDate, setServiceDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [claimAmount, setClaimAmount] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const mutation = useMutation({
    mutationFn: () =>
      benefitsService.submitClaim({
        enrollmentId,
        claimType,
        claimDate,
        serviceDate,
        claimAmount: Number(claimAmount),
        providerName: providerName || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits', 'claims'] });
      Alert.alert(t('benefits.submitted') ?? 'Submitted', undefined, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err) => {
      Alert.alert(
        t('benefits.submitFailed') ?? 'Submission failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    },
  });

  const canSubmit =
    enrollmentId.trim().length > 0 &&
    Number(claimAmount) > 0 &&
    claimDate.length === 10 &&
    serviceDate.length === 10;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('benefits.newClaim') ?? 'New benefits claim'}
      </Text>

      <Label theme={theme}>{t('benefits.enrollmentId') ?? 'Enrollment ID'}</Label>
      <TextInput
        accessibilityLabel="enrollment-id"
        value={enrollmentId}
        onChangeText={setEnrollmentId}
        placeholder="enr-..."
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <Label theme={theme}>{t('benefits.category') ?? 'Category'}</Label>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setClaimType(c)}
            accessibilityRole="button"
            accessibilityState={{ selected: claimType === c }}
            style={[
              styles.chip,
              {
                backgroundColor:
                  claimType === c ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: claimType === c ? 'white' : theme.colors.text,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label theme={theme}>{t('benefits.claimDate') ?? 'Claim date (YYYY-MM-DD)'}</Label>
      <TextInput
        value={claimDate}
        onChangeText={setClaimDate}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <Label theme={theme}>{t('benefits.serviceDate') ?? 'Service date (YYYY-MM-DD)'}</Label>
      <TextInput
        value={serviceDate}
        onChangeText={setServiceDate}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <Label theme={theme}>{t('benefits.amount') ?? 'Claim amount'}</Label>
      <TextInput
        value={claimAmount}
        onChangeText={setClaimAmount}
        keyboardType="decimal-pad"
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <Label theme={theme}>{t('benefits.provider') ?? 'Provider name'}</Label>
      <TextInput
        value={providerName}
        onChangeText={setProviderName}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <Label theme={theme}>{t('benefits.notes') ?? 'Notes'}</Label>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        style={[
          styles.input,
          styles.notes,
          { color: theme.colors.text, borderColor: theme.colors.border },
        ]}
      />

      <TouchableOpacity
        disabled={!canSubmit || mutation.isPending}
        onPress={() => mutation.mutate()}
        accessibilityRole="button"
        style={[
          styles.submit,
          {
            backgroundColor: canSubmit
              ? theme.colors.primary
              : theme.colors.textSecondary,
          },
        ]}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>
            {t('benefits.submit') ?? 'Submit claim'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Label({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof useThemeStore>['theme'];
}) {
  return (
    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 12, marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  submit: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
