import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { successionPoolService } from '@/lib/services/org-design';
import {
  badRequest,
  created,
  forbidden,
  hasAny,
  notFound,
  serverError,
  type RouteContext,
} from '../../../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:manage', 'organization:manage')) return forbidden();
  try {
    // .../succession/[id]/members -> id is second-to-last segment
    const segments = req.nextUrl.pathname.split('/');
    const poolId = segments[segments.length - 2];
    const body = await req.json();
    if (!body.employeeId || !body.employeeName)
      return badRequest('employeeId and employeeName are required', 'معرف الموظف والاسم مطلوبان');
    const member = await successionPoolService.addMember(
      ctx.user.tenantId,
      ctx.user.userId,
      poolId,
      body
    );
    if (!member) return notFound('Succession pool not found', 'مجموعة التعاقب غير موجودة');
    return created(member);
  } catch (err) {
    return serverError('Failed to add pool member', err);
  }
});
