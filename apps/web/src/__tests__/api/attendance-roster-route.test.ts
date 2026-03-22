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
import { GET, POST } from '@/app/api/attendance/roster/route';

describe('attendance roster API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters roster rows by employee and date overlap', async () => {
    const request = new NextRequest(
      'http://localhost/api/attendance/roster?employeeId=emp-1&startDate=2024-08-15&endDate=2024-08-20'
    );

    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([
      expect.objectContaining({ employeeId: 'emp-1' }),
    ]);
  });

  it('accepts date aliases on POST for dashboard roster writes', async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const request = new NextRequest('http://localhost/api/attendance/roster', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'emp-2',
        shiftId: 'shift-2',
        date: '2026-03-25',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      employeeId: 'emp-2',
      shiftId: 'shift-2',
      startDate: '2026-03-25',
      endDate: '2026-03-25',
      status: 'ACTIVE',
    });
  });
});
