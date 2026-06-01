import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultMetrics = {
      totalPolicies: 0,
      publishedPolicies: 0,
      draftPolicies: 0,
      archivedPolicies: 0,
      overallCompliance: 0,
      acknowledgementRate: 0,
      pendingApprovals: 0,
      overdueAcknowledgements: 0,
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: defaultMetrics },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching policy analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
