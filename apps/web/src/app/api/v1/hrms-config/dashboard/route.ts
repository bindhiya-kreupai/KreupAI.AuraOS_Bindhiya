import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  countryRuleSetService,
  approvalWorkflowTemplateService,
  notificationRuleService,
  auditTrailSettingService,
  HRMS_CONFIG_CONSTANTS,
} from '@/lib/services/hrms-config';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const tenantId = ctx.user.tenantId;
    const [ruleSets, approvals, notifications, audits] = await Promise.all([
      countryRuleSetService.list(tenantId),
      approvalWorkflowTemplateService.list(tenantId),
      notificationRuleService.list(tenantId),
      auditTrailSettingService.list(tenantId),
    ]);
    const ruleSetsByStatus = (ruleSets as Array<{ status: string }>).reduce<Record<string, number>>(
      (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
      {}
    );
    return ok({
      counts: {
        ruleSets: ruleSets.length,
        ruleSetsByStatus,
        approvals: approvals.length,
        approvalsActive: (approvals as Array<{ isActive: boolean }>).filter((a) => a.isActive)
          .length,
        notifications: notifications.length,
        notificationsActive: (notifications as Array<{ isActive: boolean }>).filter(
          (n) => n.isActive
        ).length,
        audits: audits.length,
        domainsCovered: new Set((audits as Array<{ domain: string }>).map((a) => a.domain)).size,
      },
      supportedCountries: HRMS_CONFIG_CONSTANTS.SUPPORTED_COUNTRIES,
      supportedDomains: HRMS_CONFIG_CONSTANTS.SUPPORTED_DOMAINS,
      channels: HRMS_CONFIG_CONSTANTS.CHANNELS,
    });
  } catch (err) {
    return serverError('Failed to load HRMS config dashboard', err);
  }
});
