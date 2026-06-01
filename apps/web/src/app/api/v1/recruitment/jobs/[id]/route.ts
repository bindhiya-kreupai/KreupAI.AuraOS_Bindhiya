import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/jobs/[id]
 * Get a specific job posting
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = await context.params;

    const job = await prisma.jobPosting.findFirst({
      where: { id, isDeleted: false },
      include: {
        candidateApplications: {
          select: {
            id: true,
            status: true,
            appliedDate: true,
            candidate: { select: { id: true, firstName: true, lastName: true } },
          },
          take: 10,
          orderBy: { appliedDate: 'desc' },
        },
        _count: { select: { candidateApplications: true } },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Job Posting API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch job posting' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/jobs/[id]
 * Update a job posting
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

      const job = await prisma.jobPosting.findFirst({ where: { id, isDeleted: false } });

      if (!job) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
          { status: 404 }
        );
      }

      const updated = await prisma.jobPosting.update({
        where: { id },
        data: {
          title: body.title,
          department: body.department,
          location: body.location,
          type: body.type,
          status: body.status,
          description: body.description,
          channels: body.channels,
          updatedBy: user.id,
          postedDate: body.status === 'Active' && !job.postedDate ? new Date() : job.postedDate,
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
      console.error('[Job Posting API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update job posting' } },
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
