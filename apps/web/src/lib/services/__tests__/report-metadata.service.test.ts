/**
 * ReportMetadataService — unit tests.
 * Targets `src/lib/services/report-metadata.service.ts`.
 * Verifies tenant-scoped counts, column projection, and preview mapping using real
 * (mocked) Prisma queries — no static mock catalogs.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/database', () => {
  const make = () => ({ findMany: vi.fn(), count: vi.fn() });
  const mockPrisma = {
    employee: make(),
    attendanceRecord: make(),
    leaveRequest: make(),
    payslip: make(),
  };
  return { prisma: mockPrisma };
});

import { ReportMetadataService } from '../report-metadata.service';
import { prisma } from '@/lib/database';

const TENANT = 'tenant-A';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReportMetadataService.getDataSources', () => {
  it('returns all data sources with tenant-scoped record counts', async () => {
    (prisma.employee.count as any).mockResolvedValue(42);
    (prisma.attendanceRecord.count as any).mockResolvedValue(10);
    (prisma.leaveRequest.count as any).mockResolvedValue(5);
    (prisma.payslip.count as any).mockResolvedValue(7);

    const sources = await ReportMetadataService.getDataSources(TENANT);

    const employees = sources.find((s) => s.id === 'employees');
    expect(employees).toBeDefined();
    expect(employees!.recordCount).toBe(42);
    expect(employees!.columns.length).toBeGreaterThan(0);

    // Employee count must be scoped by tenant via company relation.
    expect(prisma.employee.count).toHaveBeenCalledWith({
      where: { company: { tenantId: TENANT }, isDeleted: false },
    });
  });

  it('degrades gracefully to 0 when a count query throws', async () => {
    (prisma.employee.count as any).mockRejectedValue(new Error('db down'));
    (prisma.attendanceRecord.count as any).mockResolvedValue(0);
    (prisma.leaveRequest.count as any).mockResolvedValue(0);
    (prisma.payslip.count as any).mockResolvedValue(0);

    const sources = await ReportMetadataService.getDataSources(TENANT);
    expect(sources.find((s) => s.id === 'employees')!.recordCount).toBe(0);
  });
});

describe('ReportMetadataService.getColumns', () => {
  it('returns columns for a known data source', () => {
    const cols = ReportMetadataService.getColumns('employees');
    expect(cols.map((c) => c.id)).toContain('employeeCode');
  });

  it('returns empty array for an unknown data source', () => {
    expect(ReportMetadataService.getColumns('nope')).toEqual([]);
  });
});

describe('ReportMetadataService.preview', () => {
  it('projects rows to only the selected columns and scopes by tenant', async () => {
    (prisma.employee.count as any).mockResolvedValue(2);
    (prisma.employee.findMany as any).mockResolvedValue([
      {
        employeeCode: 'E1',
        firstName: 'Ann',
        lastName: 'Lee',
        email: 'ann@x.com',
        joiningDate: new Date('2024-01-01T00:00:00Z'),
        department: { name: 'HR' },
        jobProfile: { title: 'Manager' },
        location: { name: 'HQ' },
        status: { name: 'Active' },
      },
    ]);

    const result = await ReportMetadataService.preview(
      'employees',
      TENANT,
      ['employeeCode', 'department'],
      10
    );

    expect(result.totalRows).toBe(2);
    expect(result.columns.map((c) => c.id)).toEqual(['employeeCode', 'department']);
    // Row projected to only requested keys.
    expect(result.rows[0]).toEqual({ employeeCode: 'E1', department: 'HR' });

    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company: { tenantId: TENANT }, isDeleted: false },
      })
    );
  });

  it('returns empty result for an unknown data source without hitting the db', async () => {
    const result = await ReportMetadataService.preview('unknown', TENANT, [], 10);
    expect(result).toEqual({ columns: [], rows: [], totalRows: 0 });
    expect(prisma.employee.findMany).not.toHaveBeenCalled();
  });
});
