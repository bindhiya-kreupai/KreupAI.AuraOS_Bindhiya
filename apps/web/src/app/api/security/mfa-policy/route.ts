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
} from '@/lib/api/crud-helpers';

const ALLOWED_METHODS = ['totp', 'sms', 'email', 'webauthn'];

async function getOrCreatePolicy(tenantId: string, userId: string) {
  const existing = await (prisma as any).mfaPolicy.findUnique({ where: { tenantId } });
  if (existing) return existing;
  return (prisma as any).mfaPolicy.create({
    data: {
      tenantId,
      enforced: false,
      allowedMethods: ['totp'],
      enforceForAdmins: true,
      enforceForAllUsers: false,
      enforceForRemote: false,
      graceperiodDays: 7,
      rememberDeviceDays: 30,
      createdBy: userId,
      updatedBy: userId,
    },
  });
}

/**
 * GET /api/security/mfa-policy — returns the tenant MFA policy (creating a
 * default row if none exists so the page is never empty).
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/mfa:read')) return forbidden('security/mfa:read');
    const policy = await getOrCreatePolicy(user.tenantId, user.userId);
    return successItem(policy);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/mfa-policy/route.ts' },
      'Failed to load MFA policy'
    );
    return serverError(error, 'load MFA policy');
  }
});

/**
 * PUT /api/security/mfa-policy — updates the tenant MFA policy.
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/mfa:update')) return forbidden('security/mfa:update');

    const body = await safeJson(request);
    if (!body) {
      return errorResponse('E2001', 'Invalid JSON body', 400, undefined, 'نص JSON غير صالح');
    }

    const data: any = { updatedBy: user.userId };

    if (body.enforced !== undefined) data.enforced = Boolean(body.enforced);
    if (body.enforceForAdmins !== undefined) data.enforceForAdmins = Boolean(body.enforceForAdmins);
    if (body.enforceForAllUsers !== undefined)
      data.enforceForAllUsers = Boolean(body.enforceForAllUsers);
    if (body.enforceForRemote !== undefined) data.enforceForRemote = Boolean(body.enforceForRemote);

    if (body.graceperiodDays !== undefined) {
      const n = Number(body.graceperiodDays);
      if (Number.isNaN(n) || n < 0) {
        return errorResponse(
          'E2001',
          'graceperiodDays must be a non-negative number',
          400,
          undefined,
          'يجب أن تكون فترة السماح رقمًا غير سالب'
        );
      }
      data.graceperiodDays = Math.floor(n);
    }
    if (body.rememberDeviceDays !== undefined) {
      const n = Number(body.rememberDeviceDays);
      if (Number.isNaN(n) || n < 0) {
        return errorResponse(
          'E2001',
          'rememberDeviceDays must be a non-negative number',
          400,
          undefined,
          'يجب أن يكون عدد أيام تذكر الجهاز رقمًا غير سالب'
        );
      }
      data.rememberDeviceDays = Math.floor(n);
    }

    if (body.allowedMethods !== undefined) {
      if (!Array.isArray(body.allowedMethods)) {
        return errorResponse(
          'E2001',
          'allowedMethods must be an array',
          400,
          undefined,
          'يجب أن تكون طرق المصادقة مصفوفة'
        );
      }
      const methods = body.allowedMethods.filter((m: unknown) =>
        ALLOWED_METHODS.includes(m as string)
      );
      data.allowedMethods = methods;
    }

    // Ensure a row exists before updating.
    await getOrCreatePolicy(user.tenantId, user.userId);
    const updated = await (prisma as any).mfaPolicy.update({
      where: { tenantId: user.tenantId },
      data,
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/mfa-policy/route.ts' },
      'Failed to update MFA policy'
    );
    return serverError(error, 'update MFA policy');
  }
});
