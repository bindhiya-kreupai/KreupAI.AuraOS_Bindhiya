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

const VALID_PATTERN_TYPES = ['FIXED', 'ROTATING', 'COMPRESSED', 'SPLIT', 'FLEXIBLE', 'ON_CALL'];

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
    const departmentId = searchParams.get('departmentId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const where: any = {
      tenantId: user.tenantId,
      isDeleted: false,
    };
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const [patterns, total] = await Promise.all([
      (prisma as any).shiftPattern.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).shiftPattern.count({ where }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: patterns,
      meta: {
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
        message: 'Failed to list shift patterns',
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
    const { name, type, rotationDays, shifts } = body;

    if (!name || !type || !shifts || !Array.isArray(shifts) || shifts.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: name, type, and shifts (non-empty array) are required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_PATTERN_TYPES.includes(type)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid type. Must be one of: ${VALID_PATTERN_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const weeklyHours = shifts.reduce((sum: number, s: any) => sum + (s.hours || 0), 0);

    const newPattern = await (prisma as any).shiftPattern.create({
      data: {
        tenantId: user.tenantId,
        name,
        type,
        departmentId: body.departmentId || null,
        rotationDays: type === 'ROTATING' ? rotationDays : null,
        status: 'DRAFT',
        shifts,
        weeklyHours,
        employeesAssigned: 0,
        createdBy: user.userId || user.id,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: newPattern,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create shift pattern',
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
    const { id, name, type, rotationDays, shifts, status, departmentId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Pattern ID is required' } },
        { status: 400 }
      );
    }

    const existing = await (prisma as any).shiftPattern.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Pattern not found' } },
        { status: 404 }
      );
    }

    const updateData: any = { updatedBy: user.userId || user.id };
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) {
      if (!VALID_PATTERN_TYPES.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: `Invalid type. Must be one of: ${VALID_PATTERN_TYPES.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }
      updateData.type = type;
    }
    if (rotationDays !== undefined) updateData.rotationDays = rotationDays;
    if (shifts !== undefined && Array.isArray(shifts)) {
      updateData.shifts = shifts;
      updateData.weeklyHours = shifts.reduce((sum: number, s: any) => sum + (s.hours || 0), 0);
    }
    if (status !== undefined) updateData.status = status;
    if (departmentId !== undefined) updateData.departmentId = departmentId;

    const updated = await (prisma as any).shiftPattern.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update shift pattern' } },
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
        { success: false, error: { code: 'E2001', message: 'Pattern ID is required' } },
        { status: 400 }
      );
    }

    const existing = await (prisma as any).shiftPattern.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Pattern not found' } },
        { status: 404 }
      );
    }

    await (prisma as any).shiftPattern.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId || user.id },
    });

    return NextResponse.json({ success: true, data: { id, deleted: true } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to delete shift pattern' } },
      { status: 500 }
    );
  }
});
