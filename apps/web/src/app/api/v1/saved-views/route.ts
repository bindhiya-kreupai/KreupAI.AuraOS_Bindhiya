/**
 * /api/v1/saved-views
 *
 * Per-user, tenant-scoped saved filter views for the shared FilterPanel
 * primitive.
 *
 *   GET  ?scope=payroll.runs:list  → list views for that scope
 *   POST { scope, name, filters, isDefault?, isShared? } → create
 *
 * Tenant scoping: tenantId + userId are derived from the authenticated
 * session. Any value in the payload is ignored.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { savedViewService } from '@/lib/services/saved-view/saved-view.service';
import { ValidationError } from '@/lib/errors';

const createSchema = z.object({
  scope: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  filters: z.record(z.unknown()).default({}),
  isDefault: z.boolean().optional(),
  isShared: z.boolean().optional(),
});

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    if (!scope) {
      return NextResponse.json(
        {
          success: false,
          error: 'scope query parameter is required.',
          errorAr: 'يلزم تحديد نطاق العرض.',
        },
        { status: 400 }
      );
    }

    const items = await savedViewService.list({
      tenantId: (auth as any).tenantId,
      userId: (auth as any).userId,
      scope,
    });
    return NextResponse.json({ success: true, data: items });
  },
  { requiredPermissions: ['saved-views:read'] } as any
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const raw = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payload.',
          errorAr: 'بيانات غير صالحة.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }
    try {
      const created = await savedViewService.create({
        tenantId: (auth as any).tenantId,
        userId: (auth as any).userId,
        ...parsed.data,
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (err) {
      if (err instanceof ValidationError) {
        return NextResponse.json(
          { success: false, error: err.message, errorAr: 'خطأ في التحقق.' },
          { status: 400 }
        );
      }
      throw err;
    }
  },
  { requiredPermissions: ['saved-views:write'] } as any
);
