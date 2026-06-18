/**
 * EPIC-26 Employee Relations / Disciplinary residual closures.
 *
 * POST { action: 'custody'  | 'hearingNotice' | 'appealSla' | 'letter',
 *        input: ... }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateAppealSlaCadence,
  evaluateEvidenceChainOfCustody,
  evaluateHearingNoticeCompleteness,
  generateDisciplinaryLetter,
} from '@/lib/services/er-compliance/disciplinary-residuals.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const transferSchema = z.object({
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  transferredAt: isoDate,
  signedByRecipient: z.boolean(),
  note: z.string().optional(),
});

const custodyInputSchema = z.object({
  evidence: z.array(
    z.object({
      evidenceId: z.string().min(1),
      seizedAt: isoDate,
      seizedBy: z.string().min(1),
      currentCustodian: z.string().min(1),
      transfers: z.array(transferSchema),
    })
  ),
});

const hearingNoticeInputSchema = z.object({
  noticeId: z.string().min(1),
  hearingDate: isoDate.optional(),
  hearingTime: z.string().optional(),
  venue: z.string().optional(),
  allegations: z.array(z.object({ en: z.string().min(1), ar: z.string().min(1) })).optional(),
  rightToRepresentation: z.boolean().optional(),
  rightToRespondInWriting: z.boolean().optional(),
  rightToCallWitnesses: z.boolean().optional(),
  noticePeriodDays: z.number().int().nonnegative().optional(),
  servedBilingually: z.boolean().optional(),
});

const appealStatus = z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'WITHDRAWN']);

const appealSlaInputSchema = z.object({
  appeals: z.array(
    z.object({
      appealId: z.string().min(1),
      employeeId: z.string().min(1),
      filedAt: isoDate,
      acknowledgedAt: isoDate.optional(),
      resolvedAt: isoDate.optional(),
      status: appealStatus,
    })
  ),
  ackDays: z.number().int().positive().optional(),
  resolveDays: z.number().int().positive().optional(),
  asOf: isoDate.optional(),
});

const letterActionType = z.enum([
  'VERBAL_WARNING',
  'WRITTEN_WARNING',
  'FINAL_WRITTEN_WARNING',
  'SUSPENSION',
  'SALARY_DEDUCTION',
  'DEMOTION',
  'TERMINATION',
  'TERMINATION_FOR_CAUSE',
]);

const letterInputSchema = z.object({
  actionType: letterActionType,
  employeeName: z.string().min(1),
  employeeNameAr: z.string().optional(),
  employeeId: z.string().min(1),
  misconductSummary: z.string().min(1),
  misconductSummaryAr: z.string().optional(),
  effectiveDate: isoDate,
  suspensionDays: z.number().int().positive().optional(),
  salaryDeductionPct: z.number().min(0).max(100).optional(),
  issuedBy: z.string().min(1),
  legalReference: z.string().optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('custody'), input: custodyInputSchema }),
  z.object({ action: z.literal('hearingNotice'), input: hearingNoticeInputSchema }),
  z.object({ action: z.literal('appealSla'), input: appealSlaInputSchema }),
  z.object({ action: z.literal('letter'), input: letterInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(ctx.permissions, 'er:read', 'employee_relations:read', 'tenant:read', 'dashboard:read')
  ) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    const asOfDefault = new Date();

    if (body.action === 'custody') {
      const verdict = evaluateEvidenceChainOfCustody(
        body.input.evidence.map((e) => ({
          ...e,
          seizedAt: new Date(e.seizedAt),
          transfers: e.transfers.map((t) => ({
            ...t,
            transferredAt: new Date(t.transferredAt),
          })),
        }))
      );
      return ok({ verdict });
    }

    if (body.action === 'hearingNotice') {
      const verdict = evaluateHearingNoticeCompleteness({
        noticeId: body.input.noticeId,
        hearingDate: body.input.hearingDate ? new Date(body.input.hearingDate) : undefined,
        hearingTime: body.input.hearingTime,
        venue: body.input.venue,
        allegations: body.input.allegations,
        rightToRepresentation: body.input.rightToRepresentation,
        rightToRespondInWriting: body.input.rightToRespondInWriting,
        rightToCallWitnesses: body.input.rightToCallWitnesses,
        noticePeriodDays: body.input.noticePeriodDays,
        servedBilingually: body.input.servedBilingually,
      });
      return ok({ verdict });
    }

    if (body.action === 'appealSla') {
      const verdict = evaluateAppealSlaCadence({
        appeals: body.input.appeals.map((a) => ({
          appealId: a.appealId,
          employeeId: a.employeeId,
          filedAt: new Date(a.filedAt),
          acknowledgedAt: a.acknowledgedAt ? new Date(a.acknowledgedAt) : undefined,
          resolvedAt: a.resolvedAt ? new Date(a.resolvedAt) : undefined,
          status: a.status,
        })),
        ackDays: body.input.ackDays,
        resolveDays: body.input.resolveDays,
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }

    // letter
    const letter = generateDisciplinaryLetter({
      ...body.input,
      effectiveDate: new Date(body.input.effectiveDate),
    });
    return ok({ letter });
  } catch (err) {
    return serverError('Failed to evaluate disciplinary residual request', err);
  }
});
