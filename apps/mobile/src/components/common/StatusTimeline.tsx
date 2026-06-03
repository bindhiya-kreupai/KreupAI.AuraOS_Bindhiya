/**
 * StatusTimeline — vertical timeline for request / process status. Mobile #112.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface TimelineStep {
  label: string;
  date?: string;
  notes?: string;
  state: 'completed' | 'current' | 'pending' | 'failed';
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
}

const STATE_COLOR: Record<TimelineStep['state'], string> = {
  completed: '#10B981',
  current: '#4F46E5',
  pending: '#D1D5DB',
  failed: '#DC2626',
};

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <View>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <View key={i} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={[styles.dot, { backgroundColor: STATE_COLOR[step.state] }]} />
              {!isLast ? <View style={styles.connector} /> : null}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, step.state === 'pending' && styles.pendingText]}>
                {step.label}
              </Text>
              {step.date ? <Text style={styles.meta}>{step.date}</Text> : null}
              {step.notes ? <Text style={styles.notes}>{step.notes}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 56 },
  markerColumn: { width: 24, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 2 },
  connector: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginTop: 4 },
  content: { flex: 1, paddingBottom: 12, paddingLeft: 4 },
  label: { fontSize: 14, color: '#111827', fontWeight: '600' },
  pendingText: { color: '#6B7280', fontWeight: '500' },
  meta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  notes: { fontSize: 12, color: '#374151', marginTop: 4 },
});
