/**
 * Submit Expense Screen (#112)
 * Capture form for a new expense claim. Receipt URL is a placeholder for the
 * native camera handoff; production wires expo-image-picker for the upload.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { expenseService, type ExpenseCategory } from '@/services/expense.service';
import { ExpenseStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<ExpenseStackParamList, 'SubmitExpense'>;
};

const CATEGORIES: ExpenseCategory[] = [
  'TRAVEL',
  'MEALS',
  'ACCOMMODATION',
  'OFFICE',
  'TRAINING',
  'OTHER',
];

export function SubmitExpenseScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [category, setCategory] = React.useState<ExpenseCategory>('TRAVEL');
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = React.useState('');

  const mutation = useMutation({
    mutationFn: () =>
      expenseService.submit({
        title,
        amount: Number(amount),
        currency,
        category,
        date,
        description: description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      Alert.alert(t('expenses.submitted') ?? 'Submitted', undefined, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err) =>
      Alert.alert(
        t('expenses.submitFailed') ?? 'Submission failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const canSubmit =
    title.trim().length > 0 && Number(amount) > 0 && date.length === 10;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('expenses.newClaim') ?? 'New expense claim'}
      </Text>

      <Field
        theme={theme}
        label={t('expenses.title') ?? 'Title'}
        value={title}
        onChangeText={setTitle}
      />
      <View style={styles.amountRow}>
        <View style={{ flex: 2 }}>
          <Field
            theme={theme}
            label={t('expenses.amount') ?? 'Amount'}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            theme={theme}
            label={t('expenses.currency') ?? 'Currency'}
            value={currency}
            onChangeText={setCurrency}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {t('expenses.category') ?? 'Category'}
      </Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => {
          const selected = category === c;
          return (
            <TouchableOpacity
              key={c}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setCategory(c)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.colors.primary : 'transparent',
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? 'white' : theme.colors.text,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Field
        theme={theme}
        label={t('expenses.date') ?? 'Date (YYYY-MM-DD)'}
        value={date}
        onChangeText={setDate}
      />
      <Field
        theme={theme}
        label={t('expenses.description') ?? 'Description'}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity
        disabled={!canSubmit || mutation.isPending}
        onPress={() => mutation.mutate()}
        accessibilityRole="button"
        style={[
          styles.submit,
          {
            backgroundColor: canSubmit ? theme.colors.primary : theme.colors.textSecondary,
          },
        ]}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>{t('common.submit') ?? 'Submit'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({
  theme,
  label,
  multiline,
  ...rest
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[
          styles.field,
          multiline ? styles.multiline : null,
          { borderColor: theme.colors.border, color: theme.colors.text },
        ]}
        multiline={multiline}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 12, marginBottom: 4 },
  field: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  amountRow: { flexDirection: 'row', gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  submit: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
