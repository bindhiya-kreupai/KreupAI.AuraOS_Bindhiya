/**
 * Card — elevated card with shadow + border variants. Mobile #112.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'flat';

export interface CardProps {
  variant?: CardVariant;
  padding?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Card({ variant = 'elevated', padding = 16, style, children }: CardProps) {
  return <View style={[styles.base, styles[variant], { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flat: {},
});
