import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('benefits:cobra:write')) return forbidden('benefits:cobra:write');
    const body = await safeJson(request);
    if (!body?.amount) return validationError({ message: 'amount required' });
    // record COBRA premium payment against the BenefitEnrollment (or BenefitClaim if used for this)
    const enrollment = await prisma.benefitEnrollment.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!enrollment) return notFound('COBRA enrollment');
    const claim = await prisma.benefitClaim.create({
      data: {
        tenantId: user.tenantId,
        employeeId: enrollment.employeeId,
        enrollmentId: enrollment.id,
        claimType: 'COBRA_PREMIUM' as any,
        amount: body.amount,
        status: 'PAID' as any,
        paidAt: new Date(),
        description: `COBRA premium payment for period ${body.coveragePeriod || 'current'}`,
      } as any,
    });
    return successItem(claim, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'record premium');
  }
});
