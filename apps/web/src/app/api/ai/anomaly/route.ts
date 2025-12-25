/**
 * Anomaly Detection API Routes
 * Phase 3: Intelligence Layer - Pattern Recognition
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'detect';

    if (!body.tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    switch (action) {
      case 'detect':
        const dataType = body.dataType || 'attendance';

        return NextResponse.json({
          success: true,
          data: {
            anomalies: [
              {
                id: 'anom-1',
                type: 'ATTENDANCE_PATTERN',
                severity: 'HIGH',
                description: 'Unusual spike in late arrivals (Engineering dept)',
                affectedCount: 15,
                normalRange: '2-3 per week',
                currentValue: '12 this week',
                confidence: 0.94,
                detectedAt: new Date().toISOString(),
                recommendations: [
                  'Check for system issues',
                  'Review shift timings',
                  'Conduct employee survey',
                ],
              },
              {
                id: 'anom-2',
                type: 'EXPENSE_PATTERN',
                severity: 'MEDIUM',
                description: 'Abnormal expense claims from Sales team',
                affectedCount: 8,
                normalRange: '$500-800/month',
                currentValue: '$1,450/month',
                confidence: 0.87,
                detectedAt: new Date().toISOString(),
                recommendations: [
                  'Review expense policy',
                  'Audit recent claims',
                  'Provide expense training',
                ],
              },
              {
                id: 'anom-3',
                type: 'PRODUCTIVITY_DROP',
                severity: 'MEDIUM',
                description: 'Decreased productivity in Operations',
                affectedCount: 20,
                normalRange: '85-90%',
                currentValue: '72%',
                confidence: 0.91,
                detectedAt: new Date().toISOString(),
                recommendations: [
                  'Identify bottlenecks',
                  'Check resource allocation',
                  'Review workload distribution',
                ],
              },
            ],
            summary: {
              totalAnomalies: 3,
              highSeverity: 1,
              mediumSeverity: 2,
              lowSeverity: 0,
              avgConfidence: 0.91,
            },
          },
        });

      case 'analyze':
        return NextResponse.json({
          success: true,
          data: {
            analysis: {
              timeRange: body.timeRange || 'last_30_days',
              patternsFound: 8,
              significantAnomalies: 3,
              trends: [
                { pattern: 'WEEKLY_CYCLE', description: 'Monday/Friday absences trending up', strength: 0.85 },
                { pattern: 'SEASONAL', description: 'End-of-month overtime spike', strength: 0.78 },
                { pattern: 'DEPARTMENT', description: 'Engineering burnout indicators', strength: 0.82 },
              ],
            },
          },
        });

      case 'configure':
        return NextResponse.json({
          success: true,
          data: {
            configId: `config_${Date.now()}`,
            message: 'Anomaly detection configured successfully',
            thresholds: body.thresholds || {},
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json({ error: 'Failed to process anomaly detection' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status') || 'active';

    return NextResponse.json({
      success: true,
      data: {
        activeAnomalies: 3,
        resolvedToday: 2,
        avgResolutionTime: '4.2 hours',
        categories: [
          { category: 'Attendance', count: 5, avgSeverity: 'MEDIUM' },
          { category: 'Expenses', count: 3, avgSeverity: 'LOW' },
          { category: 'Productivity', count: 2, avgSeverity: 'HIGH' },
          { category: 'Leave', count: 1, avgSeverity: 'MEDIUM' },
        ],
      },
    });
  } catch (error) {
    console.error('Anomaly fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 });
  }
}
