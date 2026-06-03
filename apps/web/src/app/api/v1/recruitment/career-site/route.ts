import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

async function getTenantUserIds(tenantId: string): Promise<string[]> {
  // tenant-ok: helper takes tenantId as a typed parameter
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

/**
 * GET /api/v1/recruitment/career-site
 * Get career site data — live job counts and open positions from the database
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
    const tenantUserIds = await getTenantUserIds(user.tenantId);
    const tenantCreatedBy = {
      in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
    };

    const [activeJobs, departmentBreakdown] = await Promise.all([
      prisma.jobPosting.findMany({
        where: {
          isDeleted: false,
          status: { in: ['published', 'open', 'active'] },
          createdBy: tenantCreatedBy,
        },
        select: {
          id: true,
          title: true,
          department: true,
          location: true,
          type: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobPosting.groupBy({
        by: ['department'],
        where: {
          isDeleted: false,
          status: { in: ['published', 'open', 'active'] },
          createdBy: tenantCreatedBy,
        },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        activeJobCount: activeJobs.length,
        jobs: activeJobs,
        departmentBreakdown: departmentBreakdown.map((d) => ({
          department: d.department,
          openPositions: d._count.id,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Career Site API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch career site data' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/career-site
 * Update a job posting's visibility for career site (publish/unpublish)
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
      const body = await request.json();

      if (!body.jobId || !body.action) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'jobId and action (publish, unpublish) are required' },
          },
          { status: 400 }
        );
      }

      const tenantUserIds = await getTenantUserIds(user.tenantId);
      const job = await prisma.jobPosting.findFirst({
        where: {
          id: body.jobId,
          isDeleted: false,
          createdBy: { in: tenantUserIds },
        },
      });

      if (!job) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
          { status: 404 }
        );
      }

      const newStatus = body.action === 'publish' ? 'published' : 'draft';

      const updated = await prisma.jobPosting.update({
        where: { id: body.jobId },
        data: { status: newStatus },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Job posting ${body.action === 'publish' ? 'published' : 'unpublished'} successfully`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[Career Site API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update career site' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'job_posting',
    captureRequestBody: true,
  }
);
