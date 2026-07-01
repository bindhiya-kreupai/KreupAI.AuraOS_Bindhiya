// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const { auditLog, user, userSession } = vi.hoisted(() => ({
  auditLog: { findMany: vi.fn(), count: vi.fn() },
  user: { findMany: vi.fn() },
  userSession: { count: vi.fn() },
}));

vi.mock('@aura/database', () => ({
  prisma: { auditLog, user, userSession },
}));

import { GET } from '@/app/api/security/login-logs/route';

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
      id: 'e1',
      action: 'USER_LOGIN',
      success: true,
      timestamp: new Date().toISOString(),
      userId: 'u1',
    },
  ]);
  auditLog.count.mockResolvedValue(3);
  user.findMany.mockResolvedValue([{ id: 'u1' }]);
  userSession.count.mockResolvedValue(2);
});

describe('GET /api/security/login-logs', () => {
  it('403 when permission missing', async () => {
    const res = await GET(req('http://x/api'), ctx([]));
    expect(res.status).toBe(403);
  });

  it('200 with events + summary meta', async () => {
    const res = await GET(req('http://x/api'), ctx(['security/login-logs:read']));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.meta.summary).toBeDefined();
    expect(json.meta.summary.activeSessions).toBe(2);
    expect(json.meta.summary.uniqueUsers).toBe(1);
  });
});
