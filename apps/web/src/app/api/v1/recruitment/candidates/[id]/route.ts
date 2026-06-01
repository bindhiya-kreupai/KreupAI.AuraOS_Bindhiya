import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

async function getTenantUserIds(tenantId: string): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

/**
 * GET /api/v1/recruitment/candidates/[id]
 * Get a specific candidate with full details
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { _user } = context;
    const { id } = context.params;
    const tenantUserIds = await getTenantUserIds(_user.tenantId);
    const tenantCreatedBy = {
      in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
    };

    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        applications: {
          some: {
            jobPosting: { createdBy: tenantCreatedBy },
          },
        },
      },
      include: {
        applications: {
          include: {
            jobPosting: { select: { id: true, title: true, department: true } },
            interviews: {
              select: { id: true, scheduledDate: true, status: true, type: true },
              orderBy: { scheduledDate: 'desc' },
            },
          },
          orderBy: { appliedDate: 'desc' },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Candidate not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: candidate,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch candidate' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/candidates/[id]
 * Update candidate information
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
      const { id } = context.params;
      const body = await request.json();
      const tenantUserIds = await getTenantUserIds(user.tenantId);
      const tenantCreatedBy = {
        in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
      };

      const candidate = await prisma.candidate.findFirst({
        where: {
          id,
          applications: {
            some: {
              jobPosting: { createdBy: tenantCreatedBy },
            },
          },
        },
      });

      if (!candidate) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Candidate not found' } },
          { status: 404 }
        );
      }

      const updated = await prisma.candidate.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          location: body.location,
          skills: body.skills,
          linkedinUrl: body.linkedinUrl,
          resumeUrl: body.resumeUrl,
          source: body.source,
          experience: body.experience,
          education: body.education,
          notes: body.notes,
          updatedAt: new Date(),
          updatedBy: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      console.error('[Candidate API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update candidate' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'candidate',
    captureRequestBody: true,
  }
);
