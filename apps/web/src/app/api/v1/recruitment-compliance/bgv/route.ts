/**
 * /api/v1/recruitment-compliance/bgv
 *
 *   POST { action: "open", caseId, candidateId, vendorName? }
 *   POST { action: "consent", bgvCaseId, consentRef }
 *   POST { action: "check", bgvCaseId, checkType, result?, ... }
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { bgvCaseService, bgvCheckService } from '@/lib/services/recruitment-compliance';

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('open'),
    caseId: z.string().min(1),
    candidateId: z.string().min(1),
    vendorName: z.string().optional(),
  }),
  z.object({
    action: z.literal('consent'),
    bgvCaseId: z.string().min(1),
    consentRef: z.string().min(1),
  }),
  z.object({
    action: z.literal('check'),
    bgvCaseId: z.string().min(1),
    checkType: z.string().min(1),
    result: z.enum(['PENDING', 'PASS', 'FAIL', 'DISCREPANCY', 'WAIVED']).optional(),
    discrepancyAction: z.enum(['ESCALATE', 'ACCEPT', 'REJECT']).optional(),
    vendorRef: z.string().optional(),
    evidenceUrl: z.string().url().optional(),
    notes: z.string().optional(),
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
      if (parsed.data.action === 'open') {
        const out = await bgvCaseService.open(
          {
            caseId: parsed.data.caseId,
            candidateId: parsed.data.candidateId,
            vendorName: parsed.data.vendorName,
          },
          auth as any
        );
        return NextResponse.json({ success: true, data: out }, { status: 201 });
      }
      if (parsed.data.action === 'consent') {
        const out = await bgvCaseService.captureConsent(
          parsed.data.bgvCaseId,
          parsed.data.consentRef,
          auth as any
        );
        return NextResponse.json({ success: true, data: out });
      }
      const out = await bgvCheckService.addOrUpdate(
        {
          bgvCaseId: parsed.data.bgvCaseId,
          checkType: parsed.data.checkType,
          result: parsed.data.result,
          discrepancyAction: parsed.data.discrepancyAction,
          vendorRef: parsed.data.vendorRef,
          evidenceUrl: parsed.data.evidenceUrl,
          notes: parsed.data.notes,
        },
        auth as any
      );
      return NextResponse.json({ success: true, data: out });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'bgv action failed' },
        { status: 400 }
      );
    }
  },
  { requiredPermissions: ['recruitment:write'] } as any
);
