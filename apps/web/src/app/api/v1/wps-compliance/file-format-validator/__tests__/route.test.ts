// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/wps-compliance/file-format-validator/route';

function makeReq(body: unknown, permissions: string[] = ['wps:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/wps-compliance/file-format-validator', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ format: 'NOPE' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 for a clean MUDAD file', async () => {
    const content = [
      'H|EMP001|2026-05|SA',
      'B|E001|1098765432|SA0380000000608010167519|5500',
      'T|1|5500',
    ].join('\n');
    const [req, ctx] = makeReq({
      format: 'MUDAD',
      content,
      expected: { employerId: 'EMP001', period: '2026-05', countryCode: 'SA' },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.valid).toBe(true);
    expect(json.data.verdict.parsedRows).toBe(1);
  });
});
