import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;

    // Proxy to analytics-service
    const result = await ServiceProxy.get('analytics', '/api/v1/compliance/audit', {
      tenantId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ComplianceAudit API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance audit data' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();
    const { user } = context;

    // Proxy to analytics-service or a specialized compliance service
    // For now, assuming analytics-service handles compliance reporting/auditing metrics
    const result = await ServiceProxy.post('analytics', '/api/v1/compliance/audit', {
      ...body,
      tenantId: user.tenantId,
      performedBy: user.id
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ComplianceAudit POST API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to report violation' },
      { status: 500 }
    );
  }
});
