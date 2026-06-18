/**
 * EPIC-34 — Vendor Compliance evaluators.
 *
 * POST { action: 'dueDiligence', input } → { verdict: DdReport }
 * POST { action: 'coi', input }          → { verdict: CoiReport }
 * POST { action: 'sanctions', input }    → { verdict: ScreeningReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateConflictOfInterest,
  evaluateVendorDueDiligence,
  screenAgainstSanctionList,
} from '@/lib/services/vendor-compliance/vendor-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const tierEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const ddInputSchema = z.object({
  vendors: z.array(
    z.object({
      vendorId: z.string().min(1),
      name: z.string().min(1),
      riskTier: tierEnum,
      lastDdAt: isoDate.optional(),
    })
  ),
  config: z
    .object({
      cadenceByTier: z
        .object({
          LOW: z.number().int().positive().optional(),
          MEDIUM: z.number().int().positive().optional(),
          HIGH: z.number().int().positive().optional(),
          CRITICAL: z.number().int().positive().optional(),
        })
        .optional(),
    })
    .optional(),
  asOf: isoDate.optional(),
});

const coiInputSchema = z.object({
  links: z.array(z.object({ vendorId: z.string().min(1), employeeId: z.string().min(1) })),
  disclosures: z.array(
    z.object({
      vendorId: z.string().min(1),
      declaredAt: isoDate,
      hasRelationship: z.boolean(),
      relatedEmployeeIds: z.array(z.string()).optional(),
    })
  ),
});

const sanctionsInputSchema = z.object({
  vendors: z.array(
    z.object({
      vendorId: z.string().min(1),
      name: z.string().min(1),
      country: z.string().optional(),
    })
  ),
  list: z.array(
    z.object({
      listCode: z.string().min(1),
      name: z.string().min(1),
      country: z.string().optional(),
    })
  ),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('dueDiligence'), input: ddInputSchema }),
  z.object({ action: z.literal('coi'), input: coiInputSchema }),
  z.object({ action: z.literal('sanctions'), input: sanctionsInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'vendor:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'dueDiligence') {
      const verdict = evaluateVendorDueDiligence(
        body.input.vendors.map((v) => ({
          ...v,
          lastDdAt: v.lastDdAt ? new Date(v.lastDdAt) : undefined,
        })),
        body.input.config ?? {},
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'coi') {
      const verdict = evaluateConflictOfInterest(
        body.input.links,
        body.input.disclosures.map((d) => ({ ...d, declaredAt: new Date(d.declaredAt) }))
      );
      return ok({ verdict });
    }
    const verdict = screenAgainstSanctionList(body.input.vendors, body.input.list);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate vendor compliance', err);
  }
});
