/**
 * EPIC-38 — External Reporting evaluators.
 *
 * POST { action: 'submissions', input }  → { verdict: SubmissionReport }
 * POST { action: 'format', input }       → { verdict: FormatValidatorResult }
 * POST { action: 'disclosure', input }   → { verdict: DisclosurePackReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateDisclosurePack,
  evaluateSubmissionCadence,
  validateFileFormat,
} from '@/lib/services/external-reporting-compliance/external-reporting.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const submissionsInputSchema = z.object({
  obligations: z.array(
    z.object({
      obligationId: z.string().min(1),
      regulator: z.string().min(1),
      cadenceDays: z.number().int().positive(),
      lastSubmittedAt: isoDate.optional(),
      active: z.boolean(),
    })
  ),
  asOf: isoDate.optional(),
});

const formatInputSchema = z.object({
  spec: z.object({
    schemaId: z.string().min(1),
    columns: z.array(z.string().min(1)),
    maxRows: z.number().int().positive().optional(),
    encoding: z.enum(['UTF-8', 'UTF-16LE', 'CP1252']).optional(),
  }),
  submission: z.object({
    columns: z.array(z.string()),
    rowCount: z.number().int().min(0),
    encoding: z.enum(['UTF-8', 'UTF-16LE', 'CP1252']).optional(),
  }),
});

const disclosureInputSchema = z.object({
  requirements: z.array(
    z.object({
      sectionCode: z.string().min(1),
      label: z.string().min(1),
      requireBilingual: z.boolean(),
    })
  ),
  sections: z.array(
    z.object({
      sectionCode: z.string().min(1),
      en: z.string().optional(),
      ar: z.string().optional(),
    })
  ),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('submissions'), input: submissionsInputSchema }),
  z.object({ action: z.literal('format'), input: formatInputSchema }),
  z.object({ action: z.literal('disclosure'), input: disclosureInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'reporting:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'submissions') {
      const verdict = evaluateSubmissionCadence(
        body.input.obligations.map((o) => ({
          ...o,
          lastSubmittedAt: o.lastSubmittedAt ? new Date(o.lastSubmittedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'format') {
      const verdict = validateFileFormat(body.input.spec, body.input.submission);
      return ok({ verdict });
    }
    const verdict = evaluateDisclosurePack(body.input.requirements, body.input.sections);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate external reporting', err);
  }
});
