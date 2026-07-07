import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  relocationPackageService,
  RELOCATION_TIER_POLICIES,
  RELOCATION_TIERS,
  RELOCATION_STATUSES,
  type RelocationTier,
  type RelocationStatus,
} from '@/lib/services/relocation-package.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobility/relocation-packages
 * Lists relocation packages for the tenant. Also returns the static tier policy
 * catalogue so the UI can render "View Policy Details" from a single call.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const url = new URL(request.url);
    const tier = url.searchParams.get('tier') as RelocationTier | null;
    const status = url.searchParams.get('status') as RelocationStatus | null;

    const result = await relocationPackageService.list({
      tenantId: user.tenantId,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      tier: tier ?? undefined,
      status: status ?? undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });

    return NextResponse.json({ success: true, ...result, tierPolicies: RELOCATION_TIER_POLICIES });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to list relocation packages',
        message: 'Failed to list relocation packages',
        messageAr: 'فشل في جلب حزم الانتقال',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/mobility/relocation-packages
 * Creates a relocation package for an employee.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const required = ['employeeId', 'employeeName', 'originLocation', 'destination'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `${field} is required`,
            message: `${field} is required`,
            messageAr: 'حقول إلزامية مفقودة',
          },
          { status: 400 }
        );
      }
    }

    const tier: RelocationTier = RELOCATION_TIERS.includes(body.tier) ? body.tier : 'standard';
    const status: RelocationStatus | undefined = RELOCATION_STATUSES.includes(body.status)
      ? body.status
      : undefined;

    const created = await relocationPackageService.create({
      tenantId: user.tenantId,
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      tier,
      originLocation: body.originLocation,
      destination: body.destination,
      budgetAmount: body.budgetAmount != null ? Number(body.budgetAmount) : undefined,
      currency: body.currency,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      status,
      notes: body.notes,
      actorId: user.userId,
    });

    return NextResponse.json(
      { success: true, data: created, message: 'Relocation package created' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create relocation package',
        message: 'Failed to create relocation package',
        messageAr: 'فشل في إنشاء حزمة الانتقال',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
