import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; messageAr?: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_DIFFERENTIAL_TYPES = ['FLAT_AMOUNT', 'PERCENTAGE', 'MULTIPLIER'];

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('shifts:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const jurisdiction = searchParams.get('jurisdiction') || 'DEFAULT';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const where: any = {
      tenantId: user.tenantId,
      isDeleted: false,
      isActive: true,
      jurisdiction: jurisdiction.toUpperCase(),
    };

    const [rates, total] = await Promise.all([
      (prisma as any).shiftDifferential.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).shiftDifferential.count({ where }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: rates,
      meta: {
        jurisdiction: jurisdiction.toUpperCase(),
        totalRates: rates.length,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to get shift differential rates',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('shifts:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const {
      name,
      shiftType,
      differentialType,
      timeRange,
      amount,
      percentAmount,
      multiplier,
      applicableDays,
      eligibleRoles,
      jurisdiction,
      regulatoryBasis,
      effectiveFrom,
      effectiveTo,
    } = body;

    if (!name || !shiftType) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Validation failed: name and shiftType are required' },
        },
        { status: 400 }
      );
    }

    if (differentialType && !VALID_DIFFERENTIAL_TYPES.includes(differentialType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `Invalid differentialType. Must be one of: ${VALID_DIFFERENTIAL_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const newRate = await (prisma as any).shiftDifferential.create({
      data: {
        tenantId: user.tenantId,
        name,
        shiftType,
        differentialType: differentialType || 'FLAT_AMOUNT',
        timeRange: timeRange || null,
        amount: amount || null,
        percentAmount: percentAmount || null,
        multiplier: multiplier || null,
        applicableDays: applicableDays || null,
        eligibleRoles: eligibleRoles || null,
        jurisdiction: (jurisdiction || 'DEFAULT').toUpperCase(),
        regulatoryBasis: regulatoryBasis || null,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : null,
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        createdBy: user.userId || user.id,
      },
    });

    return NextResponse.json({ success: true, data: newRate }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to create differential rate' } },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('shifts:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Differential ID is required' } },
        { status: 400 }
      );
    }

    const existing = await (prisma as any).shiftDifferential.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Differential rate not found' } },
        { status: 404 }
      );
    }

    const updateData: any = { updatedBy: user.userId || user.id };
    const allowedFields = [
      'name',
      'shiftType',
      'differentialType',
      'timeRange',
      'amount',
      'percentAmount',
      'multiplier',
      'applicableDays',
      'eligibleRoles',
      'jurisdiction',
      'regulatoryBasis',
      'isActive',
      'effectiveFrom',
      'effectiveTo',
    ];
    for (const key of allowedFields) {
      if (updateFields[key] !== undefined) {
        if (key === 'effectiveFrom' || key === 'effectiveTo') {
          updateData[key] = updateFields[key] ? new Date(updateFields[key]) : null;
        } else if (key === 'jurisdiction') {
          updateData[key] = updateFields[key].toUpperCase();
        } else {
          updateData[key] = updateFields[key];
        }
      }
    }

    const updated = await (prisma as any).shiftDifferential.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update differential rate' } },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('shifts:delete')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:delete permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Differential ID is required' } },
        { status: 400 }
      );
    }

    const existing = await (prisma as any).shiftDifferential.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Differential rate not found' } },
        { status: 404 }
      );
    }

    await (prisma as any).shiftDifferential.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId || user.id },
    });

    return NextResponse.json({ success: true, data: { id, deleted: true } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to delete differential rate' } },
      { status: 500 }
    );
  }
});
