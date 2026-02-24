import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current';

    // Fetch headcount analytics from microservice
    const result = await ServiceProxy.get('analytics', '/reports/headcount', {
      tenantId: user.tenantId,
      period
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Headcount analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        period: 'current',
        snapshot: new Date().toISOString(),
        total: 0,
        byDepartment: [],
        byLocation: [],
        byEmploymentType: [],
        trends: [],
        newHires: { thisMonth: 0, lastMonth: 0, ytd: 0 },
        separations: { thisMonth: 0, lastMonth: 0, ytd: 0 },
        netGrowth: { thisMonth: 0, lastMonth: 0, ytd: 0, growthRate: 0 },
      },
    });
  }
});
