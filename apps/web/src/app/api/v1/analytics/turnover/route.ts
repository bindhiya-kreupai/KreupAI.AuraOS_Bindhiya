import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '12months';
    const now = new Date();

    let periodStart: Date;
    switch (period) {
      case '6months':
        periodStart = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        periodStart = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    }

    const totalEmployees = await prisma.employee.count({
      where: { company: { tenantId } },
    });

    const allExitRequests = await prisma.exitRequest.findMany({
      where: {
        tenantId,
        status: { in: ['APPROVED', 'COMPLETED'] },
        lastWorkingDate: { gte: periodStart },
      },
      select: {
        id: true,
        employeeId: true,
        exitType: true,
        reason: true,
        lastWorkingDate: true,
        employee: {
          select: {
            joiningDate: true,
            departmentId: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    const totalExits = allExitRequests.length;
    const voluntaryExits = allExitRequests.filter((e) => e.exitType === 'RESIGNATION').length;
    const involuntaryExits = totalExits - voluntaryExits;

    const turnoverRate =
      totalEmployees > 0 ? Math.round((totalExits / totalEmployees) * 1000) / 10 : 0;
    const voluntaryRate =
      totalEmployees > 0 ? Math.round((voluntaryExits / totalEmployees) * 1000) / 10 : 0;
    const involuntaryRate =
      totalEmployees > 0 ? Math.round((involuntaryExits / totalEmployees) * 1000) / 10 : 0;

    const deptExitMap = new Map<string, { voluntary: number; involuntary: number; name: string }>();
    for (const exit of allExitRequests) {
      const deptName = exit.employee.department.name;
      const existing = deptExitMap.get(deptName);
      if (existing) {
        if (exit.exitType === 'RESIGNATION') existing.voluntary++;
        else existing.involuntary++;
      } else {
        deptExitMap.set(deptName, {
          name: deptName,
          voluntary: exit.exitType === 'RESIGNATION' ? 1 : 0,
          involuntary: exit.exitType !== 'RESIGNATION' ? 1 : 0,
        });
      }
    }

    const deptHeadcounts = await prisma.employee.groupBy({
      by: ['departmentId'],
      where: { company: { tenantId } },
      _count: true,
    });

    const departments = await prisma.department.findMany({
      where: { company: { tenantId } },
      select: { id: true, name: true },
    });
    const deptIdNameMap = new Map(departments.map((d) => [d.id, d.name]));
    const deptIdCountMap = new Map(
      deptHeadcounts.map((d) => [deptIdNameMap.get(d.departmentId) || '', d._count])
    );

    const byDepartment = Array.from(deptExitMap.values()).map((dept) => {
      const headcount = deptIdCountMap.get(dept.name) || 1;
      const deptTotal = dept.voluntary + dept.involuntary;
      return {
        department: dept.name,
        rate: Math.round((deptTotal / headcount) * 1000) / 10,
        voluntary: Math.round((dept.voluntary / headcount) * 1000) / 10,
        involuntary: Math.round((dept.involuntary / headcount) * 1000) / 10,
        benchmark: 0,
      };
    });

    const reasonMap = new Map<string, number>();
    for (const exit of allExitRequests) {
      const reason = exit.reason || 'Not specified';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    }
    const reasons = Array.from(reasonMap.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalExits > 0 ? Math.round((count / totalExits) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const tenureBuckets = [
      { range: '0-6 months', maxDays: 180, count: 0 },
      { range: '6-12 months', maxDays: 365, count: 0 },
      { range: '1-2 years', maxDays: 730, count: 0 },
      { range: '2-5 years', maxDays: 1825, count: 0 },
      { range: '5+ years', maxDays: Infinity, count: 0 },
    ];

    for (const exit of allExitRequests) {
      const tenureDays =
        (new Date(exit.lastWorkingDate).getTime() - new Date(exit.employee.joiningDate).getTime()) /
        (24 * 60 * 60 * 1000);
      for (const bucket of tenureBuckets) {
        if (tenureDays <= bucket.maxDays) {
          bucket.count++;
          break;
        }
      }
    }

    const byTenure = tenureBuckets.map((b) => ({
      range: b.range,
      rate: totalEmployees > 0 ? Math.round((b.count / totalEmployees) * 1000) / 10 : 0,
      count: b.count,
    }));

    const monthlyTrend: { month: string; rate: number; separations: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const monthExits = allExitRequests.filter((e) => {
        const lwd = new Date(e.lastWorkingDate);
        return lwd >= monthDate && lwd <= monthEnd;
      }).length;
      monthlyTrend.push({
        month: monthStr,
        rate: totalEmployees > 0 ? Math.round((monthExits / totalEmployees) * 12 * 1000) / 10 : 0,
        separations: monthExits,
      });
    }

    const salaryStructures = await prisma.employeeSalaryStructure.findMany({
      where: {
        tenantId,
        isActive: true,
        employeeId: { in: allExitRequests.map((e) => e.employeeId) },
      },
      select: { employeeId: true, grossSalary: true },
    });
    const avgSalaryOfExits =
      salaryStructures.length > 0
        ? salaryStructures.reduce((sum, s) => sum + Number(s.grossSalary), 0) /
          salaryStructures.length
        : 0;
    const avgCostPerTurnover = Math.round(avgSalaryOfExits * 0.5);

    const turnoverData = {
      period,
      generatedAt: new Date().toISOString(),
      overall: {
        turnoverRate,
        voluntaryRate,
        involuntaryRate,
        industryBenchmark: 0,
        trend: turnoverRate > 0 ? 'calculated' : 'no_data',
      },
      byDepartment,
      reasons,
      byTenure,
      monthlyTrend,
      costOfTurnover: {
        averageCostPerEmployee: avgCostPerTurnover,
        totalCostYTD: avgCostPerTurnover * totalExits,
        estimatedAnnual: avgCostPerTurnover * totalExits * (12 / Math.max(1, now.getMonth() + 1)),
      },
    };

    return NextResponse.json({ success: true, data: turnoverData });
  } catch (error: any) {
    console.error('Turnover analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        period: '12months',
        generatedAt: new Date().toISOString(),
        overall: {
          turnoverRate: 0,
          voluntaryRate: 0,
          involuntaryRate: 0,
          industryBenchmark: 0,
          trend: 'no_data',
        },
        byDepartment: [],
        reasons: [],
        byTenure: [],
        monthlyTrend: [],
        costOfTurnover: { averageCostPerEmployee: 0, totalCostYTD: 0, estimatedAnnual: 0 },
      },
    });
  }
});
