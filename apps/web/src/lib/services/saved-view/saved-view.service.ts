/**
 * SavedViewService
 *
 * CRUD for per-user, per-scope saved filter views. Backs the shared
 * FilterPanel / DataPage primitives so users can name and reuse a
 * combination of filter + sort + search + column-visibility state.
 *
 * Scope keys are caller-defined and identify the list page (e.g.
 * "payroll.runs:list", "hr-policies:list"). One view per
 * (tenant, user, scope) may be flagged as the default; promoting a
 * view to default automatically clears the flag on any other default
 * for the same scope.
 */

import type { Prisma } from '@prisma/client';
import { BaseService } from '@/lib/services/base.service';
import { ValidationError } from '@/lib/errors';

export interface SavedViewRecord {
  id: string;
  tenantId: string;
  userId: string;
  scope: string;
  name: string;
  filters: Record<string, unknown>;
  isDefault: boolean;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSavedViewInput {
  tenantId: string;
  userId: string;
  scope: string;
  name: string;
  filters: Record<string, unknown>;
  isDefault?: boolean;
  isShared?: boolean;
}

export interface UpdateSavedViewInput {
  name?: string;
  filters?: Record<string, unknown>;
  isDefault?: boolean;
  isShared?: boolean;
}

export class SavedViewService extends BaseService {
  constructor() {
    super('SavedViewService');
  }

  /** Typed Prisma delegate for the tenant_saved_view table. */
  private get delegate() {
    return this.prisma.tenantSavedView;
  }

  /**
   * List views available to a user for a given scope. Returns:
   *  - all of the user's own views for the scope
   *  - shared views from other users in the same tenant
   * Ordered: default first, then most-recently-updated.
   */
  async list(params: {
    tenantId: string;
    userId: string;
    scope: string;
  }): Promise<SavedViewRecord[]> {
    const { tenantId, userId, scope } = params;
    const rows = await this.delegate.findMany({
      where: {
        tenantId,
        scope,
        OR: [{ userId }, { isShared: true }],
      },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
    return rows as SavedViewRecord[];
  }

  /** Fetch a single view, verifying the tenant scope. */
  async get(params: { tenantId: string; id: string }): Promise<SavedViewRecord | null> {
    const row = await this.delegate.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
    });
    return (row as SavedViewRecord) ?? null;
  }

  /**
   * Create a new view. If `isDefault` is true, any existing default for
   * the same (tenant, user, scope) is demoted in the same transaction.
   */
  async create(input: CreateSavedViewInput): Promise<SavedViewRecord> {
    this.validate(input);
    const { tenantId, userId, scope, name, filters, isDefault = false, isShared = false } = input;

    const created = await this.executeTransaction(async (tx) => {
      const delegate = tx.tenantSavedView;
      if (isDefault) {
        await delegate.updateMany({
          where: { tenantId, userId, scope, isDefault: true },
          data: { isDefault: false },
        });
      }
      return delegate.create({
        data: {
          tenantId,
          userId,
          scope,
          name: name.trim(),
          filters: filters as Prisma.InputJsonValue,
          isDefault,
          isShared,
        },
      });
    });

    await this.createAuditLog({
      tenantId,
      userId,
      action: 'SAVED_VIEW_CREATED',
      module: 'saved-view',
      resourceId: created.id,
      details: `Created saved view "${name}" for scope ${scope}`,
      afterValues: { scope, isDefault, isShared },
    });

    return created as SavedViewRecord;
  }

  /**
   * Update an existing view (rename, retune filters, promote-to-default,
   * share/unshare). Only the owning user (or someone with the
   * appropriate permission upstream) can call this.
   */
  async update(params: {
    tenantId: string;
    userId: string;
    id: string;
    input: UpdateSavedViewInput;
  }): Promise<SavedViewRecord> {
    const { tenantId, userId, id, input } = params;
    const existing = await this.get({ tenantId, id });
    if (!existing) throw new ValidationError(`Saved view ${id} not found.`);
    if (existing.userId !== userId) {
      throw new ValidationError('You may only edit your own saved views.');
    }

    const updated = await this.executeTransaction(async (tx) => {
      const delegate = tx.tenantSavedView;
      if (input.isDefault === true) {
        await delegate.updateMany({
          where: { tenantId, userId, scope: existing.scope, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return delegate.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          filters: input.filters as Prisma.InputJsonValue | undefined,
          isDefault: input.isDefault,
          isShared: input.isShared,
        },
      });
    });

    await this.createAuditLog({
      tenantId,
      userId,
      action: 'SAVED_VIEW_UPDATED',
      module: 'saved-view',
      resourceId: id,
      details: `Updated saved view "${updated.name}"`,
      beforeValues: {
        name: existing.name,
        isDefault: existing.isDefault,
        isShared: existing.isShared,
      },
      afterValues: { name: updated.name, isDefault: updated.isDefault, isShared: updated.isShared },
    });

    return updated as SavedViewRecord;
  }

  /** Delete a view the user owns. */
  async remove(params: { tenantId: string; userId: string; id: string }): Promise<void> {
    const existing = await this.get({ tenantId: params.tenantId, id: params.id });
    if (!existing) return;
    if (existing.userId !== params.userId) {
      throw new ValidationError('You may only delete your own saved views.');
    }
    await this.delegate.delete({ where: { id: params.id } });
    await this.createAuditLog({
      tenantId: params.tenantId,
      userId: params.userId,
      action: 'SAVED_VIEW_DELETED',
      module: 'saved-view',
      resourceId: params.id,
      details: `Deleted saved view "${existing.name}"`,
      beforeValues: { name: existing.name, scope: existing.scope },
    });
  }

  private validate(input: CreateSavedViewInput) {
    if (!input.tenantId) throw new ValidationError('tenantId is required.');
    if (!input.userId) throw new ValidationError('userId is required.');
    if (!input.scope || input.scope.length > 120) {
      throw new ValidationError('scope is required and must be ≤ 120 characters.');
    }
    if (!input.name || input.name.trim().length === 0 || input.name.length > 120) {
      throw new ValidationError('name is required and must be ≤ 120 characters.');
    }
    if (typeof input.filters !== 'object' || input.filters === null) {
      throw new ValidationError('filters must be a JSON object.');
    }
  }
}

export const savedViewService = new SavedViewService();
