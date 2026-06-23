// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/visa-exit-compliance/renewal-alerts.service', () => ({
  visaRenewalAlertService: {
    scanTenantForAlerts: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET } from '@/app/api/v1/visa-exit-compliance/renewal-alerts/route';
import { visaRenewalAlertService } from '@/lib/services/visa-exit-compliance/renewal-alerts.service';

const svc = visaRenewalAlertService as unknown as any;

function makeReq(query: Record<string, string> = {}, permissions: string[] = ['visa:read']) {
  const usp = new URLSearchParams(query);
  return [
    { json: async () => ({}), url: `http://x/api?${usp.toString()}` } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('GET /api/v1/visa-exit-compliance/renewal-alerts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid asOf', async () => {
    const [req, ctx] = makeReq({ asOf: 'not-a-date' });
    const res = await GET(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + tallied alerts', async () => {
    svc.scanTenantForAlerts.mockResolvedValue([
      { id: '1', severity: 'CRITICAL' },
      { id: '2', severity: 'URGENT' },
      { id: '3', severity: 'CRITICAL' },
      { id: '4', severity: 'WARNING' },
      { id: '5', severity: 'INFO' },
      { id: '6', severity: 'OVERDUE' },
    ]);
    const [req, ctx] = makeReq();
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.alerts).toHaveLength(6);
    expect(json.data.totals).toEqual({
      count: 6,
      critical: 2,
      urgent: 1,
      warning: 1,
      info: 1,
      overdue: 1,
    });
    expect(svc.scanTenantForAlerts).toHaveBeenCalledWith('t1', expect.any(Date));
  });
});
