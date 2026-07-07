import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapRuleToApi, type SodRuleRow } from '../_shared';

/**
 * POST /api/v1/access-governance/sod-check -> SoDCheckResult (body {userId, requestedRole})
 *
 * Looks up the user's current roles (UserRole join Role scoped by tenant) and checks
 * them against active SoD rules' conflicting entities.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:create')) {
      return forbiddenResponse('access-governance:create');
    }
    const tenantId = user.tenantId;

    const body = await request.json().catch(() => null);
    const targetUserId: string = body?.userId ?? '';
    const requestedRole: string = body?.requestedRole ?? '';

    if (!targetUserId || !requestedRole) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4000',
            message: 'userId and requestedRole are required',
            messageAr: 'معرف المستخدم والدور المطلوب مطلوبان',
          },
        },
        { status: 400 }
      );
    }

    // Current roles for the user in this tenant.
    const userRoles = await (prisma as any).userRole.findMany({
      where: { userId: targetUserId, tenantId, isDeleted: false },
      include: { role: true },
    });
    const currentRoles: string[] = userRoles
      .map((ur: any) => ur.role?.name)
      .filter((n: unknown): n is string => typeof n === 'string');

    const ruleRows: SodRuleRow[] = await (prisma as any).sodRule.findMany({
      where: { tenantId, isActive: true, isDeleted: false },
    });
    const rules = ruleRows.map(mapRuleToApi);

    const violations = rules
      .filter(
        (rule) =>
          (rule.entityA === requestedRole && currentRoles.includes(rule.entityB)) ||
          (rule.entityB === requestedRole && currentRoles.includes(rule.entityA))
      )
      .map((rule) => ({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        conflictingRole: currentRoles.find((r) => r === rule.entityA || r === rule.entityB) ?? '',
        description: rule.description,
      }));

    const result = {
      userId: targetUserId,
      requestedRole,
      currentRoles,
      violations,
      canProceed: violations.length === 0 || violations.every((v) => v.severity === 'low'),
      requiresException: violations.some((v) => v.severity === 'critical' || v.severity === 'high'),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error({ err: error, route: 'access-governance/sod-check' }, 'Failed to run SoD check');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to run SoD check',
          messageAr: 'فشل في فحص فصل المهام',
        },
      },
      { status: 500 }
    );
  }
});
