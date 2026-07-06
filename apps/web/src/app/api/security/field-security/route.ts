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
  successList,
} from '@/lib/api/crud-helpers';

const ACCESS_VALUES = ['view', 'edit', 'hidden'];

// Sensible default field set seeded per role when none exist yet.
const DEFAULT_FIELDS: Array<{
  entityType: string;
  fieldName: string;
  access: string;
  masked: boolean;
}> = [
  { entityType: 'Employee', fieldName: 'salary', access: 'view', masked: true },
  { entityType: 'Employee', fieldName: 'bankAccount', access: 'view', masked: true },
  { entityType: 'Employee', fieldName: 'nationalId', access: 'view', masked: true },
  { entityType: 'Employee', fieldName: 'dob', access: 'view', masked: false },
  { entityType: 'Employee', fieldName: 'email', access: 'edit', masked: false },
  { entityType: 'Employee', fieldName: 'phone', access: 'edit', masked: false },
];

/**
 * GET /api/security/field-security?roleName=...&entityType=...
 * Returns field security rules for a role; seeds defaults if none exist.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/field-security:read'))
      return forbidden('security/field-security:read');

    const params = new URL(request.url).searchParams;
    const roleName = params.get('roleName');
    const entityType = params.get('entityType') || undefined;
    if (!roleName) {
      return errorResponse('E2001', 'roleName is required', 400, undefined, 'اسم الدور مطلوب');
    }

    const where: any = { tenantId: user.tenantId, roleName };
    if (entityType) where.entityType = entityType;

    let rules = await (prisma as any).fieldSecurityRule.findMany({
      where,
      orderBy: [{ entityType: 'asc' }, { fieldName: 'asc' }],
    });

    // Seed a default set so the grid renders for a fresh role.
    if (rules.length === 0) {
      await (prisma as any).fieldSecurityRule.createMany({
        data: DEFAULT_FIELDS.map((f) => ({
          tenantId: user.tenantId,
          roleName,
          entityType: f.entityType,
          fieldName: f.fieldName,
          access: f.access,
          masked: f.masked,
          createdBy: user.userId,
          updatedBy: user.userId,
        })),
        skipDuplicates: true,
      });
      rules = await (prisma as any).fieldSecurityRule.findMany({
        where,
        orderBy: [{ entityType: 'asc' }, { fieldName: 'asc' }],
      });
    }

    return successList(rules, 1, rules.length || 1, rules.length);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/field-security/route.ts' },
      'Failed to list field security rules'
    );
    return serverError(error, 'list field security rules');
  }
});

/**
 * PUT /api/security/field-security — upsert a single rule
 * (roleName + entityType + fieldName -> access / masked).
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/field-security:update'))
      return forbidden('security/field-security:update');

    const body = await safeJson(request);
    if (!body) {
      return errorResponse('E2001', 'Invalid JSON body', 400, undefined, 'نص JSON غير صالح');
    }

    const { roleName, entityType, fieldName } = body;
    if (!roleName || !entityType || !fieldName) {
      return errorResponse(
        'E2001',
        'roleName, entityType and fieldName are required',
        400,
        undefined,
        'اسم الدور ونوع الكيان واسم الحقل مطلوبة'
      );
    }
    if (body.access !== undefined && !ACCESS_VALUES.includes(body.access)) {
      return errorResponse(
        'E2001',
        `access must be one of ${ACCESS_VALUES.join(', ')}`,
        400,
        undefined,
        'قيمة الوصول غير صالحة'
      );
    }

    const access = body.access ?? 'view';
    const masked = body.masked !== undefined ? Boolean(body.masked) : false;

    const rule = await (prisma as any).fieldSecurityRule.upsert({
      where: {
        tenantId_roleName_entityType_fieldName: {
          tenantId: user.tenantId,
          roleName,
          entityType,
          fieldName,
        },
      },
      update: { access, masked, updatedBy: user.userId },
      create: {
        tenantId: user.tenantId,
        roleName,
        entityType,
        fieldName,
        access,
        masked,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });

    return successItem(rule);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/field-security/route.ts' },
      'Failed to upsert field security rule'
    );
    return serverError(error, 'upsert field security rule');
  }
});

export const POST = PUT;
