/**
 * /api/v1/recruitment-compliance/cases
 *
 *   GET  ?status=&currentStage=  → list cases
 *   POST { vacancyId, candidateId, ownerId, slaDays? } → open case
 *   PATCH ?id=&nextStage=  → transition case (FSM-validated)
 *
 * Tenant scoping: tenantId is always taken from the authenticated session.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { recruitmentCaseService } from '@/lib/services/recruitment-compliance';

const openSchema = z.object({
  vacancyId: z.string().min(1),
  candidateId: z.string().min(1),
  ownerId: z.string().min(1),
  slaDays: z.number().int().positive().optional(),
});

const STAGES = [
  'APPLIED',
  'SCREENED',
  'INTERVIEWED',
  'OFFERED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;
const transitionSchema = z.object({ caseId: z.string().min(1), nextStage: z.enum(STAGES) });

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const items = await recruitmentCaseService.list({
      tenantId: (auth as any).tenantId,
      status: searchParams.get('status') ?? undefined,
      currentStage: searchParams.get('currentStage') ?? undefined,
    });
    return NextResponse.json({ success: true, data: items });
  },
  { requiredPermissions: ['recruitment:read'] } as any
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = openSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const created = await recruitmentCaseService.open(parsed.data, auth as any);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  },
  { requiredPermissions: ['recruitment:write'] } as any
);

export const PATCH = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = transitionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    try {
      const updated = await recruitmentCaseService.transition(
        parsed.data.caseId,
        parsed.data.nextStage,
        auth as any
      );
      return NextResponse.json({ success: true, data: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'transition failed';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  },
  { requiredPermissions: ['recruitment:write'] } as any
);
