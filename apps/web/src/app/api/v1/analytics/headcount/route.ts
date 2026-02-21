import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current';

    const employees = await prisma.employee.findMany({
      where: { company: { tenantId } },
      select: {
        id: true,
        departmentId: true,
        department: { select: { name: true } },
        locationId: true,
        location: { select: { name: true } },
        typeId: true,
        type: { select: { name: true } },
        statusId: true,
        status: { select: { code: true } },
        joiningDate: true,
      },
    });

    const activeEmployees = employees.filter((e) => e.status.code === 'ACTIVE' || e.status.code === 'PROBATION');
    const total = activeEmployees.length;

    const deptMap = new Map<string, { count: number; name: string }>();
    for (const emp of activeEmployees) {
      const existing = deptMap.get(emp.departmentId);
      if (existing) {
        existing.count++;
      } else {
        deptMap.set(emp.departmentId, { count: 1, name: emp.department.name });
      }
    }
    const byDepartment = Array.from(deptMap.values()).map((d) => ({
      department: d.name,
      count: d.count,
      percentage: total > 0 ? Math.round((d.count / total) * 1000) / 10 : 0,
      change: 0,
    }));

    const locMap = new Map<string, { count: number; name: string }>();
    for (const emp of activeEmployees) {
      const existing = locMap.get(emp.locationId);
      if (existing) {
        existing.count++;
      } else {
        locMap.set(emp.locationId, { count: 1, name: emp.location.name });
      }
    }
    const byLocation = Array.from(locMap.values()).map((l) => ({
      location: l.name,
      count: l.count,
      percentage: total > 0 ? Math.round((l.count / total) * 1000) / 10 : 0,
    }));

    const typeMap = new Map<string, { count: number; name: string }>();
    for (const emp of activeEmployees) {
      const existing = typeMap.get(emp.typeId);
      if (existing) {
        existing.count++;
      } else {
        typeMap.set(emp.typeId, { count: 1, name: emp.type.name });
      }
    }
    const byEmploymentType = Array.from(typeMap.values()).map((t) => ({
      type: t.name,
      count: t.count,
      percentage: total > 0 ? Math.round((t.count / total) * 1000) / 10 : 0,
    }));

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const newHiresThisMonth = employees.filter(
      (e) => new Date(e.joiningDate) >= thisMonthStart
    ).length;

    const newHiresLastMonth = employees.filter(
      (e) => new Date(e.joiningDate) >= lastMonthStart && new Date(e.joiningDate) <= lastMonthEnd
    ).length;

    const exitRequests = await prisma.exitRequest.findMany({
      where: { tenantId },
      select: { lastWorkingDate: true, status: true },
    });

    const separationsThisMonth = exitRequests.filter(
      (e) => new Date(e.lastWorkingDate) >= thisMonthStart && (e.status === 'APPROVED' || e.status === 'COMPLETED')
    ).length;

    const separationsLastMonth = exitRequests.filter(
      (e) =>
        new Date(e.lastWorkingDate) >= lastMonthStart &&
        new Date(e.lastWorkingDate) <= lastMonthEnd &&
        (e.status === 'APPROVED' || e.status === 'COMPLETED')
    ).length;

    const ytdStart = new Date(now.getFullYear(), 0, 1);
    const newHiresYTD = employees.filter((e) => new Date(e.joiningDate) >= ytdStart).length;
    const separationsYTD = exitRequests.filter(
      (e) => new Date(e.lastWorkingDate) >= ytdStart && (e.status === 'APPROVED' || e.status === 'COMPLETED')
    ).length;

    const trends: { month: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const countAtMonth = employees.filter(
        (e) => new Date(e.joiningDate) <= new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      ).length;
      trends.push({ month: monthStr, count: countAtMonth });
    }

    const headcountData = {
      period,
      snapshot: new Date().toISOString(),
      total,
      byDepartment,
      byLocation,
      byEmploymentType,
      trends,
      newHires: { thisMonth: newHiresThisMonth, lastMonth: newHiresLastMonth, ytd: newHiresYTD },
      separations: { thisMonth: separationsThisMonth, lastMonth: separationsLastMonth, ytd: separationsYTD },
      netGrowth: {
        thisMonth: newHiresThisMonth - separationsThisMonth,
        lastMonth: newHiresLastMonth - separationsLastMonth,
        ytd: newHiresYTD - separationsYTD,
        growthRate: total > 0 ? Math.round(((newHiresThisMonth - separationsThisMonth) / total) * 10000) / 100 : 0,
      },
    };

    return NextResponse.json({ success: true, data: headcountData });
  } catch (error) {
    console.error('Headcount analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        period: 'current',
        snapshot: new Date().toISOString(),
        total: 0,
        byDepartment: [],
        byLocation: [],
        byEmploymentType: [],
        trends: [],
        newHires: { thisMonth: 0, lastMonth: 0, ytd: 0 },
        separations: { thisMonth: 0, lastMonth: 0, ytd: 0 },
        netGrowth: { thisMonth: 0, lastMonth: 0, ytd: 0, growthRate: 0 },
      },
    });
  }
});
