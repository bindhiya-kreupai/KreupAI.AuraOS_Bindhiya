import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/audit-log/export
 * Export audit logs with filtering, aggregation, and summary
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/audit-log:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/audit-log:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const startDate =
      searchParams.get('startDate') ||
      new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const format = searchParams.get('format') || 'json';
    const actions = searchParams.get('actions')?.split(',').filter(Boolean);
    const users = searchParams.get('users')?.split(',').filter(Boolean);
    const modules = searchParams.get('modules')?.split(',').filter(Boolean);
    const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 5000);

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      isDeleted: false,
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      },
    };

    if (actions?.length) where.action = { in: actions };
    if (users?.length) where.userId = { in: users };
    if (modules?.length) where.resourceType = { in: modules };

    const [entries, totalEvents, actionAgg, resourceTypeAgg, uniqueUsersResult] = await Promise.all(
      [
        prisma.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: limit,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.auditLog.count({ where }),
        prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.auditLog.groupBy({
          by: ['resourceType'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.auditLog.groupBy({
          by: ['userId'],
          where: { ...where, userId: { not: null } },
        }),
      ]
    );

    const byAction = actionAgg.map((a) => ({ action: a.action, count: a._count.id }));
    const byModule = resourceTypeAgg
      .filter((r) => r.resourceType)
      .map((r) => ({ module: r.resourceType, count: r._count.id }));

    const suspiciousActivities = entries.filter((e) => !e.success).length;

    const formattedEntries = entries.map((e) => ({
      id: e.id,
      timestamp: e.timestamp.toISOString(),
      userId: e.userId,
      userName: (e.user as any)?.name || null,
      action: e.action,
      module: e.resourceType || e.module,
      resource: e.resourceId ? `${e.resourceType}/${e.resourceId}` : e.resourceType,
      details: e.details || null,
      ipAddress: e.ipAddress,
      userAgent: e.userAgent,
      status: e.success ? 'success' : 'failed',
      changes:
        e.beforeValues || e.afterValues ? { before: e.beforeValues, after: e.afterValues } : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        exportId: `audit-export-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        format,
        totalEntries: totalEvents,
        filters: {
          startDate,
          endDate,
          actions: actions || ['all'],
          users: users || ['all'],
          modules: modules || ['all'],
        },
        summary: {
          totalEvents,
          byAction,
          byModule,
          uniqueUsers: uniqueUsersResult.length,
          suspiciousActivities,
        },
        entries: formattedEntries,
        downloadUrl:
          format !== 'json'
            ? `/api/v1/admin/audit-log/export/download?format=${format}&startDate=${startDate}&endDate=${endDate}`
            : null,
        retentionPolicy: {
          currentRetention: '365 days',
          complianceStandard: 'SOC2',
        },
      },
    });
  } catch (error) {
    console.error('[Audit Log Export] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to export audit logs' } },
      { status: 500 }
    );
  }
});
