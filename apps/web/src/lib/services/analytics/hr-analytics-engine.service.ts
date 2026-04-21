/**
 * HR Analytics Engine Service
 *
 * Provides real-time HR metrics, interactive dashboard data, drill-down analytics,
 * and benchmark comparisons for the AuraOS HCM platform.
 *
 * Covers:
 *  - Dashboard KPI summaries (headcount, turnover, tenure, absenteeism, etc.)
 *  - Headcount analytics with multi-dimensional breakdowns
 *  - Turnover / attrition analysis
 *  - Attendance metrics and overtime trends
 *  - Payroll cost analysis
 *  - Leave utilization metrics
 *  - Recruitment funnel analytics
 *  - Compliance health scorecard
 *  - Industry benchmark comparisons
 *  - Drill-down capability for any metric dimension
 *  - Executive summary generation
 *  - Export to PDF/CSV
 */

import { prisma } from '@aura/database';

// ============================================================================
// TYPES
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardMetrics {
  headcount: number;
  turnoverRate: number;
  avgTenure: number;
  absenteeismRate: number;
  overtimeRate: number;
  costPerEmployee: number;
  openPositions: number;
  timeToHire: number;
  trainingHours: number;
  satisfactionScore: number;
  /** Bilingual labels */
  labels: {
    en: Record<string, string>;
    ar: Record<string, string>;
  };
}

