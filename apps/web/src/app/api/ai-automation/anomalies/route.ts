import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const anomalies = [
      {
        anomalyId: `anomaly-${Date.now()}`,
        anomalyType: 'attendance',
        detectedDate: new Date().toISOString(),
        severity: 'medium',
        affectedEntity: 'Department',
        affectedEntityId: 'dept-001',
        affectedEntityName: 'Engineering',
        description: 'Unusual attendance pattern detected',
        metrics: {},
        threshold: 0.8,
        actualValue: 0.92,
        deviation: 0.12,
        historicalComparison: {},
        potentialCauses: ['Team event', 'Holiday season'],
        suggestedActions: ['Review attendance policy'],
        status: 'new',
        assignedTo: null,
        assignedToName: null,
        resolution: null,
        resolvedDate: null,
        falsePositive: false,
        modelVersion: 'v1.2.0',
        confidenceScore: 0.85
      }
    ];

    return NextResponse.json({ anomalies }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
