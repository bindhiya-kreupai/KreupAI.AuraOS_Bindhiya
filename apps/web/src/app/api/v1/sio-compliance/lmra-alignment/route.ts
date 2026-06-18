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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { alignSioLmra } from '@/lib/services/sio-compliance/lmra-alignment.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const recordSchema = z.object({
  cpr: z.string().min(1),
  fullName: z.string().optional(),
  declaredWageBhd: z.number(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const inputSchema = z.object({
  sioRecords: z.array(recordSchema),
  lmraRecords: z.array(recordSchema),
  wageToleranceBhd: z.number().optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const normalise = (r: z.infer<typeof recordSchema>) => ({
      cpr: r.cpr,
      fullName: r.fullName,
      declaredWageBhd: r.declaredWageBhd,
      status: r.status === 'INACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
    });
    const result = alignSioLmra({
      sioRecords: body.sioRecords.map(normalise),
      lmraRecords: body.lmraRecords.map(normalise),
      wageToleranceBhd: body.wageToleranceBhd,
    });
    return ok({ result });
  } catch (err) {
    return serverError('Failed to evaluate SIO/LMRA alignment', err);
  }
});
