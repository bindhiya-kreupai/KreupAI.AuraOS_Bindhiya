import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultMetrics = {
      metrics: {
        totalCriticalPositions: 0,
        positionsWithSuccessors: 0,
        positionsCoverage: 0,
        readyNowSuccessors: 0,
        avgSuccessionDepth: 0,
        highRiskPositions: 0,
        avgTimeToReadiness: 0,
        developmentPlansActive: 0,
        talentPoolSize: 0,
        retentionRiskCount: 0,
      },
      analysis: [],
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: defaultMetrics },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching succession analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
