import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    id: 'user-1',
    employeeId: 'emp-auth-1',
  },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    attendanceRegularization: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/database';
import { POST } from '@/app/api/attendance/regularization/route';

describe('attendance regularization API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the authenticated employee when the submitted employee id is a placeholder', async () => {
    prismaMock.attendanceRegularization.create.mockResolvedValue({
      id: 'reg-1',
      employeeId: 'emp-auth-1',
      date: new Date('2026-03-22T00:00:00.000Z'),
      regularizationType: 'MISSED_PUNCH',
      requestedClockIn: new Date('2026-03-22T09:00:00.000Z'),
      requestedClockOut: new Date('2026-03-22T18:00:00.000Z'),
      reason: 'Missed scan',
      status: 'PENDING',
      attachments: [],
    });

    const request = new NextRequest('http://localhost/api/attendance/regularization', {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit',
        employeeId: 'current-user',
        date: '2026-03-22',
        type: 'MISSED_PUNCH',
        requestedInTime: '2026-03-22T09:00:00.000Z',
        requestedOutTime: '2026-03-22T18:00:00.000Z',
        reason: 'Missed scan',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.attendanceRegularization.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
          regularizationType: 'MISSED_PUNCH',
        }),
      })
    );
    expect(payload.data).toMatchObject({
      id: 'reg-1',
      employeeId: 'emp-auth-1',
    });
  });

  it('falls back to the authenticated approver and scopes approve actions by tenant', async () => {
    prismaMock.attendanceRegularization.findFirst.mockResolvedValue({
      id: 'reg-2',
      tenantId: 'tenant-1',
    });
    prismaMock.attendanceRegularization.update.mockResolvedValue({
      id: 'reg-2',
      status: 'APPROVED',
      approvedBy: 'user-1',
    });

    const request = new NextRequest('http://localhost/api/attendance/regularization', {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        regularizationId: 'reg-2',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.attendanceRegularization.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'reg-2',
        tenantId: 'tenant-1',
      },
    });
    expect(prismaMock.attendanceRegularization.update).toHaveBeenCalledWith({
      where: { id: 'reg-2' },
      data: expect.objectContaining({
        status: 'APPROVED',
        approvedBy: 'user-1',
      }),
    });
    expect(payload.data).toMatchObject({
      id: 'reg-2',
      status: 'APPROVED',
      approvedBy: 'user-1',
    });
  });
});