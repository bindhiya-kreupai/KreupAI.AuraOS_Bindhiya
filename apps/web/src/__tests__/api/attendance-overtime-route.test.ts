import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: {
    tenantId: 'tenant-1',
    employeeId: 'emp-auth-1',
    userId: 'user-1',
  },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    overtimeRequest: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/database';
import { GET, POST } from '@/app/api/attendance/overtime/route';

describe('attendance overtime API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults GET self-service placeholders to the authenticated employee', async () => {
    prismaMock.overtimeRequest.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      'http://localhost/api/attendance/overtime?employeeId=current-user-id&status=PENDING'
    );

    const response = await GET(request as any);

    expect(response.status).toBe(200);
    expect(prismaMock.overtimeRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
          status: 'PENDING',
        }),
      })
    );
  });

  it('resolves submit placeholders to the authenticated employee', async () => {
    prismaMock.overtimeRequest.create.mockResolvedValue({
      id: 'ot-1',
      employeeId: 'emp-auth-1',
      overtimeDate: new Date('2026-03-22T00:00:00.000Z'),
      startTime: new Date('2026-03-22T18:00:00.000Z'),
      endTime: new Date('2026-03-22T20:00:00.000Z'),
      totalHours: 2,
      overtimeType: 'REGULAR',
      reason: 'Release support',
      workDescription: null,
      project: null,
      status: 'PENDING',
      compensationType: null,
    });

    const request = new NextRequest('http://localhost/api/attendance/overtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit',
        employeeId: 'current-user',
        date: '2026-03-22',
        overtimeMinutes: 120,
        reason: 'Release support',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.overtimeRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
          totalHours: 2,
        }),
      })
    );
    expect(payload.data).toMatchObject({
      id: 'ot-1',
      employeeId: 'emp-auth-1',
      status: 'PENDING',
    });
  });
});
