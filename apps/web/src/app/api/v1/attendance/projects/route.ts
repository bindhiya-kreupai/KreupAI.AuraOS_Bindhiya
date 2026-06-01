export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/attendance/projects
 * Query ProjectTimeEntry grouped by project
 *
 * Query Parameters:
 * - startDate (optional): Filter start date (YYYY-MM-DD)
 * - endDate (optional): Filter end date (YYYY-MM-DD)
 * - status (optional): Filter by entry status (DRAFT, SUBMITTED, APPROVED)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = context.user.tenantId;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build where clause
    interface TimeEntryWhere {
      tenantId: string;
      date?: { gte?: Date; lte?: Date };
      status?: string;
    }
    const where: TimeEntryWhere = { tenantId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (status) where.status = status;

    // Get all time entries grouped by project
    const timeEntries = await prisma.projectTimeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Group by projectId
    const projectGroups = new Map<string, typeof timeEntries>();
    for (const entry of timeEntries) {
      const existing = projectGroups.get(entry.projectId) || [];
      existing.push(entry);
      projectGroups.set(entry.projectId, existing);
    }

    const projects = Array.from(projectGroups.entries()).map(([projectId, entries]) => {
      const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
      const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);
      const uniqueEmployees = new Set(entries.map((e) => e.employeeId)).size;

      return {
        id: projectId,
        projectId,
        totalHours: parseFloat(totalHours.toFixed(2)),
        billableHours: parseFloat(billableHours.toFixed(2)),
        nonBillableHours: parseFloat((totalHours - billableHours).toFixed(2)),
        entryCount: entries.length,
        uniqueEmployees,
        latestEntry: entries[0]?.date.toISOString().split('T')[0] || null,
      };
    });

    const response: ApiResponse = {
      success: true,
      data: {
        projects,
        total: projects.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Projects API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch project time entries',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
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
