import { prisma } from '../lib/prisma';

export interface MetricsQuery {
  organizationId: string;
  departmentId?: string;
  startDate: string;
  endDate: string;
  granularity?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface HeadcountMetrics {
  total: number;
  newHires: number;
  departures: number;
  netChange: number;
  byDepartment: Record<string, number>;
  byLocation: Record<string, number>;
  trend: TrendPoint[];
}

export interface TurnoverMetrics {
  voluntaryRate: number;
  involuntaryRate: number;
  totalRate: number;
  averageTenure: number;
  byDepartment: Record<string, number>;
  byReason: Record<string, number>;
  trend: TrendPoint[];
}

export interface DiversityMetrics {
  genderDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  ethnicityDistribution: Record<string, number>;
  payEquityIndex: number;
  leadershipDiversity: Record<string, number>;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface AggregatedMetrics {
  headcount: HeadcountMetrics;
  turnover: TurnoverMetrics;
  diversity: DiversityMetrics;
  generatedAt: string;
}

export class MetricsService {
  /**
   * Aggregate headcount metrics for the given query parameters.
   * Queries the Employee table grouped by department and location.
   */
  async aggregateHeadcount(query: MetricsQuery): Promise<HeadcountMetrics> {
    const { organizationId: companyId, departmentId, startDate, endDate } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Base filter: active employees for the company
    const baseWhere = {
      companyId,
      isDeleted: false,
      ...(departmentId ? { departmentId } : {}),
    };

    // Total active employees at end of period
    const total = await prisma.employee.count({
      where: {
        ...baseWhere,
        joiningDate: { lte: end },
      },
    });

    // New hires within the period
    const newHires = await prisma.employee.count({
      where: {
        ...baseWhere,
        joiningDate: { gte: start, lte: end },
      },
    });

    // Departures within the period (TERMINATION events in EmploymentHistory)
    const departureRecords = await prisma.employmentHistory.count({
      where: {
        changeType: 'TERMINATION',
        effectiveDate: { gte: start, lte: end },
        isDeleted: false,
      },
    });

    // Headcount grouped by department
    const deptGroups = await prisma.employee.groupBy({
      by: ['departmentId'],
      where: {
        ...baseWhere,
        joiningDate: { lte: end },
      },
      _count: { id: true },
    });

    // Resolve department names
    const byDepartment: Record<string, number> = {};
    for (const group of deptGroups) {
      const dept = await prisma.department.findUnique({
        where: { id: group.departmentId },
        select: { name: true },
      });
      const key = dept?.name ?? group.departmentId;
      byDepartment[key] = group._count.id;
    }

    // Headcount grouped by location
    const locGroups = await prisma.employee.groupBy({
      by: ['locationId'],
      where: {
        ...baseWhere,
        joiningDate: { lte: end },
      },
      _count: { id: true },
    });

    const byLocation: Record<string, number> = {};
    for (const group of locGroups) {
      const loc = await prisma.location.findUnique({
        where: { id: group.locationId },
        select: { name: true },
      });
      const key = loc?.name ?? group.locationId;
      byLocation[key] = group._count.id;
    }

    return {
      total,
      newHires,
      departures: departureRecords,
      netChange: newHires - departureRecords,
      byDepartment,
      byLocation,
      trend: [],
    };
  }

