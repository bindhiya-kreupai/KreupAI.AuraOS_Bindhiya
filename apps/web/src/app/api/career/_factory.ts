/**
 * Route factory for the career-planning collection/item endpoints.
 *
 * Each entity kind gets a collection route (GET list, POST create) and an item
 * route (GET one, PUT update, DELETE remove) built from these helpers so the
 * behaviour — tenant scoping, bilingual errors, raw payload shape — stays
 * uniform across all /api/career/* resources.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ValidationError } from '@/lib/errors';
import { careerService, type CareerKind } from '@/lib/services/career/career.service';
import { buildCareerContext, careerError, serverError } from './_shared';

function queryToFilters(request: NextRequest): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    filters[key] = value;
  });
  return filters;
}

/** GET (list) + POST (create) for a collection. */
export function makeCollectionRoute(kind: CareerKind) {
  const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const ctx = buildCareerContext(context);
      const items = await careerService.list(kind, ctx, queryToFilters(request));
      return NextResponse.json(items);
    } catch (error) {
      return serverError(`GET ${kind}`, error);
    }
  });

  const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const ctx = buildCareerContext(context);
      const body = await request.json().catch(() => ({}));
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return careerError('A JSON object body is required.', 'يلزم إرسال كائن JSON.', 400);
      }
      const created = await careerService.create(kind, ctx, body);
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      if (error instanceof ValidationError) {
        return careerError(error.message, 'فشل التحقق من صحة البيانات.', 400);
      }
      return serverError(`POST ${kind}`, error);
    }
  });

  return { GET, POST };
}

function paramId(context: any): string | undefined {
  return context?.params?.id;
}

/** GET (one) + PUT (update) + DELETE (remove) for an item. */
export function makeItemRoute(kind: CareerKind) {
  const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
    try {
      const ctx = buildCareerContext(context);
      const id = paramId(context);
      if (!id) return careerError('Missing id parameter.', 'معرّف مفقود.', 400);
      const item = await careerService.get(kind, ctx, id);
      if (!item) return careerError('Resource not found.', 'المورد غير موجود.', 404);
      return NextResponse.json(item);
    } catch (error) {
      return serverError(`GET ${kind} item`, error);
    }
  });

  const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const ctx = buildCareerContext(context);
      const id = paramId(context);
      if (!id) return careerError('Missing id parameter.', 'معرّف مفقود.', 400);
      const body = await request.json().catch(() => ({}));
      const updated = await careerService.update(kind, ctx, id, body ?? {});
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof ValidationError) {
        return careerError(error.message, 'المورد غير موجود.', 404);
      }
      return serverError(`PUT ${kind} item`, error);
    }
  });

  const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
    try {
      const ctx = buildCareerContext(context);
      const id = paramId(context);
      if (!id) return careerError('Missing id parameter.', 'معرّف مفقود.', 400);
      await careerService.remove(kind, ctx, id);
      return NextResponse.json({ success: true });
    } catch (error) {
      return serverError(`DELETE ${kind} item`, error);
    }
  });

  return { GET, PUT, DELETE };
}
