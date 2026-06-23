// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/performance-compliance/checks/route';

function makeReq(body: unknown, permissions: string[] = ['performance:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/performance-compliance/checks', () => {
  it('403 when no permission', async () => {
    const [req, ctx] = makeReq({ action: 'resolveRating' }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('400 on invalid action', async () => {
    const [req, ctx] = makeReq({ action: 'bogus' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('200 with forced-distribution verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'forcedDistribution',
      observed: [
        { rating: 'EXCEEDS', count: 20 },
        { rating: 'MEETS', count: 60 },
        { rating: 'BELOW', count: 20 },
      ],
      target: [
        { rating: 'EXCEEDS', expectedShare: 0.2 },
        { rating: 'MEETS', expectedShare: 0.6 },
        { rating: 'BELOW', expectedShare: 0.2 },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });

  it('200 with calibration evidence verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'calibrationEvidence',
      cycleStartDate: '2026-04-01',
      cycleEndDate: '2026-06-30',
      requiredByDays: 30,
      asOf: '2026-06-20',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(['PASS', 'WARN', 'FAIL']).toContain(json.data.verdict.outcome);
  });

  it('200 with rating dictionary when no code provided', async () => {
    const [req, ctx] = makeReq({ action: 'resolveRating' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(json.data.dictionary)).toBe(true);
  });

  it('200 with rating definition when code provided', async () => {
    const [req, ctx] = makeReq({ action: 'resolveRating', code: 'MEETS' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.definition.label.ar).toBeTruthy();
  });
});