  /**
   * Aggregate turnover metrics for the given query parameters.
   * Queries EmploymentHistory for TERMINATION events.
   */
  async aggregateTurnover(query: MetricsQuery): Promise<TurnoverMetrics> {
    const { organizationId: companyId, departmentId, startDate, endDate } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch all termination events within the period
    const terminations = await prisma.employmentHistory.findMany({
      where: {
        changeType: 'TERMINATION',
        effectiveDate: { gte: start, lte: end },
        isDeleted: false,
        ...(departmentId
          ? { OR: [{ previousDepartmentId: departmentId }, { newDepartmentId: departmentId }] }
          : {}),
      },
      select: {
        reason: true,
        effectiveDate: true,
        previousDepartmentId: true,
      },
    });

    // Total headcount at start of period (for rate calculation)
    const baseWhere = {
      companyId,
      isDeleted: false,
      joiningDate: { lte: start },
      ...(departmentId ? { departmentId } : {}),
    };
    const avgHeadcount = await prisma.employee.count({ where: baseWhere });
    const totalTerminations = terminations.length;

    // Separate voluntary vs involuntary based on reason keyword
    const VOLUNTARY_REASONS = new Set(['RESIGNATION', 'RETIREMENT', 'PERSONAL', 'BETTER_OPPORTUNITY']);
    let voluntaryCount = 0;
    let involuntaryCount = 0;
    const byReason: Record<string, number> = {};
    const byDeptId: Record<string, number> = {};

    for (const t of terminations) {
      const reason = (t.reason ?? 'UNKNOWN').toUpperCase();
      if (VOLUNTARY_REASONS.has(reason)) {
        voluntaryCount++;
      } else {
        involuntaryCount++;
      }
      byReason[reason] = (byReason[reason] ?? 0) + 1;

      if (t.previousDepartmentId) {
        byDeptId[t.previousDepartmentId] = (byDeptId[t.previousDepartmentId] ?? 0) + 1;
      }
    }

    // Resolve department names for byDepartment map
    const byDepartment: Record<string, number> = {};
    for (const [deptId, count] of Object.entries(byDeptId)) {
      const dept = await prisma.department.findUnique({
        where: { id: deptId },
        select: { name: true },
      });
      const key = dept?.name ?? deptId;
      byDepartment[key] = count;
    }

    const base = avgHeadcount > 0 ? avgHeadcount : 1;
    const voluntaryRate = (voluntaryCount / base) * 100;
    const involuntaryRate = (involuntaryCount / base) * 100;
    const totalRate = (totalTerminations / base) * 100;

    // Average tenure: query joining dates of terminated employees
    // Use a simplified proxy: count employees with tenure data
    const averageTenure = 0; // Requires join with Employee.joiningDate — left as 0 for now

    return {
      voluntaryRate: parseFloat(voluntaryRate.toFixed(2)),
      involuntaryRate: parseFloat(involuntaryRate.toFixed(2)),
      totalRate: parseFloat(totalRate.toFixed(2)),
      averageTenure,
      byDepartment,
      byReason,
      trend: [],
    };
  }

  /**
   * Aggregate diversity metrics for the given query parameters.
   * Queries employee demographics where available.
   * Note: Gender/ethnicity stored in Address.country or future Demographics model.
   * For now returns department-level gender proxy via job profile grouping.
   */
  async aggregateDiversity(query: MetricsQuery): Promise<DiversityMetrics> {
    const { organizationId: companyId, departmentId } = query;

    // Count employees per grade as a leadership diversity proxy
    const gradeGroups = await prisma.employee.groupBy({
      by: ['gradeId'],
      where: {
        companyId,
        isDeleted: false,
        ...(departmentId ? { departmentId } : {}),
      },
      _count: { id: true },
    });

    const leadershipDiversity: Record<string, number> = {};
    for (const group of gradeGroups) {
      const grade = await prisma.grade.findUnique({
        where: { id: group.gradeId },
        select: { name: true },
      });
      const key = grade?.name ?? group.gradeId;
      leadershipDiversity[key] = group._count.id;
    }

    // Employee count grouped by employment type as a diversity proxy
    const typeGroups = await prisma.employee.groupBy({
      by: ['typeId'],
      where: {
        companyId,
        isDeleted: false,
        ...(departmentId ? { departmentId } : {}),
      },
      _count: { id: true },
    });

    const employmentTypeDistribution: Record<string, number> = {};
    for (const group of typeGroups) {
      const empType = await prisma.employmentType.findUnique({
        where: { id: group.typeId },
        select: { name: true },
      });
      const key = empType?.name ?? group.typeId;
      employmentTypeDistribution[key] = group._count.id;
    }

    return {
      // Gender/age/ethnicity require dedicated demographics fields — return stubs
      genderDistribution: {},
      ageDistribution: {},
      ethnicityDistribution: {},
      payEquityIndex: 0,
      leadershipDiversity,
    };
  }

  /**
   * Get all aggregated metrics for a given query
   */
  async getAllMetrics(query: MetricsQuery): Promise<AggregatedMetrics> {
    const [headcount, turnover, diversity] = await Promise.all([
      this.aggregateHeadcount(query),
      this.aggregateTurnover(query),
      this.aggregateDiversity(query),
    ]);

    return {
      headcount,
      turnover,
      diversity,
      generatedAt: new Date().toISOString(),
    };
  }
}

export default new MetricsService();
