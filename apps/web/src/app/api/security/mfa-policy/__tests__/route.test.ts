import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' },
  permissions: ['security/mfa:read', 'security/mfa:update'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

vi.mock('@aura/database', () => ({
  prisma: {
    mfaPolicy: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { GET, PUT } from '../route';

describe('security/mfa-policy route', () => {
  const p = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a default policy on first GET', async () => {
    p.mfaPolicy.findUnique.mockResolvedValue(null);
    p.mfaPolicy.create.mockResolvedValue({
      tenantId: 'tenant-1',
      enforced: false,
      allowedMethods: ['totp'],
    });

    const req = new NextRequest('http://localhost/api/security/mfa-policy');
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(p.mfaPolicy.create).toHaveBeenCalled();
    expect(json.data.tenantId).toBe('tenant-1');
  });

  it('updates the policy and filters invalid methods', async () => {
    p.mfaPolicy.findUnique.mockResolvedValue({ tenantId: 'tenant-1' });
    p.mfaPolicy.update.mockResolvedValue({ tenantId: 'tenant-1', enforced: true });

    const req = new NextRequest('http://localhost/api/security/mfa-policy', {
      method: 'PUT',
      body: JSON.stringify({ enforced: true, allowedMethods: ['totp', 'bogus', 'webauthn'] }),
    });
    const res = await PUT(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    const call = p.mfaPolicy.update.mock.calls[0][0];
    expect(call.data.enforced).toBe(true);
    expect(call.data.allowedMethods).toEqual(['totp', 'webauthn']);
    expect(call.data.updatedBy).toBe('user-1');
  });

  it('rejects negative grace period', async () => {
    p.mfaPolicy.findUnique.mockResolvedValue({ tenantId: 'tenant-1' });
    const req = new NextRequest('http://localhost/api/security/mfa-policy', {
      method: 'PUT',
      body: JSON.stringify({ graceperiodDays: -1 }),
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });
});
