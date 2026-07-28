export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { shiftAttendanceService } from '@/lib/services/shift-management/shift-attendance';
import { badRequest, forbidden, hasAny, serverError, type RouteContext } from '../_shared';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'attendance:read', 'dashboard:read', 'tenant:read')) {
    return forbidden();
  }

  try {
    const url = new URL(req.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const type = url.searchParams.get('type') || 'absence';

    if (!dateFrom || !dateTo) {
      return badRequest('dateFrom and dateTo query params are required (YYYY-MM-DD)');
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return badRequest('Invalid date format. Use YYYY-MM-DD.');
    }

    if (type === 'missing-punches') {
      const results = await shiftAttendanceService.detectMissingPunches(
        ctx.user.tenantId,
        from,
        to
      );
      return NextResponse.json({ success: true, data: results, count: results.length });
    }

    const results = await shiftAttendanceService.detectAbsences(ctx.user.tenantId, from, to);
    return NextResponse.json({ success: true, data: results, count: results.length });
  } catch (err) {
    return serverError('Failed to detect absences', err);
  }
});
