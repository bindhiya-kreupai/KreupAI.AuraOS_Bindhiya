// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/wps-compliance/release-gate.service', () => ({
  wpsReleaseGateService: {
    markPrepared: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/wps-compliance/release-gate/route';
import { wpsReleaseGateService } from '@/lib/services/wps-compliance/release-gate.service';

const svc = wpsReleaseGateService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['payroll:manage']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/wps-compliance/release-gate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing action', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 on markPrepared action', async () => {
    svc.markPrepared.mockResolvedValue(undefined);
    const [req, ctx] = makeReq({ action: 'markPrepared', submissionId: 'S1' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.ok).toBe(true);
    expect(svc.markPrepared).toHaveBeenCalledWith('S1', expect.objectContaining({ userId: 'u1' }));
  });

  it('returns 200 on release action', async () => {
    svc.release.mockResolvedValue({ released: true, submissionId: 'S1' });
    const [req, ctx] = makeReq({ action: 'release', submissionId: 'S1', force: false });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.released).toBe(true);
    expect(svc.release).toHaveBeenCalledWith(
      expect.objectContaining({ submissionId: 'S1', force: false }),
      expect.anything()
    );
  });
});
