/**
 * Generic tenant-scoped CRUD route factory for Compliance / Labor-Relations
 * entities. Each entity's route.ts wires a delegate + Zod schema and gets a
 * consistent list/create/get/update/delete surface with bilingual errors and
 * the shared list response shape.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse, parsePaging, listShape, genCode, model } from './route-helpers';

export interface CrudConfig {
  /** camelCase Prisma delegate name, e.g. 'poshComplaint'. */
  delegate: string;
  /** Code prefix used when generating a <field> code, e.g. 'POSH'. */
  codePrefix?: string;
  /** Field name that stores the generated code (e.g. 'complaintCode'). */
  codeField?: string;
  /** Zod schema for create payload. */
  createSchema: z.ZodTypeAny;
  /** Zod schema for update payload. */
  updateSchema?: z.ZodTypeAny;
  /** Map validated body → prisma data (dates parsed etc.). */
  toCreateData?: (body: any) => Record<string, any>;
  toUpdateData?: (body: any) => Record<string, any>;
  /** Extra where filters derived from query params. */
  filters?: (searchParams: URLSearchParams) => Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

function parseDates(obj: Record<string, any>, dateKeys: string[]) {
  const out = { ...obj };
  for (const k of dateKeys) {
    if (out[k] !== undefined && out[k] !== null && out[k] !== '') out[k] = new Date(out[k]);
    else if (out[k] === '' || out[k] === null) out[k] = null;
  }
  return out;
}

export { parseDates };

export function makeListRoutes(cfg: CrudConfig) {
  const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
    const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
    if (permErr) return permErr;
    try {
      const { page, pageSize, skip } = parsePaging(request.url);
      const sp = new URL(request.url).searchParams;
      const where = { tenantId: user.tenantId, ...(cfg.filters ? cfg.filters(sp) : {}) };
      const [items, total] = await Promise.all([
        model(cfg.delegate).findMany({
          where,
          orderBy: cfg.orderBy || { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        model(cfg.delegate).count({ where }),
      ]);
      return NextResponse.json({ success: true, data: listShape(items, total, page, pageSize) });
    } catch {
      return errorResponse(ERR.server);
    }
  });

  const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
    const permErr = requirePermission(Resource.COMPLIANCE, Action.CREATE, permissions);
    if (permErr) return permErr;
    try {
      const raw = await request.json();
      const body = cfg.createSchema.parse(raw);
      const data: Record<string, any> = {
        tenantId: user.tenantId,
        createdBy: user.userId,
        ...(cfg.toCreateData ? cfg.toCreateData(body) : body),
      };
      if (cfg.codeField && !data[cfg.codeField]) {
        data[cfg.codeField] = genCode(cfg.codePrefix || 'REC');
      }
      const created = await model(cfg.delegate).create({ data });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
      return errorResponse(ERR.server);
    }
  });

  return { GET, POST };
}

export function makeItemRoutes(cfg: CrudConfig) {
  const GET = withEnhancedAuth(
    async (request: NextRequest, ctx: { user: any; permissions: any; params?: any }) => {
      const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, ctx.permissions);
      if (permErr) return permErr;
      try {
        const id = ctx.params?.id;
        const item = await model(cfg.delegate).findFirst({
          where: { id, tenantId: ctx.user.tenantId },
        });
        if (!item) return errorResponse(ERR.notFound, 404);
        return NextResponse.json({ success: true, data: item });
      } catch {
        return errorResponse(ERR.server);
      }
    }
  );

  const PUT = withEnhancedAuth(
    async (request: NextRequest, ctx: { user: any; permissions: any; params?: any }) => {
      const permErr = requirePermission(Resource.COMPLIANCE, Action.UPDATE, ctx.permissions);
      if (permErr) return permErr;
      try {
        const id = ctx.params?.id;
        const existing = await model(cfg.delegate).findFirst({
          where: { id, tenantId: ctx.user.tenantId },
        });
        if (!existing) return errorResponse(ERR.notFound, 404);
        const schema = cfg.updateSchema || cfg.createSchema;
        const body = schema.parse(await request.json());
        const data = cfg.toUpdateData
          ? cfg.toUpdateData(body)
          : cfg.toCreateData
            ? cfg.toCreateData(body)
            : body;
        const updated = await model(cfg.delegate).update({
          where: { id },
          data,
        });
        return NextResponse.json({ success: true, data: updated });
      } catch (error: any) {
        if (error instanceof z.ZodError) return errorResponse(ERR.badRequest, 400);
        return errorResponse(ERR.server);
      }
    }
  );

  const DELETE = withEnhancedAuth(
    async (request: NextRequest, ctx: { user: any; permissions: any; params?: any }) => {
      const permErr = requirePermission(Resource.COMPLIANCE, Action.DELETE, ctx.permissions);
      if (permErr) return permErr;
      try {
        const id = ctx.params?.id;
        const existing = await model(cfg.delegate).findFirst({
          where: { id, tenantId: ctx.user.tenantId },
        });
        if (!existing) return errorResponse(ERR.notFound, 404);
        await model(cfg.delegate).delete({ where: { id } });
        return NextResponse.json({ success: true });
      } catch {
        return errorResponse(ERR.server);
      }
    }
  );

  return { GET, PUT, DELETE };
}
