import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;

    const employees = await prisma.employee.findMany({
      where: { company: { tenantId } },
      select: {
        id: true,
        joiningDate: true,
        departmentId: true,
        department: { select: { name: true } },
        grade: { select: { name: true } },
      },
    });

    const totalEmployees = employees.length;

    const now = new Date();
    const tenureBuckets = [
      { range: '< 1 year', count: 0 },
      { range: '1-3 years', count: 0 },
      { range: '3-5 years', count: 0 },
      { range: '5-10 years', count: 0 },
      { range: '10+ years', count: 0 },
    ];

    for (const emp of employees) {
      const years = (now.getTime() - new Date(emp.joiningDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (years < 1) tenureBuckets[0].count++;
      else if (years < 3) tenureBuckets[1].count++;
      else if (years < 5) tenureBuckets[2].count++;
      else if (years < 10) tenureBuckets[3].count++;
      else tenureBuckets[4].count++;
    }

    const tenureDistribution = tenureBuckets.map((b) => ({
      range: b.range,
      count: b.count,
      percentage: totalEmployees > 0 ? Math.round((b.count / totalEmployees) * 1000) / 10 : 0,
    }));

    const deptCounts = new Map<string, number>();
    for (const emp of employees) {
      deptCounts.set(emp.department.name, (deptCounts.get(emp.department.name) || 0) + 1);
    }

    const departmentBreakdown = Array.from(deptCounts.entries()).map(([name, count]) => ({
      department: name,
      count,
      percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 1000) / 10 : 0,
    }));

    const avgTenureYears =
      totalEmployees > 0
        ? Math.round(
            (employees.reduce((sum, e) => {
              return sum + (now.getTime() - new Date(e.joiningDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            }, 0) /
              totalEmployees) *
              10
          ) / 10
        : 0;

    const diversityData = {
      generatedAt: new Date().toISOString(),
      totalEmployees,
      gender: {
        distribution: [],
        leadershipRepresentation: {},
        trend: [],
      },
      ethnicity: {
        distribution: [],
        leadershipRepresentation: {},
      },
      age: {
        distribution: [],
        averageAge: 0,
        medianAge: 0,
      },
      tenure: {
        distribution: tenureDistribution,
        averageTenure: avgTenureYears,
      },
      departmentBreakdown,
      payEquity: {
        genderPayGap: 0,
        ethnicityPayGap: 0,
        trend: 'not_available',
        lastAudit: null,
      },
      deiInitiatives: [],
      deiScore: {
        overall: 0,
        representation: 0,
        inclusion: 0,
        belonging: 0,
        industryBenchmark: 0,
      },
    };

    return NextResponse.json({ success: true, data: diversityData });
  } catch (error) {
    console.error('Diversity analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        totalEmployees: 0,
        gender: { distribution: [], leadershipRepresentation: {}, trend: [] },
        ethnicity: { distribution: [], leadershipRepresentation: {} },
        age: { distribution: [], averageAge: 0, medianAge: 0 },
        tenure: { distribution: [], averageTenure: 0 },
        departmentBreakdown: [],
        payEquity: { genderPayGap: 0, ethnicityPayGap: 0, trend: 'not_available', lastAudit: null },
        deiInitiatives: [],
        deiScore: { overall: 0, representation: 0, inclusion: 0, belonging: 0, industryBenchmark: 0 },
      },
    });
  }
});
