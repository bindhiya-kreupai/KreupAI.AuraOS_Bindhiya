/**
 * /api/v1/recruitment-compliance/immigration-eligibility
 *
 *   POST { caseId, candidateId, countryCode, nationality, profession?, banStatus?,
 *          nocRequired?, nocReceived? }
 *     → record an eligibility check; service derives PENDING / ELIGIBLE /
 *       CONDITIONAL / INELIGIBLE from inputs.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { immigrationEligibilityService } from '@/lib/services/recruitment-compliance';

const bodySchema = z.object({
  caseId: z.string().min(1),
  candidateId: z.string().min(1),
  countryCode: z.string().min(2).max(3),
  nationality: z.string().min(2).max(3),
  profession: z.string().optional(),
  banStatus: z.enum(['CLEAR', 'BANNED', 'UNKNOWN']).optional(),
  nocRequired: z.boolean().optional(),
  nocReceived: z.boolean().optional(),
});

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const out = await immigrationEligibilityService.checkAndRecord(
      { ...parsed.data, checkedById: (auth as any).userId },
      auth as any
    );
    return NextResponse.json({ success: true, data: out });
  },
  { requiredPermissions: ['recruitment:write'] } as any
);
