import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    offerApprovalRule: { create: vi.fn(), findMany: vi.fn() },
    offerApproval: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    offerTemplate: { create: vi.fn(), findMany: vi.fn() },
    offerCondition: { upsert: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    preEmploymentDocument: { upsert: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    medicalFitness: { upsert: vi.fn() },
    employmentContract: { upsert: vi.fn(), update: vi.fn() },
    offerAcceptance: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import {
  offerApprovalService,
  offerConditionService,
  preEmploymentDocumentService,
  offerAcceptanceService,
} from '../index';

const p = prisma as unknown as any;
const auth = { tenantId: 't1', userId: 'u-initiator' };

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// S02 — approval matrix + maker-checker
// ---------------------------------------------------------------------------

describe('OfferApprovalService (S02)', () => {
  it('rejects empty approverRoles when upserting a rule', async () => {
    await expect(
      offerApprovalService.upsertRule(
        { grade: 'M1', ctcThreshold: 100000, approverRoles: [] },
        auth
      )
    ).rejects.toThrow(/non-empty/);
  });

  it('resolveRule picks the highest threshold ≤ ctc', async () => {
    p.offerApprovalRule.findMany.mockResolvedValue([
      { id: 'r1', ctcThreshold: 50000, approverRoles: ['HR_HEAD'] },
    ]);
    const rule = await offerApprovalService.resolveRule('t1', 'M1', 60000);
    expect(rule?.id).toBe('r1');
    expect(p.offerApprovalRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ctcThreshold: { lte: 60000 } }),
        orderBy: { ctcThreshold: 'desc' },
      })
    );
  });

  it('initiate creates one OfferApproval row per role in the resolved rule', async () => {
    p.offerApprovalRule.findMany.mockResolvedValue([
      { id: 'r1', ctcThreshold: 0, approverRoles: ['HR_HEAD', 'CFO', 'CEO'] },
    ]);
    let idCounter = 1;
    p.offerApproval.create.mockImplementation(async (a: any) => ({
      id: `oa-${idCounter++}`,
      ...a.data,
    }));

    const rows = await offerApprovalService.initiate(
      { offerId: 'o1', grade: 'M1', ctc: 200000 },
      auth
    );
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.approverRole)).toEqual(['HR_HEAD', 'CFO', 'CEO']);
    expect(rows.map((r) => r.stepOrder)).toEqual([1, 2, 3]);
  });

  it('throws when no rule exists for grade × ctc', async () => {
    p.offerApprovalRule.findMany.mockResolvedValue([]);
    await expect(
      offerApprovalService.initiate({ offerId: 'o1', grade: 'M9', ctc: 1 }, auth)
    ).rejects.toThrow(/no OfferApprovalRule/);
  });

  it('decide enforces maker-checker (initiator cannot approve own)', async () => {
    p.offerApproval.findFirst.mockResolvedValue({
      id: 'oa-1',
      initiatorId: auth.userId, // same as the deciding user
      status: 'PENDING',
    });
    await expect(
      offerApprovalService.decide({ approvalId: 'oa-1', decision: 'APPROVED' }, auth)
    ).rejects.toThrow(/maker-checker/);
  });

  it('decide records decision when approver ≠ initiator', async () => {
    p.offerApproval.findFirst.mockResolvedValue({
      id: 'oa-1',
      initiatorId: 'u-other',
      status: 'PENDING',
    });
    p.offerApproval.update.mockImplementation(async (a: any) => ({ id: a.where.id, ...a.data }));
    const out = await offerApprovalService.decide(
      { approvalId: 'oa-1', decision: 'APPROVED' },
      auth
    );
    expect(out.status).toBe('APPROVED');
    expect(out.approverId).toBe(auth.userId);
  });

  it('statusFor returns REJECTED when any row is rejected, APPROVED only when ALL approved', async () => {
    p.offerApproval.findMany.mockResolvedValue([{ status: 'APPROVED' }, { status: 'REJECTED' }]);
    const r1 = await offerApprovalService.statusFor('t1', 'o1');
    expect(r1.overall).toBe('REJECTED');

    p.offerApproval.findMany.mockResolvedValue([{ status: 'APPROVED' }, { status: 'APPROVED' }]);
    const r2 = await offerApprovalService.statusFor('t1', 'o1');
    expect(r2.overall).toBe('APPROVED');

    p.offerApproval.findMany.mockResolvedValue([{ status: 'PENDING' }, { status: 'APPROVED' }]);
    const r3 = await offerApprovalService.statusFor('t1', 'o1');
    expect(r3.overall).toBe('PENDING');
  });
});

// ---------------------------------------------------------------------------
// S05 — conditional offers
// ---------------------------------------------------------------------------

