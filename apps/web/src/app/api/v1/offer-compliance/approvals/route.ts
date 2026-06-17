/**
 * /api/v1/offer-compliance/approvals
 *
 *   POST { action: "rule", grade, ctcThreshold, approverRoles, ... }
 *   POST { action: "initiate", offerId, grade, ctc }
 *   POST { action: "decide", approvalId, decision, comments? }
 *   GET  ?offerId=  → status (rows + overall verdict)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { offerApprovalService } from '@/lib/services/offer-compliance';

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('rule'),
    legalEntityId: z.string().optional(),
    grade: z.string().min(1),
    ctcThreshold: z.number().nonnegative(),
    approverRoles: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    action: z.literal('initiate'),
    offerId: z.string().min(1),
    grade: z.string().min(1),
    ctc: z.number().nonnegative(),
  }),
  z.object({
    action: z.literal('decide'),
    approvalId: z.string().min(1),
    decision: z.enum(['APPROVED', 'REJECTED']),
    comments: z.string().optional(),
  }),
]);

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const offerId = new URL(request.url).searchParams.get('offerId');
    if (!offerId)
      return NextResponse.json({ success: false, error: 'offerId required' }, { status: 400 });
    const out = await offerApprovalService.statusFor((auth as any).tenantId, offerId);
    return NextResponse.json({ success: true, data: out });
  },
  { requiredPermissions: ['offer:read'] } as any
);

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
      if (parsed.data.action === 'rule') {
        const out = await offerApprovalService.upsertRule(parsed.data, auth as any);
        return NextResponse.json({ success: true, data: out }, { status: 201 });
      }
      if (parsed.data.action === 'initiate') {
        const out = await offerApprovalService.initiate(parsed.data, auth as any);
        return NextResponse.json({ success: true, data: out }, { status: 201 });
      }
      const out = await offerApprovalService.decide(parsed.data, auth as any);
      return NextResponse.json({ success: true, data: out });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err instanceof Error ? err.message : 'offer approval action failed',
        },
        { status: 400 }
      );
    }
  },
  { requiredPermissions: ['offer:write'] } as any
);
