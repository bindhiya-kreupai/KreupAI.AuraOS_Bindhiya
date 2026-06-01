import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

function normalizeStage(stage?: string): string | undefined {
  if (!stage) {
    return undefined;
  }

  const stageMap: Record<string, string> = {
    applied: 'APPLIED',
    screening: 'SCREENING',
    phone_screen: 'PHONE_INTERVIEW',
    technical: 'TECHNICAL_INTERVIEW',
    hr_interview: 'HIRING_MANAGER_INTERVIEW',
    offer: 'OFFER',
    hired: 'HIRED',
    rejected: 'REJECTED',
  };

  return stageMap[stage] || stage.toUpperCase();
}

async function getTenantUserIds(tenantId: string): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  });

  return users.map((user) => user.id);
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
] as const;

/**
 * PUT /api/v1/recruitment/candidates/[id]/stage
 * Move a candidate to a different pipeline stage
 */
export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (
        !permissions.includes('recruitment:write') &&
        !permissions.includes('recruitment:update')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing recruitment:write permission',
              messageAr: 'ممنوع: صلاحية كتابة التوظيف غير متوفرة',
            },
          },
          { status: 403 }
        );
      }
      const { id } = context.params; // This is the candidateApplication ID
      const body = await request.json();
      const normalizedStage = normalizeStage(body.stage);
      const tenantUserIds = await getTenantUserIds(user.tenantId);
      const tenantCreatedBy = {
        in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
      };

      if (!normalizedStage) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: `stage is required. Must be one of: ${PIPELINE_STAGES.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }

      if (!PIPELINE_STAGES.includes(normalizedStage as any)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: `Invalid stage. Must be one of: ${PIPELINE_STAGES.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }

      const application = await prisma.candidateApplication.findFirst({
        where: {
          OR: [{ id }, { candidateId: id }],
          jobPosting: { createdBy: tenantCreatedBy },
        },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Candidate application not found' } },
          { status: 404 }
        );
      }

      const terminalStages = ['HIRED', 'REJECTED', 'WITHDRAWN', 'OFFER_ACCEPTED'];
      if (terminalStages.includes(application.currentStage.toUpperCase())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4003',
              message: `Cannot move candidate from terminal stage: ${application.currentStage}`,
            },
          },
          { status: 422 }
        );
      }

      const updated = await prisma.candidateApplication.update({
        where: { id: application.id },
        data: {
          currentStage: normalizedStage,
          status:
            normalizedStage === 'HIRED'
              ? 'HIRED'
              : normalizedStage === 'REJECTED'
                ? 'REJECTED'
                : 'IN_PROGRESS',
          rejectionReason:
            normalizedStage === 'REJECTED' ? body.reason || application.rejectionReason : null,
          notes: body.reason || application.notes,
        },
        include: {
          candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
          jobPosting: { select: { id: true, title: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Candidate moved to ${normalizedStage} stage`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      console.error('[Candidate Stage API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update candidate stage' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'candidate_application',
    captureRequestBody: true,
  }
);
