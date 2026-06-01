/**
 * Report Generation Service
 * Phase 3: Intelligence Layer - Advanced Reporting
 */

import type {
  ReportDefinition,
  ReportResult,
  ReportData,
  ReportFormat,
  ReportTemplate,
  ChartData,
  SummaryData,
  ReportType} from './types';
import {
  ReportExecution
} from './types';

/**
 * Predefined report templates
 */
const REPORT_TEMPLATES: ReportTemplate[] = [
  // Payroll Reports
  {
    id: 'tpl_payroll_summary',
    name: 'Payroll Summary Report',
    nameAr: 'تقرير ملخص الرواتب',
    description: 'Monthly payroll summary with earnings, deductions, and net pay by department',
    descriptionAr: 'ملخص الرواتب الشهري مع الأرباح والاستقطاعات وصافي الراتب حسب القسم',
    type: 'PAYROLL',
    category: 'Financial',
    icon: 'dollar-sign',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'payroll_runs' },
      columns: [
        { id: 'emp', field: 'employeeId', label: 'Employee ID', labelAr: 'رقم الموظف', type: 'STRING', visible: true },
        { id: 'name', field: 'employeeName', label: 'Employee Name', labelAr: 'اسم الموظف', type: 'STRING', visible: true },
        { id: 'dept', field: 'department', label: 'Department', labelAr: 'القسم', type: 'STRING', visible: true },
        { id: 'basic', field: 'basicSalary', label: 'Basic Salary', labelAr: 'الراتب الأساسي', type: 'CURRENCY', visible: true },
        { id: 'gross', field: 'grossPay', label: 'Gross Pay', labelAr: 'إجمالي الراتب', type: 'CURRENCY', visible: true },
        { id: 'deductions', field: 'totalDeductions', label: 'Deductions', labelAr: 'الاستقطاعات', type: 'CURRENCY', visible: true },
        { id: 'net', field: 'netPay', label: 'Net Pay', labelAr: 'صافي الراتب', type: 'CURRENCY', visible: true },
      ],
      aggregations: [
        { id: 'total_gross', field: 'grossPay', function: 'SUM', label: 'Total Gross', labelAr: 'إجمالي الرواتب' },
        { id: 'total_net', field: 'netPay', function: 'SUM', label: 'Total Net', labelAr: 'إجمالي الصافي' },
      ],
    },
  },
  {
    id: 'tpl_payroll_wps',
    name: 'WPS Bank File Report',
    nameAr: 'تقرير ملف البنك WPS',
    description: 'WPS-compliant bank file for salary transfers',
    descriptionAr: 'ملف البنك المتوافق مع نظام حماية الأجور لتحويلات الرواتب',
    type: 'PAYROLL',
    category: 'Compliance',
    icon: 'bank',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'payroll_runs' },
      columns: [
        { id: 'routing', field: 'bankRoutingCode', label: 'Routing Code', labelAr: 'رمز التوجيه', type: 'STRING', visible: true },
        { id: 'account', field: 'bankAccountNumber', label: 'Account Number', labelAr: 'رقم الحساب', type: 'STRING', visible: true },
        { id: 'amount', field: 'netPay', label: 'Amount', labelAr: 'المبلغ', type: 'CURRENCY', visible: true },
        { id: 'currency', field: 'currency', label: 'Currency', labelAr: 'العملة', type: 'STRING', visible: true },
      ],
    },
  },

  // Attendance Reports
  {
    id: 'tpl_attendance_daily',
    name: 'Daily Attendance Report',
    nameAr: 'تقرير الحضور اليومي',
    description: 'Daily attendance status with punch times and working hours',
    descriptionAr: 'حالة الحضور اليومي مع أوقات البصمة وساعات العمل',
    type: 'ATTENDANCE',
    category: 'Operations',
    icon: 'clock',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'attendance_records' },
      columns: [
        { id: 'emp', field: 'employeeId', label: 'Employee ID', labelAr: 'رقم الموظف', type: 'STRING', visible: true },
        { id: 'name', field: 'employeeName', label: 'Name', labelAr: 'الاسم', type: 'STRING', visible: true },
        { id: 'date', field: 'date', label: 'Date', labelAr: 'التاريخ', type: 'DATE', visible: true },
        { id: 'in', field: 'punchIn', label: 'Punch In', labelAr: 'وقت الدخول', type: 'STRING', visible: true },
        { id: 'out', field: 'punchOut', label: 'Punch Out', labelAr: 'وقت الخروج', type: 'STRING', visible: true },
        { id: 'hours', field: 'workedHours', label: 'Hours Worked', labelAr: 'ساعات العمل', type: 'NUMBER', visible: true },
        { id: 'status', field: 'status', label: 'Status', labelAr: 'الحالة', type: 'STRING', visible: true },
      ],
    },
  },
  {
    id: 'tpl_attendance_monthly',
    name: 'Monthly Attendance Summary',
    nameAr: 'ملخص الحضور الشهري',
    description: 'Monthly attendance summary with present days, absences, and leaves',
    descriptionAr: 'ملخص الحضور الشهري مع أيام الحضور والغياب والإجازات',
    type: 'ATTENDANCE',
    category: 'Operations',
    icon: 'calendar',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'attendance_summary' },
      columns: [
        { id: 'emp', field: 'employeeId', label: 'Employee ID', labelAr: 'رقم الموظف', type: 'STRING', visible: true },
        { id: 'name', field: 'employeeName', label: 'Name', labelAr: 'الاسم', type: 'STRING', visible: true },
        { id: 'working', field: 'workingDays', label: 'Working Days', labelAr: 'أيام العمل', type: 'NUMBER', visible: true },
        { id: 'present', field: 'presentDays', label: 'Present', labelAr: 'حاضر', type: 'NUMBER', visible: true },
        { id: 'absent', field: 'absentDays', label: 'Absent', labelAr: 'غائب', type: 'NUMBER', visible: true },
        { id: 'leave', field: 'leaveDays', label: 'Leave', labelAr: 'إجازة', type: 'NUMBER', visible: true },
        { id: 'ot', field: 'overtimeHours', label: 'OT Hours', labelAr: 'ساعات إضافية', type: 'NUMBER', visible: true },
      ],
    },
  },

  // Leave Reports
  {
    id: 'tpl_leave_balance',
    name: 'Leave Balance Report',
    nameAr: 'تقرير رصيد الإجازات',
    description: 'Current leave balances by employee and leave type',
    descriptionAr: 'أرصدة الإجازات الحالية حسب الموظف ونوع الإجازة',
    type: 'LEAVE',
    category: 'HR',
    icon: 'calendar-check',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'leave_balances' },
      columns: [
        { id: 'emp', field: 'employeeId', label: 'Employee ID', labelAr: 'رقم الموظف', type: 'STRING', visible: true },
        { id: 'name', field: 'employeeName', label: 'Name', labelAr: 'الاسم', type: 'STRING', visible: true },
        { id: 'type', field: 'leaveType', label: 'Leave Type', labelAr: 'نوع الإجازة', type: 'STRING', visible: true },
        { id: 'entitled', field: 'entitledDays', label: 'Entitled', labelAr: 'المستحق', type: 'NUMBER', visible: true },
        { id: 'taken', field: 'takenDays', label: 'Taken', labelAr: 'المستخدم', type: 'NUMBER', visible: true },
        { id: 'balance', field: 'balance', label: 'Balance', labelAr: 'الرصيد', type: 'NUMBER', visible: true },
      ],
    },
  },

  // Headcount Reports
  {
    id: 'tpl_headcount_summary',
    name: 'Headcount Summary Report',
    nameAr: 'تقرير ملخص عدد الموظفين',
    description: 'Headcount breakdown by department, location, and employment type',
    descriptionAr: 'توزيع عدد الموظفين حسب القسم والموقع ونوع التوظيف',
    type: 'HEADCOUNT',
    category: 'HR',
    icon: 'users',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'employees' },
      groupBy: ['department'],
      aggregations: [
        { id: 'count', field: 'id', function: 'COUNT', label: 'Headcount', labelAr: 'عدد الموظفين' },
      ],
    },
  },

  // Compliance Reports
  {
    id: 'tpl_gosi_report',
    name: 'GOSI Contribution Report',
    nameAr: 'تقرير اشتراكات التأمينات الاجتماعية',
    description: 'Monthly GOSI contributions for Saudi employees',
    descriptionAr: 'اشتراكات التأمينات الاجتماعية الشهرية للموظفين السعوديين',
    type: 'COMPLIANCE',
    category: 'Statutory',
    icon: 'shield',
    isSystem: true,
    definition: {
      dataSource: { type: 'SINGLE', primary: 'statutory_deductions' },
      filters: [
        { id: 'country', field: 'country', label: 'Country', type: 'SELECT', operator: 'EQ', defaultValue: 'KSA' },
        { id: 'type', field: 'deductionType', label: 'Type', type: 'SELECT', operator: 'EQ', defaultValue: 'GOSI' },
      ],
    },
  },
];

