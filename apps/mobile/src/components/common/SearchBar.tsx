/**
 * SearchBar — debounced search input with recent searches. Mobile #112.
 */
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search',
  debounceMs = 250,
  autoFocus = false,
}: SearchBarProps) {
  const [local, setLocal] = React.useState(value);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => setLocal(value), [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), debounceMs);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={local}
        onChangeText={handleChange}
        onSubmitEditing={() => onSubmit?.(local)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 6,
  },
});
