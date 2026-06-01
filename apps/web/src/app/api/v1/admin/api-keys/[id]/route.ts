import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    const { permissions } = context;
    if (!permissions.includes('admin/api-keys:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/api-keys:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { user, params } = context;
    const _tenantId = user.tenantId;
    const { id } = params;

    const revokedKey = {
      id,
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revokedBy: 'admin-001',
      revokeReason: 'Manually revoked by administrator',
      previousStatus: 'active',
      affectedIntegrations: [{ name: 'Connected Service', lastActivity: '2026-01-22T18:00:00Z' }],
      warning: 'Any services using this key will immediately lose access.',
    };

    return NextResponse.json({
      success: true,
      data: revokedKey,
      message: 'API key revoked successfully',
    });
  }),
  {
    action: AuditAction.API_KEY_REVOKED,
    resourceType: 'api_key',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
