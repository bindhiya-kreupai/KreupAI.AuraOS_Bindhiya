import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  relocationPackageService,
  RELOCATION_STATUSES,
  RELOCATION_TIERS,
  type RelocationStatus,
  type RelocationTier,
} from '@/lib/services/relocation-package.service';

export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json(
    {
      error: 'Relocation package not found',
      message: 'Relocation package not found',
      messageAr: 'حزمة الانتقال غير موجودة',
    },
    { status: 404 }
  );

function getId(request: NextRequest): string {
  const segments = new URL(request.url).pathname.split('/');
  return segments[segments.length - 1];
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const pkg = await relocationPackageService.getById(getId(request), user.tenantId);
    if (!pkg) return notFound();
    return NextResponse.json({ success: true, data: pkg });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load relocation package',
        message: 'Failed to load relocation package',
        messageAr: 'فشل في تحميل حزمة الانتقال',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

export const PATCH = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const id = getId(request);
    const body = await request.json();

    // Terminal completion transition.
    if (body.action === 'complete') {
      const completed = await relocationPackageService.complete(
        id,
        user.tenantId,
        user.userId,
        body.satisfaction != null ? Number(body.satisfaction) : undefined
      );
      if (!completed) return notFound();
      return NextResponse.json({ success: true, data: completed, message: 'Relocation completed' });
    }

    const tier: RelocationTier | undefined =
      body.tier && RELOCATION_TIERS.includes(body.tier) ? body.tier : undefined;
    const status: RelocationStatus | undefined =
      body.status && RELOCATION_STATUSES.includes(body.status) ? body.status : undefined;

    const updated = await relocationPackageService.update(id, user.tenantId, user.userId, {
      tier,
      status,
      originLocation: body.originLocation,
      destination: body.destination,
      budgetAmount: body.budgetAmount != null ? Number(body.budgetAmount) : undefined,
      spentAmount: body.spentAmount != null ? Number(body.spentAmount) : undefined,
      currency: body.currency,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      notes: body.notes,
    });
    if (!updated) return notFound();
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Relocation package updated',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update relocation package',
        message: 'Failed to update relocation package',
        messageAr: 'فشل في تحديث حزمة الانتقال',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const deleted = await relocationPackageService.softDelete(
      getId(request),
      user.tenantId,
      user.userId
    );
    if (!deleted) return notFound();
    return NextResponse.json({ success: true, message: 'Relocation package deleted' });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to delete relocation package',
        message: 'Failed to delete relocation package',
        messageAr: 'فشل في حذف حزمة الانتقال',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
