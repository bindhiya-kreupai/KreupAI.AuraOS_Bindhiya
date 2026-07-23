/**
 * /api/v1/recruitment-compliance/screening
 *
 *   POST { caseId, candidateId, score, outcome, knockoutReason?, protectedFactors? }
 *     → record per-candidate screening row (bias-aware).
 *   POST?action=bias-flagged → list bias-flagged screenings.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { candidateScreeningService } from '@/lib/services/recruitment-compliance';

const recordSchema = z.object({
  caseId: z.string().min(1),
  candidateId: z.string().min(1),
  score: z.number(),
  outcome: z.enum(['PASS', 'FAIL', 'KNOCKOUT']),
  rejectionReason: z.string().optional(),
  knockoutReason: z.string().optional(),
  protectedFactors: z.array(z.string()).optional(),
  detail: z.record(z.unknown()).optional(),
});

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const flagged = await candidateScreeningService.listBiasFlagged((auth as any).tenantId, {
      page: Number(searchParams.get('page') ?? '1'),
      pageSize: Number(searchParams.get('pageSize') ?? '50'),
    });
    return NextResponse.json({ success: true, data: flagged });
  },
  { requiredPermissions: ['recruitment:read'] } as any
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = recordSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    try {
      const out = await candidateScreeningService.record(parsed.data, auth as any);
      return NextResponse.json({ success: true, data: out });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'screening failed' },
        { status: 400 }
      );
    }
  },
  { requiredPermissions: ['recruitment:write'] } as any
);
export const DELETE = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Id is required' }, { status: 400 });
    }

    try {
      await candidateScreeningService.delete(id, auth as any);

      return NextResponse.json({
        success: true,
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err instanceof Error ? err.message : 'Delete failed',
        },
        { status: 400 }
      );
    }
  },
  { requiredPermissions: ['recruitment:write'] } as any
);
