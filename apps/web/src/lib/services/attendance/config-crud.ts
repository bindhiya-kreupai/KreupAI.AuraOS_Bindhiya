import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * Generic CRUD factory for attendance configuration models.
 *
 * Every attendance config model (#35) shares the same shape: tenant-scoped,
 * versioned, soft-deletable, JSON-config payload, name-unique-per-tenant.
 * This factory removes ~150 lines of boilerplate per route.
 *
 * Usage in a route handler:
 *   import { makeAttendanceConfigRoutes } from '@/lib/services/attendance/config-crud';
 *   import { z } from 'zod';
 *
 *   const TimeRoundingConfigSchema = z.object({
 *     checkInRounding: z.enum(['NONE','NEAREST','UP','DOWN']),
 *     roundingInterval: z.number().int().positive(),
 *     // ... domain-specific config fields ...
 *   });
 *
 *   const TimeRoundingSchema = z.object({
 *     name: z.string().min(1),
 *     description: z.string().optional(),
 *     applicableTo: z.enum(['ALL','DEPARTMENT','DESIGNATION','CUSTOM']),
 *     config: TimeRoundingConfigSchema,
 *     isActive: z.boolean().default(true),
 *   });
 *
 *   const handlers = makeAttendanceConfigRoutes({
 *     model: 'timeRoundingRule',           // Prisma model name (camelCase)
 *     createSchema: TimeRoundingSchema,
 *     resourceLabel: 'Time Rounding Rule',
 *   });
 *
 *   export const GET    = handlers.GET;
 *   export const POST   = handlers.POST;
 *   export const PUT    = handlers.PUT;
 *   export const DELETE = handlers.DELETE;
 */

export interface AttendanceConfigFactoryOptions<TCreateSchema extends z.ZodTypeAny> {
  /** Prisma model accessor name, e.g. 'timeRoundingRule' (lowercased first letter) */
  model: string;
  /** Zod schema for POST body (sans tenant/audit columns) */
  createSchema: TCreateSchema;
  /** Human-readable label for audit log + error messages */
  resourceLabel: string;
}

const sharedListQuerySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  companyId: z.string().optional(),
});

const updateBodySchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  patch: z.record(z.unknown()),
});

export function makeAttendanceConfigRoutes<TCreateSchema extends z.ZodTypeAny>(
  opts: AttendanceConfigFactoryOptions<TCreateSchema>
) {
  const { model, createSchema, resourceLabel } = opts;
  const prismaModel = (prisma as unknown as Record<string, unknown>)[model] as {
    findMany: (args: unknown) => Promise<unknown[]>;
    create: (args: { data: unknown }) => Promise<unknown>;
    update: (args: { where: unknown; data: unknown }) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<unknown>;
  };

  if (!prismaModel) {
    throw new Error(
      `makeAttendanceConfigRoutes: Prisma model '${model}' not found on the client. ` +
        `Run \`pnpm --filter @aura/database exec prisma generate\` after schema changes.`
    );
  }

  // ---------------------------------------------------------------------------
  // GET — list active configs for the tenant (optionally filter by company)
  // ---------------------------------------------------------------------------
  const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
    const permError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const parsed = sharedListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      isDeleted: false,
    };
    if (parsed.data.isActive !== undefined) {
      where.isActive = parsed.data.isActive === 'true';
    }
    if (parsed.data.companyId) {
      where.companyId = parsed.data.companyId;
    }

    try {
      const data = await prismaModel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        success: true,
        data,
        meta: { total: data.length, resourceLabel, requestId: crypto.randomUUID() },
      });
    } catch (err) {
      logger.error({ err, model }, `${resourceLabel}: failed to list`);
      return NextResponse.json(
        { success: false, error: `Failed to fetch ${resourceLabel}` },
        { status: 500 }
      );
    }
  });

  // ---------------------------------------------------------------------------
  // POST — create a new config
  // ---------------------------------------------------------------------------
  const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
    const permError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
    if (permError) return permError;

    const body = await request.json();
    const parsed = (createSchema as z.ZodTypeAny).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    try {
      const created = await prismaModel.create({
        data: {
          ...parsed.data,
          tenantId: user.tenantId,
          version: 1,
          createdBy: user.userId,
          updatedBy: user.userId,
        },
      });
      logger.info({ model, id: (created as { id?: string }).id }, `${resourceLabel}: created`);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (err) {
      // Handle Prisma unique-constraint violation (P2002) on (tenantId, name)
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: `A ${resourceLabel} with this name already exists`,
            messageAr: 'يوجد بالفعل سجل بهذا الاسم',
          },
          { status: 409 }
        );
      }
      logger.error({ err, model }, `${resourceLabel}: failed to create`);
      return NextResponse.json(
        { success: false, error: `Failed to create ${resourceLabel}` },
        { status: 500 }
      );
    }
  });

  // ---------------------------------------------------------------------------
  // PUT — update with optimistic-lock check on `version`
  // ---------------------------------------------------------------------------
  const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
    const permError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
    if (permError) return permError;

    const body = await request.json();
    const parsed = updateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update body. Expect { id, version, patch }.',
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const { id, version, patch } = parsed.data;

    try {
      // First fetch with tenant scope + version check to prevent cross-tenant
      // updates AND lost-update races
      const current = await prismaModel.findFirst({
        where: { id, tenantId: user.tenantId, isDeleted: false },
      });
      if (!current) {
        return NextResponse.json(
          { success: false, error: `${resourceLabel} not found` },
          { status: 404 }
        );
      }
      if ((current as { version: number }).version !== version) {
        return NextResponse.json(
          {
            success: false,
            error: `${resourceLabel} was modified by another user. Reload and retry.`,
            details: {
              expectedVersion: version,
              actualVersion: (current as { version: number }).version,
            },
          },
          { status: 409 }
        );
      }

      const updated = await prismaModel.update({
        where: { id },
        data: {
          ...patch,
          version: { increment: 1 },
          updatedBy: user.userId,
        },
      });
      logger.info({ model, id }, `${resourceLabel}: updated`);
      return NextResponse.json({ success: true, data: updated });
    } catch (err) {
      logger.error({ err, model, id }, `${resourceLabel}: failed to update`);
      return NextResponse.json(
        { success: false, error: `Failed to update ${resourceLabel}` },
        { status: 500 }
      );
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE — soft delete (set isDeleted=true, deletedAt=now)
  // ---------------------------------------------------------------------------
  const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
    const permError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    try {
      const current = await prismaModel.findFirst({
        where: { id, tenantId: user.tenantId, isDeleted: false },
      });
      if (!current) {
        return NextResponse.json(
          { success: false, error: `${resourceLabel} not found` },
          { status: 404 }
        );
      }
      await prismaModel.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
      });
      logger.info({ model, id }, `${resourceLabel}: soft-deleted`);
      return NextResponse.json({ success: true });
    } catch (err) {
      logger.error({ err, model, id }, `${resourceLabel}: failed to delete`);
      return NextResponse.json(
        { success: false, error: `Failed to delete ${resourceLabel}` },
        { status: 500 }
      );
    }
  });

  return { GET, POST, PUT, DELETE };
}
