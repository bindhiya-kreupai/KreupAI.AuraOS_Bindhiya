import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { logger } from '@/lib/logger';

export const DELETE = withAudit(
  withEnhancedAuth(async (_request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
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
      const tenantId = user.tenantId;
      const { id } = params;

      // Confirm the key exists in this tenant before revoking
      const existing = await prisma.aPIKey.findFirst({
        where: { id, tenantId },
      });
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'API key not found' },
          },
          { status: 404 }
        );
      }
      if (existing.revokedAt) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2003', message: 'API key is already revoked' },
          },
          { status: 409 }
        );
      }

      const revoked = await prisma.aPIKey.update({
        where: { id },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: revoked.id,
          name: revoked.name,
          status: 'revoked',
          revokedAt: revoked.revokedAt?.toISOString(),
          previousStatus: 'active',
          warning: 'Any services using this key will immediately lose access.',
        },
        message: 'API key revoked successfully',
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to revoke API key');
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5001', message: 'Failed to revoke API key' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.API_KEY_REVOKED,
    resourceType: 'api_key',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
