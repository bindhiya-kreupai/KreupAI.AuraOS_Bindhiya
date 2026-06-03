/**
 * Badge — status badges for approved/pending/rejected/info/warning/danger. Mobile #112.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONE_BG: Record<BadgeTone, string> = {
  neutral: '#F3F4F6',
  info: '#DBEAFE',
  success: '#D1FAE5',
  warning: '#FEF3C7',
  danger: '#FEE2E2',
};

const TONE_FG: Record<BadgeTone, string> = {
  neutral: '#374151',
  info: '#1E40AF',
  success: '#065F46',
  warning: '#92400E',
  danger: '#991B1B',
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, { backgroundColor: TONE_BG[tone] }]}>
      <Text style={[styles.label, { color: TONE_FG[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
