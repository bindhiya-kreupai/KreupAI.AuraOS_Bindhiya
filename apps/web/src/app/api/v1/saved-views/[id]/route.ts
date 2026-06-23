/**
 * /api/v1/saved-views/[id]
 *
 *   PATCH  → rename, retune filters, promote/demote default, share/unshare
 *   DELETE → remove (owner only)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { savedViewService } from '@/lib/services/saved-view/saved-view.service';
import { ValidationError } from '@/lib/errors';

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  filters: z.record(z.unknown()).optional(),
  isDefault: z.boolean().optional(),
  isShared: z.boolean().optional(),
});

function extractId(request: NextRequest): string | null {
  const parts = new URL(request.url).pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  return last && last !== '[id]' ? decodeURIComponent(last) : null;
}

export const PATCH = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const id = extractId(request);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing saved-view id.' },
        { status: 400 }
      );
    }
    const raw = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(raw);
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
      const updated = await savedViewService.update({
        tenantId: (auth as any).tenantId,
        userId: (auth as any).userId,
        id,
        input: parsed.data,
      });
      return NextResponse.json({ success: true, data: updated });
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

export const DELETE = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const id = extractId(request);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing saved-view id.' },
        { status: 400 }
      );
    }
    try {
      await savedViewService.remove({
        tenantId: (auth as any).tenantId,
        userId: (auth as any).userId,
        id,
      });
      return NextResponse.json({ success: true, data: { id } });
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
