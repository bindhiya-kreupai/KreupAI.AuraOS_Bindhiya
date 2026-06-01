import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/background-check
 * List background checks for the tenant
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
    const status = searchParams.get('status') || undefined;
    const applicationId = searchParams.get('applicationId') || undefined;
    const candidateId = searchParams.get('candidateId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    if (status) where.status = status;
    if (applicationId) where.applicationId = applicationId;
    if (candidateId) where.candidateId = candidateId;

    const [checks, total] = await Promise.all([
      prisma.backgroundCheck.findMany({
        where,
        orderBy: { requestDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.backgroundCheck.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: checks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Background Check API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch background checks' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/background-check
 * Initiate a new background check
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
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

      if (!body.checkType) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'checkType is required' } },
          { status: 400 }
        );
      }

      if (!body.candidateId && !body.applicationId && !body.employeeId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'At least one of candidateId, applicationId, or employeeId is required',
            },
          },
          { status: 400 }
        );
      }

      // If applicationId provided, verify it exists
      if (body.applicationId) {
        const application = await prisma.candidateApplication.findUnique({
          where: { id: body.applicationId },
        });
        if (!application) {
          return NextResponse.json(
            { success: false, error: { code: 'E4001', message: 'Application not found' } },
            { status: 404 }
          );
        }
      }

      const check = await prisma.backgroundCheck.create({
        data: {
          tenantId: user.tenantId,
          applicationId: body.applicationId || null,
          candidateId: body.candidateId || null,
          employeeId: body.employeeId || null,
          checkType: body.checkType,
          provider: body.provider || null,
          status: 'pending',
          notes: body.notes || null,
          initiatedBy: user.id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: check,
          message: 'Background check initiated successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[Background Check API] POST Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5001', message: 'Failed to initiate background check' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_CREATED,
    resourceType: 'background_check',
    captureRequestBody: true,
  }
);
