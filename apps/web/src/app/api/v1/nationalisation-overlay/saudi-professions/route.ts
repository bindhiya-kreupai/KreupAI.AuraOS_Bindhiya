import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { saudiProfessionService } from '@/lib/services/nationalisation-overlay';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (action === 'resolve') {
      const code = url.searchParams.get('professionCode');
      if (!code) return badRequest('professionCode required');
      return ok(
        await saudiProfessionService.resolve(
          ctx.user.tenantId,
          code,
          url.searchParams.get('at') ? new Date(url.searchParams.get('at')!) : undefined
        )
      );
    }
    return ok(
      await saudiProfessionService.list(ctx.user.tenantId, {
        reservedForSaudis:
          url.searchParams.get('reservedForSaudis') === null
            ? undefined
            : url.searchParams.get('reservedForSaudis') === 'true',
        isicCode: url.searchParams.get('isicCode') ?? undefined,
        at: url.searchParams.get('at') ? new Date(url.searchParams.get('at')!) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list Saudi professions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.professionCode || !body.professionNameEn || !body.effectiveFrom) {
        return badRequest('professionCode/professionNameEn/effectiveFrom required');
      }
      return ok(
        await saudiProfessionService.upsert(
          {
            professionCode: body.professionCode,
            professionNameEn: body.professionNameEn,
            professionNameAr: body.professionNameAr,
            isicCode: body.isicCode,
            reservedForSaudis: body.reservedForSaudis,
            minimumNationalisationPct: body.minimumNationalisationPct,
            effectiveFrom: new Date(body.effectiveFrom),
            effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
            regulatorRef: body.regulatorRef,
            notes: body.notes,
          },
          auth
        ),
        'Profession saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update Saudi profession', err);
  }
});
