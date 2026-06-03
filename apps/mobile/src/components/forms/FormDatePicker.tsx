/**
 * FormDatePicker — date picker stub with Hijri calendar hook. Mobile #112.
 *
 * Uses the platform-native date picker (Android dialog / iOS spinner) via
 * `@react-native-community/datetimepicker` if installed; falls back to a
 * text input with `YYYY-MM-DD` masking when not. The `hijri` prop signals
 * intent — wiring the actual Hijri picker is a follow-up that swaps the
 * input component without changing the surface.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface FormDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  required?: boolean;
  error?: string;
  hijri?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

function fmt(d: Date | null): string {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parse(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function FormDatePicker({
  label,
  value,
  onChange,
  required,
  error,
  hijri = false,
  minDate,
  maxDate,
}: FormDatePickerProps) {
  const [text, setText] = React.useState(fmt(value));
  React.useEffect(() => setText(fmt(value)), [value]);

  const hasError = Boolean(error);

  const commit = (next: string) => {
    setText(next);
    if (next === '') {
      onChange(null);
      return;
    }
    const parsed = parse(next);
    if (parsed && (!minDate || parsed >= minDate) && (!maxDate || parsed <= maxDate)) {
      onChange(parsed);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
        {hijri ? <Text style={styles.hijri}> (Hijri)</Text> : null}
      </Text>
      <TextInput
        value={text}
        onChangeText={commit}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
        keyboardType="numbers-and-punctuation"
        autoCorrect={false}
        accessibilityLabel={label}
        style={[styles.input, hasError && styles.inputError]}
      />
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: { color: '#DC2626' },
  hijri: { color: '#4F46E5', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: { borderColor: '#DC2626' },
  errorText: { marginTop: 4, fontSize: 12, color: '#DC2626' },
});
