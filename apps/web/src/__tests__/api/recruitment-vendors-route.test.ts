import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  _user: { tenantId: 'tenant-1', id: 'user-1' },
  user: { tenantId: 'tenant-1', id: 'user-1' },
  params: { id: 'vendor-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    recruitmentVendor: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET as getVendors, POST as createVendor } from '@/app/api/v1/recruitment/vendors/route';
import { PUT as updateVendor } from '@/app/api/v1/recruitment/vendors/[id]/route';

describe('recruitment vendors routes', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tenant-scoped vendors with filters', async () => {
    prismaMock.recruitmentVendor.findMany.mockResolvedValue([]);
    prismaMock.recruitmentVendor.count.mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/v1/recruitment/vendors?status=active&category=recruitment_agency');
    const response = await getVendors(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(prismaMock.recruitmentVendor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 'tenant-1',
          status: 'active',
          category: 'recruitment_agency',
        },
      })
    );
  });

  it('creates a tenant-scoped recruitment vendor', async () => {
    prismaMock.recruitmentVendor.create.mockResolvedValue({
      id: 'vendor-1',
      vendorCode: 'VEN-0001',
      name: 'Apex Recruiters',
      category: 'recruitment_agency',
      status: 'under_review',
      createdAt: new Date('2026-03-22T00:00:00.000Z'),
      updatedAt: new Date('2026-03-22T00:00:00.000Z'),
    });

    const request = new NextRequest('http://localhost/api/v1/recruitment/vendors', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Apex Recruiters',
        category: 'recruitment_agency',
        specialties: ['Tech Hiring'],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await createVendor(request as any);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(prismaMock.recruitmentVendor.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          name: 'Apex Recruiters',
          category: 'recruitment_agency',
          status: 'under_review',
          createdBy: 'user-1',
        }),
      })
    );
  });

  it('updates only the current tenant vendor', async () => {
    prismaMock.recruitmentVendor.findFirst.mockResolvedValue({ id: 'vendor-1', tenantId: 'tenant-1' });
    prismaMock.recruitmentVendor.update.mockResolvedValue({
      id: 'vendor-1',
      name: 'Apex Recruiters',
      status: 'active',
    });

    const request = new NextRequest('http://localhost/api/v1/recruitment/vendors/vendor-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'active' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await updateVendor(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(prismaMock.recruitmentVendor.findFirst).toHaveBeenCalledWith({
      where: { id: 'vendor-1', tenantId: 'tenant-1' },
    });
    expect(prismaMock.recruitmentVendor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'vendor-1' },
        data: expect.objectContaining({ status: 'active', updatedBy: 'user-1' }),
      })
    );
  });
});