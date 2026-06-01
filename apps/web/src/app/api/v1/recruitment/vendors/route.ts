import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

function generateVendorCode() {
  return `VEN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      prisma.recruitmentVendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
      }),
      prisma.recruitmentVendor.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Recruitment Vendors API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch recruitment vendors' } },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'name and category are required' } },
        { status: 400 }
      );
    }

    const vendor = await prisma.recruitmentVendor.create({
      data: {
        tenantId: user.tenantId,
        vendorCode: body.vendorCode || generateVendorCode(),
        name: body.name,
        category: body.category,
        status: body.status || 'under_review',
        contactPersonName: body.contactPersonName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        location: body.location || null,
        rating: body.rating ?? null,
        activePlacements: body.activePlacements || 0,
        totalPlacements: body.totalPlacements || 0,
        totalHires: body.totalHires || 0,
        averageTimeToFillDays: body.averageTimeToFillDays ?? null,
        monthlySpend: body.monthlySpend || 0,
        currency: body.currency || 'USD',
        complianceStatus: body.complianceStatus || 'not_reviewed',
        contractStartDate: body.contractStartDate ? new Date(body.contractStartDate) : null,
        contractEndDate: body.contractEndDate ? new Date(body.contractEndDate) : null,
        specialties: body.specialties || [],
        notes: body.notes || null,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: vendor,
        message: 'Recruitment vendor created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Recruitment Vendors API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to create recruitment vendor' } },
      { status: 500 }
    );
  }
});
