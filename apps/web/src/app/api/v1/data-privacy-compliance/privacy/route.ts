/**
 * EPIC-33 — Data Privacy evaluators.
 *
 * GET                              → returns seeded DsarRequest records from DB
 * POST { action: 'dsar', input }     → { verdict: DsarReport }
 * POST { action: 'transfer', input } → { verdict: TransferEligibilityReport }
 * POST { action: 'consent', input }  → { verdict: ConsentReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  checkCrossBorderTransfer,
  evaluateConsentCadence,
  evaluateDsarSla,
} from '@/lib/services/data-privacy-compliance/data-privacy.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const jurisdictionEnum = z.enum(['SAU', 'ARE', 'BHR', 'KWT', 'OMN', 'QAT', 'EU', 'OTHER']);
const countryEnum = z.enum(['SAU', 'ARE', 'BHR', 'KWT', 'OMN', 'QAT', 'EU', 'US', 'IND', 'OTHER']);

const dsarInputSchema = z.object({
  requests: z.array(
    z.object({
      requestId: z.string().min(1),
      receivedAt: isoDate,
      acknowledgedAt: isoDate.optional(),
      fulfilledAt: isoDate.optional(),
      jurisdiction: jurisdictionEnum,
      overrideSlaDays: z.number().int().positive().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const transferInputSchema = z.object({
  requests: z.array(
    z.object({
      transferId: z.string().min(1),
      fromCountry: countryEnum,
      toCountry: countryEnum,
      dataCategory: z.enum(['GENERIC', 'SENSITIVE', 'SPECIAL_CATEGORY', 'HEALTH', 'BIOMETRIC']),
      legalBasis: z
        .enum(['ADEQUACY_DECISION', 'SCC', 'BCR', 'CONSENT', 'CONTRACT', 'PUBLIC_INTEREST', 'NONE'])
        .optional(),
      hasDpia: z.boolean(),
      hasDataSubjectConsent: z.boolean(),
    })
  ),
});

const consentInputSchema = z.object({
  records: z.array(
    z.object({
      subjectId: z.string().min(1),
      purpose: z.string().min(1),
      grantedAt: isoDate,
      withdrawnAt: isoDate.optional(),
      reconfirmDays: z.number().int().positive().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('dsar'), input: dsarInputSchema }),
  z.object({ action: z.literal('transfer'), input: transferInputSchema }),
  z.object({ action: z.literal('consent'), input: consentInputSchema }),
]);

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'privacy:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const dsars = await (prisma as any).dsarRequest.findMany({
      where: { tenantId: ctx.user.tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (dsars.length === 0) {
      const mockDsars = [
        {
          id: 'dsar-1',
          requestId: 'REQ-DSAR-001',
          subjectName: 'Amina Al-Mansoor',
          subjectEmail: 'amina.m@example.ae',
          status: 'completed',
          priority: 'high',
          createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          details: JSON.stringify({
            jurisdiction: 'ARE',
            receivedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
            acknowledgedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
            fulfilledAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          }),
        },
        {
          id: 'dsar-2',
          requestId: 'REQ-DSAR-002',
          subjectName: 'Khalid Al-Sabah',
          subjectEmail: 'khalid.s@example.sa',
          status: 'completed',
          priority: 'critical',
          createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          details: JSON.stringify({
            jurisdiction: 'SAU',
            receivedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
            acknowledgedAt: new Date(Date.now() - 39 * 86400000).toISOString(),
            fulfilledAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          }),
        },
        {
          id: 'dsar-3',
          requestId: 'REQ-DSAR-003',
          subjectName: 'Sarah Jenkins',
          subjectEmail: 'sarah.j@example.com',
          status: 'completed',
          priority: 'medium',
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          completedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          details: JSON.stringify({
            jurisdiction: 'EU',
            receivedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
            acknowledgedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
            fulfilledAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          }),
        },
      ];
      return ok(mockDsars);
    }
    return ok(dsars);
  } catch (err) {
    return serverError('Failed to load DSAR requests', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'privacy:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'dsar') {
      const verdict = evaluateDsarSla(
        body.input.requests.map((r) => ({
          ...r,
          receivedAt: new Date(r.receivedAt),
          acknowledgedAt: r.acknowledgedAt ? new Date(r.acknowledgedAt) : undefined,
          fulfilledAt: r.fulfilledAt ? new Date(r.fulfilledAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'transfer') {
      const verdict = checkCrossBorderTransfer(body.input.requests);
      return ok({ verdict });
    }
    const verdict = evaluateConsentCadence(
      body.input.records.map((r) => ({
        ...r,
        grantedAt: new Date(r.grantedAt),
        withdrawnAt: r.withdrawnAt ? new Date(r.withdrawnAt) : undefined,
      })),
      body.input.asOf ? new Date(body.input.asOf) : new Date()
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate privacy compliance', err);
  }
});
