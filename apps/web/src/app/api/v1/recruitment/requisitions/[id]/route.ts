import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/requisitions/[id]
 * Get a single job requisition by ID
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const id = context.params?.id;

    const requisition = await prisma.jobRequisition.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!requisition) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Job requisition not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requisition,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Requisitions API] GET [id] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch requisition' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/requisitions/[id]
 * Update a job requisition
 */
export const PUT = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const id = context.params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Requisition ID is required' } },
        { status: 400 }
      );
    }

    const existing = await prisma.jobRequisition.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Job requisition not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.numberOfPositions !== undefined) updateData.numberOfPositions = body.numberOfPositions;
    if (body.employmentType !== undefined) updateData.employmentType = body.employmentType;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.salaryRange !== undefined) updateData.salaryRange = body.salaryRange;
    if (body.requiredSkills !== undefined) updateData.requiredSkills = body.requiredSkills;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.justification !== undefined) updateData.justification = body.justification;
    if (body.approvalStatus !== undefined) updateData.approvalStatus = body.approvalStatus;
    if (body.approvedBy !== undefined) updateData.approvedBy = body.approvedBy;
    if (body.approvedDate !== undefined) updateData.approvedDate = new Date(body.approvedDate);
    // Handle isActive toggle from frontend publish/unpublish
    if (body.isActive !== undefined) {
      updateData.status = body.isActive ? 'Open' : 'Closed';
    }

    const updated = await prisma.jobRequisition.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Job requisition updated successfully',
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Requisitions API] PUT [id] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update requisition' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'job_requisition',
  captureRequestBody: true,
});
