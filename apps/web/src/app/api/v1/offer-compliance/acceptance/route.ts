/**
 * /api/v1/offer-compliance/acceptance — candidate portal endpoint.
 *
 *   POST { action: "issue", offerId, candidateId, validUntil, templateVersion? }
 *   POST { action: "respond", acceptanceId, decision, declinedReason?, ipAddress?, signatureRef? }
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { offerAcceptanceService } from '@/lib/services/offer-compliance';

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('issue'),
    offerId: z.string().min(1),
    candidateId: z.string().min(1),
    validUntil: z.coerce.date(),
    templateVersion: z.number().int().positive().optional(),
  }),
  z.object({
    action: z.literal('respond'),
    acceptanceId: z.string().min(1),
    decision: z.enum(['ACCEPTED', 'DECLINED']),
    declinedReason: z.string().optional(),
    ipAddress: z.string().optional(),
    signatureRef: z.string().optional(),
  }),
]);

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
    try {
      if (parsed.data.action === 'issue') {
        const out = await offerAcceptanceService.issue(parsed.data, auth as any);
        return NextResponse.json({ success: true, data: out }, { status: 201 });
      }
      const out = await offerAcceptanceService.respond(parsed.data, auth as any);
      return NextResponse.json({ success: true, data: out });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'acceptance action failed' },
        { status: 400 }
      );
    }
  },
  { requiredPermissions: ['offer:write'] } as any
);
