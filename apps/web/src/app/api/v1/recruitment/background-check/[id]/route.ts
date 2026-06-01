import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/background-check/[id]
 * Get a specific background check by ID
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = await context.params;

    const check = await prisma.backgroundCheck.findUnique({
      where: { id },
    });

    if (!check || check.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Background check not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: check,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Background Check API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch background check' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/background-check/[id]
 * Update background check status/results
 */
export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('recruitment:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing recruitment:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = await context.params;
      const body = await request.json();

      const check = await prisma.backgroundCheck.findUnique({
        where: { id },
      });

      if (!check || check.tenantId !== user.tenantId) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Background check not found' } },
          { status: 404 }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (body.status) updateData.status = body.status;
      if (body.result) updateData.result = body.result;
      if (body.findings !== undefined) updateData.findings = body.findings;
      if (body.documentUrl !== undefined) updateData.documentUrl = body.documentUrl;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.provider) updateData.provider = body.provider;

      // Auto-set completionDate when status changes to a terminal state
      if (body.status && ['completed', 'passed', 'failed', 'cancelled'].includes(body.status)) {
        updateData.completionDate = new Date();
      }

      const updated = await prisma.backgroundCheck.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Background check updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[Background Check API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update background check' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'background_check',
    captureRequestBody: true,
  }
);
