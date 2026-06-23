import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedViewService } from '../saved-view.service';

/**
 * Service-level tests for SavedViewService. We mock the prisma delegate
 * (`tenantSavedView`) directly because the Prisma client is currently
 * pre-regeneration (see file-level note in the service). Behaviour
 * under test is the orchestration logic — validation, default-demotion
 * on promote-to-default, owner-only edits — not Prisma plumbing.
 */
describe('SavedViewService', () => {
  let svc: SavedViewService;
  let delegate: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    svc = new SavedViewService();
    delegate = {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    };

    // Override the prisma delegate accessor + executeTransaction + audit.
    Object.defineProperty(svc, 'delegate', { get: () => delegate });
    (svc as any).executeTransaction = async (op: any) => op({ tenantSavedView: delegate } as any);
    (svc as any).createAuditLog = vi.fn().mockResolvedValue(undefined);
  });

  describe('create', () => {
    it('rejects payloads missing tenantId / userId / scope / name', async () => {
      await expect(
        svc.create({ tenantId: '', userId: 'u1', scope: 's', name: 'n', filters: {} })
      ).rejects.toThrow(/tenantId/);

      await expect(
        svc.create({ tenantId: 't1', userId: '', scope: 's', name: 'n', filters: {} })
      ).rejects.toThrow(/userId/);

      await expect(
        svc.create({ tenantId: 't1', userId: 'u1', scope: '', name: 'n', filters: {} })
      ).rejects.toThrow(/scope/);

      await expect(
        svc.create({ tenantId: 't1', userId: 'u1', scope: 's', name: '  ', filters: {} })
      ).rejects.toThrow(/name/);
    });

    it('rejects non-object filters', async () => {
      await expect(
        // @ts-expect-error — purposely wrong shape for validation test
        svc.create({ tenantId: 't1', userId: 'u1', scope: 's', name: 'n', filters: 'oops' })
      ).rejects.toThrow(/filters/);
    });

    it('promoting to default demotes any pre-existing default in the same scope', async () => {
      delegate.create.mockResolvedValue({
        id: 'v-new',
        tenantId: 't1',
        userId: 'u1',
        scope: 'payroll.runs:list',
        name: 'My view',
        filters: {},
        isDefault: true,
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await svc.create({
        tenantId: 't1',
        userId: 'u1',
        scope: 'payroll.runs:list',
        name: 'My view',
        filters: { q: 'failed' },
        isDefault: true,
      });

      expect(delegate.updateMany).toHaveBeenCalledWith({
        where: { tenantId: 't1', userId: 'u1', scope: 'payroll.runs:list', isDefault: true },
        data: { isDefault: false },
      });
      expect(delegate.create).toHaveBeenCalled();
    });

    it('does NOT demote anything when not promoting to default', async () => {
      delegate.create.mockResolvedValue({
        id: 'v-2',
        tenantId: 't1',
        userId: 'u1',
        scope: 's',
        name: 'n',
        filters: {},
        isDefault: false,
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await svc.create({ tenantId: 't1', userId: 'u1', scope: 's', name: 'n', filters: {} });
      expect(delegate.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const existing = {
      id: 'v-1',
      tenantId: 't1',
      userId: 'u1',
      scope: 'payroll.runs:list',
      name: 'Old',
      filters: {},
      isDefault: false,
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('rejects edits by a non-owner', async () => {
      delegate.findFirst.mockResolvedValue(existing);

      await expect(
        svc.update({ tenantId: 't1', userId: 'other-user', id: 'v-1', input: { name: 'X' } })
      ).rejects.toThrow(/own saved views/);
    });

    it('rejects edits when the view does not exist', async () => {
      delegate.findFirst.mockResolvedValue(null);
      await expect(
        svc.update({ tenantId: 't1', userId: 'u1', id: 'nope', input: { name: 'X' } })
      ).rejects.toThrow(/not found/);
    });

    it('demotes other defaults in the same scope when promoting this one (excluding self)', async () => {
      delegate.findFirst.mockResolvedValue(existing);
      delegate.update.mockResolvedValue({ ...existing, name: 'Renamed', isDefault: true });

      await svc.update({
        tenantId: 't1',
        userId: 'u1',
        id: 'v-1',
        input: { name: 'Renamed', isDefault: true },
      });

      expect(delegate.updateMany).toHaveBeenCalledWith({
        where: {
          tenantId: 't1',
          userId: 'u1',
          scope: 'payroll.runs:list',
          isDefault: true,
          id: { not: 'v-1' },
        },
        data: { isDefault: false },
      });
    });
  });

  describe('remove', () => {
    it('refuses to delete a view owned by someone else', async () => {
      delegate.findFirst.mockResolvedValue({
        id: 'v-1',
        tenantId: 't1',
        userId: 'someone-else',
        scope: 's',
        name: 'n',
        filters: {},
        isDefault: false,
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(svc.remove({ tenantId: 't1', userId: 'u1', id: 'v-1' })).rejects.toThrow(
        /own saved views/
      );

      expect(delegate.delete).not.toHaveBeenCalled();
    });

    it('is a no-op when the view does not exist', async () => {
      delegate.findFirst.mockResolvedValue(null);
      await svc.remove({ tenantId: 't1', userId: 'u1', id: 'gone' });
      expect(delegate.delete).not.toHaveBeenCalled();
    });

    it('deletes when the caller owns the view', async () => {
      delegate.findFirst.mockResolvedValue({
        id: 'v-1',
        tenantId: 't1',
        userId: 'u1',
        scope: 's',
        name: 'n',
        filters: {},
        isDefault: false,
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await svc.remove({ tenantId: 't1', userId: 'u1', id: 'v-1' });

      expect(delegate.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
    });
  });

  describe('list', () => {
    it('returns user-owned + shared views in default-first then most-recent order', async () => {
      delegate.findMany.mockResolvedValue([]);
      await svc.list({ tenantId: 't1', userId: 'u1', scope: 'x' });
      expect(delegate.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 't1',
          scope: 'x',
          OR: [{ userId: 'u1' }, { isShared: true }],
        },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      });
    });
  });
});
