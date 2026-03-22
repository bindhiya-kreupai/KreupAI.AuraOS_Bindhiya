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
    compOffRequest: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { POST } from '@/app/api/attendance/comp-off-management/route';

describe('attendance comp-off management API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a comp-off request and resolves self-service placeholders', async () => {
    prismaMock.compOffRequest.create.mockResolvedValue({
      id: 'co-1',
      employeeId: 'emp-auth-1',
      earnedDate: new Date('2026-03-22T00:00:00.000Z'),
      earnedHours: 8,
      status: 'PENDING',
      expiryDate: new Date('2026-05-21T00:00:00.000Z'),
      remarks: 'Weekend release',
      createdAt: new Date('2026-03-22T09:00:00.000Z'),
    });

    const request = new NextRequest('http://localhost/api/attendance/comp-off-management', {
      method: 'POST',
      body: JSON.stringify({
        action: 'request',
        employeeId: 'current-user-id',
        date: '2026-03-22',
        hours: 8,
        reason: 'Weekend release',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.compOffRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          employeeId: 'emp-auth-1',
          earnedHours: 8,
          status: 'PENDING',
          remarks: 'Weekend release',
        }),
      })
    );
    expect(payload.data).toMatchObject({
      id: 'co-1',
      employeeId: 'emp-auth-1',
      earnedDate: '2026-03-22',
      earnedHours: 8,
      status: 'PENDING',
      remarks: 'Weekend release',
    });
  });

  it('updates comp-off status through approve and reject actions', async () => {
    prismaMock.compOffRequest.findFirst.mockResolvedValue({
      id: 'co-2',
      tenantId: 'tenant-1',
      employeeId: 'emp-2',
      earnedDate: new Date('2026-03-20T00:00:00.000Z'),
      earnedHours: 4,
      expiryDate: new Date('2026-05-19T00:00:00.000Z'),
      remarks: 'Initial request',
    });
    prismaMock.compOffRequest.update
      .mockResolvedValueOnce({
        id: 'co-2',
        employeeId: 'emp-2',
        earnedDate: new Date('2026-03-20T00:00:00.000Z'),
        earnedHours: 4,
        status: 'APPROVED',
        appliedDate: null,
        expiryDate: new Date('2026-05-19T00:00:00.000Z'),
        approvedBy: 'mgr-1',
        approvedAt: new Date('2026-03-23T08:00:00.000Z'),
        rejectionReason: null,
        remarks: 'Approved',
        createdAt: new Date('2026-03-20T08:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: 'co-2',
        employeeId: 'emp-2',
        earnedDate: new Date('2026-03-20T00:00:00.000Z'),
        earnedHours: 4,
        status: 'CANCELLED',
        appliedDate: null,
        expiryDate: new Date('2026-05-19T00:00:00.000Z'),
        approvedBy: 'mgr-1',
        approvedAt: new Date('2026-03-23T08:05:00.000Z'),
        rejectionReason: 'Policy mismatch',
        remarks: 'Policy mismatch',
        createdAt: new Date('2026-03-20T08:00:00.000Z'),
      });

    const approveRequest = new NextRequest('http://localhost/api/attendance/comp-off-management', {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        id: 'co-2',
        approverId: 'mgr-1',
        comments: 'Approved',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const approveResponse = await POST(approveRequest as any);
    const approvePayload = await approveResponse.json();

    expect(approveResponse.status).toBe(200);
    expect(approvePayload.data).toMatchObject({
      id: 'co-2',
      status: 'APPROVED',
      approvedBy: 'mgr-1',
      remarks: 'Approved',
    });

    const rejectRequest = new NextRequest('http://localhost/api/attendance/comp-off-management', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reject',
        id: 'co-2',
        approverId: 'mgr-1',
        reason: 'Policy mismatch',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const rejectResponse = await POST(rejectRequest as any);
    const rejectPayload = await rejectResponse.json();

    expect(rejectResponse.status).toBe(200);
    expect(rejectPayload.data).toMatchObject({
      id: 'co-2',
      status: 'CANCELLED',
      approvedBy: 'mgr-1',
      rejectionReason: 'Policy mismatch',
      remarks: 'Policy mismatch',
    });
  });
});