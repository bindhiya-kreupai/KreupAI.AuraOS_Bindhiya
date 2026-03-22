import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    const result = await ServiceProxy.get('analytics', '/api/v1/compliance/audit', {
      tenantId: user.tenantId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ComplianceAudit API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch compliance audit data' } },
      { status: 500 }
    );
  }
});

export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const result = await ServiceProxy.post('analytics', '/api/v1/compliance/audit', {
      ...body,
      tenantId: user.tenantId,
      performedBy: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ComplianceAudit API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to report violation' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.REPORT_GENERATED,
  resourceType: 'compliance_audit',
  captureRequestBody: true,
});
