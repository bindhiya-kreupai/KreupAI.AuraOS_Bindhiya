import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/requisitions
 * List job requisitions with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const department = searchParams.get('department') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const approvalStatus = searchParams.get('approvalStatus') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (priority) where.priority = priority;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const [data, total] = await Promise.all([
      prisma.jobRequisition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobRequisition.count({ where }),
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
    console.error('[Requisitions API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch requisitions' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/requisitions
 * Create a new job requisition
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.jobTitle || !body.department) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'jobTitle and department are required' } },
        { status: 400 }
      );
    }

    const requisition = await prisma.jobRequisition.create({
      data: {
        tenantId: user.tenantId,
        jobTitle: body.jobTitle,
        department: body.department,
        requestedBy: user.id,
        numberOfPositions: body.numberOfPositions || 1,
        employmentType: body.employmentType || null,
        priority: body.priority || 'Medium',
        status: 'Draft',
        location: body.location || null,
        salaryRange: body.salaryRange || null,
        requiredSkills: body.requiredSkills || [],
        description: body.description || null,
        justification: body.justification || null,
        approvalStatus: 'Pending',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: requisition,
        message: 'Job requisition created successfully',
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Requisitions API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to create requisition' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_CREATED,
  resourceType: 'job_requisition',
  captureRequestBody: true,
});
