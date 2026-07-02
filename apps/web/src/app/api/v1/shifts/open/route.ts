import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/shifts/open
 * List open (unassigned) shift roster slots available for claiming.
 * Open shifts are ShiftRoster entries with status = 'OPEN'.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
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
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const shiftId = searchParams.get('shiftId') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);

    const where: any = {
      tenantId: user.tenantId,
      status: 'OPEN',
    };
    if (shiftId) where.shiftId = shiftId;
    if (startDate && endDate) {
      where.rosterDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.rosterDate = { gte: new Date(startDate) };
    } else if (endDate) {
      where.rosterDate = { lte: new Date(endDate) };
    }

    // Cast: the `shift` relation is not declared on ShiftRoster in schema.prisma
    const [data, total] = await Promise.all([
      (prisma as any).shiftRoster.findMany({
        where,
        include: { shift: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rosterDate: 'asc' },
      }),
      prisma.shiftRoster.count({ where }),
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
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: error.message } },
      { status: 500 }
    );
  }
});
