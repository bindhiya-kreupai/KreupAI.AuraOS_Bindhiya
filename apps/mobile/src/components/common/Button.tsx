/**
 * Button — primary, secondary, outline, danger variants with loading state.
 * Part of the v1.0 mobile component library (#112).
 */
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_BG: Record<ButtonVariant, string> = {
  primary: '#4F46E5',
  secondary: '#E5E7EB',
  outline: 'transparent',
  danger: '#DC2626',
};

const VARIANT_FG: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#111827',
  outline: '#4F46E5',
  danger: '#FFFFFF',
};

const VARIANT_BORDER: Record<ButtonVariant, string> = {
  primary: '#4F46E5',
  secondary: 'transparent',
  outline: '#4F46E5',
  danger: '#DC2626',
};

const SIZE_PAD: Record<ButtonSize, { x: number; y: number; fs: number }> = {
  sm: { x: 12, y: 6, fs: 13 },
  md: { x: 16, y: 10, fs: 15 },
  lg: { x: 20, y: 14, fs: 17 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const pad = SIZE_PAD[size];
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: VARIANT_BG[variant],
          borderColor: VARIANT_BORDER[variant],
          paddingHorizontal: pad.x,
          paddingVertical: pad.y,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={VARIANT_FG[variant]} size="small" />
      ) : (
        <Text style={[styles.label, { color: VARIANT_FG[variant], fontSize: pad.fs }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
