import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/cases/[id]
 * Get a specific ER case
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/cases:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/cases:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    const erCase = await prisma.eRCase.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!erCase) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'ER case not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: erCase,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[HR Case Detail API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch ER case' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/hr/cases/[id]
 * Update an ER case
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/cases:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/cases:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json();

    const erCase = await prisma.eRCase.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!erCase) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'ER case not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.eRCase.update({
      where: { id },
      data: {
        status: body.status,
        priority: body.priority,
        assignedTo: body.assignedTo,
        description: body.description,
        resolution: body.resolution,
        resolvedAt: body.status === 'CLOSED' ? new Date() : undefined,
        resolvedBy: body.status === 'CLOSED' ? user.id : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[HR Case Detail API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update ER case' } },
      { status: 500 }
    );
  }
});