/**
 * Report Service
 */
export class ReportService {
  /**
   * Get available report templates
   */
  static async getTemplates(
    type?: ReportType,
    category?: string
  ): Promise<ReportTemplate[]> {
    let templates = [...REPORT_TEMPLATES];

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return templates;
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(templateId: string): Promise<ReportTemplate | null> {
    return REPORT_TEMPLATES.find(t => t.id === templateId) || null;
  }

  /**
   * Create report from template
   */
  static async createFromTemplate(
    tenantId: string,
    templateId: string,
    name: string,
    createdBy: string,
    customizations?: Partial<ReportDefinition>
  ): Promise<ReportDefinition> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const report: ReportDefinition = {
      id: `rpt_${Date.now()}`,
      tenantId,
      name,
      nameAr: template.nameAr,
      description: template.description,
      descriptionAr: template.descriptionAr,
      type: template.type,
      category: template.category,
      template: templateId,

      dataSource: template.definition.dataSource || { type: 'SINGLE', primary: '' },
      columns: template.definition.columns || [],
      filters: template.definition.filters || [],
      groupBy: template.definition.groupBy,
      orderBy: template.definition.orderBy,
      aggregations: template.definition.aggregations,
      calculations: template.definition.calculations,
      charts: template.definition.charts,
      summaryCards: template.definition.summaryCards,

      defaultFormat: 'PDF',
      availableFormats: ['PDF', 'EXCEL', 'CSV'],
      visibility: 'PRIVATE',
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),

      ...customizations,
    };

