/**
 * AnalyticsService — unit tests against the actual class API.
 * Targets `src/lib/services/analytics.service.ts`.
 *
 * Packet 1 / #49 — Analytics domain.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@aura/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  });
  return {
    prisma: {
      reportDefinition: make(),
      reportExecution: make(),
      dashboardWidget: make(),
      predictiveModel: make(),
      prediction: make(),
      analyticsCache: make(),
      aIAgentConversation: make(),
      aIAgentMessage: make(),
    },
  };
});

import { AnalyticsService } from '../../analytics.service';
import { prisma } from '@aura/database';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

describe('AnalyticsService.findAllReports', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenantId and paginates', async () => {
    (prisma.reportDefinition.count as any).mockResolvedValue(5);
    (prisma.reportDefinition.findMany as any).mockResolvedValue([{ id: 'r1' }]);

    const result = await AnalyticsService.findAllReports({
      tenantId: TENANT_A,
      page: 1,
      limit: 10,
    });

    const where = (prisma.reportDefinition.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(result.meta.total).toBe(5);
    expect(result.data).toEqual([{ id: 'r1' }]);
  });

  it('applies category and isActive filters', async () => {
    (prisma.reportDefinition.count as any).mockResolvedValue(0);
    (prisma.reportDefinition.findMany as any).mockResolvedValue([]);

    await AnalyticsService.findAllReports({
      tenantId: TENANT_A,
      category: 'PAYROLL',
      isActive: 'true',
    });

    const where = (prisma.reportDefinition.findMany as any).mock.calls[0][0].where;
    expect(where.category).toBe('PAYROLL');
    expect(where.isActive).toBe(true);
  });

  it('computes pagination across pages', async () => {
    (prisma.reportDefinition.count as any).mockResolvedValue(100);
    (prisma.reportDefinition.findMany as any).mockResolvedValue([]);

    const result = await AnalyticsService.findAllReports({
      tenantId: TENANT_A,
      page: 3,
      limit: 20,
    });

    expect(result.meta.totalPages).toBe(5);
    expect(prisma.reportDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 })
    );
  });
});

describe('AnalyticsService.findReportById — tenant isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes lookup by tenantId + id', async () => {
    (prisma.reportDefinition.findFirst as any).mockResolvedValue({ id: 'r1', tenantId: TENANT_A });

    await AnalyticsService.findReportById('r1', TENANT_A);

    expect(prisma.reportDefinition.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'r1', tenantId: TENANT_A } })
    );
  });

  it('returns null when another tenant tries', async () => {
    (prisma.reportDefinition.findFirst as any).mockResolvedValue(null);

    const result = await AnalyticsService.findReportById('r1', TENANT_B);

    expect(result).toBeNull();
  });
});

describe('AnalyticsService.createReport', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates input via zod', async () => {
    await expect(
      AnalyticsService.createReport({} as any)
    ).rejects.toThrow();
  });
});

describe('AnalyticsService.deleteReport', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the report', async () => {
    (prisma.reportDefinition.delete as any).mockResolvedValue({ id: 'r1' });

    await AnalyticsService.deleteReport('r1', TENANT_A);

    expect(prisma.reportDefinition.delete).toHaveBeenCalledWith({
      where: { id: 'r1' },
    });
  });
});

describe('AnalyticsService.findAllWidgets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant, dashboardId, and isActive', async () => {
    (prisma.dashboardWidget.count as any).mockResolvedValue(0);
    (prisma.dashboardWidget.findMany as any).mockResolvedValue([]);

    await AnalyticsService.findAllWidgets({
      tenantId: TENANT_A,
      dashboardId: 'dash-1',
      isActive: 'true',
    });

    const where = (prisma.dashboardWidget.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.dashboardId).toBe('dash-1');
    expect(where.isActive).toBe(true);
  });
});

describe('AnalyticsService.findWidgetById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes by tenant', async () => {
    (prisma.dashboardWidget.findFirst as any).mockResolvedValue(null);

    await AnalyticsService.findWidgetById('w-1', TENANT_A);

    expect(prisma.dashboardWidget.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'w-1', tenantId: TENANT_A } })
    );
  });
});

describe('AnalyticsService.deleteWidget', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the widget', async () => {
    (prisma.dashboardWidget.delete as any).mockResolvedValue({});

    await AnalyticsService.deleteWidget('w-1', TENANT_A);

    expect(prisma.dashboardWidget.delete).toHaveBeenCalledWith({
      where: { id: 'w-1' },
    });
  });
});

describe('AnalyticsService.getReportExecutions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by reportId and status', async () => {
    (prisma.reportExecution.count as any).mockResolvedValue(0);
    (prisma.reportExecution.findMany as any).mockResolvedValue([]);

    await AnalyticsService.getReportExecutions({
      tenantId: TENANT_A,
      reportId: 'r-1',
      status: 'COMPLETED',
    });

    const where = (prisma.reportExecution.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.reportId).toBe('r-1');
    expect(where.status).toBe('COMPLETED');
  });
});
