import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  serverError,
  safeJson,
  validationError,
} from '@/lib/api/crud-helpers';
import { mapEvidence } from '../../../_lib/compliance-mappers';

/**
 * POST /api/v1/compliance/controls/[controlId]/evidence
 * Body: SubmitEvidenceInput. Creates a ComplianceEvidence row and returns it
 * mapped to the ComplianceEvidence shape (bare object).
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('compliance/controls:create')) {
      return forbidden('compliance/controls:create');
    }

    const controlId = params?.controlId;
    if (!controlId) return notFound('Compliance control');

    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    if (!body.fileName || !body.fileType) {
      return validationError({ message: 'fileName and fileType are required' });
    }

    const control = await (prisma as any).complianceControl.findFirst({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        OR: [{ id: controlId }, { code: controlId }],
      },
      select: { id: true },
    });
    if (!control) return notFound('Compliance control');

    const created = await (prisma as any).complianceEvidence.create({
      data: {
        tenantId: user.tenantId,
        controlId: control.id,
        fileName: body.fileName,
        fileType: body.fileType,
        fileSize: Number(body.fileSize) || 0,
        fileUrl: body.fileUrl ?? null,
        description: body.description ?? null,
        status: 'pending',
        uploadedBy: user.userId,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });

    return NextResponse.json(mapEvidence(created), { status: 201 });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'v1/compliance/controls/[controlId]/evidence/route.ts' },
      'Failed to submit evidence'
    );
    return serverError(error, 'submit evidence');
  }
});
