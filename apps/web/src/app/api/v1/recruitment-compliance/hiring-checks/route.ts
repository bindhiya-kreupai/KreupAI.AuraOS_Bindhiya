/**
 * EPIC-22 — Recruitment hiring-compliance checks.
 *
 * Three sub-actions:
 *   { action: 'shortlistBias', ... }   → bias detection on shortlist
 *   { action: 'equalPay', ... }        → equal-pay band check on offer
 *   { action: 'nationalizationGate', ... } → quota gating on hire
 *
 * Pure evaluators; persistence is up to upstream callers via AuditLog.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  checkEqualPay,
  detectShortlistBias,
  evaluateNationalizationGate,
} from '@/lib/services/recruitment-compliance/hiring-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const demographicAttrs = z.object({
  gender: z.string().optional(),
  nationality: z.string().optional(),
  ageBand: z.string().optional(),
});

const shortlistBiasSchema = z.object({
  action: z.literal('shortlistBias'),
  applicantPool: z
    .array(z.object({ candidateId: z.string().min(1), attributes: demographicAttrs }))
    .min(1),
  shortlist: z
    .array(z.object({ candidateId: z.string().min(1), attributes: demographicAttrs }))
    .min(1),
  toleranceAbs: z.number().min(0).max(1).optional(),
});

const equalPaySchema = z.object({
  action: z.literal('equalPay'),
  offerCandidate: z.object({
    gender: z.string().optional(),
    nationality: z.string().optional(),
  }),
  offerSalary: z.number().min(0),
  band: z.object({
    grade: z.string().min(1),
    min: z.number().min(0),
    mid: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().min(1),
  }),
  peers: z
    .array(
      z.object({
        employeeId: z.string().min(1),
        grade: z.string().min(1),
        salary: z.number().min(0),
        gender: z.string().optional(),
        nationality: z.string().optional(),
      })
    )
    .default([]),
});

const nationalizationSchema = z.object({
  action: z.literal('nationalizationGate'),
  currentNationals: z.number().int().min(0),
  currentTotal: z.number().int().min(0),
  requiredRatio: z.number().min(0).max(1),
  candidateIsNational: z.boolean(),
  graceBufferPct: z.number().min(0).max(1).optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  shortlistBiasSchema,
  equalPaySchema,
  nationalizationSchema,
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'recruitment:read', 'recruitment:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    if (body.action === 'shortlistBias') {
      const verdict = detectShortlistBias({
        applicantPool: body.applicantPool,
        shortlist: body.shortlist,
        toleranceAbs: body.toleranceAbs,
      });
      return ok({ verdict });
    }
    if (body.action === 'equalPay') {
      const verdict = checkEqualPay({
        offerCandidate: body.offerCandidate,
        offerSalary: body.offerSalary,
        band: body.band,
        peers: body.peers,
      });
      return ok({ verdict });
    }
    const verdict = evaluateNationalizationGate({
      currentNationals: body.currentNationals,
      currentTotal: body.currentTotal,
      requiredRatio: body.requiredRatio,
      candidateIsNational: body.candidateIsNational,
      graceBufferPct: body.graceBufferPct,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate recruitment hiring check', err);
  }
});