describe('OfferConditionService.allMet (S05)', () => {
  it('returns true when no conditions exist (trivially met)', async () => {
    p.offerCondition.findMany.mockResolvedValue([]);
    await expect(offerConditionService.allMet('t1', 'o1')).resolves.toBe(true);
  });

  it('returns true when all conditions are MET or WAIVED', async () => {
    p.offerCondition.findMany.mockResolvedValue([
      { status: 'MET' },
      { status: 'WAIVED' },
      { status: 'MET' },
    ]);
    await expect(offerConditionService.allMet('t1', 'o1')).resolves.toBe(true);
  });

  it('returns false when any condition is PENDING / UNMET', async () => {
    p.offerCondition.findMany.mockResolvedValue([{ status: 'MET' }, { status: 'PENDING' }]);
    await expect(offerConditionService.allMet('t1', 'o1')).resolves.toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S09 — pre-employment documents
// ---------------------------------------------------------------------------

describe('PreEmploymentDocumentService (S09)', () => {
  it('verify requires rejectionReason when decision = REJECTED', async () => {
    await expect(
      preEmploymentDocumentService.verify({ documentId: 'd1', decision: 'REJECTED' }, auth)
    ).rejects.toThrow(/rejectionReason/);
  });

  it('allMandatoryVerified returns true when no docs exist (trivially met)', async () => {
    p.preEmploymentDocument.findMany.mockResolvedValue([]);
    await expect(preEmploymentDocumentService.allMandatoryVerified('t1', 'o1')).resolves.toBe(true);
  });

  it('allMandatoryVerified returns false when any mandatory doc is unverified', async () => {
    p.preEmploymentDocument.findMany.mockResolvedValue([
      { status: 'VERIFIED' },
      { status: 'RECEIVED' },
    ]);
    await expect(preEmploymentDocumentService.allMandatoryVerified('t1', 'o1')).resolves.toBe(
      false
    );
  });
});

// ---------------------------------------------------------------------------
// S13 — acceptance portal validation
// ---------------------------------------------------------------------------

describe('OfferAcceptanceService.respond (S13)', () => {
  function arrangePending(overrides: any = {}) {
    p.offerAcceptance.findFirst.mockResolvedValue({
      id: 'oa-1',
      offerId: 'offer-1',
      candidateId: 'cand-1',
      status: 'PENDING',
      validUntil: new Date(Date.now() + 86_400_000), // tomorrow
      ...overrides,
    });
    p.offerAcceptance.update.mockImplementation(async (a: any) => ({ id: a.where.id, ...a.data }));
  }

  it('refuses to re-accept an already-accepted offer', async () => {
    arrangePending({ status: 'ACCEPTED' });
    await expect(
      offerAcceptanceService.respond({ acceptanceId: 'oa-1', decision: 'ACCEPTED' }, auth)
    ).rejects.toThrow(/already accepted/);
  });

  it('auto-expires + throws when past validUntil', async () => {
    arrangePending({ validUntil: new Date(Date.now() - 86_400_000) });
    await expect(
      offerAcceptanceService.respond({ acceptanceId: 'oa-1', decision: 'ACCEPTED' }, auth)
    ).rejects.toThrow(/validity window/);
    expect(p.offerAcceptance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'EXPIRED' } })
    );
  });

  it('blocks ACCEPTED when not all conditions MET', async () => {
    arrangePending();
    p.offerCondition.findMany.mockResolvedValue([{ status: 'PENDING' }]);
    await expect(
      offerAcceptanceService.respond({ acceptanceId: 'oa-1', decision: 'ACCEPTED' }, auth)
    ).rejects.toThrow(/conditions not MET/);
  });

  it('blocks ACCEPTED when mandatory docs not VERIFIED', async () => {
    arrangePending();
    p.offerCondition.findMany.mockResolvedValue([{ status: 'MET' }]);
    p.preEmploymentDocument.findMany.mockResolvedValue([{ status: 'RECEIVED' }]);
    await expect(
      offerAcceptanceService.respond({ acceptanceId: 'oa-1', decision: 'ACCEPTED' }, auth)
    ).rejects.toThrow(/documents not VERIFIED/);
  });

  it('persists IP + signatureRef when accepted with all gates clear', async () => {
    arrangePending();
    p.offerCondition.findMany.mockResolvedValue([{ status: 'MET' }]);
    p.preEmploymentDocument.findMany.mockResolvedValue([{ status: 'VERIFIED' }]);
    const out = await offerAcceptanceService.respond(
      {
        acceptanceId: 'oa-1',
        decision: 'ACCEPTED',
        ipAddress: '203.0.113.1',
        signatureRef: 'sig-hmac-abc',
      },
      auth
    );
    expect(out.status).toBe('ACCEPTED');
    expect(out.ipAddress).toBe('203.0.113.1');
    expect(out.signatureRef).toBe('sig-hmac-abc');
  });

  it('DECLINED bypasses condition / doc gates', async () => {
    arrangePending();
    p.offerCondition.findMany.mockResolvedValue([{ status: 'PENDING' }]); // would block ACCEPTED
    const out = await offerAcceptanceService.respond(
      { acceptanceId: 'oa-1', decision: 'DECLINED', declinedReason: 'better offer elsewhere' },
      auth
    );
    expect(out.status).toBe('DECLINED');
    expect(out.declinedReason).toMatch(/better offer/);
  });
});
