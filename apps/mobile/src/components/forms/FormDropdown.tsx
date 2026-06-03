/**
 * FormDropdown — selectable dropdown with optional multi-select. Mobile #112.
 *
 * Uses BottomSheet for the picker UI so it works without extra dependencies.
 */
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '../common/BottomSheet';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
}

export interface FormDropdownProps<T = string> {
  label: string;
  value: T | T[] | null;
  options: DropdownOption<T>[];
  onChange: (value: T | T[]) => void;
  multi?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function FormDropdown<T extends string = string>({
  label,
  value,
  options,
  onChange,
  multi = false,
  required,
  error,
  placeholder = 'Select…',
}: FormDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);

  const display = React.useMemo(() => {
    if (multi && Array.isArray(value)) {
      const labels = value
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean);
      return labels.length > 0 ? labels.join(', ') : placeholder;
    }
    if (value && !Array.isArray(value)) {
      return options.find((o) => o.value === value)?.label ?? placeholder;
    }
    return placeholder;
  }, [value, options, multi, placeholder]);

  const isSelected = (v: T): boolean => {
    if (multi && Array.isArray(value)) return value.includes(v);
    return v === value;
  };

  const toggle = (v: T) => {
    if (multi) {
      const next = new Set((Array.isArray(value) ? value : []) as T[]);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange([...next] as T[]);
    } else {
      onChange(v);
      setOpen(false);
    }
  };

  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={[styles.button, hasError && styles.buttonError]}
      >
        <Text style={value ? styles.display : styles.placeholder}>{display}</Text>
      </Pressable>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <FlatList
          data={options}
          keyExtractor={(o) => String(o.value)}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected(item.value) }}
              onPress={() => toggle(item.value)}
              style={styles.option}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
              {isSelected(item.value) ? <Text style={styles.tick}>✓</Text> : null}
            </Pressable>
          )}
        />
      </BottomSheet>
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
  button: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  buttonError: { borderColor: '#DC2626' },
  display: { fontSize: 15, color: '#111827' },
  placeholder: { fontSize: 15, color: '#9CA3AF' },
  errorText: { marginTop: 4, fontSize: 12, color: '#DC2626' },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionLabel: { fontSize: 15, color: '#111827' },
  tick: { fontSize: 17, color: '#4F46E5', fontWeight: '700' },
});
