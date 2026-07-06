import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

/**
 * DELETE /api/v1/analytics/reports/schedule/[id]
 * Deactivates the schedule on a report definition (keeps the report, clears schedule).
 */
export const DELETE = withEnhancedAuth(async (request, context) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('analytics:update') && !permissions.includes('analytics:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing analytics:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const id = params.id;

    const report = await prisma.reportDefinition.findFirst({ where: { id, tenantId } });
    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4040',
            message: 'Report schedule not found',
            messageAr: 'جدول التقرير غير موجود',
          },
        },
        { status: 404 }
      );
    }

    await prisma.reportDefinition.update({
      where: { id: report.id },
      data: { isScheduled: false, scheduleConfig: undefined },
    });

    return NextResponse.json({
      success: true,
      message: 'Report schedule removed',
      messageAr: 'تمت إزالة جدول التقرير',
    });
  } catch (error: any) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5000',
          message: 'Failed to remove report schedule',
          messageAr: 'فشل إزالة جدول التقرير',
        },
      },
      { status: 500 }
    );
  }
});
