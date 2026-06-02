/**
 * EmployeeService — unit tests against the actual class API.
 *
 * Targets `src/lib/services/employee/employee.service.ts`.
 * Note: the service imports `prisma` from `@/lib/database` (NOT
 * `@aura/database`), so the mock targets `@/lib/database`.
 *
 * Coverage focus (Packet 1 / #49):
 *   - findAll: filter normalization, search OR clause, pagination math
 *   - findById / findByCode / findByEmail
 *   - create: rejects duplicate email and duplicate employeeCode
 *   - update: rejects email collision with a DIFFERENT employee
 *   - delete: soft delete (sets statusId to terminated)
 *   - getDirectReports / getOrgChart: manager chain traversal
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  });
  return {
    prisma: {
      employee: make(),
    },
  };
});

import { EmployeeService } from '../employee.service';
import { prisma } from '@/lib/database';

const TERMINATED_STATUS = 'status-terminated';

const baseEmployee: any = {
  id: 'emp-1',
  employeeCode: 'E001',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  companyId: 'co-1',
  departmentId: 'dep-1',
  locationId: 'loc-1',
  jobProfileId: 'jp-1',
  gradeId: 'g-1',
  statusId: 'st-active',
  typeId: 'type-perm',
  joiningDate: new Date('2024-01-15'),
  managerId: null,
  manager: null,
  department: { name: 'Engineering' },
  jobProfile: { title: 'Senior Engineer' },
  grade: { name: 'G5' },
  status: { name: 'Active' },
};

describe('EmployeeService.findAll', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('applies all scalar filters', async () => {
    (prisma.employee.count as any).mockResolvedValue(0);
    (prisma.employee.findMany as any).mockResolvedValue([]);

    await service.findAll({
      companyId: 'co-1',
      departmentId: 'dep-1',
      locationId: 'loc-1',
      statusId: 'st-active',
      managerId: 'mgr-1',
    });

    const where = (prisma.employee.findMany as any).mock.calls[0][0].where;
    expect(where.companyId).toBe('co-1');
    expect(where.departmentId).toBe('dep-1');
    expect(where.locationId).toBe('loc-1');
    expect(where.statusId).toBe('st-active');
    expect(where.managerId).toBe('mgr-1');
  });

  it('builds an OR clause across name/email/code for search', async () => {
    (prisma.employee.count as any).mockResolvedValue(0);
    (prisma.employee.findMany as any).mockResolvedValue([]);

    await service.findAll({ search: 'doe' });

    const where = (prisma.employee.findMany as any).mock.calls[0][0].where;
    expect(where.OR).toHaveLength(4);
    expect(where.OR.map((c: any) => Object.keys(c)[0])).toEqual([
      'firstName',
      'lastName',
      'email',
      'employeeCode',
    ]);
    expect(where.OR[0].firstName.mode).toBe('insensitive');
  });

  it('computes pagination math', async () => {
    (prisma.employee.count as any).mockResolvedValue(45);
    (prisma.employee.findMany as any).mockResolvedValue([]);

    const result = await service.findAll({ page: 2, limit: 10 });

    expect(result.pagination.total).toBe(45);
    expect(result.pagination.totalPages).toBe(5);
    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('defaults to page=1 limit=20 ordered by createdAt desc', async () => {
    (prisma.employee.count as any).mockResolvedValue(0);
    (prisma.employee.findMany as any).mockResolvedValue([]);

    await service.findAll({});

    const call = (prisma.employee.findMany as any).mock.calls[0][0];
    expect(call.skip).toBe(0);
    expect(call.take).toBe(20);
    expect(call.orderBy).toEqual({ createdAt: 'desc' });
  });
});

describe('EmployeeService.findById/findByCode/findByEmail', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('findById includes full relation tree', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(baseEmployee);
    await service.findById('emp-1');
    const call = (prisma.employee.findUnique as any).mock.calls[0][0];
    expect(call.where).toEqual({ id: 'emp-1' });
    expect(call.include.company).toBe(true);
    expect(call.include.department).toBe(true);
    expect(call.include.manager).toBeDefined();
    expect(call.include.reports).toBeDefined();
  });

  it('findByCode looks up via employeeCode unique key', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(baseEmployee);
    await service.findByCode('E001');
    expect(prisma.employee.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { employeeCode: 'E001' } })
    );
  });

  it('findByEmail looks up via email unique key', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(baseEmployee);
    await service.findByEmail('jane@example.com');
    expect(prisma.employee.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'jane@example.com' } })
    );
  });
});

describe('EmployeeService.create', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  const dto = {
    employeeCode: 'E001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    companyId: 'co-1',
    departmentId: 'dep-1',
    locationId: 'loc-1',
    jobProfileId: 'jp-1',
    gradeId: 'g-1',
    statusId: 'st-active',
    typeId: 'type-perm',
    joiningDate: new Date('2024-01-15'),
  };

  it('refuses to create when email already exists', async () => {
    (prisma.employee.findUnique as any).mockResolvedValueOnce(baseEmployee);

    await expect(service.create(dto)).rejects.toThrow('email already exists');
    expect(prisma.employee.create).not.toHaveBeenCalled();
  });

  it('refuses to create when employeeCode already exists', async () => {
    (prisma.employee.findUnique as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(baseEmployee);

    await expect(service.create(dto)).rejects.toThrow('code already exists');
    expect(prisma.employee.create).not.toHaveBeenCalled();
  });

  it('creates when both email and code are free', async () => {
    (prisma.employee.findUnique as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    (prisma.employee.create as any).mockResolvedValue(baseEmployee);

    await service.create(dto);

    expect(prisma.employee.create).toHaveBeenCalled();
    const data = (prisma.employee.create as any).mock.calls[0][0].data;
    expect(data.joiningDate).toBeInstanceOf(Date);
    expect(data.email).toBe(dto.email);
  });
});

describe('EmployeeService.update', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('allows update without email change (no duplicate check)', async () => {
    (prisma.employee.update as any).mockResolvedValue(baseEmployee);

    await service.update('emp-1', { firstName: 'Janet' });

    expect(prisma.employee.findUnique).not.toHaveBeenCalled();
    expect(prisma.employee.update).toHaveBeenCalled();
  });

  it('rejects email update if email belongs to a DIFFERENT employee', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue({
      ...baseEmployee,
      id: 'other-emp',
    });

    await expect(
      service.update('emp-1', { email: 'taken@example.com' })
    ).rejects.toThrow('email already exists');
  });

  it('ALLOWS email update if the same employee already has that email', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue({
      ...baseEmployee,
      id: 'emp-1',
    });
    (prisma.employee.update as any).mockResolvedValue(baseEmployee);

    await service.update('emp-1', { email: 'jane@example.com' });

    expect(prisma.employee.update).toHaveBeenCalled();
  });

  it('allows email update when no other employee has it', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(null);
    (prisma.employee.update as any).mockResolvedValue(baseEmployee);

    await service.update('emp-1', { email: 'new@example.com' });

    expect(prisma.employee.update).toHaveBeenCalled();
  });
});

describe('EmployeeService.delete (soft delete)', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('updates statusId rather than calling prisma.delete', async () => {
    (prisma.employee.update as any).mockResolvedValue({});

    await service.delete('emp-1', TERMINATED_STATUS);

    expect(prisma.employee.delete).not.toHaveBeenCalled();
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { statusId: TERMINATED_STATUS },
    });
  });
});

describe('EmployeeService.getDirectReports', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('queries by managerId with firstName asc order', async () => {
    (prisma.employee.findMany as any).mockResolvedValue([baseEmployee]);

    await service.getDirectReports('mgr-1');

    const call = (prisma.employee.findMany as any).mock.calls[0][0];
    expect(call.where.managerId).toBe('mgr-1');
    expect(call.orderBy).toEqual({ firstName: 'asc' });
  });

  it('returns empty array when manager has no reports', async () => {
    (prisma.employee.findMany as any).mockResolvedValue([]);

    const result = await service.getDirectReports('mgr-1');

    expect(result).toEqual([]);
  });
});

describe('EmployeeService.getOrgChart', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('returns null when employee not found', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(null);

    const result = await service.getOrgChart('missing');
    expect(result).toBeNull();
  });

  it('terminates traversal when manager chain ends', async () => {
    const manager = {
      ...baseEmployee,
      id: 'mgr-1',
      firstName: 'Boss',
      manager: null,
    };
    (prisma.employee.findUnique as any)
      .mockResolvedValueOnce({ ...baseEmployee, manager })
      .mockResolvedValueOnce(manager);
    (prisma.employee.findMany as any).mockResolvedValue([]);

    const result = await service.getOrgChart('emp-1');

    expect(result.managerChain).toHaveLength(1);
    expect(result.managerChain[0].name).toBe('Boss Doe');
    expect(result.directReports).toEqual([]);
  });

  it('includes direct reports in the org chart', async () => {
    (prisma.employee.findUnique as any).mockResolvedValueOnce({
      ...baseEmployee,
      manager: null,
    });
    (prisma.employee.findMany as any).mockResolvedValue([
      { ...baseEmployee, id: 'rep-1', firstName: 'Report1' },
      { ...baseEmployee, id: 'rep-2', firstName: 'Report2' },
    ]);

    const result = await service.getOrgChart('emp-1');

    expect(result.directReports).toHaveLength(2);
    expect(result.directReports[0].name).toBe('Report1 Doe');
  });
});

describe('EmployeeService.getEmploymentHistory (stub)', () => {
  let service: EmployeeService;
  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  it('returns empty array when employee not found', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(null);

    const result = await service.getEmploymentHistory('missing');

    expect(result).toEqual([]);
  });

  it('returns synthesized hire event when employee exists', async () => {
    (prisma.employee.findUnique as any).mockResolvedValue(baseEmployee);

    const result = await service.getEmploymentHistory('emp-1');

    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('HIRED');
    expect(result[0].effectiveDate).toEqual(baseEmployee.joiningDate);
  });
});
