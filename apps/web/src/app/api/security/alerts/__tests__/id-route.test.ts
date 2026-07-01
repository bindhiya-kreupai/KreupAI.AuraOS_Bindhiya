import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' },
  permissions: ['security/alerts:update', 'security/alerts:delete'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

vi.mock('@aura/database', () => ({
  prisma: {
    securityAlert: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { PUT, DELETE } from '../[id]/route';

describe('security/alerts/[id] route', () => {
  const p = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates alert status and sets resolvedAt when resolved', async () => {
    p.securityAlert.findFirst.mockResolvedValue({
      id: 'a1',
      tenantId: 'tenant-1',
      isDeleted: false,
      resolvedAt: null,
    });
    p.securityAlert.update.mockResolvedValue({ id: 'a1', status: 'RESOLVED' });

    const req = new NextRequest('http://localhost/api/security/alerts/a1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    const res = await PUT(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    const call = p.securityAlert.update.mock.calls[0][0];
    expect(call.data.status).toBe('RESOLVED');
    expect(call.data.resolvedAt).toBeInstanceOf(Date);
    expect(call.data.resolvedBy).toBe('user-1');
  });

  it('returns 404 for alert outside tenant', async () => {
    p.securityAlert.findFirst.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/security/alerts/x', {
      method: 'PUT',
      body: JSON.stringify({ status: 'OPEN' }),
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(404);
  });

  it('soft-deletes an alert', async () => {
    p.securityAlert.findFirst.mockResolvedValue({
      id: 'a2',
      tenantId: 'tenant-1',
      isDeleted: false,
    });
    p.securityAlert.update.mockResolvedValue({ id: 'a2' });
    const req = new NextRequest('http://localhost/api/security/alerts/a2', { method: 'DELETE' });
    const res = await DELETE(req as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.deleted).toBe(true);
    expect(p.securityAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDeleted: true }) })
    );
  });
});
