/**
 * /api/v1/recruitment-compliance/risks
 *
 *   GET → list risk register entries
 *   POST { code, description, likelihood, impact, mitigationPlan?, ownerId? }
 *     → raise / upsert a risk; band is derived from L × I.
 *   PATCH ?id= → mark mitigated.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { riskRegisterService } from '@/lib/services/recruitment-compliance';

const raiseSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  mitigationPlan: z.string().optional(),
  ownerId: z.string().optional(),
});

export const GET = createProtectedRoute(
  async (_request: NextRequest, { auth }) => {
    const items = await riskRegisterService.list((auth as any).tenantId);
    return NextResponse.json({ success: true, data: items });
  },
  { requiredPermissions: ['recruitment:read'] } as any
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = raiseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    try {
      const out = await riskRegisterService.raise(parsed.data, auth as any);
      return NextResponse.json({ success: true, data: out }, { status: 201 });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'risk raise failed' },
        { status: 400 }
      );
    }
  },
  { requiredPermissions: ['recruitment:write'] } as any
);

export const PATCH = createProtectedRoute(
  async (request: NextRequest, _ctx) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    const out = await riskRegisterService.mitigate(id);
    return NextResponse.json({ success: true, data: out });
  },
  { requiredPermissions: ['recruitment:write'] } as any
);
