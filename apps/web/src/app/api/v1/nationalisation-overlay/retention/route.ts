import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nationalisationRetentionService } from '@/lib/services/nationalisation-overlay';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (action === 'kpis') {
      const program = url.searchParams.get('program');
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      if (!program || !from || !to) return badRequest('program/from/to required');
      return ok(
        await nationalisationRetentionService.kpis(ctx.user.tenantId, program, {
          from: new Date(from),
          to: new Date(to),
        })
      );
    }
    return ok(
      await nationalisationRetentionService.list(ctx.user.tenantId, {
        program: url.searchParams.get('program') ?? undefined,
        eventType: url.searchParams.get('eventType') ?? undefined,
        isEarlyAttrition:
          url.searchParams.get('isEarlyAttrition') === null
            ? undefined
            : url.searchParams.get('isEarlyAttrition') === 'true',
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        from: url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined,
        to: url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list retention events', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'record') {
      if (
        !body.employeeId ||
        !body.program ||
        !body.nationalityFlag ||
        !body.eventType ||
        !body.eventDate
      ) {
        return badRequest('employeeId/program/nationalityFlag/eventType/eventDate required');
      }
      return ok(
        await nationalisationRetentionService.record(
          {
            employeeId: body.employeeId,
            program: body.program,
            nationalityFlag: body.nationalityFlag,
            eventType: body.eventType,
            eventDate: new Date(body.eventDate),
            hireDate: body.hireDate ? new Date(body.hireDate) : undefined,
            earlyAttritionThresholdDays: body.earlyAttritionThresholdDays,
            reasonCode: body.reasonCode,
            notes: body.notes,
          },
          auth
        ),
        'Event recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to record retention event', err);
  }
});
