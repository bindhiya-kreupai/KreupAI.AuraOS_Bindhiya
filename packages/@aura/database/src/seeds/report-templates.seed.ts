import { PrismaClient } from '@prisma/client';

export interface ReportTemplate {
  name: string;
  category: string;
  columns: string[];
  defaultFilters: Record<string, unknown>;
  chartType?: string;
}

export const reportTemplates: ReportTemplate[] = [
  {
    name: 'Headcount Report',
    category: 'workforce',
    columns: [
      'employeeId', 'fullName', 'department', 'location', 'position',
      'employmentType', 'startDate', 'status', 'manager', 'costCenter',
    ],
    defaultFilters: {
      status: 'active',
      groupBy: 'department',
      dateRange: 'current',
    },
    chartType: 'stacked_bar',
  },
  {
    name: 'Turnover Report',
    category: 'workforce',
    columns: [
      'employeeId', 'fullName', 'department', 'position', 'hireDate',
      'terminationDate', 'tenure', 'terminationType', 'terminationReason',
      'manager', 'replacementStatus',
    ],
    defaultFilters: {
      dateRange: 'last_12_months',
      groupBy: 'department',
      terminationType: 'all',
    },
    chartType: 'line',
  },
  {
    name: 'Compensation Summary',
    category: 'compensation',
    columns: [
      'employeeId', 'fullName', 'department', 'position', 'grade',
      'baseSalary', 'bonus', 'totalCompensation', 'currency',
      'compaRatio', 'lastReviewDate', 'nextReviewDate',
    ],
    defaultFilters: {
      status: 'active',
      groupBy: 'grade',
      currency: 'USD',
    },
    chartType: 'box_plot',
  },
  {
    name: 'Attendance Report',
    category: 'time_attendance',
    columns: [
      'employeeId', 'fullName', 'department', 'date', 'clockIn',
      'clockOut', 'totalHours', 'overtime', 'status', 'lateMinutes',
      'earlyDepartureMinutes',
    ],
    defaultFilters: {
      dateRange: 'current_month',
      status: 'all',
      groupBy: 'department',
    },
    chartType: 'heatmap',
  },
  {
    name: 'Leave Balance Report',
    category: 'leave',
    columns: [
      'employeeId', 'fullName', 'department', 'leaveType',
      'entitled', 'taken', 'pending', 'balance', 'carryForward',
      'expiringDays', 'expiryDate',
    ],
    defaultFilters: {
      year: 'current',
      leaveType: 'all',
      groupBy: 'department',
    },
    chartType: 'grouped_bar',
  },
  {
    name: 'Performance Ratings Distribution',
    category: 'performance',
    columns: [
      'employeeId', 'fullName', 'department', 'position', 'manager',
      'reviewPeriod', 'selfRating', 'managerRating', 'finalRating',
      'calibratedRating', 'promotionRecommendation',
    ],
    defaultFilters: {
      reviewPeriod: 'latest',
      groupBy: 'department',
      ratingScale: '1-5',
    },
    chartType: 'bell_curve',
  },
  {
    name: 'Recruitment Pipeline',
    category: 'recruitment',
    columns: [
      'requisitionId', 'jobTitle', 'department', 'hiringManager',
      'stage', 'candidateCount', 'daysOpen', 'source',
      'offersMade', 'offersAccepted', 'timeToFill',
    ],
    defaultFilters: {
      status: 'open',
      dateRange: 'current_quarter',
      groupBy: 'stage',
    },
    chartType: 'funnel',
  },
  {
    name: 'Training Completion Report',
    category: 'learning',
    columns: [
      'employeeId', 'fullName', 'department', 'courseName',
      'courseType', 'assignedDate', 'completedDate', 'status',
      'score', 'certificateId', 'mandatory',
    ],
    defaultFilters: {
      status: 'all',
      mandatory: true,
      dateRange: 'current_year',
      groupBy: 'department',
    },
    chartType: 'progress_bar',
  },
  {
    name: 'Diversity Metrics',
    category: 'dei',
    columns: [
      'department', 'level', 'genderDistribution', 'ethnicityDistribution',
      'ageDistribution', 'veteranStatus', 'disabilityStatus',
      'payEquityRatio', 'promotionRate', 'retentionRate',
    ],
    defaultFilters: {
      groupBy: 'department',
      level: 'all',
      dateRange: 'current_year',
      anonymized: true,
    },
    chartType: 'donut',
  },
  {
    name: 'Compliance Audit Report',
    category: 'compliance',
    columns: [
      'auditArea', 'jurisdiction', 'requirement', 'status',
      'lastAuditDate', 'nextAuditDate', 'findings',
      'riskLevel', 'responsiblePerson', 'remediationDeadline',
      'documentsAttached',
    ],
    defaultFilters: {
      status: 'all',
      riskLevel: 'all',
      dateRange: 'current_year',
      groupBy: 'jurisdiction',
    },
    chartType: 'risk_matrix',
  },
];

/**
 * NOTE: ReportTemplate is not a dedicated Prisma model.
 * Templates are stored in SystemSetting under the `report_templates` group.
 * ReportDefinition model is the correct home for custom reports; these seed
 * entries serve as default templates that can be imported at runtime.
 */
export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding report templates...');

  for (const report of reportTemplates) {
    const key = `report_template.${report.name.toLowerCase().replace(/\s+/g, '_')}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(report) },
      create: {
        key,
        value: JSON.stringify(report),
        group: 'report_templates',
        description: `Report template: ${report.name}`,
      },
    });
  }

  console.log(`Seeded ${reportTemplates.length} report templates.`);
}
