// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/succession/nine-box
 * Get 9-box grid data for talent management
 * Axes: Performance (X) vs Potential (Y)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/succession:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/succession:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const departmentId = searchParams.get('departmentId') || undefined;
    const periodId = searchParams.get('periodId') || undefined;

    // Get employees with performance data
    const employeeWhere: Record<string, unknown> = {
      isDeleted: false,
      company: { tenant: { id: user.tenantId } },
    };
    if (departmentId) employeeWhere.departmentId = departmentId;

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        department: { select: { id: true, name: true } },
        jobProfile: { select: { id: true, title: true } },
        grade: { select: { id: true, name: true, level: true } },
      },
      take: 500, // Limit for 9-box
    });

    // For now, use mock performance/potential scores (in production, would join with performance review data)
    const nineBoxData = {
      grid: {
        rows: ['HIGH_POTENTIAL', 'MEDIUM_POTENTIAL', 'LOW_POTENTIAL'],
        columns: ['LOW_PERFORMANCE', 'MEDIUM_PERFORMANCE', 'HIGH_PERFORMANCE'],
      },
      cells: {
        HIGH_POTENTIAL_LOW_PERFORMANCE: {
          label: 'Inconsistent Player',
          description: 'High potential but needs performance support',
          employees: [],
          count: 0,
        },
        HIGH_POTENTIAL_MEDIUM_PERFORMANCE: {
          label: 'High Potential',
          description: 'On the way to becoming a star performer',
          employees: [],
          count: 0,
        },
        HIGH_POTENTIAL_HIGH_PERFORMANCE: {
          label: 'Star',
          description: 'Ready for immediate advancement',
          employees: [],
          count: 0,
        },
        MEDIUM_POTENTIAL_LOW_PERFORMANCE: {
          label: 'Underperformer',
          description: 'Needs performance improvement plan',
          employees: [],
          count: 0,
        },
        MEDIUM_POTENTIAL_MEDIUM_PERFORMANCE: {
          label: 'Core Employee',
          description: 'Valuable team member, solid performer',
          employees: [],
          count: 0,
        },
        MEDIUM_POTENTIAL_HIGH_PERFORMANCE: {
          label: 'High Performer',
          description: 'Excellent results, moderate growth potential',
          employees: [],
          count: 0,
        },
        LOW_POTENTIAL_LOW_PERFORMANCE: {
          label: 'Talent Risk',
          description: 'Consider development or reassignment',
          employees: [],
          count: 0,
        },
        LOW_POTENTIAL_MEDIUM_PERFORMANCE: {
          label: 'Effective Professional',
          description: 'Good at current role, limited advancement potential',
          employees: [],
          count: 0,
        },
        LOW_POTENTIAL_HIGH_PERFORMANCE: {
          label: 'Solid Performer',
          description: 'Highly effective in current role',
          employees: [],
          count: 0,
        },
      },
      summary: {
        totalEmployees: employees.length,
        stars: 0,
        highPotentials: 0,
        coreEmployees: 0,
        atRisk: 0,
      },
    };

    // Distribute employees across cells (simplified random distribution)
    const cellKeys = Object.keys(nineBoxData.cells);
    employees.forEach((emp) => {
      const cellIndex = Math.floor(Math.random() * cellKeys.length);
      const cellKey = cellKeys[cellIndex] as keyof typeof nineBoxData.cells;
      const cell = nineBoxData.cells[cellKey];
      cell.employees.push({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        department: emp.department?.name,
        jobTitle: emp.jobProfile?.title,
        grade: emp.grade?.name,
      } as any);
      cell.count++;
    });

    nineBoxData.summary.stars = nineBoxData.cells.HIGH_POTENTIAL_HIGH_PERFORMANCE.count;
    nineBoxData.summary.highPotentials = nineBoxData.cells.HIGH_POTENTIAL_MEDIUM_PERFORMANCE.count;
    nineBoxData.summary.coreEmployees = nineBoxData.cells.MEDIUM_POTENTIAL_MEDIUM_PERFORMANCE.count;
    nineBoxData.summary.atRisk = nineBoxData.cells.LOW_POTENTIAL_LOW_PERFORMANCE.count;

    return NextResponse.json({
      success: true,
      data: nineBoxData,
      meta: {
        departmentId,
        periodId,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[9-Box Grid API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch 9-box grid data' } },
      { status: 500 }
    );
  }
});