    return report;
  }

  /**
   * Generate report
   */
  static async generateReport(
    report: ReportDefinition,
    parameters: Record<string, any>,
    format: ReportFormat = 'PDF'
  ): Promise<ReportResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}`;

    try {
      // Fetch data based on report definition
      const data = await this.fetchReportData(report, parameters);

      // Generate chart data
      const charts = report.charts?.map(chartConfig =>
        this.generateChartData(chartConfig, data)
      );

      // Generate summary data
      const summary = report.summaryCards?.map(cardConfig =>
        this.generateSummaryData(cardConfig, data)
      );

      const result: ReportResult = {
        id: `result_${Date.now()}`,
        executionId,
        reportId: report.id,
        reportName: report.name,
        generatedAt: new Date(),
        data,
        charts,
        summary,
        parameters,
        generationTime: Date.now() - startTime,
      };

      return result;
    } catch (error) {
      throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch report data (mock implementation)
   */
  private static async fetchReportData(
    report: ReportDefinition,
    parameters: Record<string, any>
  ): Promise<ReportData> {
    // In production, this would query the database
    // For now, return mock data based on report type

    const mockRows = this.generateMockData(report, parameters);

    // Apply aggregations if group by is defined
    const aggregates: Record<string, any> = {};
    if (report.aggregations) {
      for (const agg of report.aggregations) {
        aggregates[agg.id] = this.calculateAggregate(mockRows, agg.field, agg.function);
      }
    }

    return {
      columns: report.columns,
      rows: mockRows,
      totalRows: mockRows.length,
      page: 1,
      pageSize: 100,
      totalPages: Math.ceil(mockRows.length / 100),
      aggregates,
    };
  }

  /**
   * Generate mock data for reports
   */
  private static generateMockData(
    report: ReportDefinition,
    parameters: Record<string, any>
  ): Record<string, any>[] {
    const rows: Record<string, any>[] = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const row: Record<string, any> = {};

      for (const column of report.columns) {
        switch (column.type) {
          case 'STRING':
            if (column.field.includes('Name')) {
              row[column.field] = `Employee ${i + 1}`;
            } else if (column.field.includes('department')) {
              row[column.field] = ['Engineering', 'Sales', 'HR', 'Finance'][i % 4];
            } else if (column.field.includes('Id')) {
              row[column.field] = `EMP${String(i + 1).padStart(4, '0')}`;
            } else {
              row[column.field] = `Value ${i + 1}`;
            }
            break;

          case 'NUMBER':
            row[column.field] = Math.round(Math.random() * 100);
            break;

          case 'CURRENCY':
            row[column.field] = Math.round(Math.random() * 10000 + 5000);
            break;

          case 'DATE':
            row[column.field] = new Date().toISOString().split('T')[0];
            break;

          case 'PERCENTAGE':
            row[column.field] = Math.round(Math.random() * 100);
            break;

          case 'BOOLEAN':
            row[column.field] = Math.random() > 0.5;
            break;
        }
      }

      rows.push(row);
    }

    return rows;
  }

  /**
   * Calculate aggregate value
   */
  private static calculateAggregate(
    rows: Record<string, any>[],
    field: string,
    func: string
  ): number {
    const values = rows.map(r => Number(r[field]) || 0);

    switch (func) {
      case 'SUM':
        return values.reduce((a, b) => a + b, 0);
      case 'AVG':
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'COUNT':
        return values.length;
      case 'MIN':
        return Math.min(...values);
      case 'MAX':
        return Math.max(...values);
      case 'DISTINCT_COUNT':
        return new Set(values).size;
      default:
        return 0;
    }
  }

  /**
   * Generate chart data
   */
  private static generateChartData(
    config: NonNullable<ReportDefinition['charts']>[0],
    data: ReportData
  ): ChartData {
    const labels: string[] = [];
    const dataPoints: number[] = [];

    // Group data by x-axis field
    const groups = new Map<string, number[]>();

    for (const row of data.rows) {
      const label = String(row[config.xAxis?.field || ''] || 'Unknown');
      if (!groups.has(label)) {
        groups.set(label, []);
      }
      for (const series of config.series) {
        groups.get(label)!.push(Number(row[series.field]) || 0);
      }
    }

    for (const [label, values] of groups) {
      labels.push(label);
      dataPoints.push(values.reduce((a: any, b: any) => a + b, 0) / values.length);
    }

    return {
      config,
      data: {
        labels,
        datasets: config.series.map((series, index) => ({
          label: series.name,
          data: dataPoints,
          backgroundColor: config.colors?.[index] || this.getDefaultColor(index),
          borderColor: config.colors?.[index] || this.getDefaultColor(index),
        })),
      },
    };
  }

  /**
   * Get default chart color
   */
  private static getDefaultColor(index: number): string {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#EC4899', // pink
    ];
    return colors[index % colors.length];
  }

  /**
   * Generate summary data
   */
  private static generateSummaryData(
    config: NonNullable<ReportDefinition['summaryCards']>[0],
    data: ReportData
  ): SummaryData {
    const value = this.calculateAggregate(
      data.rows,
      config.field,
      config.aggregate
    );

    const formattedValue = this.formatValue(value, config.format);

    return {
      config,
      value,
      formattedValue,
      trend: {
        direction: Math.random() > 0.5 ? 'UP' : 'DOWN',
        percentage: Math.round(Math.random() * 20),
        previousValue: value * (1 + (Math.random() - 0.5) * 0.2),
      },
    };
  }

  /**
   * Format value based on format string
   */
  private static formatValue(value: number, format?: string): string {
    if (!format) {
      return value.toLocaleString();
    }

    if (format === 'CURRENCY' || format.includes('$')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }

    if (format === 'PERCENTAGE' || format.includes('%')) {
      return `${value.toFixed(1)}%`;
    }

    return value.toLocaleString();
  }

  /**
   * Export report to different formats
   */
  static async exportReport(
    result: ReportResult,
    format: ReportFormat
  ): Promise<{ content: string | Buffer; contentType: string; fileName: string }> {
    const fileName = `${result.reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'CSV':
        return {
          content: this.generateCSV(result.data),
          contentType: 'text/csv',
          fileName: `${fileName}.csv`,
        };

      case 'JSON':
        return {
          content: JSON.stringify(result, null, 2),
          contentType: 'application/json',
          fileName: `${fileName}.json`,
        };

      case 'EXCEL':
        // In production, use a library like xlsx
        return {
          content: this.generateCSV(result.data),
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileName: `${fileName}.xlsx`,
        };

      case 'PDF':
      default:
        // In production, use a PDF generation library
        return {
          content: JSON.stringify(result),
          contentType: 'application/pdf',
          fileName: `${fileName}.pdf`,
        };
    }
  }

  /**
   * Generate CSV content
   */
  private static generateCSV(data: ReportData): string {
    const headers = data.columns
      .filter(c => c.visible)
      .map(c => c.label);

    const rows = data.rows.map(row =>
      data.columns
        .filter(c => c.visible)
        .map(c => {
          const value = row[c.field];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
    );

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Create report schedule
   */
  static async scheduleReport(
    report: ReportDefinition,
    schedule: Omit<import('./types').ReportSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<import('./types').ReportSchedule> {
    const now = new Date();

    return {
      id: `sch_${Date.now()}`,
      ...schedule,
      reportId: report.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get report categories
   */
  static getCategories(): { id: string; name: string; nameAr: string; icon: string }[] {
    return [
      { id: 'Financial', name: 'Financial', nameAr: 'المالية', icon: 'dollar-sign' },
      { id: 'Operations', name: 'Operations', nameAr: 'العمليات', icon: 'settings' },
      { id: 'HR', name: 'Human Resources', nameAr: 'الموارد البشرية', icon: 'users' },
      { id: 'Compliance', name: 'Compliance', nameAr: 'الامتثال', icon: 'shield' },
      { id: 'Statutory', name: 'Statutory', nameAr: 'القانونية', icon: 'file-text' },
      { id: 'Analytics', name: 'Analytics', nameAr: 'التحليلات', icon: 'bar-chart' },
    ];
  }
}
