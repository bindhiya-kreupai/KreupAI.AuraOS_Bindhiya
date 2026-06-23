import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationClinicService } from '@/lib/services/workforce-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await accommodationClinicService.list(
        ctx.user.tenantId,
        url.searchParams.get('siteId') ?? undefined,
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list clinics', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.siteId || !body.clinicCode || !body.label) {
        return badRequest('siteId/clinicCode/label required');
      }
      return ok(
        await accommodationClinicService.upsert(
          {
            siteId: body.siteId,
            clinicCode: body.clinicCode,
            label: body.label,
            isOnSite: body.isOnSite,
            nearestHospital: body.nearestHospital,
            nearestHospitalDistanceKm: body.nearestHospitalDistanceKm,
            operatingHours: body.operatingHours,
            doctorOnCall: body.doctorOnCall,
            isActive: body.isActive,
            notes: body.notes,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'record-inspection') {
      if (!body.id || !body.result) return badRequest('id/result required');
      return ok(
        await accommodationClinicService.recordInspection(body.id, body.result, auth),
        'Recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update clinic', err);
  }
});
