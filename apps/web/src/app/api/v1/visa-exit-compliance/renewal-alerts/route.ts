/**
 * EPIC-29 visa renewal alerts API.
 *
 * Scans the tenant's ACTIVE VisaPermit rows for upcoming / overdue
 * expiries and returns the typed alert set. Backed by
 * VisaRenewalAlertService.scanTenantForAlerts().
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { visaRenewalAlertService } from '@/lib/services/visa-exit-compliance/renewal-alerts.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  asOf: z.string().datetime().optional().nullable(),
});

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'visa:read', 'dashboard:read', 'employee:read')) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({ asOf: url.searchParams.get('asOf') });
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const asOf = parsed.data.asOf ? new Date(parsed.data.asOf) : new Date();
    const alerts = await visaRenewalAlertService.scanTenantForAlerts(ctx.user.tenantId, asOf);
    return ok({
      alerts,
      totals: {
        count: alerts.length,
        critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
        urgent: alerts.filter((a) => a.severity === 'URGENT').length,
        warning: alerts.filter((a) => a.severity === 'WARNING').length,
        info: alerts.filter((a) => a.severity === 'INFO').length,
        overdue: alerts.filter((a) => a.severity === 'OVERDUE').length,
      },
    });
  } catch (err) {
    return serverError('Failed to load visa renewal alerts', err);
  }
});
