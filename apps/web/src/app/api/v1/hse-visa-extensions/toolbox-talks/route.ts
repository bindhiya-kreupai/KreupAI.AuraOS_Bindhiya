import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseToolboxTalkService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseToolboxTalkService.list(
        ctx.user.tenantId,
        {
          siteId: url.searchParams.get('siteId') ?? undefined,
          from: url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined,
          to: url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list toolbox talks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'record') return badRequest('unknown action');
    if (!body.talkCode || !body.topic || !body.deliveredAt) {
      return badRequest('talkCode/topic/deliveredAt required');
    }
    return ok(
      await hseToolboxTalkService.record(
        {
          talkCode: body.talkCode,
          topic: body.topic,
          siteId: body.siteId,
          deliveredAt: new Date(body.deliveredAt),
          attendeeCount: body.attendeeCount,
          attendees: body.attendees,
          summary: body.summary,
        },
        auth
      ),
      'Recorded'
    );
  } catch (err) {
    return serverError('Failed to record toolbox talk', err);
  }
});
