import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    employeeId: 'emp-auth-1',
    userId: 'user-1',
  },
  permissions: ['attendance:read', 'attendance:update'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
  Resource: { ATTENDANCE: 'ATTENDANCE' },
  Action: { READ: 'READ', UPDATE: 'UPDATE', DELETE: 'DELETE', CREATE: 'CREATE' },
  requirePermission: vi.fn(() => null),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: {
    attendanceRecord: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/attendance/exceptions/route';

describe('attendance exceptions API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps exceptions into nested data for GET', async () => {
    prismaMock.attendanceRecord.findMany.mockResolvedValue([
      {
        id: 'ex-1',
        employeeId: 'emp-1',
        date: new Date('2026-03-22T00:00:00.000Z'),
        isLate: true,
        isEarlyOut: false,
        status: 'PRESENT',
        approvalStatus: 'PENDING',
        isRegularized: false,
        remarks: null,
        clockIn: new Date('2026-03-22T09:20:00.000Z'),
        clockOut: new Date('2026-03-22T18:00:00.000Z'),
        workHours: 7.67,
        createdAt: new Date('2026-03-22T18:05:00.000Z'),
      },
    ]);
    prismaMock.employee.findMany.mockResolvedValue([
      { id: 'emp-1', firstName: 'Jane', lastName: 'Doe' },
    ]);

    const request = new NextRequest('http://localhost/api/attendance/exceptions');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.exceptions[0]).toMatchObject({
      id: 'ex-1',
      employeeName: 'Jane Doe',
      type: 'LATE_ARRIVAL',
      status: 'PENDING',
    });
  });

  it('resolves exceptions using existing attendance record approval fields', async () => {
    prismaMock.attendanceRecord.findFirst.mockResolvedValue({
      id: 'ex-2',
      tenantId: 'tenant-1',
      employeeId: 'emp-2',
      date: new Date('2026-03-22T00:00:00.000Z'),
      isLate: false,
      isEarlyOut: false,
      status: 'ABSENT',
      clockIn: null,
      clockOut: null,
      workHours: 0,
    });
    prismaMock.attendanceRecord.update.mockResolvedValue({
      id: 'ex-2',
      employeeId: 'emp-2',
      date: new Date('2026-03-22T00:00:00.000Z'),
      isLate: false,
      isEarlyOut: false,
      status: 'ABSENT',
      approvalStatus: 'APPROVED',
      isRegularized: true,
      remarks: 'Regularized from attendance exceptions dashboard',
      clockIn: null,
      clockOut: null,
      workHours: 0,
    });
    prismaMock.employee.findUnique.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });

    const request = new NextRequest('http://localhost/api/attendance/exceptions', {
      method: 'POST',
      body: JSON.stringify({ id: 'ex-2', action: 'regularize' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.attendanceRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ex-2' },
        data: expect.objectContaining({
          approvalStatus: 'APPROVED',
          isRegularized: true,
        }),
      })
    );
    expect(payload.data).toMatchObject({
      id: 'ex-2',
      employeeName: 'John Doe',
      type: 'ABSENT',
      status: 'APPROVED',
      isRegularized: true,
    });
  });
});
