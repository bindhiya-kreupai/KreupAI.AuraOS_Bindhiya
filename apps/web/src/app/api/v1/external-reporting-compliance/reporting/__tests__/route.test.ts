// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/external-reporting-compliance/reporting/route';

function makeReq(body: unknown, permissions: string[] = ['reporting:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/external-reporting-compliance/reporting', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'submissions', input: { obligations: [] } }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('400 on invalid', async () => {
    const [req, ctx] = makeReq({ action: 'nope' });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('200 submissions verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'submissions',
      input: {
        obligations: [{ obligationId: 'o1', regulator: 'GAZT', active: true, cadenceDays: 30 }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.overdue).toBe(1);
  });

  it('200 format verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'format',
      input: {
        spec: { schemaId: 'WPS', columns: ['a', 'b'] },
        submission: { columns: ['a'], rowCount: 5 },
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.defects).toContain('MISSING_COLUMN');
  });

  it('200 disclosure verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'disclosure',
      input: {
        requirements: [{ sectionCode: 'INTRO', label: 'Intro', requireBilingual: true }],
        sections: [{ sectionCode: 'INTRO', en: 'Hi' }],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.results[0].status).toBe('MISSING_AR');
  });
});
