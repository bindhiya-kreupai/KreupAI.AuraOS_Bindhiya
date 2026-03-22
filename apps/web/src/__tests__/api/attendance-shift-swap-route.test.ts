import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    employeeId: 'emp-auth-1',
    userId: 'user-1',
  },
  permissions: ['attendance:read', 'attendance:create', 'attendance:update'],
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
import { GET, POST, PUT } from '@/app/api/attendance/shift-swap/route';

describe('attendance shift swap API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters placeholder employee queries to the authenticated employee', async () => {
    const request = new NextRequest(
      'http://localhost/api/attendance/shift-swap?employeeId=current-user-id&status=PENDING'
    );

    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([
      expect.objectContaining({
        requestorId: 'emp-auth-1',
        status: 'PENDING',
      }),
    ]);
  });

  it('accepts simplified dashboard request payloads on POST', async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const request = new NextRequest('http://localhost/api/attendance/shift-swap', {
      method: 'POST',
      body: JSON.stringify({
        fromEmployeeId: 'current-user-id',
        shiftId: 'assignment-1',
        date: '2026-03-22',
        reason: 'Shift swap request',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      requestorId: 'emp-auth-1',
      requestorShiftId: 'assignment-1',
      requestorDate: '2026-03-22',
      targetDate: '2026-03-22',
      status: 'PENDING',
    });
  });

  it('accepts marketplace approvals via PUT on the base route', async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-2' });

    const request = new NextRequest('http://localhost/api/attendance/shift-swap', {
      method: 'PUT',
      body: JSON.stringify({
        id: 'swap-3',
        status: 'APPROVED',
        employeeId: 'current-user-id',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PUT(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toMatchObject({
      id: 'swap-3',
      status: 'APPROVED',
      targetEmployeeId: 'emp-auth-1',
      approvedBy: 'user-1',
    });
  });
});
