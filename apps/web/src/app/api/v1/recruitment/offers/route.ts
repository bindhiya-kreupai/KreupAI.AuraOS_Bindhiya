import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

async function getTenantUserIds(tenantId: string): Promise<string[]> {
  const users = await prisma.user.findMany({ where: { tenantId }, select: { id: true } });
  return users.map((u) => u.id);
}

/**
 * GET /api/v1/recruitment/offers
 * List job offers
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
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
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || undefined;

    const tenantUserIds = await getTenantUserIds(user.tenantId);
    const tenantCreatedBy = {
      in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
    };

    const where: Record<string, unknown> = {
      application: { jobPosting: { createdBy: tenantCreatedBy } },
    };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
              jobPosting: { select: { id: true, title: true, department: true } },
            },
          },
        },
      }),
      prisma.jobOffer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Offers API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch offers' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/offers
 * Create a new job offer
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { _user, permissions } = context;
      if (!permissions.includes('recruitment:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing recruitment:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      if (!body.applicationId || !body.salary) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'applicationId and salary are required' },
          },
          { status: 400 }
        );
      }

      const application = await prisma.candidateApplication.findUnique({
        where: { id: body.applicationId },
        include: { jobPosting: true },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Application not found' } },
          { status: 404 }
        );
      }

      const offer = await prisma.jobOffer.create({
        data: {
          applicationId: body.applicationId,
          jobTitle: body.jobTitle || application.jobPosting.title,
          department: body.department || application.jobPosting.department,
          location: body.location || application.jobPosting.location,
          employmentType: body.employmentType || application.jobPosting.type,
          startDate: body.startDate ? new Date(body.startDate) : null,
          salary: body.salary,
          currency: body.currency || 'USD',
          bonus: body.bonus || null,
          equity: body.equity || null,
          benefits: body.benefits || null,
          status: 'draft',
          expiryDate: body.expiryDate
            ? new Date(body.expiryDate)
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          notes: body.notes || null,
        },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      // Move candidate to OFFER stage
      await prisma.candidateApplication.update({
        where: { id: body.applicationId },
        data: { currentStage: 'OFFER', status: 'IN_PROGRESS' },
      });

      return NextResponse.json(
        {
          success: true,
          data: offer,
          message: 'Offer created successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[Offers API] POST Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to create offer' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_CREATED,
    resourceType: 'job_offer',
    captureRequestBody: true,
  }
);
