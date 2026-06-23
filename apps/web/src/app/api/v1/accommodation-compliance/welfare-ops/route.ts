/**
 * EPIC-23 Accommodation / Welfare residual closures.
 *
 * POST { action: 'water', input: WaterQualityCadenceInput } → { verdict }
 * POST { action: 'parity', input: ContractorParityInput }   → { verdict }
 * POST { action: 'grievance.submit', grievanceId, details, category } → { state }
 * POST { action: 'grievance.approve', grievanceId } → { state }
 * POST { action: 'grievance.reject', grievanceId, reason } → { state }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateContractorAccommodationParity,
  evaluateWaterQualityCadence,
  welfareGrievanceMakerCheckerService,
} from '@/lib/services/accommodation-compliance/welfare-ops.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const waterParameter = z.enum([
  'MICROBIOLOGICAL',
  'TDS',
  'RESIDUAL_CHLORINE',
  'PH',
  'HEAVY_METALS',
]);

const waterInputSchema = z.object({
  tests: z.array(
    z.object({
      parameter: waterParameter,
      testedAt: isoDate,
      value: z.number().optional(),
      certifiedLab: z.boolean(),
      passed: z.boolean(),
    })
  ),
  cadence: z.record(waterParameter, z.number().int().positive()).optional(),
  requireCertifiedLab: z.record(waterParameter, z.boolean()).optional(),
  asOf: isoDate.optional(),
});

const accommodationProfileSchema = z.object({
  label: z.string().min(1),
  occupants: z.number().int().positive(),
  floorAreaM2: z.number().positive(),
  hygieneScore: z.number().min(0).max(100),
  fireScore: z.number().min(0).max(100),
  acProvided: z.boolean(),
  messProvided: z.boolean(),
});

const parityInputSchema = z.object({
  principal: accommodationProfileSchema,
  contractors: z.array(accommodationProfileSchema),
  toleranceFraction: z.number().min(0).max(1).optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('water'), input: waterInputSchema }),
  z.object({ action: z.literal('parity'), input: parityInputSchema }),
  z.object({
    action: z.literal('grievance.submit'),
    grievanceId: z.string().min(1),
    details: z.string().min(10),
    category: z.string().min(1),
  }),
  z.object({
    action: z.literal('grievance.approve'),
    grievanceId: z.string().min(1),
  }),
  z.object({
    action: z.literal('grievance.reject'),
    grievanceId: z.string().min(1),
    reason: z.string().min(5),
  }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'accommodation:read',
      'accommodation:write',
      'tenant:read',
      'dashboard:read'
    )
  ) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const asOfDefault = new Date();

    if (body.action === 'water') {
      const verdict = evaluateWaterQualityCadence({
        tests: body.input.tests.map((t) => ({
          parameter: t.parameter,
          testedAt: new Date(t.testedAt),
          value: t.value,
          certifiedLab: t.certifiedLab,
          passed: t.passed,
        })),
        cadence: body.input.cadence,
        requireCertifiedLab: body.input.requireCertifiedLab,
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }

    if (body.action === 'parity') {
      const verdict = evaluateContractorAccommodationParity(body.input);
      return ok({ verdict });
    }

    // grievance maker-checker
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    };

    if (body.action === 'grievance.submit') {
      if (!hasAny(ctx.permissions, 'accommodation:write')) return forbidden();
      const state = await welfareGrievanceMakerCheckerService.submit(
        { grievanceId: body.grievanceId, details: body.details, category: body.category },
        auth
      );
      return ok({ state });
    }

    if (body.action === 'grievance.approve') {
      if (!hasAny(ctx.permissions, 'accommodation:write')) return forbidden();
      const state = await welfareGrievanceMakerCheckerService.approve(body.grievanceId, auth);
      return ok({ state });
    }

    // grievance.reject
    if (!hasAny(ctx.permissions, 'accommodation:write')) return forbidden();
    const state = await welfareGrievanceMakerCheckerService.reject(
      body.grievanceId,
      body.reason,
      auth
    );
    return ok({ state });
  } catch (err) {
    return serverError('Failed to evaluate welfare-ops request', err);
  }
});
