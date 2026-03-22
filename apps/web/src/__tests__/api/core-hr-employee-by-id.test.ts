import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request, routeContext?: any) =>
    handler(request, mockContext, routeContext),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    employee: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/database';
import { GET, PUT } from '@/app/api/core-hr/employees/[employeeId]/route';

describe('core-HR employee by id API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an employee scoped through company tenant ownership', async () => {
    prismaMock.employee.findFirst.mockResolvedValue({
      id: 'emp-1',
      firstName: 'Jane',
      lastName: 'Doe',
      jobProfile: { title: 'HR Manager' },
      department: { name: 'People' },
      location: { name: 'Dubai' },
    });

    const request = new NextRequest('http://localhost/api/core-hr/employees/emp-1');
    const response = await GET(request as any, { params: { employeeId: 'emp-1' } } as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.employee.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'emp-1',
          company: { tenantId: 'tenant-1' },
        },
      })
    );
    expect(payload.employee).toMatchObject({
      id: 'emp-1',
      name: 'Jane Doe',
      role: 'HR Manager',
      dept: 'People',
      loc: 'Dubai',
    });
  });

  it('updates an employee through the missing by-id route used by the dashboard service', async () => {
    prismaMock.employee.findFirst.mockResolvedValueOnce({ id: 'emp-1' });
    prismaMock.employee.update.mockResolvedValue({
      id: 'emp-1',
      firstName: 'Jane',
      lastName: 'Updated',
      jobProfile: { title: 'HR Manager' },
      department: { name: 'People' },
      location: { name: 'Dubai' },
    });

    const request = new NextRequest('http://localhost/api/core-hr/employees/emp-1', {
      method: 'PUT',
      body: JSON.stringify({ lastName: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PUT(request as any, { params: { employeeId: 'emp-1' } } as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'emp-1' },
        data: expect.objectContaining({ lastName: 'Updated' }),
      })
    );
    expect(payload.employee).toMatchObject({
      id: 'emp-1',
      name: 'Jane Updated',
    });
  });
});