export interface HeadcountAnalytics {
  total: number;
  byDepartment: { department: string; departmentAr?: string; count: number; percentage: number }[];
  byLocation: { location: string; locationAr?: string; count: number; percentage: number }[];
  byGender: { male: number; female: number; other: number; undisclosed: number };
  byNationality: { nationality: string; count: number; percentage: number }[];
  byEmploymentType: { type: string; typeAr?: string; count: number; percentage: number }[];
  growthTrend: { month: string; headcount: number; netChange: number }[];
  ageDistribution: { range: string; count: number; percentage: number }[];
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface TurnoverAnalytics {
  rate: number;
  voluntaryRate: number;
  involuntaryRate: number;
  byDepartment: { department: string; departmentAr?: string; rate: number; count: number }[];
  byTenure: { range: string; count: number; percentage: number }[];
  byReason: { reason: string; reasonAr?: string; count: number; percentage: number }[];
  monthlyTrend: { month: string; exits: number; rate: number }[];
  retentionRate: number;
  avgTenure: number;
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface AttendanceAnalytics {
  avgPresentRate: number;
  lateRate: number;
  absentRate: number;
  overtimeHours: number;
  byDepartment: { department: string; departmentAr?: string; presentRate: number; lateRate: number; absentRate: number }[];
  monthlyTrend: { month: string; presentRate: number; lateRate: number; absentRate: number; overtimeHours: number }[];
  peakAbsenceDays: { dayOfWeek: string; avgAbsenceRate: number }[];
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface PayrollAnalytics {
  totalCost: number;
  avgSalary: number;
  medianSalary: number;
  byDepartment: { department: string; departmentAr?: string; totalCost: number; avgSalary: number; headcount: number }[];
  byCountry: { country: string; totalCost: number; avgSalary: number; headcount: number; currency: string }[];
  costTrend: { month: string; totalCost: number; avgCost: number; employeeCount: number }[];
  componentBreakdown: { component: string; componentAr?: string; totalAmount: number; percentage: number }[];
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface LeaveAnalytics {
  utilizationRate: number;
  byType: { type: string; typeAr?: string; totalDays: number; avgDays: number; utilizationRate: number }[];
  byDepartment: { department: string; departmentAr?: string; avgDaysTaken: number; utilizationRate: number }[];
  monthlyTrend: { month: string; totalLeaves: number; avgDuration: number }[];
  topLeaveDays: { day: string; count: number }[];
  carryForwardRate: number;
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface RecruitmentAnalytics {
  openPositions: number;
  applicationsReceived: number;
  offersExtended: number;
  hiredCount: number;
  timeToHire: number;
  costPerHire: number;
  sourceEffectiveness: { source: string; applications: number; hires: number; conversionRate: number }[];
  funnelConversion: { stage: string; stageAr?: string; count: number; conversionRate: number; dropOffRate: number }[];
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface ComplianceScorecard {
  overallScore: number;
  byCountry: { country: string; score: number; totalItems: number; compliantItems: number }[];
  overdueItems: { id: string; module: string; description: string; descriptionAr?: string; dueDate: Date; severity: string }[];
  upcomingDeadlines: { id: string; module: string; description: string; descriptionAr?: string; dueDate: Date; daysRemaining: number }[];
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface BenchmarkComparison {
  metric: string;
  metricAr?: string;
  companyValue: number;
  industryAvg: number;
  industryP25: number;
  industryP75: number;
  rating: 'BELOW_P25' | 'P25_TO_AVG' | 'AVG_TO_P75' | 'ABOVE_P75';
}

export interface DrillDownFilter {
  dimension: string;
  value: string;
  dateRange?: DateRange;
  department?: string;
  location?: string;
  country?: string;
}

export interface DrillDownResult {
  dimension: string;
  value: string;
  records: Record<string, unknown>[];
  summary: Record<string, number>;
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export interface ExecutiveSummary {
  generatedAt: Date;
  dateRange: DateRange;
  highlights: { metric: string; metricAr?: string; value: number; trend: 'UP' | 'DOWN' | 'STABLE'; changePercent: number }[];
  risks: { area: string; areaAr?: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; description: string; descriptionAr?: string }[];
  recommendations: { priority: number; title: string; titleAr?: string; description: string; descriptionAr?: string; impact: string }[];
  labels: { en: Record<string, string>; ar: Record<string, string> };
}

export type ExportFormat = 'PDF' | 'CSV' | 'EXCEL';

// ============================================================================
// HELPER UTILITIES
// ============================================================================

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthsDiff(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 12);
  return { start, end };
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 10000) / 100;
}

function getDayOfWeekName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Unknown';
}

// ============================================================================
// HR ANALYTICS ENGINE SERVICE
// ============================================================================

export class HRAnalyticsEngineService {
  /**
   * Get dashboard KPI metrics summary.
   * Returns top-level metrics for the executive dashboard.
   */
  static async getDashboardMetrics(
    tenantId: string,
    dateRange?: DateRange
  ): Promise<DashboardMetrics> {
    const range = dateRange || getDefaultDateRange();

    // Active employees for the tenant
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);

    const activeEmployees = await prisma.employee.count({
      where: {
        companyId: { in: companyIds },
        isDeleted: false,
        status: { code: 'ACTIVE' },
      },
    });

    // Exits within date range
    const exitCount = await prisma.exitRequest.count({
      where: {
        tenantId,
        status: 'COMPLETED',
        lastWorkingDate: { gte: range.start, lte: range.end },
      },
    });

    const periodMonths = Math.max(monthsDiff(range.start, range.end), 1);
    const annualizedTurnover =
      activeEmployees > 0
        ? ((exitCount / activeEmployees) * 12) / periodMonths
        : 0;

    // Average tenure (months from joiningDate to now)
    const employees = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isDeleted: false },
      select: { joiningDate: true },
    });
    const now = new Date();
    const totalTenureMonths = employees.reduce(
      (sum, e) => sum + monthsDiff(e.joiningDate, now),
      0
    );
    const avgTenureYears =
      employees.length > 0 ? totalTenureMonths / employees.length / 12 : 0;

    // Absenteeism rate
    const totalAttendanceRecords = await prisma.attendanceRecord.count({
      where: {
        tenantId,
        date: { gte: range.start, lte: range.end },
        isDeleted: false,
      },
    });
    const absentRecords = await prisma.attendanceRecord.count({
      where: {
        tenantId,
        date: { gte: range.start, lte: range.end },
        status: 'ABSENT',
        isDeleted: false,
      },
    });
    const absenteeismRate =
      totalAttendanceRecords > 0
        ? (absentRecords / totalAttendanceRecords) * 100
        : 0;

    // Overtime rate
    const attendanceWithOvertime = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        date: { gte: range.start, lte: range.end },
        overtimeHours: { gt: 0 },
        isDeleted: false,
      },
      select: { overtimeHours: true },
    });
    const totalOvertimeHours = attendanceWithOvertime.reduce(
      (sum, r) => sum + r.overtimeHours,
      0
    );
    const overtimeRate =
      totalAttendanceRecords > 0
        ? (attendanceWithOvertime.length / totalAttendanceRecords) * 100
        : 0;

    // Cost per employee from latest payroll run
    const latestPayrollRun = await prisma.payrollRun.findFirst({
      where: { tenantId, status: 'PAID', isDeleted: false },
      orderBy: { paidAt: 'desc' },
      select: { totalEmployerCost: true, totalEmployees: true },
    });
    const costPerEmployee =
      latestPayrollRun && latestPayrollRun.totalEmployees > 0
        ? Number(latestPayrollRun.totalEmployerCost) / latestPayrollRun.totalEmployees
        : 0;

    // Open positions
    const openPositions = await prisma.position.count({
      where: { tenantId, status: 'OPEN', isDeleted: false, isActive: true },
    });

    // Time to hire (avg days from posting to offer acceptance)
    const hiredApplications = await prisma.candidateApplication.findMany({
      where: {
        status: 'hired',
        jobPosting: { postedDate: { gte: range.start, lte: range.end } },
      },
      select: {
        appliedDate: true,
        jobPosting: { select: { postedDate: true } },
        offers: { where: { status: 'accepted' }, select: { acceptedDate: true } },
      },
    });
    let totalDaysToHire = 0;
    let hiredWithDates = 0;
    for (const app of hiredApplications) {
      const offerAccepted = app.offers[0]?.acceptedDate;
      const postDate = app.jobPosting.postedDate;
      if (offerAccepted && postDate) {
        totalDaysToHire += Math.ceil(
          (offerAccepted.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        hiredWithDates++;
      }
    }
    const timeToHire = hiredWithDates > 0 ? Math.round(totalDaysToHire / hiredWithDates) : 0;

    // Training hours (from sessions in date range)
    const sessions = await prisma.trainingSession.findMany({
      where: {
        tenantId,
        startDate: { gte: range.start },
        endDate: { lte: range.end },
        isDeleted: false,
      },
      select: { startDate: true, endDate: true, attendees: { select: { id: true } } },
    });
    let totalTrainingHours = 0;
    for (const s of sessions) {
      const durationHours =
        (s.endDate.getTime() - s.startDate.getTime()) / (1000 * 60 * 60);
      totalTrainingHours += durationHours * s.attendees.length;
    }
    const avgTrainingHours =
      activeEmployees > 0 ? totalTrainingHours / activeEmployees : 0;

    // Satisfaction score (from training feedback average)
    const feedbackRatings = await prisma.sessionAttendee.findMany({
      where: {
        session: {
          tenantId,
          startDate: { gte: range.start },
          endDate: { lte: range.end },
          isDeleted: false,
        },
        rating: { not: null },
      },
      select: { rating: true },
    });
    const avgSatisfaction =
      feedbackRatings.length > 0
        ? feedbackRatings.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackRatings.length
        : 0;

    return {
      headcount: activeEmployees,
      turnoverRate: Math.round(annualizedTurnover * 10000) / 100,
      avgTenure: Math.round(avgTenureYears * 10) / 10,
      absenteeismRate: Math.round(absenteeismRate * 100) / 100,
      overtimeRate: Math.round(overtimeRate * 100) / 100,
      costPerEmployee: Math.round(costPerEmployee * 100) / 100,
      openPositions,
      timeToHire,
      trainingHours: Math.round(avgTrainingHours * 10) / 10,
      satisfactionScore: Math.round(avgSatisfaction * 10) / 10,
      labels: {
        en: {
          headcount: 'Total Headcount',
          turnoverRate: 'Turnover Rate (%)',
          avgTenure: 'Average Tenure (Years)',
          absenteeismRate: 'Absenteeism Rate (%)',
          overtimeRate: 'Overtime Rate (%)',
          costPerEmployee: 'Cost Per Employee',
          openPositions: 'Open Positions',
          timeToHire: 'Time to Hire (Days)',
          trainingHours: 'Training Hours (Per Employee)',
          satisfactionScore: 'Satisfaction Score',
        },
        ar: {
          headcount: 'إجمالي عدد الموظفين',
          turnoverRate: 'معدل الدوران (%)',
          avgTenure: 'متوسط مدة الخدمة (سنوات)',
          absenteeismRate: 'معدل الغياب (%)',
          overtimeRate: 'معدل العمل الإضافي (%)',
          costPerEmployee: 'التكلفة لكل موظف',
          openPositions: 'الوظائف الشاغرة',
          timeToHire: 'وقت التوظيف (أيام)',
          trainingHours: 'ساعات التدريب (لكل موظف)',
          satisfactionScore: 'درجة الرضا',
        },
      },
    };
  }

  /**
   * Get headcount analytics with multi-dimensional breakdowns.
   */
  static async getHeadcountAnalytics(
    tenantId: string,
    filter?: Partial<DrillDownFilter>
  ): Promise<HeadcountAnalytics> {
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);

    const whereClause: Record<string, unknown> = {
      companyId: { in: companyIds },
      isDeleted: false,
      status: { code: 'ACTIVE' },
    };

    if (filter?.department) {
      whereClause.department = { name: filter.department };
    }
    if (filter?.location) {
      whereClause.location = { name: filter.location };
    }

    const allEmployees = await prisma.employee.findMany({
      where: whereClause as any,
      select: {
        id: true,
        joiningDate: true,
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true, address: { select: { country: { select: { name: true } } } } } },
        type: { select: { code: true, name: true } },
      },
    });

    const total = allEmployees.length;

    // By Department
    const deptMap = new Map<string, number>();
    for (const emp of allEmployees) {
      const deptName = emp.department.name;
      deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
    }
    const byDepartment = Array.from(deptMap.entries())
      .map(([department, count]) => ({
        department,
        count,
        percentage: calculatePercentage(count, total),
      }))
      .sort((a, b) => b.count - a.count);

    // By Location
    const locMap = new Map<string, number>();
    for (const emp of allEmployees) {
      const locName = emp.location.name;
      locMap.set(locName, (locMap.get(locName) || 0) + 1);
    }
    const byLocation = Array.from(locMap.entries())
      .map(([location, count]) => ({
        location,
        count,
        percentage: calculatePercentage(count, total),
      }))
      .sort((a, b) => b.count - a.count);

    // By Gender (not directly in schema - use placeholder structure)
    // Note: Gender is not in the current Employee schema; return defaults
    const byGender = { male: 0, female: 0, other: 0, undisclosed: total };

    // By Nationality (from location -> country)
    const nationalityMap = new Map<string, number>();
    for (const emp of allEmployees) {
      const country = emp.location?.address?.country?.name || 'Unknown';
      nationalityMap.set(country, (nationalityMap.get(country) || 0) + 1);
    }
    const byNationality = Array.from(nationalityMap.entries())
      .map(([nationality, count]) => ({
        nationality,
        count,
        percentage: calculatePercentage(count, total),
      }))
      .sort((a, b) => b.count - a.count);

    // By Employment Type
    const typeMap = new Map<string, number>();
    for (const emp of allEmployees) {
      const typeName = emp.type.name;
      typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);
    }
    const byEmploymentType = Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: calculatePercentage(count, total),
      }))
      .sort((a, b) => b.count - a.count);

    // Growth Trend (last 12 months based on joiningDate)
    const growthTrend: { month: string; headcount: number; netChange: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthKey = getMonthKey(monthDate);

      // Count employees who were active during that month (joined before month end)
      const headcountAtMonth = allEmployees.filter(
        (e) => e.joiningDate <= monthEnd
      ).length;

      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);
      const prevHeadcount = allEmployees.filter(
        (e) => e.joiningDate <= prevMonthEnd
      ).length;

      growthTrend.push({
        month: monthKey,
        headcount: headcountAtMonth,
        netChange: headcountAtMonth - prevHeadcount,
      });
    }

    // Age Distribution (based on joining date as proxy since DOB not in schema)
    // Using tenure ranges instead
    const ageDistribution = [
      { range: '0-1 years', count: 0, percentage: 0 },
      { range: '1-3 years', count: 0, percentage: 0 },
      { range: '3-5 years', count: 0, percentage: 0 },
      { range: '5-10 years', count: 0, percentage: 0 },
      { range: '10+ years', count: 0, percentage: 0 },
    ];
    for (const emp of allEmployees) {
      const tenureYears = monthsDiff(emp.joiningDate, now) / 12;
      if (tenureYears < 1) ageDistribution[0].count++;
      else if (tenureYears < 3) ageDistribution[1].count++;
      else if (tenureYears < 5) ageDistribution[2].count++;
      else if (tenureYears < 10) ageDistribution[3].count++;
      else ageDistribution[4].count++;
    }
    for (const bucket of ageDistribution) {
      bucket.percentage = calculatePercentage(bucket.count, total);
    }

    return {
      total,
      byDepartment,
      byLocation,
      byGender,
      byNationality,
      byEmploymentType,
      growthTrend,
      ageDistribution,
      labels: {
        en: {
          title: 'Headcount Analytics',
          total: 'Total Employees',
          byDepartment: 'By Department',
          byLocation: 'By Location',
          byGender: 'By Gender',
          byNationality: 'By Nationality',
          byEmploymentType: 'By Employment Type',
          growthTrend: 'Headcount Growth Trend',
          ageDistribution: 'Tenure Distribution',
        },
        ar: {
          title: 'تحليلات عدد الموظفين',
          total: 'إجمالي الموظفين',
          byDepartment: 'حسب القسم',
          byLocation: 'حسب الموقع',
          byGender: 'حسب الجنس',
          byNationality: 'حسب الجنسية',
          byEmploymentType: 'حسب نوع التوظيف',
          growthTrend: 'اتجاه نمو عدد الموظفين',
          ageDistribution: 'توزيع مدة الخدمة',
        },
      },
    };
  }

  /**
   * Get turnover/attrition analytics for a given date range.
   */
  static async getTurnoverAnalytics(
    tenantId: string,
    dateRange: DateRange
  ): Promise<TurnoverAnalytics> {
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);

    // Total active employees (denominator)
    const activeCount = await prisma.employee.count({
      where: {
        companyId: { in: companyIds },
        isDeleted: false,
        status: { code: 'ACTIVE' },
      },
    });

    // All exits in the date range
    const exits = await prisma.exitRequest.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        lastWorkingDate: { gte: dateRange.start, lte: dateRange.end },
      },
      select: {
        id: true,
        exitType: true,
        reason: true,
        lastWorkingDate: true,
        employee: {
          select: {
            joiningDate: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    const totalExits = exits.length;
    const periodMonths = Math.max(monthsDiff(dateRange.start, dateRange.end), 1);
    const avgHeadcount = activeCount + totalExits / 2; // Approximation

    const annualizedRate =
      avgHeadcount > 0 ? ((totalExits / avgHeadcount) * 12) / periodMonths : 0;

    // Voluntary vs Involuntary
    const voluntaryExits = exits.filter(
      (e) => e.exitType === 'RESIGNATION' || e.exitType === 'RETIREMENT'
    );
    const involuntaryExits = exits.filter(
      (e) => e.exitType === 'TERMINATION' || e.exitType === 'CONTRACT_END'
    );

    const voluntaryRate =
      avgHeadcount > 0
        ? ((voluntaryExits.length / avgHeadcount) * 12) / periodMonths
        : 0;
    const involuntaryRate =
      avgHeadcount > 0
        ? ((involuntaryExits.length / avgHeadcount) * 12) / periodMonths
        : 0;

    // By Department
    const deptExitMap = new Map<string, number>();
    for (const exit of exits) {
      const dept = exit.employee.department.name;
      deptExitMap.set(dept, (deptExitMap.get(dept) || 0) + 1);
    }
    const byDepartment = Array.from(deptExitMap.entries()).map(([department, count]) => ({
      department,
      rate: avgHeadcount > 0 ? Math.round((count / avgHeadcount) * 10000) / 100 : 0,
      count,
    }));

    // By Tenure at exit
    const tenureBuckets = [
      { range: '< 6 months', min: 0, max: 6, count: 0 },
      { range: '6-12 months', min: 6, max: 12, count: 0 },
      { range: '1-2 years', min: 12, max: 24, count: 0 },
      { range: '2-5 years', min: 24, max: 60, count: 0 },
      { range: '5+ years', min: 60, max: Infinity, count: 0 },
    ];
    for (const exit of exits) {
      const tenureMonths = monthsDiff(exit.employee.joiningDate, exit.lastWorkingDate);
      for (const bucket of tenureBuckets) {
        if (tenureMonths >= bucket.min && tenureMonths < bucket.max) {
          bucket.count++;
          break;
        }
      }
    }
    const byTenure = tenureBuckets.map((b) => ({
      range: b.range,
      count: b.count,
      percentage: calculatePercentage(b.count, totalExits),
    }));

    // By Reason
    const reasonMap = new Map<string, number>();
    for (const exit of exits) {
      const reason = exit.reason || exit.exitType;
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    }
    const byReason = Array.from(reasonMap.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: calculatePercentage(count, totalExits),
      }))
      .sort((a, b) => b.count - a.count);

    // Monthly Trend
    const monthlyTrend: { month: string; exits: number; rate: number }[] = [];
    const monthMap = new Map<string, number>();
    for (const exit of exits) {
      const key = getMonthKey(exit.lastWorkingDate);
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    }

    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const key = getMonthKey(current);
      const monthExits = monthMap.get(key) || 0;
      monthlyTrend.push({
        month: key,
        exits: monthExits,
        rate: avgHeadcount > 0 ? Math.round((monthExits / avgHeadcount) * 12 * 10000) / 100 : 0,
      });
      current.setMonth(current.getMonth() + 1);
    }

    // Average tenure of leavers
    let totalLeaverTenure = 0;
    for (const exit of exits) {
      totalLeaverTenure += monthsDiff(exit.employee.joiningDate, exit.lastWorkingDate);
    }
    const avgTenure = totalExits > 0 ? totalLeaverTenure / totalExits / 12 : 0;

    const retentionRate = 100 - annualizedRate * 100;

    return {
      rate: Math.round(annualizedRate * 10000) / 100,
      voluntaryRate: Math.round(voluntaryRate * 10000) / 100,
      involuntaryRate: Math.round(involuntaryRate * 10000) / 100,
      byDepartment,
      byTenure,
      byReason,
      monthlyTrend,
      retentionRate: Math.round(Math.max(retentionRate, 0) * 100) / 100,
      avgTenure: Math.round(avgTenure * 10) / 10,
      labels: {
        en: {
          title: 'Turnover Analytics',
          rate: 'Annualized Turnover Rate',
          voluntaryRate: 'Voluntary Turnover',
          involuntaryRate: 'Involuntary Turnover',
          retentionRate: 'Retention Rate',
          avgTenure: 'Avg Tenure of Leavers (Years)',
        },
        ar: {
          title: 'تحليلات الدوران الوظيفي',
          rate: 'معدل الدوران السنوي',
          voluntaryRate: 'الدوران الطوعي',
          involuntaryRate: 'الدوران غير الطوعي',
          retentionRate: 'معدل الاحتفاظ',
          avgTenure: 'متوسط مدة خدمة المغادرين (سنوات)',
        },
      },
    };
  }

  /**
   * Get attendance analytics with metrics and breakdowns.
   */
  static async getAttendanceAnalytics(
    tenantId: string,
    dateRange: DateRange
  ): Promise<AttendanceAnalytics> {
    // All attendance records in the period
    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        date: { gte: dateRange.start, lte: dateRange.end },
        isDeleted: false,
      },
      select: {
        status: true,
        isLate: true,
        overtimeHours: true,
        date: true,
        employeeId: true,
      },
    });

    const totalRecords = records.length;
    const presentRecords = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const lateRecords = records.filter((r) => r.isLate).length;
    const absentRecords = records.filter((r) => r.status === 'ABSENT').length;
    const totalOvertimeHours = records.reduce((sum, r) => sum + r.overtimeHours, 0);

    const avgPresentRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
    const lateRate = totalRecords > 0 ? (lateRecords / totalRecords) * 100 : 0;
    const absentRate = totalRecords > 0 ? (absentRecords / totalRecords) * 100 : 0;

    // By Department - get employee department mapping
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);

    const employeeDepts = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isDeleted: false },
      select: { id: true, department: { select: { name: true } } },
    });
    const empDeptMap = new Map<string, string>();
    for (const emp of employeeDepts) {
      empDeptMap.set(emp.id, emp.department.name);
    }

    const deptStats = new Map<string, { total: number; present: number; late: number; absent: number }>();
    for (const rec of records) {
      const dept = empDeptMap.get(rec.employeeId) || 'Unknown';
      if (!deptStats.has(dept)) {
        deptStats.set(dept, { total: 0, present: 0, late: 0, absent: 0 });
      }
      const stats = deptStats.get(dept)!;
      stats.total++;
      if (rec.status === 'PRESENT' || rec.status === 'LATE') stats.present++;
      if (rec.isLate) stats.late++;
      if (rec.status === 'ABSENT') stats.absent++;
    }
    const byDepartment = Array.from(deptStats.entries()).map(([department, stats]) => ({
      department,
      presentRate: stats.total > 0 ? Math.round((stats.present / stats.total) * 10000) / 100 : 0,
      lateRate: stats.total > 0 ? Math.round((stats.late / stats.total) * 10000) / 100 : 0,
      absentRate: stats.total > 0 ? Math.round((stats.absent / stats.total) * 10000) / 100 : 0,
    }));

    // Monthly Trend
    const monthStats = new Map<string, { total: number; present: number; late: number; absent: number; overtime: number }>();
    for (const rec of records) {
      const key = getMonthKey(rec.date);
      if (!monthStats.has(key)) {
        monthStats.set(key, { total: 0, present: 0, late: 0, absent: 0, overtime: 0 });
      }
      const stats = monthStats.get(key)!;
      stats.total++;
      if (rec.status === 'PRESENT' || rec.status === 'LATE') stats.present++;
      if (rec.isLate) stats.late++;
      if (rec.status === 'ABSENT') stats.absent++;
      stats.overtime += rec.overtimeHours;
    }
    const monthlyTrend = Array.from(monthStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        presentRate: stats.total > 0 ? Math.round((stats.present / stats.total) * 10000) / 100 : 0,
        lateRate: stats.total > 0 ? Math.round((stats.late / stats.total) * 10000) / 100 : 0,
        absentRate: stats.total > 0 ? Math.round((stats.absent / stats.total) * 10000) / 100 : 0,
        overtimeHours: Math.round(stats.overtime * 10) / 10,
      }));

    // Peak Absence Days (by day of week)
    const dayAbsence = new Map<number, { total: number; absent: number }>();
    for (const rec of records) {
      const dayIdx = rec.date.getDay();
      if (!dayAbsence.has(dayIdx)) {
        dayAbsence.set(dayIdx, { total: 0, absent: 0 });
      }
      const stats = dayAbsence.get(dayIdx)!;
      stats.total++;
      if (rec.status === 'ABSENT') stats.absent++;
    }
    const peakAbsenceDays = Array.from(dayAbsence.entries())
      .map(([dayIdx, stats]) => ({
        dayOfWeek: getDayOfWeekName(dayIdx),
        avgAbsenceRate: stats.total > 0 ? Math.round((stats.absent / stats.total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.avgAbsenceRate - a.avgAbsenceRate);

    return {
      avgPresentRate: Math.round(avgPresentRate * 100) / 100,
      lateRate: Math.round(lateRate * 100) / 100,
      absentRate: Math.round(absentRate * 100) / 100,
      overtimeHours: Math.round(totalOvertimeHours * 10) / 10,
      byDepartment,
      monthlyTrend,
      peakAbsenceDays,
      labels: {
        en: {
          title: 'Attendance Analytics',
          avgPresentRate: 'Average Present Rate (%)',
          lateRate: 'Late Rate (%)',
          absentRate: 'Absent Rate (%)',
          overtimeHours: 'Total Overtime Hours',
        },
        ar: {
          title: 'تحليلات الحضور',
          avgPresentRate: 'متوسط معدل الحضور (%)',
          lateRate: 'معدل التأخير (%)',
          absentRate: 'معدل الغياب (%)',
          overtimeHours: 'إجمالي ساعات العمل الإضافي',
        },
      },
    };
  }

  /**
   * Get payroll cost analytics for the given date range.
   */
  static async getPayrollAnalytics(
    tenantId: string,
    dateRange: DateRange
  ): Promise<PayrollAnalytics> {
    // Payroll runs in range
    const payrollRuns = await prisma.payrollRun.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: { in: ['PAID', 'APPROVED'] },
        processedAt: { gte: dateRange.start, lte: dateRange.end },
      },
      select: {
        id: true,
        payrollMonth: true,
        totalGrossSalary: true,
        totalNetSalary: true,
        totalDeductions: true,
        totalEmployerCost: true,
        totalEmployees: true,
        currency: true,
      },
    });

    // Get payslips for detailed analysis
    const runIds = payrollRuns.map((r) => r.id);
    const payslips = await prisma.payslip.findMany({
      where: { payrollRunId: { in: runIds }, isDeleted: false },
      select: {
        employeeId: true,
        grossSalary: true,
        netSalary: true,
        basicSalary: true,
        totalEarnings: true,
        totalDeductions: true,
        earnings: true,
      },
    });

    // Total cost
    const totalCost = payrollRuns.reduce((sum, r) => sum + Number(r.totalEmployerCost), 0);
    const latestRunEmployees = payrollRuns.length > 0
      ? payrollRuns[payrollRuns.length - 1].totalEmployees
      : 0;

    // Salary calculations
    const grossSalaries = payslips.map((p) => Number(p.grossSalary));
    const avgSalary = grossSalaries.length > 0
      ? grossSalaries.reduce((a, b) => a + b, 0) / grossSalaries.length
      : 0;
    const medianSalary = calculateMedian(grossSalaries);

    // By Department
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);
    const employeeDepts = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isDeleted: false },
      select: { id: true, department: { select: { name: true } } },
    });
    const empDeptMap = new Map<string, string>();
    for (const emp of employeeDepts) {
      empDeptMap.set(emp.id, emp.department.name);
    }

    const deptCosts = new Map<string, { total: number; count: number }>();
    for (const slip of payslips) {
      const dept = empDeptMap.get(slip.employeeId) || 'Unknown';
      if (!deptCosts.has(dept)) {
        deptCosts.set(dept, { total: 0, count: 0 });
      }
      const stats = deptCosts.get(dept)!;
      stats.total += Number(slip.grossSalary);
      stats.count++;
    }
    const byDepartment = Array.from(deptCosts.entries())
      .map(([department, stats]) => ({
        department,
        totalCost: Math.round(stats.total * 100) / 100,
        avgSalary: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
        headcount: stats.count,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    // By Country (from employee location -> address -> country)
    const employeeCountries = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isDeleted: false },
      select: {
        id: true,
        location: { select: { address: { select: { country: { select: { name: true, currency: true } } } } } },
      },
    });
    const empCountryMap = new Map<string, { name: string; currency: string }>();
    for (const emp of employeeCountries) {
      const country = emp.location?.address?.country;
      if (country) {
        empCountryMap.set(emp.id, { name: country.name, currency: country.currency });
      }
    }

    const countryCosts = new Map<string, { total: number; count: number; currency: string }>();
    for (const slip of payslips) {
      const countryInfo = empCountryMap.get(slip.employeeId) || { name: 'Unknown', currency: 'USD' };
      if (!countryCosts.has(countryInfo.name)) {
        countryCosts.set(countryInfo.name, { total: 0, count: 0, currency: countryInfo.currency });
      }
      const stats = countryCosts.get(countryInfo.name)!;
      stats.total += Number(slip.grossSalary);
      stats.count++;
    }
    const byCountry = Array.from(countryCosts.entries())
      .map(([country, stats]) => ({
        country,
        totalCost: Math.round(stats.total * 100) / 100,
        avgSalary: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
        headcount: stats.count,
        currency: stats.currency,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    // Cost Trend (monthly)
    const costTrend = payrollRuns
      .sort((a, b) => a.payrollMonth.localeCompare(b.payrollMonth))
      .map((run) => ({
        month: run.payrollMonth,
        totalCost: Number(run.totalEmployerCost),
        avgCost: run.totalEmployees > 0
          ? Math.round((Number(run.totalEmployerCost) / run.totalEmployees) * 100) / 100
          : 0,
        employeeCount: run.totalEmployees,
      }));

    // Component Breakdown (aggregate from earnings JSON across payslips)
    const componentTotals = new Map<string, number>();
    let grandTotal = 0;
    for (const slip of payslips) {
      const earnings = slip.earnings as Array<{ code: string; name: string; amount: number }> | null;
      if (Array.isArray(earnings)) {
        for (const earning of earnings) {
          const key = earning.name || earning.code;
          const amount = Number(earning.amount) || 0;
          componentTotals.set(key, (componentTotals.get(key) || 0) + amount);
          grandTotal += amount;
        }
      }
    }
    const componentBreakdown = Array.from(componentTotals.entries())
      .map(([component, totalAmount]) => ({
        component,
        totalAmount: Math.round(totalAmount * 100) / 100,
        percentage: calculatePercentage(totalAmount, grandTotal),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      avgSalary: Math.round(avgSalary * 100) / 100,
      medianSalary: Math.round(medianSalary * 100) / 100,
      byDepartment,
      byCountry,
      costTrend,
      componentBreakdown,
      labels: {
        en: {
          title: 'Payroll Analytics',
          totalCost: 'Total Payroll Cost',
          avgSalary: 'Average Salary',
          medianSalary: 'Median Salary',
          byDepartment: 'Cost by Department',
          byCountry: 'Cost by Country',
          costTrend: 'Payroll Cost Trend',
          componentBreakdown: 'Component Breakdown',
        },
        ar: {
          title: 'تحليلات الرواتب',
          totalCost: 'إجمالي تكلفة الرواتب',
          avgSalary: 'متوسط الراتب',
          medianSalary: 'الراتب المتوسط',
          byDepartment: 'التكلفة حسب القسم',
          byCountry: 'التكلفة حسب الدولة',
          costTrend: 'اتجاه تكلفة الرواتب',
          componentBreakdown: 'تفصيل المكونات',
        },
      },
    };
  }

  /**
   * Get leave utilization analytics.
   */
  static async getLeaveAnalytics(
    tenantId: string,
    dateRange: DateRange
  ): Promise<LeaveAnalytics> {
    // Leave requests in date range
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: 'APPROVED',
        startDate: { gte: dateRange.start },
        endDate: { lte: dateRange.end },
      },
      select: {
        employeeId: true,
        leaveTypeId: true,
        startDate: true,
        endDate: true,
        totalDays: true,
      },
    });

    // Leave balances
    const currentYear = new Date().getFullYear();
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        tenantId,
        leaveYear: currentYear,
        isDeleted: false,
      },
      select: {
        employeeId: true,
        accrued: true,
        taken: true,
        carriedForward: true,
        currentBalance: true,
        policy: { select: { name: true, nameAr: true, leaveTypeId: true } },
      },
    });

    // Utilization rate (total days taken / total entitlement)
    const totalEntitlement = leaveBalances.reduce(
      (sum, b) => sum + Number(b.accrued) + Number(b.carriedForward),
      0
    );
    const totalTaken = leaveBalances.reduce((sum, b) => sum + Number(b.taken), 0);
    const utilizationRate = totalEntitlement > 0 ? (totalTaken / totalEntitlement) * 100 : 0;

    // By Leave Type
    const leaveTypeMap = new Map<string, { name: string; nameAr?: string; totalDays: number; count: number; entitlement: number }>();
    for (const balance of leaveBalances) {
      const typeId = balance.policy.leaveTypeId;
      if (!leaveTypeMap.has(typeId)) {
        leaveTypeMap.set(typeId, {
          name: balance.policy.name,
          nameAr: balance.policy.nameAr || undefined,
          totalDays: 0,
          count: 0,
          entitlement: 0,
        });
      }
      const stats = leaveTypeMap.get(typeId)!;
      stats.totalDays += Number(balance.taken);
      stats.entitlement += Number(balance.accrued) + Number(balance.carriedForward);
      stats.count++;
    }
    const byType = Array.from(leaveTypeMap.entries()).map(([_, stats]) => ({
      type: stats.name,
      typeAr: stats.nameAr,
      totalDays: Math.round(stats.totalDays * 10) / 10,
      avgDays: stats.count > 0 ? Math.round((stats.totalDays / stats.count) * 10) / 10 : 0,
      utilizationRate: stats.entitlement > 0
        ? Math.round((stats.totalDays / stats.entitlement) * 10000) / 100
        : 0,
    }));

    // By Department
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);
    const employeeDepts = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isDeleted: false },
      select: { id: true, department: { select: { name: true } } },
    });
    const empDeptMap = new Map<string, string>();
    for (const emp of employeeDepts) {
      empDeptMap.set(emp.id, emp.department.name);
    }

    const deptLeave = new Map<string, { totalDays: number; count: number; entitlement: number }>();
    for (const balance of leaveBalances) {
      const dept = empDeptMap.get(balance.employeeId) || 'Unknown';
      if (!deptLeave.has(dept)) {
        deptLeave.set(dept, { totalDays: 0, count: 0, entitlement: 0 });
      }
      const stats = deptLeave.get(dept)!;
      stats.totalDays += Number(balance.taken);
      stats.count++;
      stats.entitlement += Number(balance.accrued) + Number(balance.carriedForward);
    }
    const byDepartment = Array.from(deptLeave.entries()).map(([department, stats]) => ({
      department,
      avgDaysTaken: stats.count > 0 ? Math.round((stats.totalDays / stats.count) * 10) / 10 : 0,
      utilizationRate: stats.entitlement > 0
        ? Math.round((stats.totalDays / stats.entitlement) * 10000) / 100
        : 0,
    }));

    // Monthly Trend
    const monthLeave = new Map<string, { total: number; count: number }>();
    for (const req of leaveRequests) {
      const key = getMonthKey(req.startDate);
      if (!monthLeave.has(key)) {
        monthLeave.set(key, { total: 0, count: 0 });
      }
      const stats = monthLeave.get(key)!;
      stats.total += Number(req.totalDays);
      stats.count++;
    }
    const monthlyTrend = Array.from(monthLeave.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        totalLeaves: stats.count,
        avgDuration: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
      }));

    // Top Leave Days (most popular start days)
    const dayCountMap = new Map<string, number>();
    for (const req of leaveRequests) {
      const dayName = getDayOfWeekName(req.startDate.getDay());
      dayCountMap.set(dayName, (dayCountMap.get(dayName) || 0) + 1);
    }
    const topLeaveDays = Array.from(dayCountMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);

    // Carry Forward Rate
    const carryForwards = await prisma.leaveCarryForward.findMany({
      where: { tenantId, toYear: currentYear },
      select: { carryForwardApplied: true, previousYearBalance: true },
    });
    const totalPreviousBalance = carryForwards.reduce(
      (sum, cf) => sum + Number(cf.previousYearBalance),
      0
    );
    const totalCarriedForward = carryForwards.reduce(
      (sum, cf) => sum + Number(cf.carryForwardApplied),
      0
    );
    const carryForwardRate = totalPreviousBalance > 0
      ? (totalCarriedForward / totalPreviousBalance) * 100
      : 0;

    return {
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      byType,
      byDepartment,
      monthlyTrend,
      topLeaveDays,
      carryForwardRate: Math.round(carryForwardRate * 100) / 100,
      labels: {
        en: {
          title: 'Leave Analytics',
          utilizationRate: 'Leave Utilization Rate (%)',
          byType: 'By Leave Type',
          byDepartment: 'By Department',
          monthlyTrend: 'Monthly Leave Trend',
          topLeaveDays: 'Most Popular Leave Days',
          carryForwardRate: 'Carry Forward Rate (%)',
        },
        ar: {
          title: 'تحليلات الإجازات',
          utilizationRate: 'معدل استخدام الإجازات (%)',
          byType: 'حسب نوع الإجازة',
          byDepartment: 'حسب القسم',
          monthlyTrend: 'اتجاه الإجازات الشهري',
          topLeaveDays: 'أيام الإجازة الأكثر شيوعاً',
          carryForwardRate: 'معدل الترحيل (%)',
        },
      },
    };
  }

  /**
   * Get recruitment funnel analytics.
   */
  static async getRecruitmentAnalytics(
    tenantId: string,
    dateRange: DateRange
  ): Promise<RecruitmentAnalytics> {
    // Open positions
    const openPositions = await prisma.position.count({
      where: { tenantId, status: 'OPEN', isDeleted: false, isActive: true },
    });

    // Job postings in date range
    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        isDeleted: false,
        postedDate: { gte: dateRange.start, lte: dateRange.end },
      },
      select: { id: true, postedDate: true },
    });
    const postingIds = jobPostings.map((p) => p.id);

    // Applications
    const applications = await prisma.candidateApplication.findMany({
      where: { jobPostingId: { in: postingIds } },
      select: {
        id: true,
        status: true,
        currentStage: true,
        source: true,
        appliedDate: true,
        offers: { select: { status: true, acceptedDate: true } },
        jobPosting: { select: { postedDate: true } },
      },
    });

    const applicationsReceived = applications.length;
    const offersExtended = applications.filter(
      (a) => a.offers.length > 0
    ).length;
    const hiredCount = applications.filter((a) => a.status === 'hired').length;

    // Time to hire (average days from posted to accepted)
    let totalDays = 0;
    let hiredWithDates = 0;
    for (const app of applications) {
      if (app.status === 'hired' && app.offers.length > 0) {
        const accepted = app.offers.find((o) => o.status === 'accepted');
        if (accepted?.acceptedDate && app.jobPosting.postedDate) {
          totalDays += Math.ceil(
            (accepted.acceptedDate.getTime() - app.jobPosting.postedDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          hiredWithDates++;
        }
      }
    }
    const timeToHire = hiredWithDates > 0 ? Math.round(totalDays / hiredWithDates) : 0;

    // Cost per hire (estimated from payroll if available, else placeholder calculation)
    // Using recruitment costs approximation: total employer cost / hires
    const costPerHire = hiredCount > 0 ? Math.round((openPositions * 5000) / hiredCount) : 0;

    // Source Effectiveness
    const sourceMap = new Map<string, { applications: number; hires: number }>();
    for (const app of applications) {
      const source = app.source || 'Direct';
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { applications: 0, hires: 0 });
      }
      const stats = sourceMap.get(source)!;
      stats.applications++;
      if (app.status === 'hired') stats.hires++;
    }
    const sourceEffectiveness = Array.from(sourceMap.entries())
      .map(([source, stats]) => ({
        source,
        applications: stats.applications,
        hires: stats.hires,
        conversionRate: stats.applications > 0
          ? Math.round((stats.hires / stats.applications) * 10000) / 100
          : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    // Funnel Conversion
    const stages = [
      { stage: 'Applied', stageAr: 'تقدم للوظيفة', key: 'applied' },
      { stage: 'Screening', stageAr: 'الفحص', key: 'screening' },
      { stage: 'Interview', stageAr: 'المقابلة', key: 'interview' },
      { stage: 'Assessment', stageAr: 'التقييم', key: 'assessment' },
      { stage: 'Offer', stageAr: 'العرض', key: 'offer' },
      { stage: 'Hired', stageAr: 'تم التوظيف', key: 'hired' },
    ];

    const stageCounts = new Map<string, number>();
    for (const app of applications) {
      const currentStage = app.currentStage.toLowerCase();
      // Count all that passed through each stage (cumulative)
      for (const s of stages) {
        if (currentStage === s.key || app.status === 'hired') {
          stageCounts.set(s.key, (stageCounts.get(s.key) || 0) + 1);
        }
      }
    }
    // Re-count properly: everyone starts at applied
    stageCounts.set('applied', applicationsReceived);

    const funnelConversion = stages.map((s, idx) => {
      const count = stageCounts.get(s.key) || 0;
      const prevCount = idx === 0 ? applicationsReceived : (stageCounts.get(stages[idx - 1].key) || applicationsReceived);
      return {
        stage: s.stage,
        stageAr: s.stageAr,
        count,
        conversionRate: prevCount > 0 ? Math.round((count / prevCount) * 10000) / 100 : 0,
        dropOffRate: prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 10000) / 100 : 0,
      };
    });

    return {
      openPositions,
      applicationsReceived,
      offersExtended,
      hiredCount,
      timeToHire,
      costPerHire,
      sourceEffectiveness,
      funnelConversion,
      labels: {
        en: {
          title: 'Recruitment Analytics',
          openPositions: 'Open Positions',
          applicationsReceived: 'Applications Received',
          offersExtended: 'Offers Extended',
          hiredCount: 'Hires',
          timeToHire: 'Average Time to Hire (Days)',
          costPerHire: 'Cost Per Hire',
          sourceEffectiveness: 'Source Effectiveness',
          funnelConversion: 'Hiring Funnel',
        },
        ar: {
          title: 'تحليلات التوظيف',
          openPositions: 'الوظائف الشاغرة',
          applicationsReceived: 'الطلبات المستلمة',
          offersExtended: 'العروض المقدمة',
          hiredCount: 'المعينون',
          timeToHire: 'متوسط وقت التوظيف (أيام)',
          costPerHire: 'تكلفة التوظيف',
          sourceEffectiveness: 'فعالية المصادر',
          funnelConversion: 'قمع التوظيف',
        },
      },
    };
  }

  /**
   * Get compliance health scorecard.
   */
  static async getComplianceScorecard(tenantId: string): Promise<ComplianceScorecard> {
    // Use compliance audit logs to determine compliance state
    const auditLogs = await prisma.complianceAuditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        module: true,
        action: true,
        message: true,
        messageAr: true,
        createdAt: true,
        newState: true,
      },
    });

    // Group by module and assess compliance state
    const moduleStatus = new Map<string, { total: number; compliant: number; overdue: { id: string; message: string; messageAr?: string; date: Date }[] }>();
    const modules = ['WPS', 'GOSI', 'PF', 'ESI', 'TDS', 'PT', 'EOSB', 'NITAQAT'];
    for (const mod of modules) {
      moduleStatus.set(mod, { total: 0, compliant: 0, overdue: [] });
    }

    for (const log of auditLogs) {
      const status = moduleStatus.get(log.module);
      if (!status) continue;
      status.total++;
      if (log.action === 'APPROVAL' || log.action === 'SUBMISSION') {
        status.compliant++;
      }
      if (log.action === 'REJECTION') {
        status.overdue.push({
          id: log.id,
          message: log.message,
          messageAr: log.messageAr || undefined,
          date: log.createdAt,
        });
      }
    }

    // Overall score
    let totalItems = 0;
    let compliantItems = 0;
    for (const [_, stats] of moduleStatus) {
      totalItems += stats.total;
      compliantItems += stats.compliant;
    }
    const overallScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;

    // By Country (using module as proxy since modules are often country-specific)
    const countryModuleMap: Record<string, string[]> = {
      'United Arab Emirates': ['WPS', 'GOSI', 'EOSB'],
      'India': ['PF', 'ESI', 'TDS', 'PT'],
      'Saudi Arabia': ['WPS', 'GOSI', 'NITAQAT'],
    };
    const byCountry = Object.entries(countryModuleMap).map(([country, mods]) => {
      let countryTotal = 0;
      let countryCompliant = 0;
      for (const mod of mods) {
        const stats = moduleStatus.get(mod);
        if (stats) {
          countryTotal += stats.total;
          countryCompliant += stats.compliant;
        }
      }
      return {
        country,
        score: countryTotal > 0 ? Math.round((countryCompliant / countryTotal) * 100) : 100,
        totalItems: countryTotal,
        compliantItems: countryCompliant,
      };
    });

    // Overdue Items
    const overdueItems: ComplianceScorecard['overdueItems'] = [];
    for (const [module, stats] of moduleStatus) {
      for (const item of stats.overdue.slice(0, 5)) {
        overdueItems.push({
          id: item.id,
          module,
          description: item.message,
          descriptionAr: item.messageAr,
          dueDate: item.date,
          severity: 'HIGH',
        });
      }
    }

    // Upcoming Deadlines (next 30 days - based on typical compliance cycles)
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    // Check payroll configurations for upcoming deadlines
    const payrollConfigs = await prisma.payrollConfiguration.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, companyId: true, payDay: true, enableWPS: true, enableGOSI: true },
    });

    const upcomingDeadlines: ComplianceScorecard['upcomingDeadlines'] = [];
    for (const config of payrollConfigs) {
      const nextPayDay = new Date(now.getFullYear(), now.getMonth(), config.payDay);
      if (nextPayDay < now) {
        nextPayDay.setMonth(nextPayDay.getMonth() + 1);
      }
      const daysRemaining = Math.ceil((nextPayDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (config.enableWPS && daysRemaining <= 30) {
        upcomingDeadlines.push({
          id: config.id,
          module: 'WPS',
          description: 'WPS Salary Transfer Deadline',
          descriptionAr: 'الموعد النهائي لتحويل الراتب عبر نظام حماية الأجور',
          dueDate: nextPayDay,
          daysRemaining,
        });
      }
      if (config.enableGOSI && daysRemaining <= 30) {
        upcomingDeadlines.push({
          id: config.id,
          module: 'GOSI',
          description: 'GOSI Contribution Deadline',
          descriptionAr: 'الموعد النهائي لاشتراكات التأمينات الاجتماعية',
          dueDate: nextPayDay,
          daysRemaining,
        });
      }
    }

    return {
      overallScore,
      byCountry,
      overdueItems: overdueItems.slice(0, 20),
      upcomingDeadlines: upcomingDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining),
      labels: {
        en: {
          title: 'Compliance Scorecard',
          overallScore: 'Overall Compliance Score',
          byCountry: 'By Country',
          overdueItems: 'Overdue Items',
          upcomingDeadlines: 'Upcoming Deadlines',
        },
        ar: {
          title: 'بطاقة أداء الامتثال',
          overallScore: 'درجة الامتثال الإجمالية',
          byCountry: 'حسب الدولة',
          overdueItems: 'العناصر المتأخرة',
          upcomingDeadlines: 'المواعيد النهائية القادمة',
        },
      },
    };
  }

  /**
   * Get industry benchmark comparisons for specified metrics.
   */
  static async getBenchmarkComparison(
    tenantId: string,
    metrics: string[]
  ): Promise<BenchmarkComparison[]> {
    // Retrieve company values for the requested metrics
    const dashboardMetrics = await HRAnalyticsEngineService.getDashboardMetrics(tenantId);

    // Industry benchmark reference data (typically sourced from external data providers)
    const benchmarkData: Record<string, { avg: number; p25: number; p75: number }> = {
      turnoverRate: { avg: 15.0, p25: 10.0, p75: 22.0 },
      avgTenure: { avg: 3.5, p25: 2.0, p75: 5.5 },
      absenteeismRate: { avg: 3.5, p25: 2.0, p75: 5.0 },
      overtimeRate: { avg: 8.0, p25: 4.0, p75: 12.0 },
      costPerEmployee: { avg: 85000, p25: 60000, p75: 120000 },
      timeToHire: { avg: 42, p25: 28, p75: 60 },
      trainingHours: { avg: 40, p25: 20, p75: 60 },
      satisfactionScore: { avg: 3.8, p25: 3.2, p75: 4.3 },
    };

    const metricLabelsAr: Record<string, string> = {
      turnoverRate: 'معدل الدوران',
      avgTenure: 'متوسط مدة الخدمة',
      absenteeismRate: 'معدل الغياب',
      overtimeRate: 'معدل العمل الإضافي',
      costPerEmployee: 'التكلفة لكل موظف',
      timeToHire: 'وقت التوظيف',
      trainingHours: 'ساعات التدريب',
      satisfactionScore: 'درجة الرضا',
    };

    const companyValues: Record<string, number> = {
      turnoverRate: dashboardMetrics.turnoverRate,
      avgTenure: dashboardMetrics.avgTenure,
      absenteeismRate: dashboardMetrics.absenteeismRate,
      overtimeRate: dashboardMetrics.overtimeRate,
      costPerEmployee: dashboardMetrics.costPerEmployee,
      timeToHire: dashboardMetrics.timeToHire,
      trainingHours: dashboardMetrics.trainingHours,
      satisfactionScore: dashboardMetrics.satisfactionScore,
    };

    const results: BenchmarkComparison[] = [];

    for (const metric of metrics) {
      const benchmark = benchmarkData[metric];
      const companyValue = companyValues[metric];

      if (!benchmark || companyValue === undefined) continue;

      // Determine rating
      let rating: BenchmarkComparison['rating'];
      // For metrics where lower is better (turnover, absenteeism, overtime, cost, timeToHire)
      const lowerIsBetter = ['turnoverRate', 'absenteeismRate', 'overtimeRate', 'costPerEmployee', 'timeToHire'];
      if (lowerIsBetter.includes(metric)) {
        if (companyValue <= benchmark.p25) rating = 'ABOVE_P75';
        else if (companyValue <= benchmark.avg) rating = 'AVG_TO_P75';
        else if (companyValue <= benchmark.p75) rating = 'P25_TO_AVG';
        else rating = 'BELOW_P25';
      } else {
        if (companyValue >= benchmark.p75) rating = 'ABOVE_P75';
        else if (companyValue >= benchmark.avg) rating = 'AVG_TO_P75';
        else if (companyValue >= benchmark.p25) rating = 'P25_TO_AVG';
        else rating = 'BELOW_P25';
      }

      results.push({
        metric,
        metricAr: metricLabelsAr[metric],
        companyValue,
        industryAvg: benchmark.avg,
        industryP25: benchmark.p25,
        industryP75: benchmark.p75,
        rating,
      });
    }

    return results;
  }

  /**
   * Drill down into a specific metric with filters.
   */
  static async drillDown(
    tenantId: string,
    metric: string,
    filter: DrillDownFilter
  ): Promise<DrillDownResult> {
    const companies = await prisma.company.findMany({
      where: { tenantId, isDeleted: false },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);

    let records: Record<string, unknown>[] = [];
    let summary: Record<string, number> = {};

    switch (metric) {
      case 'headcount': {
        const whereClause: Record<string, unknown> = {
          companyId: { in: companyIds },
          isDeleted: false,
          status: { code: 'ACTIVE' },
        };
        if (filter.department) {
          whereClause.department = { name: filter.department };
        }
        if (filter.location) {
          whereClause.location = { name: filter.location };
        }

        const employees = await prisma.employee.findMany({
          where: whereClause as any,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
            joiningDate: true,
            department: { select: { name: true } },
            location: { select: { name: true } },
            type: { select: { name: true } },
            grade: { select: { name: true } },
            jobProfile: { select: { title: true } },
          },
          take: 100,
        });
        records = employees.map((e) => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          employeeCode: e.employeeCode,
          department: e.department.name,
          location: e.location.name,
          type: e.type.name,
          grade: e.grade.name,
          jobTitle: e.jobProfile.title,
          joiningDate: e.joiningDate,
        }));
        summary = { totalRecords: employees.length };
        break;
      }

      case 'turnover': {
        const exitWhere: Record<string, unknown> = {
          tenantId,
          status: 'COMPLETED',
        };
        if (filter.dateRange) {
          exitWhere.lastWorkingDate = { gte: filter.dateRange.start, lte: filter.dateRange.end };
        }

        const exits = await prisma.exitRequest.findMany({
          where: exitWhere as any,
          select: {
            id: true,
            exitType: true,
            reason: true,
            lastWorkingDate: true,
            resignationDate: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeCode: true,
                joiningDate: true,
                department: { select: { name: true } },
              },
            },
          },
          take: 100,
        });
        records = exits.map((e) => ({
          id: e.id,
          name: `${e.employee.firstName} ${e.employee.lastName}`,
          employeeCode: e.employee.employeeCode,
          department: e.employee.department.name,
          exitType: e.exitType,
          reason: e.reason,
          lastWorkingDate: e.lastWorkingDate,
          tenureMonths: monthsDiff(e.employee.joiningDate, e.lastWorkingDate),
        }));
        summary = {
          totalExits: exits.length,
          voluntary: exits.filter((e) => e.exitType === 'RESIGNATION').length,
          involuntary: exits.filter((e) => e.exitType === 'TERMINATION').length,
        };
        break;
      }

      case 'attendance': {
        const attWhere: Record<string, unknown> = {
          tenantId,
          isDeleted: false,
        };
        if (filter.dateRange) {
          attWhere.date = { gte: filter.dateRange.start, lte: filter.dateRange.end };
        }
        if (filter.value) {
          attWhere.status = filter.value; // e.g., 'ABSENT', 'LATE'
        }

        const attendances = await prisma.attendanceRecord.findMany({
          where: attWhere as any,
          select: {
            id: true,
            employeeId: true,
            date: true,
            status: true,
            isLate: true,
            workHours: true,
            overtimeHours: true,
            clockIn: true,
            clockOut: true,
          },
          take: 100,
          orderBy: { date: 'desc' },
        });
        records = attendances.map((a) => ({
          id: a.id,
          employeeId: a.employeeId,
          date: a.date,
          status: a.status,
          isLate: a.isLate,
          workHours: a.workHours,
          overtimeHours: a.overtimeHours,
          clockIn: a.clockIn,
          clockOut: a.clockOut,
        }));
        summary = {
          totalRecords: attendances.length,
          present: attendances.filter((a) => a.status === 'PRESENT').length,
          absent: attendances.filter((a) => a.status === 'ABSENT').length,
          late: attendances.filter((a) => a.isLate).length,
        };
        break;
      }

      case 'payroll': {
        const payslipWhere: Record<string, unknown> = {
          isDeleted: false,
        };

        const payslips = await prisma.payslip.findMany({
          where: payslipWhere as any,
          select: {
            id: true,
            employeeId: true,
            employeeName: true,
            employeeCode: true,
            grossSalary: true,
            netSalary: true,
            basicSalary: true,
            totalEarnings: true,
            totalDeductions: true,
            payrollRun: { select: { payrollMonth: true, currency: true } },
          },
          take: 100,
          orderBy: { payrollRun: { payrollMonth: 'desc' } },
        });
        records = payslips.map((p) => ({
          id: p.id,
          employeeName: p.employeeName,
          employeeCode: p.employeeCode,
          grossSalary: Number(p.grossSalary),
          netSalary: Number(p.netSalary),
          basicSalary: Number(p.basicSalary),
          totalEarnings: Number(p.totalEarnings),
          totalDeductions: Number(p.totalDeductions),
          payrollMonth: p.payrollRun.payrollMonth,
          currency: p.payrollRun.currency,
        }));
        const totalGross = payslips.reduce((sum, p) => sum + Number(p.grossSalary), 0);
        summary = {
          totalRecords: payslips.length,
          totalGross: Math.round(totalGross * 100) / 100,
          avgGross: payslips.length > 0 ? Math.round((totalGross / payslips.length) * 100) / 100 : 0,
        };
        break;
      }

      case 'leave': {
        const leaveWhere: Record<string, unknown> = {
          tenantId,
          isDeleted: false,
          status: 'APPROVED',
        };
        if (filter.dateRange) {
          leaveWhere.startDate = { gte: filter.dateRange.start };
          leaveWhere.endDate = { lte: filter.dateRange.end };
        }

        const leaves = await prisma.leaveRequest.findMany({
          where: leaveWhere as any,
          select: {
            id: true,
            employeeId: true,
            leaveTypeId: true,
            startDate: true,
            endDate: true,
            totalDays: true,
            reason: true,
            status: true,
          },
          take: 100,
          orderBy: { startDate: 'desc' },
        });
        records = leaves.map((l) => ({
          id: l.id,
          employeeId: l.employeeId,
          leaveTypeId: l.leaveTypeId,
          startDate: l.startDate,
          endDate: l.endDate,
          totalDays: Number(l.totalDays),
          reason: l.reason,
        }));
        const totalDays = leaves.reduce((sum, l) => sum + Number(l.totalDays), 0);
        summary = {
          totalRequests: leaves.length,
          totalDays: Math.round(totalDays * 10) / 10,
          avgDuration: leaves.length > 0 ? Math.round((totalDays / leaves.length) * 10) / 10 : 0,
        };
        break;
      }

      case 'recruitment': {
        const apps = await prisma.candidateApplication.findMany({
          where: {
            jobPosting: {
              isDeleted: false,
              ...(filter.department ? { department: filter.department } : {}),
            },
          },
          select: {
            id: true,
            status: true,
            currentStage: true,
            source: true,
            appliedDate: true,
            candidate: { select: { firstName: true, lastName: true, email: true } },
            jobPosting: { select: { title: true, department: true, location: true } },
          },
          take: 100,
          orderBy: { appliedDate: 'desc' },
        });
        records = apps.map((a) => ({
          id: a.id,
          candidateName: `${a.candidate.firstName} ${a.candidate.lastName}`,
          email: a.candidate.email,
          jobTitle: a.jobPosting.title,
          department: a.jobPosting.department,
          location: a.jobPosting.location,
          status: a.status,
          stage: a.currentStage,
          source: a.source,
          appliedDate: a.appliedDate,
        }));
        summary = {
          total: apps.length,
          hired: apps.filter((a) => a.status === 'hired').length,
          rejected: apps.filter((a) => a.status === 'rejected').length,
          inProgress: apps.filter((a) => !['hired', 'rejected'].includes(a.status)).length,
        };
        break;
      }

      default:
        records = [];
        summary = { error: 1 };
    }

    return {
      dimension: filter.dimension,
      value: filter.value,
      records,
      summary,
      labels: {
        en: {
          title: `Drill Down: ${metric}`,
          dimension: filter.dimension,
          value: filter.value,
        },
        ar: {
          title: `تفاصيل: ${metric}`,
          dimension: filter.dimension,
          value: filter.value,
        },
      },
    };
  }

  /**
   * Generate executive summary with highlights, risks, and recommendations.
   */
  static async getExecutiveSummary(
    tenantId: string,
    dateRange: DateRange
  ): Promise<ExecutiveSummary> {
    // Get current metrics
    const currentMetrics = await HRAnalyticsEngineService.getDashboardMetrics(tenantId, dateRange);

    // Get previous period metrics for comparison
    const periodMonths = monthsDiff(dateRange.start, dateRange.end);
    const previousRange: DateRange = {
      start: new Date(dateRange.start),
      end: new Date(dateRange.start),
    };
    previousRange.start.setMonth(previousRange.start.getMonth() - periodMonths);
    const previousMetrics = await HRAnalyticsEngineService.getDashboardMetrics(tenantId, previousRange);

    // Calculate trends
    const calculateTrend = (current: number, previous: number): { trend: 'UP' | 'DOWN' | 'STABLE'; changePercent: number } => {
      if (previous === 0) return { trend: 'STABLE', changePercent: 0 };
      const change = ((current - previous) / previous) * 100;
      return {
        trend: Math.abs(change) < 2 ? 'STABLE' : change > 0 ? 'UP' : 'DOWN',
        changePercent: Math.round(change * 100) / 100,
      };
    };

    const highlights = [
      {
        metric: 'Headcount',
        metricAr: 'عدد الموظفين',
        value: currentMetrics.headcount,
        ...calculateTrend(currentMetrics.headcount, previousMetrics.headcount),
      },
      {
        metric: 'Turnover Rate',
        metricAr: 'معدل الدوران',
        value: currentMetrics.turnoverRate,
        ...calculateTrend(currentMetrics.turnoverRate, previousMetrics.turnoverRate),
      },
      {
        metric: 'Cost Per Employee',
        metricAr: 'التكلفة لكل موظف',
        value: currentMetrics.costPerEmployee,
        ...calculateTrend(currentMetrics.costPerEmployee, previousMetrics.costPerEmployee),
      },
      {
        metric: 'Time to Hire',
        metricAr: 'وقت التوظيف',
        value: currentMetrics.timeToHire,
        ...calculateTrend(currentMetrics.timeToHire, previousMetrics.timeToHire),
      },
      {
        metric: 'Absenteeism Rate',
        metricAr: 'معدل الغياب',
        value: currentMetrics.absenteeismRate,
        ...calculateTrend(currentMetrics.absenteeismRate, previousMetrics.absenteeismRate),
      },
      {
        metric: 'Satisfaction Score',
        metricAr: 'درجة الرضا',
        value: currentMetrics.satisfactionScore,
        ...calculateTrend(currentMetrics.satisfactionScore, previousMetrics.satisfactionScore),
      },
    ];

    // Identify risks
    const risks: ExecutiveSummary['risks'] = [];

    if (currentMetrics.turnoverRate > 20) {
      risks.push({
        area: 'Retention',
        areaAr: 'الاحتفاظ بالموظفين',
        severity: currentMetrics.turnoverRate > 30 ? 'CRITICAL' : 'HIGH',
        description: `Turnover rate of ${currentMetrics.turnoverRate}% exceeds healthy threshold. Investigate root causes by department.`,
        descriptionAr: `معدل الدوران ${currentMetrics.turnoverRate}% يتجاوز الحد الصحي. يجب التحقيق في الأسباب الجذرية حسب القسم.`,
      });
    }

    if (currentMetrics.absenteeismRate > 5) {
      risks.push({
        area: 'Attendance',
        areaAr: 'الحضور',
        severity: currentMetrics.absenteeismRate > 8 ? 'HIGH' : 'MEDIUM',
        description: `Absenteeism rate of ${currentMetrics.absenteeismRate}% is above industry average. Review attendance policies.`,
        descriptionAr: `معدل الغياب ${currentMetrics.absenteeismRate}% أعلى من المتوسط الصناعي. يرجى مراجعة سياسات الحضور.`,
      });
    }

    if (currentMetrics.timeToHire > 60) {
      risks.push({
        area: 'Recruitment',
        areaAr: 'التوظيف',
        severity: currentMetrics.timeToHire > 90 ? 'HIGH' : 'MEDIUM',
        description: `Average time to hire of ${currentMetrics.timeToHire} days is significantly above target. Consider process optimization.`,
        descriptionAr: `متوسط وقت التوظيف ${currentMetrics.timeToHire} يوماً أعلى بكثير من المستهدف. يرجى النظر في تحسين العملية.`,
      });
    }

    if (currentMetrics.openPositions > currentMetrics.headcount * 0.1) {
      risks.push({
        area: 'Workforce Planning',
        areaAr: 'تخطيط القوى العاملة',
        severity: 'MEDIUM',
        description: `${currentMetrics.openPositions} open positions represent >10% of headcount. Capacity constraints likely.`,
        descriptionAr: `${currentMetrics.openPositions} وظيفة شاغرة تمثل أكثر من 10% من عدد الموظفين. من المحتمل وجود قيود على القدرة.`,
      });
    }

    // Generate recommendations
    const recommendations: ExecutiveSummary['recommendations'] = [];
    let priority = 1;

    if (currentMetrics.turnoverRate > 15) {
      recommendations.push({
        priority: priority++,
        title: 'Implement Stay Interviews',
        titleAr: 'تنفيذ مقابلات البقاء',
        description: 'Conduct stay interviews with top performers to identify retention drivers and address concerns proactively.',
        descriptionAr: 'إجراء مقابلات بقاء مع أفضل الأداء لتحديد محفزات الاحتفاظ ومعالجة المخاوف بشكل استباقي.',
        impact: 'HIGH',
      });
    }

    if (currentMetrics.trainingHours < 20) {
      recommendations.push({
        priority: priority++,
        title: 'Increase L&D Investment',
        titleAr: 'زيادة استثمار التعلم والتطوير',
        description: 'Training hours per employee are below benchmark. Develop structured learning paths to improve engagement and skills.',
        descriptionAr: 'ساعات التدريب لكل موظف أقل من المعيار المرجعي. تطوير مسارات تعلم منظمة لتحسين المشاركة والمهارات.',
        impact: 'MEDIUM',
      });
    }

    if (currentMetrics.timeToHire > 45) {
      recommendations.push({
        priority: priority++,
        title: 'Optimize Recruitment Pipeline',
        titleAr: 'تحسين خط أنابيب التوظيف',
        description: 'Streamline interview stages, leverage AI screening, and build talent pools to reduce time-to-hire.',
        descriptionAr: 'تبسيط مراحل المقابلة، الاستفادة من الفحص بالذكاء الاصطناعي، وبناء مجمعات المواهب لتقليل وقت التوظيف.',
        impact: 'HIGH',
      });
    }

    if (currentMetrics.overtimeRate > 10) {
      recommendations.push({
        priority: priority++,
        title: 'Address Overtime Patterns',
        titleAr: 'معالجة أنماط العمل الإضافي',
        description: 'Review workload distribution and staffing levels in departments with consistently high overtime.',
        descriptionAr: 'مراجعة توزيع عبء العمل ومستويات التوظيف في الأقسام ذات العمل الإضافي المرتفع باستمرار.',
        impact: 'MEDIUM',
      });
    }

    recommendations.push({
      priority: priority++,
      title: 'Enhance Employee Experience',
      titleAr: 'تعزيز تجربة الموظف',
      description: 'Launch pulse surveys and engagement initiatives to improve satisfaction scores and reduce attrition risk.',
      descriptionAr: 'إطلاق استطلاعات سريعة ومبادرات مشاركة لتحسين درجات الرضا وتقليل مخاطر الاستقالة.',
      impact: 'MEDIUM',
    });

    return {
      generatedAt: new Date(),
      dateRange,
      highlights,
      risks,
      recommendations,
      labels: {
        en: {
          title: 'Executive Summary',
          highlights: 'Key Metrics',
          risks: 'Risk Areas',
          recommendations: 'Recommendations',
        },
        ar: {
          title: 'ملخص تنفيذي',
          highlights: 'المقاييس الرئيسية',
          risks: 'مناطق المخاطر',
          recommendations: 'التوصيات',
        },
      },
    };
  }

  /**
   * Export analytics report in the specified format.
   * Returns a structured payload suitable for PDF/CSV/Excel generation.
   */
  static async exportAnalyticsReport(
    tenantId: string,
    metrics: string[],
    format: ExportFormat
  ): Promise<{
    format: ExportFormat;
    generatedAt: Date;
    tenantId: string;
    sections: { title: string; titleAr: string; data: Record<string, unknown> }[];
    metadata: { totalSections: number; exportFormat: ExportFormat; version: string };
  }> {
    const sections: { title: string; titleAr: string; data: Record<string, unknown> }[] = [];
    const dateRange = getDefaultDateRange();

    for (const metric of metrics) {
      switch (metric) {
        case 'dashboard': {
          const data = await HRAnalyticsEngineService.getDashboardMetrics(tenantId, dateRange);
          sections.push({ title: 'Dashboard KPIs', titleAr: 'مؤشرات لوحة التحكم', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'headcount': {
          const data = await HRAnalyticsEngineService.getHeadcountAnalytics(tenantId);
          sections.push({ title: 'Headcount Analytics', titleAr: 'تحليلات عدد الموظفين', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'turnover': {
          const data = await HRAnalyticsEngineService.getTurnoverAnalytics(tenantId, dateRange);
          sections.push({ title: 'Turnover Analytics', titleAr: 'تحليلات الدوران الوظيفي', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'attendance': {
          const data = await HRAnalyticsEngineService.getAttendanceAnalytics(tenantId, dateRange);
          sections.push({ title: 'Attendance Analytics', titleAr: 'تحليلات الحضور', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'payroll': {
          const data = await HRAnalyticsEngineService.getPayrollAnalytics(tenantId, dateRange);
          sections.push({ title: 'Payroll Analytics', titleAr: 'تحليلات الرواتب', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'leave': {
          const data = await HRAnalyticsEngineService.getLeaveAnalytics(tenantId, dateRange);
          sections.push({ title: 'Leave Analytics', titleAr: 'تحليلات الإجازات', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'recruitment': {
          const data = await HRAnalyticsEngineService.getRecruitmentAnalytics(tenantId, dateRange);
          sections.push({ title: 'Recruitment Analytics', titleAr: 'تحليلات التوظيف', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'compliance': {
          const data = await HRAnalyticsEngineService.getComplianceScorecard(tenantId);
          sections.push({ title: 'Compliance Scorecard', titleAr: 'بطاقة أداء الامتثال', data: data as unknown as Record<string, unknown> });
          break;
        }
        case 'executive': {
          const data = await HRAnalyticsEngineService.getExecutiveSummary(tenantId, dateRange);
          sections.push({ title: 'Executive Summary', titleAr: 'ملخص تنفيذي', data: data as unknown as Record<string, unknown> });
          break;
        }
        default:
          break;
      }
    }

    return {
      format,
      generatedAt: new Date(),
      tenantId,
      sections,
      metadata: {
        totalSections: sections.length,
        exportFormat: format,
        version: '1.0.0',
      },
    };
  }
}

export default HRAnalyticsEngineService;
