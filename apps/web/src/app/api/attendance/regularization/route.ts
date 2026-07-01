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
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch regularization requests' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const action = body.action || 'submit';

    switch (action) {
      case 'submit': {
        const employeeId =
          body.employeeId &&
          body.employeeId !== 'current-user' &&
          body.employeeId !== 'current-user-id'
            ? body.employeeId
            : user.employeeId;
        const regularizationType = body.regularizationType || body.category || body.type;
        const required = [employeeId, body.date, body.reason, regularizationType];
        if (required.some((field) => !field)) {
          return NextResponse.json(
            { error: 'employeeId, date, reason, and regularizationType are required' },
            { status: 400 }
          );
        }

        const regularization = await prisma.attendanceRegularization.create({
          data: {
            tenantId: user.tenantId,
            employeeId,
            date: new Date(body.date),
            regularizationType,
            requestedClockIn:
              body.requestedClockIn || body.requestedCheckIn || body.requestedInTime
                ? new Date(body.requestedClockIn || body.requestedCheckIn || body.requestedInTime)
                : null,
            requestedClockOut:
              body.requestedClockOut || body.requestedCheckOut || body.requestedOutTime
                ? new Date(
                    body.requestedClockOut || body.requestedCheckOut || body.requestedOutTime
                  )
                : null,
            reason: body.reason,
            attachments: Array.isArray(body.attachments)
              ? body.attachments
              : body.supportingDocument
                ? [body.supportingDocument]
                : [],
            status: 'PENDING',
          },
        });

        return NextResponse.json({
          success: true,
          data: regularization,
        });
      }

      case 'approve': {
        const approverId = body.approverId || user.id;
        if (!body.regularizationId) {
          return NextResponse.json({ error: 'regularizationId is required' }, { status: 400 });
        }

        const existing = await prisma.attendanceRegularization.findFirst({
          where: {
            id: body.regularizationId,
            tenantId: user.tenantId,
          },
        });

        if (!existing) {
          return NextResponse.json({ error: 'Regularization request not found' }, { status: 404 });
        }

        // tenant-ok: id-based op preceded by tenant-scoped findFirst above
        const approved = await prisma.attendanceRegularization.update({
          where: { id: existing.id },
          data: {
            status: 'APPROVED',
            approvedBy: approverId,
            approvedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          data: approved,
        });
      }

      case 'reject': {
        const approverId = body.approverId || user.id;
        if (!body.regularizationId) {
          return NextResponse.json({ error: 'regularizationId is required' }, { status: 400 });
        }

        const existing = await prisma.attendanceRegularization.findFirst({
          where: {
            id: body.regularizationId,
            tenantId: user.tenantId,
          },
        });

        if (!existing) {
          return NextResponse.json({ error: 'Regularization request not found' }, { status: 404 });
        }

        // tenant-ok: id-based op preceded by tenant-scoped findFirst above
        const rejected = await prisma.attendanceRegularization.update({
          where: { id: existing.id },
          data: {
            status: 'REJECTED',
            approvedBy: approverId,
            approvedAt: new Date(),
            rejectionReason: body.comments || '',
          },
        });

        return NextResponse.json({
          success: true,
          data: rejected,
        });
      }

      case 'cancel': {
        if (!body.regularizationId) {
          return NextResponse.json(
            {
              error: 'regularizationId is required',
              message: 'regularizationId is required',
              messageAr: 'معرف طلب التسوية مطلوب',
            },
            { status: 400 }
          );
        }

        const existing = await prisma.attendanceRegularization.findFirst({
          where: {
            id: body.regularizationId,
            tenantId: user.tenantId,
          },
        });

        if (!existing) {
          return NextResponse.json(
            {
              error: 'Regularization request not found',
              message: 'Regularization request not found',
              messageAr: 'طلب التسوية غير موجود',
            },
            { status: 404 }
          );
        }

        // Only the owning employee may cancel, and only while still pending.
        if (existing.employeeId !== user.employeeId) {
          return NextResponse.json(
            {
              error: 'You can only cancel your own requests',
              message: 'You can only cancel your own requests',
              messageAr: 'يمكنك إلغاء طلباتك الخاصة فقط',
            },
            { status: 403 }
          );
        }

        if (existing.status !== 'PENDING') {
          return NextResponse.json(
            {
              error: 'Only pending requests can be cancelled',
              message: 'Only pending requests can be cancelled',
              messageAr: 'يمكن إلغاء الطلبات المعلقة فقط',
            },
            { status: 409 }
          );
        }

        // tenant-ok: id-based op preceded by tenant-scoped findFirst above
        const cancelled = await prisma.attendanceRegularization.update({
          where: { id: existing.id },
          data: {
            status: 'CANCELLED',
            rejectionReason: body.comments || 'Cancelled by employee',
          },
        });

        return NextResponse.json({
          success: true,
          data: cancelled,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', message: 'Invalid action', messageAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process regularization' },
      { status: 500 }
    );
  }
});
