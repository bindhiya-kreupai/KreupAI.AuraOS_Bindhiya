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
    attendanceRecord: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/attendance/timesheets/route';

describe('attendance timesheets API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults GET to the authenticated employee for self-service timesheets', async () => {
    prismaMock.attendanceRecord.findMany.mockResolvedValue([
      {
        employeeId: 'emp-auth-1',
        date: new Date('2026-03-16T00:00:00.000Z'),
        clockIn: new Date('2026-03-16T09:00:00.000Z'),
        clockOut: new Date('2026-03-16T18:00:00.000Z'),
        workHours: 8,
        overtimeHours: 0,
        status: 'PRESENT',
      },
    ]);
    prismaMock.employee.findMany.mockResolvedValue([
      { id: 'emp-auth-1', firstName: 'Jane', lastName: 'Doe' },
    ]);

    const request = new NextRequest('http://localhost/api/attendance/timesheets');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.attendanceRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', employeeId: 'emp-auth-1' },
      })
    );
    expect(payload.data[0]).toMatchObject({
      employeeId: 'emp-auth-1',
      employeeName: 'Jane Doe',
      totalHours: 8,
    });
  });

  it('falls back to the authenticated employee on POST placeholders', async () => {
    prismaMock.attendanceRecord.upsert.mockResolvedValue({ id: 'att-1' });

    const request = new NextRequest('http://localhost/api/attendance/timesheets', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'current-user',
        weekEnding: '2026-03-22',
        entries: [
          { date: '2026-03-16', hours: 8, status: 'PRESENT', checkIn: null, checkOut: null },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.attendanceRecord.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId_employeeId_date: {
            tenantId: 'tenant-1',
            employeeId: 'emp-auth-1',
            date: new Date('2026-03-16T00:00:00.000Z'),
          },
        },
      })
    );
    expect(payload.data).toMatchObject({
      employeeId: 'emp-auth-1',
      weekEnding: '2026-03-22',
      totalHours: 8,
      status: 'PENDING',
    });
  });
});