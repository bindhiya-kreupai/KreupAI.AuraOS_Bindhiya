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

const VALID_STAGES = [
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
 * PUT /api/v1/recruitment/applications/[id]/stage
 * Move a candidate application to a new pipeline stage
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
      const id = context.params?.id;

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'Application ID is required' } },
          { status: 400 }
        );
      }

      const body = await request.json();
      const stage = String(body.stage || '').toUpperCase();

      if (!stage || !VALID_STAGES.includes(stage)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2002',
              message: `Invalid stage. Valid stages: ${VALID_STAGES.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }

      const tenantUserIds = await getTenantUserIds(user.tenantId);

      // Verify application exists and belongs to tenant
      const application = await prisma.candidateApplication.findFirst({
        where: {
          id,
          jobPosting: {
            createdBy: { in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'] },
          },
        },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Application not found' } },
          { status: 404 }
        );
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        currentStage: stage,
      };

      // Derive status from stage
      if (stage === 'REJECTED') {
        updateData.status = 'rejected';
        if (body.reason) updateData.rejectionReason = body.reason;
      } else if (stage === 'WITHDRAWN') {
        updateData.status = 'withdrawn';
      } else if (stage === 'HIRED') {
        updateData.status = 'hired';
      } else if (stage === 'OFFER' || stage === 'OFFER_ACCEPTED') {
        updateData.status = 'offer';
      } else {
        updateData.status = 'in_review';
      }

      if (body.notes) updateData.notes = body.notes;

      const updated = await prisma.candidateApplication.update({
        where: { id },
        data: updateData,
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          jobPosting: { select: { id: true, title: true, department: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Application moved to ${stage}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[Applications Stage API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update application stage' } },
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
