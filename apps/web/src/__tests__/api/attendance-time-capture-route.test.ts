import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    id: 'user-1',
    userId: 'user-1',
    employeeId: 'emp-auth-1',
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
    attendancePunch: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    attendanceRecord: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/attendance/time-capture/route';

describe('attendance time capture API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults GET to the authenticated employee and returns mapped captures with summary', async () => {
    prismaMock.attendancePunch.findMany.mockResolvedValue([
      {
        id: 'cap-1',
        employeeId: 'emp-auth-1',
        punchType: 'CHECK_IN',
        punchTime: new Date('2026-03-22T09:00:00.000Z'),
        location: '25.2048,55.2708 - Dubai Office HQ',
        photo: null,
        ipAddress: '127.0.0.1',
        device: 'WEB',
        notes: null,
        isVerified: true,
        createdAt: new Date('2026-03-22T09:00:00.000Z'),
      },
    ]);
    prismaMock.employee.findMany.mockResolvedValue([
      { id: 'emp-auth-1', firstName: 'Jane', lastName: 'Doe' },
    ]);

    const request = new NextRequest('http://localhost/api/attendance/time-capture?date=2026-03-22');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.attendancePunch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
        }),
      })
    );
    expect(payload.data.captures[0]).toMatchObject({
      id: 'cap-1',
      employeeName: 'Jane Doe',
      type: 'CHECK_IN',
      location: {
        latitude: 25.2048,
        longitude: 55.2708,
        address: 'Dubai Office HQ',
      },
    });
    expect(payload.data.summary).toMatchObject({
      total: 1,
      checkIns: 1,
      currentStatus: 'CHECKED_IN',
    });
  });

  it('falls back to the authenticated employee on POST placeholders and creates an attendance record for check-in', async () => {
    prismaMock.attendancePunch.create.mockResolvedValue({
      id: 'cap-2',
      employeeId: 'emp-auth-1',
      punchType: 'CHECK_IN',
      punchTime: new Date('2026-03-22T09:05:00.000Z'),
      location: '25.2048,55.2708 - Dubai Office HQ',
      photo: null,
      ipAddress: 'unknown',
      device: 'WEB',
      notes: null,
      isVerified: true,
      createdAt: new Date('2026-03-22T09:05:00.000Z'),
    });
    prismaMock.attendanceRecord.findFirst.mockResolvedValue(null);
    prismaMock.employee.findUnique.mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' });

    const request = new NextRequest('http://localhost/api/attendance/time-capture', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'current-user',
        type: 'CHECK_IN',
        timestamp: '2026-03-22T09:05:00.000Z',
        location: {
          latitude: 25.2048,
          longitude: 55.2708,
          address: 'Dubai Office HQ',
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.attendancePunch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
          punchType: 'CHECK_IN',
        }),
      })
    );
    expect(prismaMock.attendanceRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
          status: 'PRESENT',
        }),
      })
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
    expect(payload.data).toMatchObject({
      id: 'cap-2',
      employeeId: 'emp-auth-1',
      employeeName: 'Jane Doe',
      type: 'CHECK_IN',
    });
  });
});