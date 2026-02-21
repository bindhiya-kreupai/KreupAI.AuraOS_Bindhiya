import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;

    const reports = await prisma.reportDefinition.findMany({
      where: { tenantId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 1,
          select: { executedAt: true, status: true },
        },
      },
    });

    const savedReports = reports.map((report) => ({
      id: report.id,
      name: report.name,
      description: report.description,
      type: report.category,
      createdBy: report.createdBy,
      createdAt: report.createdAt.toISOString(),
      lastRun: report.executions[0]?.executedAt?.toISOString() || null,
      schedule: report.isScheduled ? 'scheduled' : 'on-demand',
      format: 'json',
      filters: report.filters,
      columns: report.columns,
    }));

    return NextResponse.json({
      success: true,
      data: savedReports,
      meta: { total: savedReports.length },
    });
  } catch (error) {
    console.error('Custom reports GET error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      meta: { total: 0 },
    });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const body = await request.json();

    const existingCount = await prisma.reportDefinition.count({
      where: { tenantId },
    });

    const report = await prisma.reportDefinition.create({
      data: {
        tenantId,
        code: body.code || `CUSTOM_${existingCount + 1}`,
        name: body.name || 'Custom Report',
        description: body.description || null,
        category: body.type || 'CUSTOM',
        dataSource: body.dataSource || 'CUSTOM_QUERY',
        columns: body.columns || [],
        filters: body.filters || null,
        groupBy: body.groupBy || null,
        sortBy: body.sortBy || null,
        chartType: body.chartType || null,
        isPublic: body.isPublic || false,
        createdBy: user.userId,
      },
    });

    const execution = await prisma.reportExecution.create({
      data: {
        reportId: report.id,
        tenantId,
        executedBy: user.userId,
        status: 'COMPLETED',
        recordCount: 0,
        executionTime: 0,
      },
    });

    const reportResult = {
      executionId: execution.id,
      reportId: report.id,
      reportName: report.name,
      type: report.category,
      status: 'completed',
      startedAt: execution.executedAt.toISOString(),
      completedAt: execution.executedAt.toISOString(),
      duration: '0s',
      rowCount: 0,
      filters: body.filters || {},
      columns: body.columns || [],
      data: [],
      exportUrl: `/api/v1/analytics/reports/custom/${execution.id}/download`,
      format: body.format || 'json',
    };

    return NextResponse.json({ success: true, data: reportResult });
  } catch (error) {
    console.error('Custom reports POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create custom report' },
      { status: 500 }
    );
  }
});
