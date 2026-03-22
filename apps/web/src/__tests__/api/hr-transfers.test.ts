import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    interCompanyTransfer: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/database';
import { GET, POST } from '@/app/api/v1/hr/transfers/route';

describe('HR transfers API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated transfer requests scoped to tenant and filters', async () => {
    prismaMock.interCompanyTransfer.findMany.mockResolvedValue([
      {
        id: 'transfer-1',
        employeeId: 'emp-1',
        fromCompanyId: 'company-a',
        toCompanyId: 'company-b',
        transferType: 'SECONDMENT',
        effectiveDate: new Date('2026-04-01T00:00:00.000Z'),
        status: 'APPROVED',
        requestedBy: 'mgr-1',
        createdAt: new Date('2026-03-22T00:00:00.000Z'),
        employee: { id: 'emp-1', firstName: 'Jane', lastName: 'Doe', employeeCode: 'E001' },
        fromCompany: { id: 'company-a', name: 'Aura Dubai', code: 'DXB' },
        toCompany: { id: 'company-b', name: 'Aura Riyadh', code: 'RUH' },
      },
    ]);
    prismaMock.interCompanyTransfer.count.mockResolvedValue(11);

    const request = new NextRequest(
      'http://localhost/api/v1/hr/transfers?page=2&limit=10&status=APPROVED&employeeId=emp-1'
    );

    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.interCompanyTransfer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 'tenant-1',
          status: 'APPROVED',
          employeeId: 'emp-1',
        },
        skip: 10,
        take: 10,
      })
    );
    expect(prismaMock.interCompanyTransfer.count).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        status: 'APPROVED',
        employeeId: 'emp-1',
      },
    });
    expect(payload.success).toBe(true);
    expect(payload.data).toHaveLength(1);
    expect(payload.meta.pagination).toMatchObject({
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    });
  });

  it('creates transfer requests with the supported schema fields only', async () => {
    prismaMock.interCompanyTransfer.create.mockResolvedValue({
      id: 'transfer-2',
      employeeId: 'emp-2',
      fromCompanyId: 'company-a',
      toCompanyId: 'company-c',
      transferType: 'PROJECT_BASED',
      effectiveDate: new Date('2026-04-05T00:00:00.000Z'),
      status: 'PENDING',
      requestedBy: 'user-1',
      employee: { id: 'emp-2', firstName: 'Alex', lastName: 'Smith', employeeCode: 'E002' },
      fromCompany: { id: 'company-a', name: 'Aura Dubai', code: 'DXB' },
      toCompany: { id: 'company-c', name: 'Aura Mumbai', code: 'BOM' },
    });

    const request = new NextRequest('http://localhost/api/v1/hr/transfers', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'emp-2',
        fromCompanyId: 'company-a',
        toCompanyId: 'company-c',
        effectiveDate: '2026-04-05T00:00:00.000Z',
        transferType: 'PROJECT_BASED',
        reason: 'Ignored old field',
        notes: 'Ignored old field',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.interCompanyTransfer.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        employeeId: 'emp-2',
        fromCompanyId: 'company-a',
        toCompanyId: 'company-c',
        effectiveDate: new Date('2026-04-05T00:00:00.000Z'),
        transferType: 'PROJECT_BASED',
        status: 'PENDING',
        requestedBy: 'user-1',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        fromCompany: { select: { id: true, name: true, code: true } },
        toCompany: { select: { id: true, name: true, code: true } },
      },
    });
    expect(payload).toMatchObject({
      success: true,
      message: 'Transfer request created successfully',
    });
  });

  it('rejects transfer creation when source and target company are the same', async () => {
    const request = new NextRequest('http://localhost/api/v1/hr/transfers', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'emp-3',
        fromCompanyId: 'company-a',
        toCompanyId: 'company-a',
        effectiveDate: '2026-04-07T00:00:00.000Z',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(prismaMock.interCompanyTransfer.create).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      success: false,
      error: {
        code: 'E2001',
        message: 'fromCompanyId and toCompanyId must be different',
      },
    });
  });
});