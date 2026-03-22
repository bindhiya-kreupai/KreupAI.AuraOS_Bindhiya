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
  return users.map(u => u.id);
}

/**
 * GET /api/v1/recruitment/applications
 * List candidate applications with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const jobPostingId = searchParams.get('jobPostingId') || undefined;
    const stage = searchParams.get('stage') || undefined;

    const tenantUserIds = await getTenantUserIds(user.tenantId);
    const tenantCreatedBy = { in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'] };

    const where: Record<string, unknown> = {
      jobPosting: { createdBy: tenantCreatedBy },
    };
    if (status) where.status = status;
    if (jobPostingId) where.jobPostingId = jobPostingId;
    if (stage) where.currentStage = stage.toUpperCase();

    const [data, total] = await Promise.all([
      prisma.candidateApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedDate: 'desc' },
        include: {
          candidate: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          jobPosting: { select: { id: true, title: true, department: true } },
          _count: { select: { interviews: true, offers: true } },
        },
      }),
      prisma.candidateApplication.count({ where }),
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
    console.error('[Applications API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch applications' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/applications
 * Create a new candidate application
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();

    if (!body.candidateId || !body.jobPostingId) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'candidateId and jobPostingId are required' } },
        { status: 400 }
      );
    }

    // Verify job posting exists
    const job = await prisma.jobPosting.findFirst({
      where: { id: body.jobPostingId, isDeleted: false },
    });
    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
        { status: 404 }
      );
    }

    // Check for duplicate application
    const existing = await prisma.candidateApplication.findFirst({
      where: { candidateId: body.candidateId, jobPostingId: body.jobPostingId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E4002', message: 'Candidate has already applied for this position' } },
        { status: 409 }
      );
    }

    const application = await prisma.candidateApplication.create({
      data: {
        candidateId: body.candidateId,
        jobPostingId: body.jobPostingId,
        status: 'applied',
        currentStage: 'APPLIED',
        source: body.source || 'direct',
        resumeUrl: body.resumeUrl || null,
        coverLetter: body.coverLetter || null,
        notes: body.notes || null,
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPosting: { select: { id: true, title: true, department: true } },
      },
    });

    // Increment applies counter on job posting
    await prisma.jobPosting.update({
      where: { id: body.jobPostingId },
      data: { applies: { increment: 1 } },
    });

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: 'Application submitted successfully',
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Applications API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to create application' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_CREATED,
  resourceType: 'candidate_application',
  captureRequestBody: true,
});
