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
import { GET, POST } from '@/app/api/attendance/work-from-home/route';

describe('attendance work-from-home API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults GET placeholders to the authenticated employee', async () => {
    const request = new NextRequest(
      'http://localhost/api/attendance/work-from-home?employeeId=current-user-id'
    );

    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toSatisfy((items: Array<{ employeeId: string }>) =>
      items.every(item => item.employeeId === 'emp-auth-1')
    );
  });

  it('resolves POST placeholders to the authenticated employee', async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    const request = new NextRequest('http://localhost/api/attendance/work-from-home', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'current-user-id',
        startDate: '2026-03-24',
        endDate: '2026-03-25',
        reason: 'Focused work',
        isRecurring: false,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({
      employeeId: 'emp-auth-1',
      startDate: '2026-03-24',
      endDate: '2026-03-25',
      reason: 'Focused work',
      status: 'PENDING',
    });
  });

  it('supports approve and reject actions on the base POST route', async () => {
    const approveRequest = new NextRequest('http://localhost/api/attendance/work-from-home', {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        id: 'wfh-approve-1',
        approverId: 'mgr-1',
        comments: 'Approved for this sprint',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const approveResponse = await POST(approveRequest as any);
    const approvePayload = await approveResponse.json();

    expect(approveResponse.status).toBe(200);
    expect(approvePayload.data).toMatchObject({
      id: 'wfh-approve-1',
      employeeId: 'emp-auth-1',
      status: 'APPROVED',
      approvedBy: 'mgr-1',
      reason: 'Approved for this sprint',
    });

    const rejectRequest = new NextRequest('http://localhost/api/attendance/work-from-home', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reject',
        id: 'wfh-reject-1',
        approverId: 'mgr-1',
        reason: 'Onsite coverage needed',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const rejectResponse = await POST(rejectRequest as any);
    const rejectPayload = await rejectResponse.json();

    expect(rejectResponse.status).toBe(200);
    expect(rejectPayload.data).toMatchObject({
      id: 'wfh-reject-1',
      employeeId: 'emp-auth-1',
      status: 'REJECTED',
      approvedBy: 'mgr-1',
      reason: 'Onsite coverage needed',
    });
  });
});
