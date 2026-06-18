/**
 * EPIC-15 SIO ↔ LMRA alignment API.
 *
 * POST {
 *   sioRecords: AlignmentRecord[],
 *   lmraRecords: AlignmentRecord[],
 *   wageToleranceBhd?: number
 * } → { result: AlignmentReport }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { alignSioLmra } from '@/lib/services/sio-compliance/lmra-alignment.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

function normaliseRecord(r: any) {
  if (!r.cpr) throw new Error('record.cpr required');
  if (typeof r.declaredWageBhd !== 'number') throw new Error('declaredWageBhd (number) required');
  return {
    cpr: String(r.cpr),
    fullName: r.fullName,
    declaredWageBhd: r.declaredWageBhd,
    status: r.status === 'INACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
  };
}

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.sioRecords)) return badRequest('sioRecords (array) required');
    if (!Array.isArray(body.lmraRecords)) return badRequest('lmraRecords (array) required');
    const result = alignSioLmra({
      sioRecords: body.sioRecords.map(normaliseRecord),
      lmraRecords: body.lmraRecords.map(normaliseRecord),
      wageToleranceBhd:
        typeof body.wageToleranceBhd === 'number' ? body.wageToleranceBhd : undefined,
    });
    return ok({ result });
  } catch (err) {
    return serverError('Failed to evaluate SIO/LMRA alignment', err);
  }
});
