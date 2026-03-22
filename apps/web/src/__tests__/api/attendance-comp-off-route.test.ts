import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    employeeId: 'emp-auth-1',
    userId: 'user-1',
  },
  permissions: ['attendance:read', 'attendance:create'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
  Resource: { ATTENDANCE: 'ATTENDANCE' },
  Action: { READ: 'READ', CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
  requirePermission: vi.fn(() => null),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/attendance/comp-off/route';

describe('attendance comp-off API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults GET placeholders to the authenticated employee', async () => {
    const request = new NextRequest(
      'http://localhost/api/attendance/comp-off?employeeId=current-user-id'
    );

    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.compOffs).toSatisfy((items: Array<{ employeeId: string }>) =>
      items.every(item => item.employeeId === 'emp-auth-1')
    );
  });

  it('accepts dashboard aliases and resolves employee placeholders on POST', async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const request = new NextRequest('http://localhost/api/attendance/comp-off', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'current-user-id',
        date: '2026-03-21',
        hours: 4,
        reason: 'Holiday maintenance',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      employeeId: 'emp-auth-1',
      workDate: '2026-03-21',
      workHours: 4,
      reason: 'Holiday maintenance',
      status: 'PENDING',
      balance: 0.5,
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
        }),
      })
    );
  });
});
