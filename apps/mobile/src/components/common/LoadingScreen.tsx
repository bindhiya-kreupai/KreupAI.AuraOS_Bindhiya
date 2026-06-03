/**
 * LoadingScreen — skeleton loaders per screen type. Mobile #112.
 *
 * Three variants: full-screen spinner, list-skeleton, card-skeleton.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Card } from './Card';

export type LoadingVariant = 'spinner' | 'list' | 'card';

export interface LoadingScreenProps {
  variant?: LoadingVariant;
  rows?: number;
}

export function LoadingScreen({ variant = 'spinner', rows = 4 }: LoadingScreenProps) {
  if (variant === 'spinner') {
    return (
      <View style={styles.container} accessibilityRole="progressbar">
        <ActivityIndicator color="#4F46E5" size="large" />
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View style={styles.listWrapper} accessibilityRole="progressbar">
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.listRow}>
            <View style={styles.avatar} />
            <View style={styles.listText}>
              <View style={[styles.line, { width: '60%' }]} />
              <View style={[styles.line, { width: '40%', marginTop: 6 }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // card
  return (
    <View style={styles.cardWrapper} accessibilityRole="progressbar">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} style={styles.skeletonCard}>
          <View style={[styles.line, { width: '70%' }]} />
          <View style={[styles.line, { width: '90%', marginTop: 8 }]} />
          <View style={[styles.line, { width: '50%', marginTop: 8 }]} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listWrapper: { paddingHorizontal: 16, paddingVertical: 8 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  listText: { flex: 1 },
  line: { height: 10, borderRadius: 6, backgroundColor: '#E5E7EB' },
  cardWrapper: { paddingHorizontal: 16, paddingVertical: 8 },
  skeletonCard: { marginVertical: 6 },
});
