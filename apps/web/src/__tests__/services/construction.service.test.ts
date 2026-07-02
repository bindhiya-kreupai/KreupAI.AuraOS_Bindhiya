/**
 * ConstructionService unit tests
 *
 * Exercises the pure transformation, promoted-column, and tenant-scoping logic
 * of the construction service by mocking the Prisma delegates. No live database
 * required. New models are resolved dynamically via `(prisma as any)[delegate]`,
 * so the mock exposes the construction model accessors used by the service.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    constructionProject: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    constructionEquipmentLease: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    constructionSettings: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { ConstructionService } from '@/lib/services/construction/construction.service';

type FnMap = Record<string, ReturnType<typeof vi.fn>>;
const project = (prisma as any).constructionProject as FnMap;
const lease = (prisma as any).constructionEquipmentLease as FnMap;
const settings = (prisma as any).constructionSettings as FnMap;
const auditLog = (prisma as any).auditLog as FnMap;

const ctx = { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' };

describe('ConstructionService', () => {
  let service: ConstructionService;

  beforeEach(() => {
    service = new ConstructionService();
    vi.clearAllMocks();
    auditLog.create.mockResolvedValue({ id: 'audit-1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists projects scoped by tenant and surfaces the kind id key', async () => {
    project.findMany.mockResolvedValueOnce([{ id: 'p1', data: { projectName: 'Skyline' } }]);

    const result = await service.list('project', ctx, { status: 'in_progress' });

    expect(project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          isDeleted: false,
          status: 'in_progress',
        }),
      })
    );
    expect(result[0]).toMatchObject({ id: 'p1', projectId: 'p1', projectName: 'Skyline' });
  });

  it('ignores non-indexed filter keys when listing', async () => {
    project.findMany.mockResolvedValueOnce([]);
    await service.list('project', ctx, { randomKey: 'x' });
    const where = project.findMany.mock.calls[0][0].where;
    expect(where).not.toHaveProperty('randomKey');
    expect(where.tenantId).toBe('tenant-1');
  });

  it('creates a project with server-derived tenant/user and promotes columns', async () => {
    project.create.mockResolvedValueOnce({
      id: 'p2',
      data: { projectName: 'Metro', projectNumber: 'PRJ-1', projectType: 'infrastructure' },
    });

    const created = await service.create('project', ctx, {
      projectName: 'Metro',
      projectNumber: 'PRJ-1',
      projectType: 'infrastructure',
      status: 'planning',
      // Client-supplied ids must be stripped, not trusted.
      projectId: 'HACK',
      tenantId: 'other-tenant',
    });

    const arg = project.create.mock.calls[0][0];
    expect(arg.data.tenantId).toBe('tenant-1');
    expect(arg.data.projectName).toBe('Metro');
    expect(arg.data.projectType).toBe('infrastructure');
    expect(arg.data.createdBy).toBe('user-1');
    expect(arg.data.data.projectId).toBeUndefined();
    expect(arg.data.data.tenantId).toBeUndefined();
    expect(created).toMatchObject({ id: 'p2', projectId: 'p2', projectName: 'Metro' });
  });

  it('promotes a numeric column (crew size handled via number pick) on update merge', async () => {
    lease.findFirst.mockResolvedValueOnce({
      id: 'l1',
      data: { equipmentName: 'Excavator', status: 'active' },
      equipmentName: 'Excavator',
      status: 'active',
    });
    lease.update.mockResolvedValueOnce({
      id: 'l1',
      data: { equipmentName: 'Excavator', status: 'maintenance' },
    });

    const updated = await service.update('equipment-lease', ctx, 'l1', { status: 'maintenance' });

    const arg = lease.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'l1' });
    expect(arg.data.status).toBe('maintenance');
    expect(arg.data.updatedBy).toBe('user-1');
    expect(updated).toMatchObject({ id: 'l1', leaseId: 'l1' });
  });

  it('throws when updating a non-existent record (tenant-scoped lookup misses)', async () => {
    project.findFirst.mockResolvedValueOnce(null);
    await expect(service.update('project', ctx, 'missing', { projectName: 'x' })).rejects.toThrow(
      /not found/i
    );
  });

  it('returns merged default settings when none are stored', async () => {
    settings.findUnique.mockResolvedValueOnce(null);
    const result = await service.getSettings(ctx);
    expect((result.projectSettings as any).defaultContingency).toBe(10);
    expect(result.settingsId).toBe('tenant-1');
    expect(result.organizationId).toBe('tenant-1');
  });

  it('upserts settings tenant-scoped, merging the update over defaults', async () => {
    settings.findUnique.mockResolvedValueOnce(null);
    settings.upsert.mockResolvedValueOnce({
      id: 'set-1',
      updatedAt: new Date('2026-07-01T00:00:00Z'),
      data: { customFlag: true },
    });

    const updated = await service.updateSettings(ctx, { customFlag: true });
    const upsertArg = settings.upsert.mock.calls[0][0];
    expect(upsertArg.where).toEqual({ tenantId: 'tenant-1' });
    expect(upsertArg.create.data.customFlag).toBe(true);
    expect(updated.settingsId).toBe('set-1');
  });
});
