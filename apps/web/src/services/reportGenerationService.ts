/**
 * @module reportGenerationService
 * @description Enterprise Report Generation Service — templates, scheduling, history,
 *              15+ report types across HR, Payroll, Attendance, Compliance, Analytics.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportCategory = 'hr' | 'payroll' | 'attendance' | 'compliance' | 'analytics';
export type ReportStatus = 'queued' | 'generating' | 'ready' | 'failed';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  estimatedRows?: number;
  supportsDateRange: boolean;
  supportsDepartmentFilter: boolean;
  supportsLocationFilter: boolean;
  supportsEmployeeFilter: boolean;
  defaultFormat: ReportFormat;
  availableFormats: ReportFormat[];
  isFavorite: boolean;
  lastGenerated?: string;
  sampleColumns: string[];
  tags: string[];
}

export interface ReportParameters {
  templateId: string;
  dateRange?: { start: string; end: string };
  departmentIds?: string[];
  locationIds?: string[];
  employeeIds?: string[];
  format: ReportFormat;
  includeCharts?: boolean;
  filters?: Record<string, unknown>;
  title?: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  category: ReportCategory;
  title: string;
  parameters: ReportParameters;
  status: ReportStatus;
  format: ReportFormat;
  rowCount?: number;
  fileSize?: number;
  downloadUrl?: string;
  generatedAt: string;
  expiresAt: string;
  generatedBy: string;
  errorMessage?: string;
  preview?: ReportPreviewData;
}

export interface ReportPreviewData {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totalRows: number;
  sampleNote?: string;
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  width?: number;
  sortable: boolean;
  filterable: boolean;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  category: ReportCategory;
  parameters: ReportParameters;
  schedule: {
    frequency: ScheduleFrequency;
    dayOfWeek?: number; // 0 = Sunday
    dayOfMonth?: number; // 1-31
    time: string; // HH:mm
    timezone: string;
  };
  recipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdBy: string;
  createdAt: string;
}

export interface ScheduleReportInput {
  templateId: string;
  parameters: Omit<ReportParameters, 'templateId'>;
  schedule: ScheduledReport['schedule'];
  recipients: string[];
  title?: string;
}

export interface ReportHistoryFilters {
  category?: ReportCategory;
  status?: ReportStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// REPORT TEMPLATES (15+)
// ============================================================================

const REPORT_TEMPLATES: ReportTemplate[] = [
  // ── HR Reports ──────────────────────────────────────────────────────────────
  {
    id: 'rpt-headcount',
    name: 'Headcount Report',
    description: 'Employee headcount by department, location, and employment type',
    category: 'hr',
    icon: 'Users',
    estimatedRows: 50,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: true,
    supportsEmployeeFilter: false,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: true,
    lastGenerated: '2026-02-20T10:00:00Z',
    sampleColumns: ['Department', 'Active', 'On Leave', 'Total', 'vs Last Month'],
    tags: ['hr', 'headcount', 'workforce'],
  },
  {
    id: 'rpt-turnover',
    name: 'Turnover Analysis',
    description: 'Employee turnover rate and attrition by department and period',
    category: 'hr',
    icon: 'TrendingDown',
    estimatedRows: 30,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: true,
    supportsEmployeeFilter: false,
    defaultFormat: 'pdf',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: false,
    sampleColumns: ['Department', 'Headcount', 'Exits', 'Turnover %', 'Avg Tenure'],
    tags: ['hr', 'turnover', 'attrition'],
  },
  {
    id: 'rpt-employee-roster',
    name: 'Employee Roster',
    description: 'Complete employee directory with contact and employment details',
    category: 'hr',
    icon: 'List',
    estimatedRows: 200,
    supportsDateRange: false,
    supportsDepartmentFilter: true,
    supportsLocationFilter: true,
    supportsEmployeeFilter: true,
    defaultFormat: 'excel',
    availableFormats: ['excel', 'csv'],
    isFavorite: true,
    lastGenerated: '2026-02-22T14:00:00Z',
    sampleColumns: [
      'Employee ID',
      'Name',
      'Title',
      'Department',
      'Email',
      'Phone',
      'Location',
      'Hire Date',
    ],
    tags: ['hr', 'roster', 'directory'],
  },
  {
    id: 'rpt-new-hires',
    name: 'New Hire Report',
    description: 'New employees onboarded within a date range',
    category: 'hr',
    icon: 'UserPlus',
    estimatedRows: 25,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: false,
    sampleColumns: ['Name', 'Title', 'Department', 'Hire Date', 'Manager', 'Status'],
    tags: ['hr', 'onboarding', 'new-hires'],
  },
  {
    id: 'rpt-leave-balance',
    name: 'Leave Balance Report',
    description: 'Employee leave balances by type (annual, sick, maternity)',
    category: 'hr',
    icon: 'Calendar',
    estimatedRows: 200,
    supportsDateRange: false,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: true,
    defaultFormat: 'excel',
    availableFormats: ['excel', 'csv'],
    isFavorite: true,
    lastGenerated: '2026-02-23T09:00:00Z',
    sampleColumns: ['Employee', 'Annual Entitlement', 'Taken', 'Balance', 'Carried Forward'],
    tags: ['hr', 'leave', 'balance'],
  },

  // ── Payroll Reports ─────────────────────────────────────────────────────────
  {
    id: 'rpt-payroll-summary',
    name: 'Payroll Summary',
    description: 'Payroll summary by department including gross, deductions, and net pay',
    category: 'payroll',
    icon: 'DollarSign',
    estimatedRows: 60,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: true,
    lastGenerated: '2026-02-15T16:00:00Z',
    sampleColumns: ['Department', 'Employees', 'Gross Pay', 'Deductions', 'Tax', 'Net Pay'],
    tags: ['payroll', 'summary', 'finance'],
  },
  {
    id: 'rpt-payslip-detail',
    name: 'Payslip Detail',
    description: 'Detailed payslip breakdown for individual employees',
    category: 'payroll',
    icon: 'Receipt',
    estimatedRows: 1,
    supportsDateRange: true,
    supportsDepartmentFilter: false,
    supportsLocationFilter: false,
    supportsEmployeeFilter: true,
    defaultFormat: 'pdf',
    availableFormats: ['pdf'],
    isFavorite: false,
    sampleColumns: ['Earnings', 'Amount', 'Deductions', 'Amount', 'Net Pay'],
    tags: ['payroll', 'payslip', 'individual'],
  },
  {
    id: 'rpt-expense-summary',
    name: 'Expense Reimbursement Summary',
    description: 'Expense reports by department with approval status and amounts',
    category: 'payroll',
    icon: 'CreditCard',
    estimatedRows: 80,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: false,
    sampleColumns: ['Employee', 'Department', 'Report', 'Amount', 'Status', 'Submitted Date'],
    tags: ['payroll', 'expenses', 'reimbursement'],
  },

  // ── Attendance Reports ───────────────────────────────────────────────────────
  {
    id: 'rpt-attendance-summary',
    name: 'Attendance Summary',
    description: 'Monthly attendance summary with present/absent/late breakdown',
    category: 'attendance',
    icon: 'Clock',
    estimatedRows: 200,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: true,
    supportsEmployeeFilter: true,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: true,
    lastGenerated: '2026-02-24T08:00:00Z',
    sampleColumns: ['Employee', 'Working Days', 'Present', 'Absent', 'Late', 'WFH', 'Attendance %'],
    tags: ['attendance', 'summary', 'workforce'],
  },
  {
    id: 'rpt-overtime',
    name: 'Overtime Report',
    description: 'Overtime hours logged by employee and department',
    category: 'attendance',
    icon: 'TimerReset',
    estimatedRows: 100,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: true,
    defaultFormat: 'excel',
    availableFormats: ['excel', 'csv'],
    isFavorite: false,
    sampleColumns: ['Employee', 'Regular Hours', 'Overtime Hours', 'OT Rate', 'OT Amount'],
    tags: ['attendance', 'overtime', 'payroll'],
  },

  // ── Compliance Reports ───────────────────────────────────────────────────────
  {
    id: 'rpt-compliance-status',
    name: 'Compliance Status Report',
    description: 'Overview of compliance items, due dates, and completion rates',
    category: 'compliance',
    icon: 'ShieldCheck',
    estimatedRows: 40,
    supportsDateRange: true,
    supportsDepartmentFilter: false,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'pdf',
    availableFormats: ['pdf', 'excel'],
    isFavorite: false,
    sampleColumns: ['Requirement', 'Category', 'Status', 'Due Date', 'Owner', 'Completion %'],
    tags: ['compliance', 'status', 'regulatory'],
  },
  {
    id: 'rpt-training-completion',
    name: 'Training Completion Report',
    description: 'Mandatory training completion status per employee',
    category: 'compliance',
    icon: 'GraduationCap',
    estimatedRows: 200,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: true,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: false,
    lastGenerated: '2026-02-10T12:00:00Z',
    sampleColumns: ['Employee', 'Course', 'Enrolled', 'Completed', 'Score', 'Certificate'],
    tags: ['compliance', 'training', 'mandatory'],
  },
  {
    id: 'rpt-gdpr-audit',
    name: 'GDPR/Data Privacy Audit',
    description: 'Data subject requests, consent records, and data retention compliance',
    category: 'compliance',
    icon: 'Lock',
    estimatedRows: 50,
    supportsDateRange: true,
    supportsDepartmentFilter: false,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'pdf',
    availableFormats: ['pdf', 'excel'],
    isFavorite: false,
    sampleColumns: ['Request Type', 'Subject', 'Status', 'Submitted', 'Due Date', 'Completed'],
    tags: ['compliance', 'gdpr', 'privacy', 'ccpa'],
  },

  // ── Analytics Reports ────────────────────────────────────────────────────────
  {
    id: 'rpt-workforce-analytics',
    name: 'Workforce Analytics',
    description: 'Comprehensive workforce insights including demographics, diversity, and trends',
    category: 'analytics',
    icon: 'BarChart3',
    estimatedRows: 0, // Chart-based
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: true,
    supportsEmployeeFilter: false,
    defaultFormat: 'pdf',
    availableFormats: ['pdf', 'excel'],
    isFavorite: true,
    sampleColumns: ['Metric', 'Current', 'Previous', 'Change', 'Trend'],
    tags: ['analytics', 'workforce', 'diversity', 'kpi'],
  },
  {
    id: 'rpt-performance-summary',
    name: 'Performance Review Summary',
    description: 'Performance ratings distribution and goal completion by department',
    category: 'analytics',
    icon: 'Target',
    estimatedRows: 100,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel', 'csv'],
    isFavorite: false,
    sampleColumns: ['Employee', 'Department', 'Rating', 'Goals Set', 'Goals Met', 'Score'],
    tags: ['analytics', 'performance', 'goals'],
  },
  {
    id: 'rpt-recruitment-funnel',
    name: 'Recruitment Funnel Report',
    description: 'Candidate pipeline metrics, time-to-hire, and source effectiveness',
    category: 'analytics',
    icon: 'Filter',
    estimatedRows: 30,
    supportsDateRange: true,
    supportsDepartmentFilter: true,
    supportsLocationFilter: false,
    supportsEmployeeFilter: false,
    defaultFormat: 'excel',
    availableFormats: ['pdf', 'excel'],
    isFavorite: false,
    sampleColumns: [
      'Job Title',
      'Applied',
      'Screened',
      'Interviewed',
      'Offered',
      'Hired',
      'Days to Hire',
    ],
    tags: ['analytics', 'recruitment', 'hiring'],
  },
];

// ============================================================================
// (Mock history, scheduled, and preview data removed — all data from API)
// ============================================================================

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ReportGenerationService {
  /**
   * Get all available report templates
   */
  static async getAvailableReports(category?: ReportCategory): Promise<ReportTemplate[]> {
    try {
      return await APIClient.get<ReportTemplate[]>('/v1/reports/templates', { category });
    } catch {
      if (category) return REPORT_TEMPLATES.filter((t) => t.category === category);
      return REPORT_TEMPLATES;
    }
  }

  /**
   * Get a single report template
   */
  static async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
    try {
      return await APIClient.get<ReportTemplate>(`/v1/reports/templates/${templateId}`);
    } catch {
      return REPORT_TEMPLATES.find((t) => t.id === templateId) ?? null;
    }
  }

  /**
   * Generate a report (async — returns immediately with queued status)
   */
  static async generateReport(params: ReportParameters): Promise<GeneratedReport> {
    return await APIClient.post<GeneratedReport>('/v1/reports/generate', params);
  }

  /**
   * Get report history (previously generated reports)
   */
  static async getReportHistory(filters: ReportHistoryFilters = {}): Promise<GeneratedReport[]> {
    try {
      return await APIClient.get<GeneratedReport[]>('/v1/reports/history', filters);
    } catch {
      return [];
    }
  }

  /**
   * Get a single generated report
   */
  static async getGeneratedReport(id: string): Promise<GeneratedReport | null> {
    try {
      return await APIClient.get<GeneratedReport>(`/v1/reports/history/${id}`);
    } catch {
      return null;
    }
  }

  /**
   * Get preview data for a template (sample rows for in-app preview)
   */
  static async getReportPreview(templateId: string): Promise<ReportPreviewData | null> {
    try {
      return await APIClient.get<ReportPreviewData>(`/v1/reports/templates/${templateId}/preview`);
    } catch {
      return null;
    }
  }

  /**
   * Schedule a recurring report
   */
  static async scheduleReport(input: ScheduleReportInput): Promise<ScheduledReport> {
    return await APIClient.post<ScheduledReport>('/v1/reports/schedules', input);
  }

  /**
   * Get all scheduled reports
   */
  static async getScheduledReports(): Promise<ScheduledReport[]> {
    try {
      return await APIClient.get<ScheduledReport[]>('/v1/reports/schedules');
    } catch {
      return [];
    }
  }

  /**
   * Delete or deactivate a scheduled report
   */
  static async deleteScheduledReport(scheduleId: string): Promise<void> {
    await APIClient.delete(`/v1/reports/schedules/${scheduleId}`);
  }

  /**
   * Toggle a template's favorite status
   */
  static async toggleFavorite(templateId: string): Promise<void> {
    await APIClient.post(`/v1/reports/templates/${templateId}/favorite`, {});
  }

  /**
   * Get favorite report templates
   */
  static async getFavoriteReports(): Promise<ReportTemplate[]> {
    try {
      return await APIClient.get<ReportTemplate[]>('/v1/reports/templates/favorites');
    } catch {
      return REPORT_TEMPLATES.filter((t) => t.isFavorite);
    }
  }
}

// ── Category meta ──────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  ReportCategory,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  hr: { label: 'HR', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: 'Users' },
  payroll: {
    label: 'Payroll',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: 'DollarSign',
  },
  attendance: {
    label: 'Attendance',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: 'Clock',
  },
  compliance: {
    label: 'Compliance',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: 'ShieldCheck',
  },
  analytics: {
    label: 'Analytics',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: 'BarChart3',
  },
};

export const STATUS_META: Record<ReportStatus, { label: string; color: string; bgColor: string }> =
  {
    queued: { label: 'Queued', color: 'text-slate-600', bgColor: 'bg-slate-100' },
    generating: { label: 'Generating', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    ready: { label: 'Ready', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    failed: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-50' },
  };

export default ReportGenerationService;
