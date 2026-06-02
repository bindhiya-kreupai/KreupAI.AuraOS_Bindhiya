import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const vendorId = params?.id;

    const existing = await prisma.recruitmentVendor.findFirst({
      where: { id: vendorId, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E4004', message: 'Recruitment vendor not found' } },
        { status: 404 }
      );
    }

    const vendor = await prisma.recruitmentVendor.update({
      where: { id: vendorId },
      data: {
        name: body.name,
        category: body.category,
        status: body.status,
        contactPersonName: body.contactPersonName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        location: body.location,
        rating: body.rating,
        activePlacements: body.activePlacements,
        totalPlacements: body.totalPlacements,
        totalHires: body.totalHires,
        averageTimeToFillDays: body.averageTimeToFillDays,
        monthlySpend: body.monthlySpend,
        currency: body.currency,
        complianceStatus: body.complianceStatus,
        contractStartDate: body.contractStartDate ? new Date(body.contractStartDate) : undefined,
        contractEndDate: body.contractEndDate ? new Date(body.contractEndDate) : undefined,
        specialties: body.specialties,
        notes: body.notes,
        updatedBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: vendor,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Recruitment Vendors API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update recruitment vendor' } },
      { status: 500 }
    );
  }
});
