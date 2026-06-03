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
 * GET /api/v1/recruitment/referrals
 * List referral applications (CandidateApplications where source contains 'referral')
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
    const referrerId = searchParams.get('referrerId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const tenantUserIds = await getTenantUserIds(user.tenantId);
    const tenantCreatedBy = {
      in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
    };

    const where: Record<string, unknown> = {
      source: { contains: 'referral', mode: 'insensitive' },
      jobPosting: { createdBy: tenantCreatedBy, isDeleted: false },
    };

    if (status) where.status = status;
    if (referrerId) {
      where.notes = { contains: referrerId, mode: 'insensitive' };
    }

    const [referrals, total] = await Promise.all([
      prisma.candidateApplication.findMany({
        where,
        orderBy: { appliedDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          jobPosting: {
            select: { id: true, title: true, department: true },
          },
        },
      }),
      prisma.candidateApplication.count({ where }),
    ]);

    const data = referrals.map((r) => ({
      id: r.id,
      candidateId: r.candidate.id,
      candidateName: `${r.candidate.firstName} ${r.candidate.lastName}`,
      candidateEmail: r.candidate.email,
      jobId: r.jobPosting.id,
      jobTitle: r.jobPosting.title,
      department: r.jobPosting.department,
      status: r.status,
      currentStage: r.currentStage,
      source: r.source,
      appliedDate: r.appliedDate,
      notes: r.notes,
    }));

    return NextResponse.json({
      success: true,
      data: { referrals: data, total },
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Referrals API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch referrals' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/referrals
 * Submit a referral — creates a Candidate + CandidateApplication with source='referral'
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

      if (!body.candidateEmail || !body.candidateName || !body.jobId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'candidateEmail, candidateName, and jobId are required',
            },
          },
          { status: 400 }
        );
      }

      const tenantUserIds = await getTenantUserIds(user.tenantId);

      // Verify the job posting exists and belongs to tenant
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

      // Parse candidate name
      const nameParts = body.candidateName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Find or create the candidate by email
      let candidate = await prisma.candidate.findUnique({
        where: { email: body.candidateEmail },
      });

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            firstName,
            lastName,
            email: body.candidateEmail,
            phone: body.candidatePhone || null,
            source: `referral:${user.id}`,
            skills: body.skills || [],
          },
        });
      }

      // Check for duplicate application
      const existingApp = await prisma.candidateApplication.findFirst({
        where: { candidateId: candidate.id, jobPostingId: body.jobId },
      });

      if (existingApp) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4002',
              message: 'Candidate has already been referred/applied for this position',
            },
          },
          { status: 409 }
        );
      }

      // Build referral note with referrer info
      const referralNote = [
        `Referred by: ${user.id}`,
        body.relationship ? `Relationship: ${body.relationship}` : null,
        body.notes ? `Notes: ${body.notes}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const application = await prisma.candidateApplication.create({
        data: {
          candidateId: candidate.id,
          jobPostingId: body.jobId,
          source: `referral:${user.id}`,
          status: 'applied',
          currentStage: 'APPLIED',
          notes: referralNote,
          resumeUrl: body.resumeUrl || null,
        },
        include: {
          candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
          jobPosting: { select: { id: true, title: true, department: true } },
        },
      });

      // Increment job applies count
      await prisma.jobPosting.update({
        where: { id: body.jobId },
        data: { applies: { increment: 1 } },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            referralId: application.id,
            candidateId: candidate.id,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            candidateEmail: candidate.email,
            jobId: application.jobPosting.id,
            jobTitle: application.jobPosting.title,
            status: application.status,
            source: application.source,
            appliedDate: application.appliedDate,
          },
          message: 'Referral submitted successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[Referrals API] POST Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to submit referral' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_CREATED,
    resourceType: 'referral',
    captureRequestBody: true,
  }
);
