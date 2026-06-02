import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function getDefaultRemoteWorkData(tenantId: string) {
  return {
    policies: [
      {
        id: `rwp-${tenantId}-001`,
        name: 'Hybrid Work Policy',
        description: 'Standard hybrid work arrangement with 3 days in office',
        minOfficeDays: 3,
        maxRemoteDays: 2,
        eligibility: 'all_employees',
        status: 'active',
        tenantId,
      },
    ],
    assignments: [],
    statistics: {
      tenantId,
      totalRemoteWorkers: 0,
      hybridWorkers: 0,
      fullyRemote: 0,
      averageProductivityScore: 0,
      equipmentRequestsPending: 0,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const data = getDefaultRemoteWorkData(user.tenantId);

    switch (type) {
      case 'policies':
        return NextResponse.json({ policies: data.policies });
      case 'assignments':
        return NextResponse.json({ assignments: data.assignments });
      case 'statistics':
        return NextResponse.json({ statistics: data.statistics });
      case 'metrics':
        return NextResponse.json({ teamMetrics: data.statistics });
      case 'equipment':
        return NextResponse.json({ equipment: [] });
      case 'requests':
        return NextResponse.json({ requests: [] });
      default:
        return NextResponse.json(data);
    }
  } catch (error: any) {
    logger.error('Remote Work API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ENGAGEMENT, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const newRequest = {
      ...body,
      id: `rw-req-${Date.now()}`,
      tenantId: user.tenantId,
      requestedBy: user.userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error: any) {
    logger.error('Remote Work Request API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ENGAGEMENT, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { requestId, decision, comments } = body;

    if (!requestId || !decision) {
      return NextResponse.json({ error: 'Request ID and decision are required' }, { status: 400 });
    }

    const updatedRequest = {
      id: requestId,
      tenantId: user.tenantId,
      decision,
      comments: comments || '',
      reviewedBy: user.userId,
      reviewedAt: new Date().toISOString(),
    };

    return NextResponse.json({ request: updatedRequest });
  } catch (error: any) {
    logger.error('Remote Work Review API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
