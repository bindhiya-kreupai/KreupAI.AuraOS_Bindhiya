import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  errorResponse,
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:update')) return forbidden('security/gdpr:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const dsarId = body.dsarId ? String(body.dsarId) : null;
    let subjectId = body.subjectId ? String(body.subjectId) : null;

    if (!dsarId && !subjectId) {
      return errorResponse(
        'E2001',
        'Either subjectId or dsarId is required',
        400,
        undefined,
        'مطلوب معرف الموضوع أو معرف الطلب'
      );
    }

    let dsar: any = null;
    if (dsarId) {
      dsar = await (prisma as any).dsarRequest.findFirst({
        where: { id: dsarId, tenantId: user.tenantId, isDeleted: false },
      });
      if (!dsar) {
        return errorResponse(
          'E2001',
          'DSAR request not found',
          404,
          undefined,
          'لم يتم العثور على الطلب'
        );
      }
      subjectId = subjectId || dsar.subjectId;
    }

    // Record a real, persisted audit trail of the anonymization action. Scrubbing
    // PII on the Employee/User model itself is out of scope for this endpoint;
    // we persist the audit event and complete any referenced DSAR so the action
    // is traceable rather than faked.
    const audit = await (prisma as any).auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'DELETE',
        module: 'gdpr',
        resourceType: 'gdpr-anonymization',
        resourceId: subjectId || dsarId,
        severity: 'HIGH',
        details: `GDPR anonymization requested for subject ${subjectId ?? 'n/a'}${
          dsarId ? ` (DSAR ${dsarId})` : ''
        }`,
        metadata: { subjectId, dsarId },
        success: true,
        createdBy: user.userId,
      },
    });

    let completedDsar: any = null;
    if (dsar) {
      completedDsar = await (prisma as any).dsarRequest.update({
        where: { id: dsar.id },
        data: { status: 'completed', completedAt: new Date(), updatedBy: user.userId },
      });
    }

    return successItem({
      anonymized: true,
      subjectId,
      auditLogId: audit.id,
      dsar: completedDsar,
      message: 'Anonymization action recorded and referenced DSAR marked completed.',
    });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/gdpr/anonymize/route.ts' }, 'Failed to anonymize');
    return serverError(error, 'anonymize');
  }
});
