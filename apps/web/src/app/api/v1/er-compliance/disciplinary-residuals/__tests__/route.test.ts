// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/er-compliance/disciplinary-residuals/route';

function makeReq(body: unknown, permissions: string[] = ['er:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/er-compliance/disciplinary-residuals', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'custody', input: { evidence: [] } }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ action: 'letter' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('action=custody returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'custody',
      input: { evidence: [] },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.evidenceCount).toBe(0);
  });

  it('action=hearingNotice returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'hearingNotice',
      input: {
        noticeId: 'N1',
        hearingDate: new Date('2026-06-20').toISOString(),
        hearingTime: '10:00',
        venue: 'HR',
        allegations: [{ en: 'tardy', ar: 'تأخر' }],
        rightToRepresentation: true,
        rightToRespondInWriting: true,
        rightToCallWitnesses: true,
        noticePeriodDays: 5,
        servedBilingually: true,
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.pass).toBe(true);
  });

  it('action=appealSla returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'appealSla',
      input: {
        appeals: [],
        asOf: new Date().toISOString(),
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.appealsChecked).toBe(0);
  });

  it('action=letter returns bilingual letter', async () => {
    const [req, ctx] = makeReq({
      action: 'letter',
      input: {
        actionType: 'WRITTEN_WARNING',
        employeeName: 'Ali Khan',
        employeeId: 'E1',
        misconductSummary: 'Tardiness',
        effectiveDate: new Date('2026-06-20').toISOString(),
        issuedBy: 'HR Manager',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.letter.subject).toContain('Written Warning');
    expect(json.data.letter.bodyAr.length).toBeGreaterThan(0);
  });
});
