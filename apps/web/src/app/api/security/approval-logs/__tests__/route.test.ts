// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const { auditLog } = vi.hoisted(() => ({
  auditLog: { findMany: vi.fn(), count: vi.fn() },
}));

vi.mock('@aura/database', () => ({
  prisma: { auditLog },
}));

import { GET } from '@/app/api/security/approval-logs/route';

function req(url: string) {
  return { url } as any;
}
function ctx(permissions: string[]) {
  return { user: { tenantId: 't1', userId: 'u1' }, permissions } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  auditLog.findMany.mockResolvedValue([
    {
      id: 'a1',
      action: 'APPROVE_LEAVE_REQUEST',
      module: 'leave',
      userEmail: 'm@x.io',
      timestamp: new Date().toISOString(),
    },
  ]);
  auditLog.count.mockResolvedValue(5);
});

describe('GET /api/security/approval-logs', () => {
  it('403 when permission missing', async () => {
    const res = await GET(req('http://x/api'), ctx([]));
    expect(res.status).toBe(403);
  });

  it('200 with rows + summary meta', async () => {
    const res = await GET(
      req('http://x/api?action=APPROVE_LEAVE_REQUEST&q=leave'),
      ctx(['security/approval-logs:read'])
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.meta.summary).toBeDefined();
    expect(json.meta.summary.totalApprovals).toBe(5);
  });
});
