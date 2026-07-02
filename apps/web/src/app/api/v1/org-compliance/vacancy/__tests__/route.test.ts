// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/org-compliance', () => ({
  orgVacancyService: {
    list: vi.fn(),
    raise: vi.fn(),
    approve: vi.fn(),
    fill: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET, POST } from '@/app/api/v1/org-compliance/vacancy/route';
import { orgVacancyService } from '@/lib/services/org-compliance';

const svc = orgVacancyService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['org_compliance:manage']) {
  return [
    { json: async () => body, url: 'http://x/api/v1/org-compliance/vacancy' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('org-compliance/vacancy route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('GET returns 200 + paginated list scoped to tenant', async () => {
    svc.list.mockResolvedValue({
      items: [{ id: 'v1', vacancyNumber: 'V-001', status: 'OPEN' }],
      total: 1,
      page: 1,
      pageSize: 50,
      hasNextPage: false,
    });
    const [req, ctx] = makeReq({}, ['org_compliance:read']);
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
    expect(svc.list).toHaveBeenCalledWith('t1', expect.any(Object), expect.any(Object));
  });

  it('POST returns 403 when manage permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'raise', vacancyNumber: 'V-1' }, ['org_compliance:read']);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('POST raise returns 400 when vacancyNumber missing', async () => {
    const [req, ctx] = makeReq({ action: 'raise' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('POST raise returns 200 + record', async () => {
    svc.raise.mockResolvedValue({ id: 'v1', vacancyNumber: 'V-001', status: 'OPEN' });
    const [req, ctx] = makeReq({ action: 'raise', vacancyNumber: 'V-001' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.id).toBe('v1');
    expect(svc.raise).toHaveBeenCalledWith(
      expect.objectContaining({ vacancyNumber: 'V-001' }),
      expect.objectContaining({ tenantId: 't1', userId: 'u1' })
    );
  });

  it('POST approve returns 200 + record', async () => {
    svc.approve.mockResolvedValue({ id: 'v1', status: 'APPROVED' });
    const [req, ctx] = makeReq({ action: 'approve', id: 'v1' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.status).toBe('APPROVED');
    expect(svc.approve).toHaveBeenCalledWith('v1', expect.anything());
  });

  it('POST fill returns 200 + record with candidate', async () => {
    svc.fill.mockResolvedValue({ id: 'v1', status: 'FILLED', candidateId: 'c9' });
    const [req, ctx] = makeReq({ action: 'fill', id: 'v1', candidateId: 'c9' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.status).toBe('FILLED');
    expect(svc.fill).toHaveBeenCalledWith('v1', 'c9', expect.anything());
  });

  it('POST returns 400 on unknown action', async () => {
    const [req, ctx] = makeReq({ action: 'nope' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });
});
