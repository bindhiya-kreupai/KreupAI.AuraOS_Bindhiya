/**
 * CareerService unit tests
 *
 * Exercises the pure transformation + tenant-scoping logic of the career
 * planning service by mocking the Prisma delegates. No live database required.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Prisma client that BaseService imports via '@aura/database'.
// The factory is hoisted, so the delegate mocks are created inside it and
// re-read from the mocked module below.
vi.mock('@aura/database', () => ({
  prisma: {
    careerEntity: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    careerSetting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { CareerService } from '@/lib/services/career/career.service';

const careerEntity = prisma.careerEntity as unknown as Record<string, ReturnType<typeof vi.fn>>;
const careerSetting = prisma.careerSetting as unknown as Record<string, ReturnType<typeof vi.fn>>;
const auditLog = prisma.auditLog as unknown as Record<string, ReturnType<typeof vi.fn>>;

const ctx = { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' };

describe('CareerService', () => {
  let service: CareerService;

  beforeEach(() => {
    service = new CareerService();
    vi.clearAllMocks();
    auditLog.create.mockResolvedValue({ id: 'audit-1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists entities scoped by tenant + kind and surfaces the kind-specific id key', async () => {
    careerEntity.findMany.mockResolvedValueOnce([
      { id: 'row-1', data: { ladderName: 'Engineering' } },
    ]);

    const result = await service.list('ladder', ctx, { department: 'Engineering' });

    expect(careerEntity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          kind: 'ladder',
          isDeleted: false,
          department: 'Engineering',
        }),
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'row-1',
      ladderId: 'row-1',
      ladderName: 'Engineering',
    });
  });

  it('creates an entity with server-derived tenant/user and promotes indexed columns', async () => {
    careerEntity.create.mockResolvedValueOnce({
      id: 'goal-1',
      data: { goalTitle: 'Grow', employeeId: 'emp-1' },
    });

    const created = await service.create('goal', ctx, {
      goalTitle: 'Grow',
      employeeId: 'emp-1',
      status: 'in_progress',
    });

    const callArg = careerEntity.create.mock.calls[0][0];
    expect(callArg.data.tenantId).toBe('tenant-1');
    expect(callArg.data.kind).toBe('goal');
    expect(callArg.data.employeeId).toBe('emp-1');
    expect(callArg.data.status).toBe('in_progress');
    expect(callArg.data.createdBy).toBe('user-1');
    expect(created).toMatchObject({ id: 'goal-1', goalId: 'goal-1', goalTitle: 'Grow' });
  });

  it('returns merged defaults for settings when none are stored', async () => {
    careerSetting.findUnique.mockResolvedValueOnce(null);

    const settings = await service.getSettings(ctx);

    expect(settings.enableCareerLadders).toBe(true);
    expect(settings.maxActiveGoalsPerEmployee).toBe(5);
    expect(settings.settingsId).toBe('tenant-1');
  });

  it('upserts settings tenant-scoped and merges the update over defaults', async () => {
    careerSetting.findUnique.mockResolvedValueOnce(null);
    careerSetting.upsert.mockResolvedValueOnce({
      id: 'set-1',
      updatedAt: new Date('2026-07-01T00:00:00Z'),
      updatedBy: 'user-1',
      data: { maxActiveGoalsPerEmployee: 10 },
    });

    const updated = await service.updateSettings(ctx, { maxActiveGoalsPerEmployee: 10 });

    const upsertArg = careerSetting.upsert.mock.calls[0][0];
    expect(upsertArg.where).toEqual({ tenantId: 'tenant-1' });
    expect(upsertArg.create.data.maxActiveGoalsPerEmployee).toBe(10);
    expect(updated.maxActiveGoalsPerEmployee).toBe(10);
    expect(updated.settingsId).toBe('set-1');
  });

  it('throws when updating a non-existent entity (tenant-scoped lookup misses)', async () => {
    careerEntity.findFirst.mockResolvedValueOnce(null);

    await expect(service.update('goal', ctx, 'missing', { goalTitle: 'x' })).rejects.toThrow(
      /not found/i
    );
  });
});
