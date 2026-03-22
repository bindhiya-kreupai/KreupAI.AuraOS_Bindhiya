import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

async function getTenantUserIds(tenantId: string): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  });
  return users.map(u => u.id);
}

const PIPELINE_STAGES = [
  'APPLIED',
  'SCREENING',
  'PHONE_INTERVIEW',
  'TECHNICAL_INTERVIEW',
  'HIRING_MANAGER_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER',
  'OFFER_ACCEPTED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
];

/**
 * GET /api/v1/recruitment/pipeline
 * Get pipeline stage counts and candidates per stage
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get('jobPostingId') || undefined;

    const tenantUserIds = await getTenantUserIds(user.tenantId);
    const tenantCreatedBy = { in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'] };

    const where: Record<string, unknown> = {
      jobPosting: { createdBy: tenantCreatedBy, isDeleted: false },
    };
    if (jobPostingId) where.jobPostingId = jobPostingId;

    const applications = await prisma.candidateApplication.findMany({
      where,
      select: {
        id: true,
        currentStage: true,
        status: true,
        appliedDate: true,
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPosting: { select: { id: true, title: true, department: true } },
      },
    });

    // Group by stage
    const stageGroups = new Map<string, typeof applications>();
    for (const app of applications) {
      const stage = app.currentStage.toUpperCase();
      const list = stageGroups.get(stage) || [];
      list.push(app);
      stageGroups.set(stage, list);
    }

    const pipeline = PIPELINE_STAGES.map(stage => ({
      stage,
      count: stageGroups.get(stage)?.length || 0,
      candidates: (stageGroups.get(stage) || []).slice(0, 10).map(app => ({
        applicationId: app.id,
        candidateId: app.candidate.id,
        name: `${app.candidate.firstName} ${app.candidate.lastName}`,
        email: app.candidate.email,
        jobTitle: app.jobPosting.title,
        department: app.jobPosting.department,
        appliedDate: app.appliedDate,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalApplications: applications.length,
        stages: pipeline.filter(s => s.count > 0 || ['APPLIED', 'SCREENING', 'OFFER', 'HIRED'].includes(s.stage)),
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Pipeline API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch pipeline data' } },
      { status: 500 }
    );
  }
});
