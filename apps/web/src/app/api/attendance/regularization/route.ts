import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [regularizations, total] = await Promise.all([
      prisma.attendanceRegularization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendanceRegularization.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        regularizations,
        pagination: { page, limit, total },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch regularization requests' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const action = body.action || 'submit';

    switch (action) {
      case 'submit': {
        const required = ['employeeId', 'date', 'reason', 'category'];
        for (const field of required) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        const regularization = await prisma.attendanceRegularization.create({
          data: {
            tenantId: user.tenantId,
            employeeId: body.employeeId,
            date: new Date(body.date),
            regularizationType: body.category,
            requestedClockIn: body.requestedCheckIn ? new Date(body.requestedCheckIn) : null,
            requestedClockOut: body.requestedCheckOut ? new Date(body.requestedCheckOut) : null,
            reason: body.reason,
            attachments: body.supportingDocument ? [body.supportingDocument] : [],
            status: 'PENDING',
          },
        });

        return NextResponse.json({
          success: true,
          data: regularization,
        });
      }

      case 'approve': {
        if (!body.regularizationId || !body.approverId) {
          return NextResponse.json(
            { error: 'regularizationId and approverId are required' },
            { status: 400 }
          );
        }

        const approved = await prisma.attendanceRegularization.update({
          where: { id: body.regularizationId },
          data: {
            status: 'APPROVED',
            approvedBy: body.approverId,
            approvedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          data: approved,
        });
      }

      case 'reject': {
        if (!body.regularizationId || !body.approverId) {
          return NextResponse.json(
            { error: 'regularizationId and approverId are required' },
            { status: 400 }
          );
        }

        const rejected = await prisma.attendanceRegularization.update({
          where: { id: body.regularizationId },
          data: {
            status: 'REJECTED',
            approvedBy: body.approverId,
            rejectionReason: body.comments || '',
          },
        });

        return NextResponse.json({
          success: true,
          data: rejected,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process regularization' },
      { status: 500 }
    );
  }
});
