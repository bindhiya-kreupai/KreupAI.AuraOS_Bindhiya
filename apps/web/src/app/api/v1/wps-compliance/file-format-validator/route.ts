/**
 * EPIC-13 KSA / EPIC-14 UAE — WPS file-format validator API.
 *
 * POST {
 *   format: 'SIF' | 'MUDAD' | 'QWPS' | 'BWPS' | 'OWPS' | 'KWPS',
 *   content: string,
 *   expected: { employerId, period, countryCode, establishmentName?,
 *               employeeCount?, totalAmount? }
 * } → { verdict: WpsValidationReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { validateWpsFile } from '@/lib/services/wps-compliance/file-format-validator.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const formatEnum = z.enum(['SIF', 'MUDAD', 'QWPS', 'BWPS', 'OWPS', 'KWPS']);

const inputSchema = z.object({
  format: formatEnum,
  content: z.string().min(1).max(20_000_000),
  expected: z.object({
    employerId: z.string().min(1),
    establishmentName: z.string().optional(),
    period: z.string().regex(/^\d{4}-\d{2}$/),
    countryCode: z.string().length(2),
    employeeCount: z.number().int().nonnegative().optional(),
    totalAmount: z.number().nonnegative().optional(),
  }),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'wps:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const verdict = validateWpsFile(parsed.data);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to validate WPS file', err);
  }
});
