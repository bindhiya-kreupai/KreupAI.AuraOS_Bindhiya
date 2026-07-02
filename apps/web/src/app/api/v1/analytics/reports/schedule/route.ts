import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

function computeNextRun(frequency: string): Date {
  const next = new Date();
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('analytics:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing analytics:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;

    const reports = await prisma.reportDefinition.findMany({
      where: { tenantId, isScheduled: true, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 1,
          select: { executedAt: true, status: true },
        },
      },
    });

    const schedules = reports.map((report) => {
      const cfg = (report.scheduleConfig as Record<string, any>) || {};
      const frequency = cfg.frequency || 'monthly';
      return {
        id: report.id,
        reportId: report.id,
        reportName: report.name,
        category: report.category,
        frequency,
        cronExpression: cfg.cronExpression || null,
        timezone: cfg.timezone || 'UTC',
        recipients: Array.isArray(cfg.recipients) ? cfg.recipients : [],
        format: cfg.format || 'pdf',
        delivery: cfg.delivery || null,
        isActive: report.isActive,
        lastRun: report.executions[0]?.executedAt?.toISOString() || null,
        nextRun: computeNextRun(frequency).toISOString(),
        createdAt: report.createdAt.toISOString(),
        createdBy: report.createdBy,
      };
    });

    return NextResponse.json({ success: true, data: schedules, meta: { total: schedules.length } });
  } catch (error: any) {
    console.error('List schedules error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5000',
          message: 'Failed to load report schedules',
          messageAr: 'فشل تحميل جداول التقارير',
        },
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('analytics:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing analytics:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const body = await request.json();

    let report;
    if (body.reportId) {
      report = await prisma.reportDefinition.findFirst({
        where: { id: body.reportId, tenantId },
      });
    }

    if (!report && body.reportId) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const scheduleConfig = {
      frequency: body.frequency || 'monthly',
      cronExpression: body.cronExpression || '0 6 1 * *',
      timezone: body.timezone || 'UTC',
      recipients: body.recipients || [],
      delivery: {
        method: body.deliveryMethod || 'email',
        includeAttachment: true,
        includeSummary: true,
        subject: body.subject || `Scheduled Report: ${body.reportName || 'Report'}`,
      },
      format: body.format || 'pdf',
    };

    if (report) {
      await prisma.reportDefinition.update({
        where: { id: report.id },
        data: {
          isScheduled: true,
          scheduleConfig,
        },
      });
    } else {
      const existingCount = await prisma.reportDefinition.count({
        where: { tenantId },
      });

      report = await prisma.reportDefinition.create({
        data: {
          tenantId,
          code: `SCHED_${existingCount + 1}`,
          name: body.reportName || 'Scheduled Report',
          description: body.description || null,
          category: body.category || 'SCHEDULED',
          dataSource: body.dataSource || 'CUSTOM_QUERY',
          columns: body.columns || [],
          filters: body.filters || null,
          isPublic: false,
          createdBy: user.userId,
          isScheduled: true,
          scheduleConfig,
        },
      });
    }

    const nextRunDate = new Date();
    switch (body.frequency) {
      case 'daily':
        nextRunDate.setDate(nextRunDate.getDate() + 1);
        break;
      case 'weekly':
        nextRunDate.setDate(nextRunDate.getDate() + 7);
        break;
      case 'quarterly':
        nextRunDate.setMonth(nextRunDate.getMonth() + 3);
        break;
      default:
        nextRunDate.setMonth(nextRunDate.getMonth() + 1);
    }

    const recentExecutions = await prisma.reportExecution.findMany({
      where: { reportId: report.id },
      orderBy: { executedAt: 'desc' },
      take: 3,
      select: {
        executedAt: true,
        status: true,
      },
    });

    const schedule = {
      id: report.id,
      reportId: report.id,
      reportName: report.name,
      frequency: scheduleConfig.frequency,
      cronExpression: scheduleConfig.cronExpression,
      timezone: scheduleConfig.timezone,
      nextRun: nextRunDate.toISOString(),
      recipients: scheduleConfig.recipients,
      delivery: scheduleConfig.delivery,
      filters: body.filters || {},
      format: scheduleConfig.format,
      status: 'active',
      createdAt: report.createdAt.toISOString(),
      createdBy: user.userId,
      history: recentExecutions.map((exec) => ({
        runDate: exec.executedAt.toISOString(),
        status: exec.status === 'COMPLETED' ? 'delivered' : exec.status.toLowerCase(),
        recipients: scheduleConfig.recipients.length,
      })),
    };

    return NextResponse.json(
      { success: true, data: schedule, message: 'Report schedule created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Schedule report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report schedule' },
      { status: 500 }
    );
  }
});
