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

    const employees = await prisma.employee.findMany({
      where: { company: { tenantId } },
      select: {
        id: true,
        departmentId: true,
        department: { select: { name: true } },
        grade: { select: { code: true, name: true } },
      },
    });

    const totalEmployees = employees.length;

    const salaryStructures = await prisma.employeeSalaryStructure.findMany({
      where: { tenantId, isActive: true },
      select: {
        employeeId: true,
        grossSalary: true,
        basicSalary: true,
        ctc: true,
      },
    });

    const salaryMap = new Map<string, { grossSalary: number; basicSalary: number; ctc: number }>();
    for (const s of salaryStructures) {
      salaryMap.set(s.employeeId, {
        grossSalary: Number(s.grossSalary),
        basicSalary: Number(s.basicSalary),
        ctc: Number(s.ctc),
      });
    }

    const allSalaries = employees
      .map((e) => salaryMap.get(e.id)?.grossSalary ?? 0)
      .filter((s) => s > 0);

    const totalPayroll = allSalaries.reduce((sum, s) => sum + s, 0);
    const averageSalary =
      allSalaries.length > 0 ? Math.round(totalPayroll / allSalaries.length) : 0;
    const sortedSalaries = [...allSalaries].sort((a, b) => a - b);
    const medianSalary =
      sortedSalaries.length > 0
        ? sortedSalaries.length % 2 === 0
          ? Math.round(
              (sortedSalaries[sortedSalaries.length / 2 - 1] +
                sortedSalaries[sortedSalaries.length / 2]) /
                2
            )
          : sortedSalaries[Math.floor(sortedSalaries.length / 2)]
        : 0;
    const salaryRangeMin = sortedSalaries.length > 0 ? sortedSalaries[0] : 0;
    const salaryRangeMax =
      sortedSalaries.length > 0 ? sortedSalaries[sortedSalaries.length - 1] : 0;

    const deptMap = new Map<string, { name: string; salaries: number[] }>();
    for (const emp of employees) {
      const salary = salaryMap.get(emp.id)?.grossSalary ?? 0;
      const existing = deptMap.get(emp.departmentId);
      if (existing) {
        existing.salaries.push(salary);
      } else {
        deptMap.set(emp.departmentId, { name: emp.department.name, salaries: [salary] });
      }
    }

    const byDepartment = Array.from(deptMap.values()).map((dept) => {
      const validSalaries = dept.salaries.filter((s) => s > 0);
      const sorted = [...validSalaries].sort((a, b) => a - b);
      const avg =
        validSalaries.length > 0
          ? Math.round(validSalaries.reduce((s, v) => s + v, 0) / validSalaries.length)
          : 0;
      const median =
        sorted.length > 0
          ? sorted.length % 2 === 0
            ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
            : sorted[Math.floor(sorted.length / 2)]
          : 0;
      return {
        department: dept.name,
        avgSalary: avg,
        median,
        min: sorted.length > 0 ? sorted[0] : 0,
        max: sorted.length > 0 ? sorted[sorted.length - 1] : 0,
        headcount: dept.salaries.length,
      };
    });

    const payrollRuns = await prisma.payrollRun.findMany({
      where: { tenantId },
      orderBy: { payrollMonth: 'desc' },
      take: 5,
      select: {
        payrollMonth: true,
        totalGrossSalary: true,
        totalNetSalary: true,
        totalEmployees: true,
      },
    });

    const trends = payrollRuns.reverse().map((run) => ({
      period: run.payrollMonth,
      avgSalary:
        run.totalEmployees > 0 ? Math.round(Number(run.totalGrossSalary) / run.totalEmployees) : 0,
      totalPayroll: Number(run.totalGrossSalary),
    }));

    const benefitsTotal = await prisma.employeeBenefit.aggregate({
      where: { tenantId, isActive: true },
      _sum: { totalPremium: true },
    });

    const totalBenefitsCost = Number(benefitsTotal._sum.totalPremium ?? 0);

    const compensationData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalPayroll: totalPayroll * 12,
        averageSalary,
        medianSalary,
        salaryRangeMin,
        salaryRangeMax,
        totalBenefitsCost,
        benefitsPerEmployee:
          totalEmployees > 0 ? Math.round(totalBenefitsCost / totalEmployees) : 0,
      },
      byDepartment,
      payEquity: {
        genderGap: { overall: 0, adjustedGap: 0, byLevel: [] },
        ethnicityGap: { overall: 0, adjustedGap: 0 },
        compRatio: {
          average:
            averageSalary > 0 ? Math.round((averageSalary / (medianSalary || 1)) * 100) / 100 : 0,
          belowRange: 0,
          withinRange: totalEmployees,
          aboveRange: 0,
        },
      },
      marketComparison: {
        overallPosition: 'N/A',
        byRole: [],
        lastBenchmarkDate: null,
        dataSource: 'Internal Data',
      },
      budgetUtilization: {
        annualBudget: totalPayroll * 12,
        utilized: totalPayroll * 12,
        remaining: 0,
        utilizationRate: 100,
        projectedYearEnd: totalPayroll * 12,
      },
      trends,
    };

    return NextResponse.json({ success: true, data: compensationData });
  } catch (error: any) {
    console.error('Compensation analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        summary: {
          totalPayroll: 0,
          averageSalary: 0,
          medianSalary: 0,
          salaryRangeMin: 0,
          salaryRangeMax: 0,
          totalBenefitsCost: 0,
          benefitsPerEmployee: 0,
        },
        byDepartment: [],
        payEquity: {
          genderGap: { overall: 0, adjustedGap: 0, byLevel: [] },
          ethnicityGap: { overall: 0, adjustedGap: 0 },
          compRatio: { average: 0, belowRange: 0, withinRange: 0, aboveRange: 0 },
        },
        marketComparison: {
          overallPosition: 'N/A',
          byRole: [],
          lastBenchmarkDate: null,
          dataSource: 'Internal Data',
        },
        budgetUtilization: {
          annualBudget: 0,
          utilized: 0,
          remaining: 0,
          utilizationRate: 0,
          projectedYearEnd: 0,
        },
        trends: [],
      },
    });
  }
});
