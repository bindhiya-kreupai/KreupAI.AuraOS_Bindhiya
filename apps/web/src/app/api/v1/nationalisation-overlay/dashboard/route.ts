import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  NATIONALISATION_PROGRAMS,
  nationalisationRequisitionTagService,
  nationalisationJobTagService,
  nationalisationRetentionService,
  nationalisationDevelopmentPlanService,
  nationalisationArtificialRiskService,
  saudiProfessionService,
} from '@/lib/services/nationalisation-overlay';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const monthsBack = Number(url.searchParams.get('monthsBack') ?? 12);
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - monthsBack, 1);

    const programs = await Promise.all(
      NATIONALISATION_PROGRAMS.map(async (program) => {
        const [reservedReq, reservedJob, kpis, devStats, openCritical] = await Promise.all([
          nationalisationRequisitionTagService.reservedSeatCount(ctx.user.tenantId, program),
          nationalisationJobTagService.reservedSeatTotal(ctx.user.tenantId, program),
          nationalisationRetentionService.kpis(ctx.user.tenantId, program, { from, to }),
          nationalisationDevelopmentPlanService.stats(ctx.user.tenantId, program),
          nationalisationArtificialRiskService.openCriticalCount(ctx.user.tenantId, program),
        ]);
        return {
          program,
          reservedRequisitionSeats: reservedReq,
          reservedJobSeats: reservedJob,
          retention: kpis,
          development: devStats,
          openCriticalArtificialRisk: openCritical,
        };
      })
    );

    const saudiReserved = await saudiProfessionService.reservedCount(ctx.user.tenantId);

    return ok({
      programs,
      saudiReservedProfessionCount: saudiReserved,
      coverageWindow: { from: from.toISOString(), to: to.toISOString(), monthsBack },
    });
  } catch (err) {
    return serverError('Failed to load nationalisation overlay dashboard', err);
  }
});
