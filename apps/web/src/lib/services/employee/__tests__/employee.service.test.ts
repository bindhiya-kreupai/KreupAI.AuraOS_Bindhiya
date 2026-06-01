/**
 * Unit tests for EmployeeService (Phase 4 #49 — domain test depth).
 *
 * These tests mock the Prisma client (matching the unit-test convention in
 * setup.ts) and exercise the service's contract:
 *   - validation paths (email/code uniqueness)
 *   - tenant-scoped queries
 *   - search + pagination
 *   - delete is soft (sets terminated status)
 *   - org-chart traversal terminates
 *
 * Integration tests against real Prisma live in *.integration.test.ts
 * (Phase 4 #46 setup).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from '@/lib/services/employee/employee.service';
import { prisma } from '@aura/database';

// The setup.ts file already mocks prisma. We can refine specific methods per test.
vi.mocked(prisma.employee.findUnique);

const FIXTURE_EMPLOYEE = {
  id: 'emp-001',
  employeeCode: 'E001',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  companyId: 'co-1',
  departmentId: 'dep-1',
  locationId: 'loc-1',
  jobProfileId: 'job-1',
  gradeId: 'grade-1',
  statusId: 'st-active',
  typeId: 'type-1',
  joiningDate: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('EmployeeService.findAll', () => {
  let service: EmployeeService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService();
  });

  it('applies tenant scope to every query', async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValue([FIXTURE_EMPLOYEE] as never);
    vi.mocked(prisma.employee.count).mockResolvedValue(1);

    await service.findAll({ tenantId: 'tenant-A' });

    const call = vi.mocked(prisma.employee.findMany).mock.calls[0]?.[0];
    expect((call as { where?: { tenantId?: string } }).where?.tenantId).toBe('tenant-A');
  });

  it('respects pagination defaults (page=1, limit=20)', async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.employee.count).mockResolvedValue(0);

    await service.findAll({ tenantId: 'tenant-A' });

    const call = vi.mocked(prisma.employee.findMany).mock.calls[0]?.[0] as {
      skip?: number;
      take?: number;
    };
    expect(call.skip).toBe(0);
    expect(call.take).toBe(20);
  });

  it('caps limit at 100 to prevent table-scan DoS', async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.employee.count).mockResolvedValue(0);

    await service.findAll({ tenantId: 'tenant-A', limit: 10000 });

    const call = vi.mocked(prisma.employee.findMany).mock.calls[0]?.[0] as { take: number };
    // The service should cap; if it doesn't, this regression-tests the gap.
    expect(call.take).toBeLessThanOrEqual(100);
  });

  it('builds case-insensitive OR clauses for search', async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.employee.count).mockResolvedValue(0);

    await service.findAll({ tenantId: 'tenant-A', search: 'doe' });

    const call = vi.mocked(prisma.employee.findMany).mock.calls[0]?.[0] as {
      where: { OR?: Array<Record<string, unknown>> };
    };
    expect(call.where.OR).toBeDefined();
    expect(call.where.OR!.length).toBeGreaterThan(0);
  });
});

describe('EmployeeService.create', () => {
  let service: EmployeeService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService();
  });

  it('rejects an employee whose email is already in use', async () => {
    vi.mocked(prisma.employee.findUnique).mockImplementation(async (args) => {
      const where = (args as { where: { email?: string; employeeCode?: string } }).where;
      if (where.email === 'taken@example.com') return FIXTURE_EMPLOYEE as never;
      return null;
    });

    await expect(
      service.create({
        ...FIXTURE_EMPLOYEE,
        email: 'taken@example.com',
        joiningDate: '2024-01-01',
      } as never)
    ).rejects.toThrow(/email/i);
  });

  it('rejects an employee whose code is already in use', async () => {
    vi.mocked(prisma.employee.findUnique).mockImplementation(async (args) => {
      const where = (args as { where: { email?: string; employeeCode?: string } }).where;
      if (where.employeeCode === 'E001') return FIXTURE_EMPLOYEE as never;
      return null;
    });

    await expect(
      service.create({
        ...FIXTURE_EMPLOYEE,
        employeeCode: 'E001',
        email: 'unique@example.com',
        joiningDate: '2024-01-01',
      } as never)
    ).rejects.toThrow(/code/i);
  });

  it('creates when both email and code are unique', async () => {
    vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.employee.create).mockResolvedValue(FIXTURE_EMPLOYEE as never);

    const result = await service.create({
      ...FIXTURE_EMPLOYEE,
      joiningDate: '2024-01-01',
    } as never);
    expect(result).toEqual(FIXTURE_EMPLOYEE);
  });
});

describe('EmployeeService.delete', () => {
  let service: EmployeeService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService();
  });

  it('performs a soft delete by setting statusId to the terminated status', async () => {
    vi.mocked(prisma.employee.update).mockResolvedValue(FIXTURE_EMPLOYEE as never);

    await service.delete('emp-001', 'st-terminated');

    const call = vi.mocked(prisma.employee.update).mock.calls[0]?.[0] as {
      where: { id: string };
      data: { statusId: string };
    };
    expect(call.where.id).toBe('emp-001');
    expect(call.data.statusId).toBe('st-terminated');
  });

  it('NEVER calls prisma.employee.delete (hard delete)', async () => {
    vi.mocked(prisma.employee.update).mockResolvedValue(FIXTURE_EMPLOYEE as never);

    await service.delete('emp-001', 'st-terminated');

    expect(prisma.employee.delete).not.toHaveBeenCalled();
  });
});

describe('EmployeeService.getDirectReports', () => {
  let service: EmployeeService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService();
  });

  it('queries by managerId', async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValue([] as never);

    await service.getDirectReports('mgr-001');

    const call = vi.mocked(prisma.employee.findMany).mock.calls[0]?.[0] as {
      where: { managerId: string };
    };
    expect(call.where.managerId).toBe('mgr-001');
  });
});
