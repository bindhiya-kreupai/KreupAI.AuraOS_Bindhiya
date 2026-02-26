import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/exits/[id]/clearance
 * Get clearance checklist for an exit request
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;

    const exitRequest = await prisma.exitRequest.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        clearanceItems: {
          orderBy: { sortOrder: 'asc' },
          include: {
            approvedByUser: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    // If no clearance items exist, return default checklist
    if (!exitRequest.clearanceItems || exitRequest.clearanceItems.length === 0) {
      const defaultChecklist = [
        {
          department: 'IT',
          item: 'Return laptop and accessories',
          status: 'PENDING',
          sortOrder: 1,
        },
        { department: 'IT', item: 'Revoke system access', status: 'PENDING', sortOrder: 2 },
        { department: 'IT', item: 'Return access cards/badges', status: 'PENDING', sortOrder: 3 },
        { department: 'HR', item: 'Final settlement calculation', status: 'PENDING', sortOrder: 4 },
        { department: 'HR', item: 'Exit interview conducted', status: 'PENDING', sortOrder: 5 },
        {
          department: 'Finance',
          item: 'Pending expense claims settled',
          status: 'PENDING',
          sortOrder: 6,
        },
        {
          department: 'Finance',
          item: 'Company credit card returned',
          status: 'PENDING',
          sortOrder: 7,
        },
        {
          department: 'Manager',
          item: 'Knowledge transfer completed',
          status: 'PENDING',
          sortOrder: 8,
        },
        {
          department: 'Library',
          item: 'Return company property/books',
          status: 'PENDING',
          sortOrder: 9,
        },
        {
          department: 'Security',
          item: 'Building access deactivated',
          status: 'PENDING',
          sortOrder: 10,
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          exitRequest: {
            id: exitRequest.id,
            employeeId: exitRequest.employeeId,
            employee: exitRequest.employee,
            status: exitRequest.status,
          },
          clearanceItems: defaultChecklist,
          isDefault: true,
          completedCount: 0,
          totalCount: defaultChecklist.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    const completedCount = exitRequest.clearanceItems.filter(
      (item) => item.status === 'COMPLETED'
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        exitRequest: {
          id: exitRequest.id,
          employeeId: exitRequest.employeeId,
          employee: exitRequest.employee,
          status: exitRequest.status,
        },
        clearanceItems: exitRequest.clearanceItems,
        completedCount,
        totalCount: exitRequest.clearanceItems.length,
        isFullyCleared: completedCount === exitRequest.clearanceItems.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Exit Clearance API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch clearance checklist' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/hr/exits/[id]/clearance
 * Update clearance checklist items
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;
    const body = await request.json();

    const exitRequest = await prisma.exitRequest.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'items array is required' } },
        { status: 400 }
      );
    }

    // Update each clearance item
    const updates = await Promise.all(
      body.items.map((item: any) =>
        item.id
          ? prisma.exitClearanceItem.update({
              where: { id: item.id },
              data: {
                status: item.status,
                remarks: item.remarks || null,
                completedAt: item.status === 'COMPLETED' ? new Date() : null,
                completedBy: item.status === 'COMPLETED' ? user.id : null,
              },
            })
          : prisma.exitClearanceItem.create({
              data: {
                exitRequestId: id,
                department: item.department,
                item: item.item,
                status: item.status || 'PENDING',
                remarks: item.remarks || null,
                sortOrder: item.sortOrder || 0,
              },
            })
      )
    );

    return NextResponse.json({
      success: true,
      data: updates,
      message: 'Clearance checklist updated',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Exit Clearance API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update clearance checklist' } },
      { status: 500 }
    );
  }
});
