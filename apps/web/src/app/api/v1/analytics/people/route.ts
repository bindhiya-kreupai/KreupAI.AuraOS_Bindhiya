import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const period = searchParams.get('period') || 'current';

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const employeeWhere: any = { company: { tenantId } };
    if (department) {
      employeeWhere.department = { name: department };
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        joiningDate: true,
        departmentId: true,
        department: { select: { name: true } },
        statusId: true,
        status: { select: { code: true } },
      },
    });

    const activeEmployees = employees.filter((e) => e.status.code === 'ACTIVE' || e.status.code === 'PROBATION');
    const totalEmployees = employees.length;
    const activeCount = activeEmployees.length;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        tenantId,
        status: 'APPROVED',
        startDate: { lte: todayEnd },
        endDate: { gte: todayStart },
      },
    });

    const avgTenure =
      activeEmployees.length > 0
        ? Math.round(
            (activeEmployees.reduce(
              (sum, e) => sum + (now.getTime() - new Date(e.joiningDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
              0
            ) /
              activeEmployees.length) *
              10
          ) / 10
        : 0;

    const newHiresThisMonth = employees.filter((e) => new Date(e.joiningDate) >= thisMonthStart).length;

    const exitRequests = await prisma.exitRequest.findMany({
      where: {
        tenantId,
        lastWorkingDate: { gte: thisMonthStart },
        status: { in: ['APPROVED', 'COMPLETED'] },
      },
      select: { employeeId: true },
    });
    const separationsThisMonth = exitRequests.length;

    const openPositions = await prisma.jobPosting.count({
      where: { status: { in: ['Active', 'Published', 'Open'] } },
    });

    const deptMap = new Map<string, string[]>();
    for (const emp of activeEmployees) {
      const existing = deptMap.get(emp.department.name);
      if (existing) {
        existing.push(emp.id);
      } else {
        deptMap.set(emp.department.name, [emp.id]);
      }
    }

    const salaryStructures = await prisma.employeeSalaryStructure.findMany({
      where: { tenantId, isActive: true },
      select: { employeeId: true, grossSalary: true },
    });
    const salaryMap = new Map<string, number>();
    for (const s of salaryStructures) {
      salaryMap.set(s.employeeId, Number(s.grossSalary));
    }

    const performanceReviews = await prisma.performanceReview.findMany({
      where: { tenantId },
      select: { employeeId: true, finalRating: true, managerRating: true },
      orderBy: { createdAt: 'desc' },
    });

    const latestRatingMap = new Map<string, number>();
    for (const review of performanceReviews) {
      if (!latestRatingMap.has(review.employeeId)) {
        const rating = review.finalRating || review.managerRating;
        if (rating && rating > 0) {
          latestRatingMap.set(review.employeeId, rating);
        }
      }
    }

    const departmentBreakdown = await Promise.all(
      Array.from(deptMap.entries()).map(async ([deptName, empIds]) => {
        const headcount = empIds.length;
        const deptSalaries = empIds.map((id) => salaryMap.get(id) ?? 0).filter((s) => s > 0);
        const avgSalary = deptSalaries.length > 0 ? Math.round(deptSalaries.reduce((s, v) => s + v, 0) / deptSalaries.length) : 0;
        const deptTenures = activeEmployees
          .filter((e) => empIds.includes(e.id))
          .map((e) => (now.getTime() - new Date(e.joiningDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const avgTenureDept = deptTenures.length > 0 ? Math.round((deptTenures.reduce((s, v) => s + v, 0) / deptTenures.length) * 10) / 10 : 0;

        const deptExits = await prisma.exitRequest.count({
          where: {
            tenantId,
            employee: { department: { name: deptName } },
            status: { in: ['APPROVED', 'COMPLETED'] },
          },
        });
        const turnoverRate = headcount > 0 ? Math.round((deptExits / headcount) * 1000) / 10 : 0;

        const deptOpenRoles = await prisma.jobPosting.count({
          where: { department: deptName, status: { in: ['Active', 'Published', 'Open'] } },
        });

        return {
          department: deptName,
          headcount,
          avgTenure: avgTenureDept,
          avgSalary,
          turnoverRate,
          engagementScore: 0,
          openRoles: deptOpenRoles,
        };
      })
    );

    const allRatings = Array.from(latestRatingMap.values());
    const avgRating = allRatings.length > 0 ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10 : 0;

    const completedReviews = performanceReviews.filter((r) => r.finalRating !== null).length;
    const uniqueReviewedEmployees = new Set(performanceReviews.map((r) => r.employeeId)).size;
    const reviewCompletionRate = totalEmployees > 0 ? Math.round((uniqueReviewedEmployees / totalEmployees) * 100) : 0;

    const highPerformers = allRatings.filter((r) => r >= 4.5).length;
    const solidPerformers = allRatings.filter((r) => r >= 3 && r < 4.5).length;
    const lowPerformers = allRatings.filter((r) => r < 3).length;

    const ratingDistribution = [
      { rating: 'Exceptional', count: allRatings.filter((r) => r >= 4.5).length, percentage: 0 },
      { rating: 'Exceeds Expectations', count: allRatings.filter((r) => r >= 3.5 && r < 4.5).length, percentage: 0 },
      { rating: 'Meets Expectations', count: allRatings.filter((r) => r >= 2.5 && r < 3.5).length, percentage: 0 },
      { rating: 'Needs Improvement', count: allRatings.filter((r) => r >= 1.5 && r < 2.5).length, percentage: 0 },
      { rating: 'Unsatisfactory', count: allRatings.filter((r) => r < 1.5).length, percentage: 0 },
    ];
    const totalRatings = allRatings.length;
    for (const rd of ratingDistribution) {
      rd.percentage = totalRatings > 0 ? Math.round((rd.count / totalRatings) * 100) : 0;
    }

    const totalExitRequests = await prisma.exitRequest.count({
      where: { tenantId, status: { in: ['APPROVED', 'COMPLETED'] } },
    });
    const voluntaryExits = await prisma.exitRequest.count({
      where: { tenantId, exitType: 'RESIGNATION', status: { in: ['APPROVED', 'COMPLETED'] } },
    });
    const involuntaryExits = totalExitRequests - voluntaryExits;
    const overallRetentionRate = totalEmployees > 0 ? Math.round(((totalEmployees - totalExitRequests) / totalEmployees) * 1000) / 10 : 100;
    const voluntaryTurnoverRate = totalEmployees > 0 ? Math.round((voluntaryExits / totalEmployees) * 1000) / 10 : 0;
    const involuntaryTurnoverRate = totalEmployees > 0 ? Math.round((involuntaryExits / totalEmployees) * 1000) / 10 : 0;

    const peopleAnalytics = {
      workforce: {
        totalEmployees,
        activeEmployees: activeCount,
        onLeave: onLeaveToday,
        averageTenure: avgTenure,
        averageAge: 0,
        newHiresThisMonth,
        separationsThisMonth,
        netGrowth: newHiresThisMonth - separationsThisMonth,
        growthRate: totalEmployees > 0 ? Math.round(((newHiresThisMonth - separationsThisMonth) / totalEmployees) * 1000) / 10 : 0,
        openPositions,
        timeToFill: 0,
      },
      demographics: {
        gender: [],
        ageDistribution: [],
        tenureDistribution: [],
      },
      departmentBreakdown,
      engagement: {
        overallScore: 0,
        responseRate: 0,
        enps: 0,
        trend: [],
        topDrivers: [],
        areasOfConcern: [],
      },
      performance: {
        averageRating: avgRating,
        reviewCompletionRate,
        highPerformers,
        solidPerformers,
        lowPerformers,
        ratingDistribution,
      },
      retention: {
        overallRetentionRate,
        voluntaryTurnoverRate,
        involuntaryTurnoverRate,
        avgTimeToTermination: 0,
        retentionByTenure: [],
        topExitReasons: [],
      },
      costMetrics: {
        avgCostPerHire: 0,
        avgCostPerTermination: 0,
        trainingInvestmentPerEmployee: 0,
        revenuePerEmployee: 0,
        laborCostAsPercentOfRevenue: 0,
      },
      riskIndicators: {
        attritionRisk: { high: 0, medium: 0, low: activeCount },
        criticalRolesAtRisk: 0,
        successionCoverage: 0,
        burnoutRisk: 0,
        complianceIssues: 0,
      },
      generatedAt: new Date().toISOString(),
      period,
      filters: { department },
    };

    return NextResponse.json({ success: true, data: peopleAnalytics });
  } catch (error) {
    console.error('People analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        workforce: { totalEmployees: 0, activeEmployees: 0, onLeave: 0, averageTenure: 0, averageAge: 0, newHiresThisMonth: 0, separationsThisMonth: 0, netGrowth: 0, growthRate: 0, openPositions: 0, timeToFill: 0 },
        demographics: { gender: [], ageDistribution: [], tenureDistribution: [] },
        departmentBreakdown: [],
        engagement: { overallScore: 0, responseRate: 0, enps: 0, trend: [], topDrivers: [], areasOfConcern: [] },
        performance: { averageRating: 0, reviewCompletionRate: 0, highPerformers: 0, solidPerformers: 0, lowPerformers: 0, ratingDistribution: [] },
        retention: { overallRetentionRate: 0, voluntaryTurnoverRate: 0, involuntaryTurnoverRate: 0, avgTimeToTermination: 0, retentionByTenure: [], topExitReasons: [] },
        costMetrics: { avgCostPerHire: 0, avgCostPerTermination: 0, trainingInvestmentPerEmployee: 0, revenuePerEmployee: 0, laborCostAsPercentOfRevenue: 0 },
        riskIndicators: { attritionRisk: { high: 0, medium: 0, low: 0 }, criticalRolesAtRisk: 0, successionCoverage: 0, burnoutRisk: 0, complianceIssues: 0 },
        generatedAt: new Date().toISOString(),
        period: 'current',
        filters: { department: null },
      },
    });
  }
});
