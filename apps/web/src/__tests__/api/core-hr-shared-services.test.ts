import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
  employeeId: 'emp-1',
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    sharedServiceRequest: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/database';
import { GET, POST } from '@/app/api/core-hr/shared-services/route';

describe('core-HR shared services API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns tenant-scoped shared service requests mapped to the dashboard contract', async () => {
    prismaMock.sharedServiceRequest.findMany.mockResolvedValue([
      {
        id: 'ssr-1',
        requestorId: 'emp-1',
        category: 'IT_ACCESS',
        subject: 'VPN Access',
        details: 'Need client VPN access',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToId: 'emp-2',
        createdAt: new Date('2026-03-22T00:00:00.000Z'),
        requestor: { id: 'emp-1', firstName: 'Jane', lastName: 'Doe' },
        assignedTo: { id: 'emp-2', firstName: 'Alex', lastName: 'Smith' },
      },
    ]);
    prismaMock.sharedServiceRequest.count.mockResolvedValue(1);

    const request = new NextRequest('http://localhost/api/core-hr/shared-services?status=in_progress&category=it_access');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.sharedServiceRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 'tenant-1',
          status: 'IN_PROGRESS',
          category: 'IT_ACCESS',
        },
      })
    );
    expect(payload.requests[0]).toMatchObject({
      requestId: 'ssr-1',
      requestorName: 'Jane Doe',
      category: 'it_access',
      priority: 'high',
      status: 'in_progress',
      assignedToName: 'Alex Smith',
    });
  });

  it('creates shared service requests using the authenticated employee as requestor', async () => {
    prismaMock.sharedServiceRequest.create.mockResolvedValue({
      id: 'ssr-2',
      requestorId: 'emp-1',
      category: 'HR_LETTER',
      subject: 'NOC Letter',
      details: 'For bank use',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedToId: null,
      createdAt: new Date('2026-03-22T00:00:00.000Z'),
      requestor: { id: 'emp-1', firstName: 'Jane', lastName: 'Doe' },
      assignedTo: null,
    });

    const request = new NextRequest('http://localhost/api/core-hr/shared-services', {
      method: 'POST',
      body: JSON.stringify({
        category: 'hr_letter',
        subject: 'NOC Letter',
        details: 'For bank use',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.sharedServiceRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          requestorId: 'emp-1',
          category: 'HR_LETTER',
          status: 'OPEN',
        }),
      })
    );
    expect(payload.request).toMatchObject({
      requestId: 'ssr-2',
      requestorName: 'Jane Doe',
      category: 'hr_letter',
      status: 'open',
    });
  });
});