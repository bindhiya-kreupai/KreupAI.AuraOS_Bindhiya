/**
 * FormInput — text input with validation, error states, RTL. Mobile #112.
 */
import React from 'react';
import { I18nManager, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

export interface FormInputProps extends Omit<TextInputProps, 'onChange' | 'onChangeText'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormInput({
  label,
  value,
  onChange,
  error,
  required,
  ...rest
}: FormInputProps) {
  const hasError = Boolean(error);
  return (
    <View style={styles.container}>
      <Text style={[styles.label, I18nManager.isRTL && styles.rtl]}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#9CA3AF"
        style={[
          styles.input,
          hasError && styles.inputError,
          I18nManager.isRTL && styles.rtl,
        ]}
        accessibilityLabel={label}
        accessibilityState={{ disabled: rest.editable === false }}
        {...rest}
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
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
  },
  rtl: { textAlign: 'right' },
});
