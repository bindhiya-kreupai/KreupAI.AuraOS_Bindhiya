/**
 * EPIC-01 Foundation governance evaluator API.
 *
 * POST { action: 'error-catalog', code, fallback?, fallbackAr? }
 *   → { verdict: CatalogLookup }
 * POST { action: 'pii-mask', record, policy }
 *   → { verdict: { masked: Record<string, unknown> } }
 * POST { action: 'audit-summary', events }
 *   → { verdict: AuditSummary }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  lookupErrorCatalog,
  maskPiiFields,
  summariseAuditEvents,
} from '@/lib/services/gcc-landscape/foundation-governance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();
const policyEnum = z.enum(['NONE', 'PARTIAL', 'FULL']);

const errorCatalogSchema = z.object({
  action: z.literal('error-catalog'),
  code: z.string().min(2).max(16),
  fallback: z.string().optional(),
  fallbackAr: z.string().optional(),
});

const piiMaskSchema = z.object({
  action: z.literal('pii-mask'),
  record: z.record(z.unknown()),
  policy: z.object({
    default: policyEnum.optional(),
    fields: z.record(policyEnum).optional(),
  }),
});

const auditSummarySchema = z.object({
  action: z.literal('audit-summary'),
  events: z
    .array(
      z.object({
        action: z.string().min(1),
        severity: z.string().optional(),
        resourceType: z.string().nullable().optional(),
        timestamp: isoDate,
        userId: z.string().nullable().optional(),
        success: z.boolean().optional(),
      })
    )
    .max(50_000),
});

const inputSchema = z.discriminatedUnion('action', [
  errorCatalogSchema,
  piiMaskSchema,
  auditSummarySchema,
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance:read', 'audit:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    if (body.action === 'error-catalog') {
      const verdict = lookupErrorCatalog(body.code, body.fallback, body.fallbackAr);
      return ok({ verdict });
    }
    if (body.action === 'pii-mask') {
      const masked = maskPiiFields(body.record as Record<string, unknown>, body.policy);
      return ok({ verdict: { masked } });
    }
    // audit-summary
    const verdict = summariseAuditEvents(
      body.events.map((e) => ({
        action: e.action,
        severity: e.severity,
        resourceType: e.resourceType ?? null,
        timestamp: new Date(e.timestamp),
        userId: e.userId ?? null,
        success: e.success,
      }))
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate foundation governance', err);
  }
});
