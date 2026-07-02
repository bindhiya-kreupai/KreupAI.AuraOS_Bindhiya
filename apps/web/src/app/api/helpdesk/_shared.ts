/**
 * Shared tenant-scoped CRUD builders for HR Helpdesk API routes. Each helpdesk
 * domain (service-requests, catalog, cases, chat, channels, automations,
 * improvements, canned-responses, escalation-matrices, alerts) has the same
 * list / create / get / update / soft-delete shape against a new Prisma model
 * accessed via (prisma as any).<delegate>. These builders remove the
 * boilerplate while keeping per-route permission checks and tenant scoping.
 */
import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

type Delegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
};

interface Options {
  /** camelCase Prisma delegate name, e.g. 'helpdeskServiceRequest'. */
  model: string;
  /** Permission prefix, e.g. 'helpdesk' → helpdesk:read / :create / etc. */
  permission: string;
  /** Human resource name for 404s, e.g. 'Service request'. */
  resource: string;
  /** Whether the model has isDeleted/deletedAt soft-delete columns. */
  softDelete?: boolean;
  /** Default orderBy. */
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** Required non-empty string fields on create. */
  required?: string[];
  /** Optional hook to derive extra create data (e.g. generated numbers). */
  onCreate?: (
    body: Record<string, any>,
    ctx: { tenantId: string; userId: string }
  ) => Record<string, any>;
}

function delegate(model: string): Delegate {
  return (prisma as any)[model] as Delegate;
}

function baseWhere(tenantId: string, softDelete?: boolean) {
  return softDelete ? { tenantId, isDeleted: false } : { tenantId };
}

export function listHandler(opts: Options) {
  return withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes(`${opts.permission}:read`))
        return forbidden(`${opts.permission}:read`);
      const sp = new URL(request.url).searchParams;
      const { page, limit, skip } = parsePagination(sp);
      const where: Record<string, unknown> = baseWhere(user.tenantId, opts.softDelete);
      const status = sp.get('status');
      const category = sp.get('category');
      if (status) where.status = status;
      if (category) where.category = category;
      const [rows, total] = await Promise.all([
        delegate(opts.model).findMany({
          where,
          orderBy: opts.orderBy ?? { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        delegate(opts.model).count({ where }),
      ]);
      return successList(rows, page, limit, total);
    } catch (error: any) {
      logger.error({ err: error, model: opts.model }, 'Failed to list');
      return serverError(error, `list ${opts.resource}`);
    }
  });
}

export function createHandler(opts: Options) {
  return withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes(`${opts.permission}:create`))
        return forbidden(`${opts.permission}:create`);
      const body = await safeJson(request);
      if (!body) return validationError({ message: 'Invalid JSON body' });
      for (const field of opts.required ?? []) {
        if (!String(body[field] ?? '').trim())
          return validationError({ message: `${field} is required`, field });
      }
      const { tenantId: _t, id: _i, ...rest } = body as Record<string, unknown>;
      const extra = opts.onCreate
        ? opts.onCreate(body, { tenantId: user.tenantId, userId: user.userId })
        : {};
      const created = await delegate(opts.model).create({
        data: { ...rest, ...extra, tenantId: user.tenantId, createdBy: user.userId },
      });
      return successItem(created, { status: 201 });
    } catch (error: any) {
      logger.error({ err: error, model: opts.model }, 'Failed to create');
      return serverError(error, `create ${opts.resource}`);
    }
  });
}

export function getHandler(opts: Options) {
  return withEnhancedAuth(async (_request: NextRequest, context: any) => {
    try {
      const { user, permissions, params } = context;
      if (!permissions.includes(`${opts.permission}:read`))
        return forbidden(`${opts.permission}:read`);
      const row = await delegate(opts.model).findFirst({
        where: { id: params.id, ...baseWhere(user.tenantId, opts.softDelete) },
      });
      if (!row) return notFound(opts.resource);
      return successItem(row);
    } catch (error: any) {
      logger.error({ err: error, model: opts.model }, 'Failed to get');
      return serverError(error, `get ${opts.resource}`);
    }
  });
}

export function updateHandler(opts: Options) {
  return withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions, params } = context;
      if (!permissions.includes(`${opts.permission}:update`))
        return forbidden(`${opts.permission}:update`);
      const body = await safeJson(request);
      if (!body) return validationError({ message: 'Invalid JSON body' });
      const existing = await delegate(opts.model).findFirst({
        where: { id: params.id, tenantId: user.tenantId },
      });
      if (!existing) return notFound(opts.resource);
      const {
        tenantId: _t,
        id: _i,
        createdBy: _cb,
        createdAt: _ca,
        ...data
      } = body as Record<string, unknown>;
      const updated = await delegate(opts.model).update({
        where: { id: params.id },
        data: { ...data, updatedBy: user.userId },
      });
      return successItem(updated);
    } catch (error: any) {
      logger.error({ err: error, model: opts.model }, 'Failed to update');
      return serverError(error, `update ${opts.resource}`);
    }
  });
}

export function deleteHandler(opts: Options) {
  return withEnhancedAuth(async (_request: NextRequest, context: any) => {
    try {
      const { user, permissions, params } = context;
      if (!permissions.includes(`${opts.permission}:delete`))
        return forbidden(`${opts.permission}:delete`);
      const existing = await delegate(opts.model).findFirst({
        where: { id: params.id, tenantId: user.tenantId },
      });
      if (!existing) return notFound(opts.resource);
      const data = opts.softDelete
        ? { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId }
        : { status: 'CANCELLED', updatedBy: user.userId };
      const updated = await delegate(opts.model).update({ where: { id: params.id }, data });
      return successItem(updated);
    } catch (error: any) {
      logger.error({ err: error, model: opts.model }, 'Failed to delete');
      return serverError(error, `delete ${opts.resource}`);
    }
  });
}

/** Generate a short human-friendly sequential-ish reference number. */
export function refNumber(prefix: string): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${Date.now().toString().slice(-6)}${rand}`;
}
