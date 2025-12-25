/**
 * Dashboard Service
 * Phase 3: Intelligence Layer - Analytics Dashboards
 */

import type {
  DashboardConfig,
  DashboardWidget,
  AnalyticsMetric,
  AnalyticsFilter,
  AnalyticsPeriod,
} from './types';

/**
 * Predefined dashboard templates
 */
const DASHBOARD_TEMPLATES: Partial<DashboardConfig>[] = [
  {
    name: 'HR Executive Dashboard',
    nameAr: 'لوحة المعلومات التنفيذية للموارد البشرية',
    description: 'High-level HR metrics for executives',
    layout: { columns: 12, rowHeight: 100, margin: [16, 16] },
  },
  {
    name: 'Payroll Dashboard',
    nameAr: 'لوحة معلومات الرواتب',
    description: 'Payroll processing and cost analytics',
    layout: { columns: 12, rowHeight: 100, margin: [16, 16] },
  },
  {
    name: 'Attendance Dashboard',
    nameAr: 'لوحة معلومات الحضور',
    description: 'Real-time attendance monitoring',
    layout: { columns: 12, rowHeight: 100, margin: [16, 16] },
  },
  {
    name: 'Recruitment Dashboard',
    nameAr: 'لوحة معلومات التوظيف',
    description: 'Recruitment pipeline and metrics',
    layout: { columns: 12, rowHeight: 100, margin: [16, 16] },
  },
];

/**
 * Dashboard Service
 */
export class DashboardService {
  /**
   * Get HR analytics metrics
   */
  static async getHRMetrics(
    tenantId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsMetric[]> {
    // In production, fetch from database
    return [
      {
        id: 'total_employees',
        name: 'Total Employees',
        nameAr: 'إجمالي الموظفين',
        value: 1250,
        formattedValue: '1,250',
        trend: {
          direction: 'UP',
          percentage: 3.2,
          isPositive: true,
        },
        sparkline: [1180, 1195, 1210, 1225, 1240, 1250],
        icon: 'users',
        color: '#3B82F6',
      },
      {
        id: 'new_hires',
        name: 'New Hires',
        nameAr: 'التعيينات الجديدة',
        value: 45,
        formattedValue: '45',
        trend: {
          direction: 'UP',
          percentage: 12.5,
          isPositive: true,
        },
        sparkline: [32, 38, 41, 35, 42, 45],
        icon: 'user-plus',
        color: '#10B981',
      },
      {
        id: 'attrition_rate',
        name: 'Attrition Rate',
        nameAr: 'معدل الاستقالات',
        value: 8.5,
        formattedValue: '8.5%',
        trend: {
          direction: 'DOWN',
          percentage: 1.2,
          isPositive: true,
        },
        sparkline: [10.2, 9.8, 9.5, 9.0, 8.8, 8.5],
        icon: 'user-minus',
        color: '#EF4444',
      },
      {
        id: 'open_positions',
        name: 'Open Positions',
        nameAr: 'الوظائف الشاغرة',
        value: 28,
        formattedValue: '28',
        trend: {
          direction: 'DOWN',
          percentage: 8.0,
          isPositive: true,
        },
        sparkline: [35, 32, 30, 28, 27, 28],
        icon: 'briefcase',
        color: '#F59E0B',
      },
      {
        id: 'time_to_hire',
        name: 'Avg. Time to Hire',
        nameAr: 'متوسط وقت التوظيف',
        value: 32,
        formattedValue: '32 days',
        trend: {
          direction: 'DOWN',
          percentage: 5.9,
          isPositive: true,
        },
        sparkline: [38, 36, 35, 34, 33, 32],
        icon: 'clock',
        color: '#8B5CF6',
      },
      {
        id: 'avg_tenure',
        name: 'Avg. Tenure',
        nameAr: 'متوسط مدة الخدمة',
        value: 3.2,
        formattedValue: '3.2 years',
        trend: {
          direction: 'UP',
          percentage: 4.5,
          isPositive: true,
        },
        sparkline: [2.8, 2.9, 3.0, 3.1, 3.1, 3.2],
        icon: 'award',
        color: '#06B6D4',
      },
    ];
  }

  /**
   * Get payroll analytics metrics
   */
  static async getPayrollMetrics(
    tenantId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsMetric[]> {
    return [
      {
        id: 'total_payroll',
        name: 'Total Payroll',
        nameAr: 'إجمالي الرواتب',
        value: 4250000,
        formattedValue: 'SAR 4.25M',
        trend: {
          direction: 'UP',
          percentage: 5.2,
          isPositive: false,
        },
        icon: 'dollar-sign',
        color: '#3B82F6',
      },
      {
        id: 'avg_salary',
        name: 'Avg. Salary',
        nameAr: 'متوسط الراتب',
        value: 12500,
        formattedValue: 'SAR 12,500',
        trend: {
          direction: 'UP',
          percentage: 3.1,
          isPositive: true,
        },
        icon: 'trending-up',
        color: '#10B981',
      },
      {
        id: 'overtime_cost',
        name: 'Overtime Cost',
        nameAr: 'تكلفة العمل الإضافي',
        value: 185000,
        formattedValue: 'SAR 185K',
        trend: {
          direction: 'UP',
          percentage: 8.5,
          isPositive: false,
        },
        icon: 'clock',
        color: '#F59E0B',
      },
      {
        id: 'statutory_deductions',
        name: 'Statutory Deductions',
        nameAr: 'الاستقطاعات القانونية',
        value: 425000,
        formattedValue: 'SAR 425K',
        trend: {
          direction: 'FLAT',
          percentage: 0.2,
          isPositive: true,
        },
        icon: 'shield',
        color: '#8B5CF6',
      },
    ];
  }

  /**
   * Get attendance analytics metrics
   */
  static async getAttendanceMetrics(
    tenantId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsMetric[]> {
    return [
      {
        id: 'attendance_rate',
        name: 'Attendance Rate',
        nameAr: 'معدل الحضور',
        value: 94.5,
        formattedValue: '94.5%',
        trend: {
          direction: 'UP',
          percentage: 1.2,
          isPositive: true,
        },
        icon: 'check-circle',
        color: '#10B981',
      },
      {
        id: 'avg_work_hours',
        name: 'Avg. Work Hours',
        nameAr: 'متوسط ساعات العمل',
        value: 8.2,
        formattedValue: '8.2 hrs',
        trend: {
          direction: 'UP',
          percentage: 2.5,
          isPositive: true,
        },
        icon: 'clock',
        color: '#3B82F6',
      },
      {
        id: 'late_arrivals',
        name: 'Late Arrivals',
        nameAr: 'التأخيرات',
        value: 42,
        formattedValue: '42',
        trend: {
          direction: 'DOWN',
          percentage: 15.0,
          isPositive: true,
        },
        icon: 'alert-circle',
        color: '#F59E0B',
      },
      {
        id: 'absence_rate',
        name: 'Absence Rate',
        nameAr: 'معدل الغياب',
        value: 2.8,
        formattedValue: '2.8%',
        trend: {
          direction: 'DOWN',
          percentage: 5.0,
          isPositive: true,
        },
        icon: 'x-circle',
        color: '#EF4444',
      },
    ];
  }

  /**
   * Get leave analytics metrics
   */
  static async getLeaveMetrics(
    tenantId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsMetric[]> {
    return [
      {
        id: 'pending_requests',
        name: 'Pending Requests',
        nameAr: 'الطلبات المعلقة',
        value: 18,
        formattedValue: '18',
        icon: 'clock',
        color: '#F59E0B',
      },
      {
        id: 'approved_today',
        name: 'Approved Today',
        nameAr: 'الموافقات اليوم',
        value: 5,
        formattedValue: '5',
        icon: 'check',
        color: '#10B981',
      },
      {
        id: 'on_leave_today',
        name: 'On Leave Today',
        nameAr: 'في إجازة اليوم',
        value: 45,
        formattedValue: '45',
        icon: 'calendar',
        color: '#3B82F6',
      },
      {
        id: 'avg_leave_balance',
        name: 'Avg. Leave Balance',
        nameAr: 'متوسط رصيد الإجازات',
        value: 12.5,
        formattedValue: '12.5 days',
        icon: 'calendar-check',
        color: '#8B5CF6',
      },
    ];
  }

  /**
   * Get recruitment analytics metrics
   */
  static async getRecruitmentMetrics(
    tenantId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsMetric[]> {
    return [
      {
        id: 'active_jobs',
        name: 'Active Job Postings',
        nameAr: 'الوظائف النشطة',
        value: 28,
        formattedValue: '28',
        icon: 'briefcase',
        color: '#3B82F6',
      },
      {
        id: 'total_applications',
        name: 'Total Applications',
        nameAr: 'إجمالي الطلبات',
        value: 342,
        formattedValue: '342',
        trend: {
          direction: 'UP',
          percentage: 18.5,
          isPositive: true,
        },
        icon: 'file-text',
        color: '#10B981',
      },
      {
        id: 'interviews_scheduled',
        name: 'Interviews Scheduled',
        nameAr: 'المقابلات المجدولة',
        value: 45,
        formattedValue: '45',
        icon: 'calendar',
        color: '#F59E0B',
      },
      {
        id: 'offers_pending',
        name: 'Offers Pending',
        nameAr: 'العروض المعلقة',
        value: 8,
        formattedValue: '8',
        icon: 'mail',
        color: '#8B5CF6',
      },
      {
        id: 'offer_acceptance_rate',
        name: 'Offer Acceptance Rate',
        nameAr: 'معدل قبول العروض',
        value: 85,
        formattedValue: '85%',
        trend: {
          direction: 'UP',
          percentage: 5.0,
          isPositive: true,
        },
        icon: 'check-circle',
        color: '#06B6D4',
      },
    ];
  }

  /**
   * Get department breakdown data
   */
  static async getDepartmentBreakdown(
    tenantId: string,
    metric: 'headcount' | 'payroll' | 'attendance' | 'attrition'
  ): Promise<{ department: string; value: number; percentage: number }[]> {
    const data: Record<string, { department: string; value: number; percentage: number }[]> = {
      headcount: [
        { department: 'Engineering', value: 450, percentage: 36 },
        { department: 'Sales', value: 280, percentage: 22.4 },
        { department: 'Operations', value: 220, percentage: 17.6 },
        { department: 'Finance', value: 150, percentage: 12 },
        { department: 'HR', value: 80, percentage: 6.4 },
        { department: 'Marketing', value: 70, percentage: 5.6 },
      ],
      payroll: [
        { department: 'Engineering', value: 1800000, percentage: 42.4 },
        { department: 'Sales', value: 950000, percentage: 22.4 },
        { department: 'Operations', value: 650000, percentage: 15.3 },
        { department: 'Finance', value: 480000, percentage: 11.3 },
        { department: 'HR', value: 220000, percentage: 5.2 },
        { department: 'Marketing', value: 150000, percentage: 3.5 },
      ],
      attendance: [
        { department: 'Finance', value: 98.2, percentage: 98.2 },
        { department: 'HR', value: 97.5, percentage: 97.5 },
        { department: 'Operations', value: 95.8, percentage: 95.8 },
        { department: 'Engineering', value: 94.2, percentage: 94.2 },
        { department: 'Marketing', value: 93.5, percentage: 93.5 },
        { department: 'Sales', value: 91.2, percentage: 91.2 },
      ],
      attrition: [
        { department: 'Sales', value: 12.5, percentage: 12.5 },
        { department: 'Operations', value: 10.2, percentage: 10.2 },
        { department: 'Engineering', value: 8.5, percentage: 8.5 },
        { department: 'Marketing', value: 7.8, percentage: 7.8 },
        { department: 'Finance', value: 5.2, percentage: 5.2 },
        { department: 'HR', value: 4.5, percentage: 4.5 },
      ],
    };

    return data[metric] || [];
  }

  /**
   * Get trend data for charts
   */
  static async getTrendData(
    tenantId: string,
    metric: string,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<{ label: string; value: number }[]> {
    const periods = {
      week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      month: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      quarter: ['Jan', 'Feb', 'Mar'],
      year: ['Q1', 'Q2', 'Q3', 'Q4'],
    };

    return periods[period].map(label => ({
      label,
      value: Math.round(Math.random() * 100),
    }));
  }

  /**
   * Create default dashboard for tenant
   */
  static async createDefaultDashboard(
    tenantId: string,
    createdBy: string
  ): Promise<DashboardConfig> {
    const widgets: DashboardWidget[] = [
      // Metric cards - Row 1
      {
        id: 'widget_1',
        type: 'METRIC',
        title: 'Total Employees',
        titleAr: 'إجمالي الموظفين',
        x: 0,
        y: 0,
        width: 3,
        height: 1,
        config: {
          id: 'card_employees',
          title: 'Total Employees',
          titleAr: 'إجمالي الموظفين',
          field: 'total_employees',
          aggregate: 'COUNT',
          icon: 'users',
          color: '#3B82F6',
        },
      },
      {
        id: 'widget_2',
        type: 'METRIC',
        title: 'New Hires',
        titleAr: 'التعيينات الجديدة',
        x: 3,
        y: 0,
        width: 3,
        height: 1,
        config: {
          id: 'card_hires',
          title: 'New Hires',
          titleAr: 'التعيينات الجديدة',
          field: 'new_hires',
          aggregate: 'COUNT',
          icon: 'user-plus',
          color: '#10B981',
        },
      },
      {
        id: 'widget_3',
        type: 'METRIC',
        title: 'Attrition Rate',
        titleAr: 'معدل الاستقالات',
        x: 6,
        y: 0,
        width: 3,
        height: 1,
        config: {
          id: 'card_attrition',
          title: 'Attrition Rate',
          titleAr: 'معدل الاستقالات',
          field: 'attrition_rate',
          aggregate: 'AVG',
          format: 'PERCENTAGE',
          icon: 'trending-down',
          color: '#EF4444',
        },
      },
      {
        id: 'widget_4',
        type: 'METRIC',
        title: 'Open Positions',
        titleAr: 'الوظائف الشاغرة',
        x: 9,
        y: 0,
        width: 3,
        height: 1,
        config: {
          id: 'card_positions',
          title: 'Open Positions',
          titleAr: 'الوظائف الشاغرة',
          field: 'open_positions',
          aggregate: 'COUNT',
          icon: 'briefcase',
          color: '#F59E0B',
        },
      },

      // Charts - Row 2
      {
        id: 'widget_5',
        type: 'CHART',
        title: 'Headcount by Department',
        titleAr: 'عدد الموظفين حسب القسم',
        x: 0,
        y: 1,
        width: 6,
        height: 3,
        config: {
          id: 'chart_dept_headcount',
          type: 'BAR',
          title: 'Headcount by Department',
          titleAr: 'عدد الموظفين حسب القسم',
          xAxis: { field: 'department', label: 'Department', labelAr: 'القسم' },
          yAxis: { field: 'count', label: 'Employees', labelAr: 'الموظفين' },
          series: [{ field: 'count', name: 'Employees', nameAr: 'الموظفين' }],
          colors: ['#3B82F6'],
        },
      },
      {
        id: 'widget_6',
        type: 'CHART',
        title: 'Hiring Trend',
        titleAr: 'اتجاه التوظيف',
        x: 6,
        y: 1,
        width: 6,
        height: 3,
        config: {
          id: 'chart_hiring_trend',
          type: 'LINE',
          title: 'Hiring Trend',
          titleAr: 'اتجاه التوظيف',
          xAxis: { field: 'month', label: 'Month', labelAr: 'الشهر' },
          yAxis: { field: 'hires', label: 'New Hires', labelAr: 'التعيينات' },
          series: [
            { field: 'hires', name: 'Hires', nameAr: 'التعيينات', color: '#10B981' },
            { field: 'exits', name: 'Exits', nameAr: 'المغادرات', color: '#EF4444' },
          ],
        },
      },

      // Table and Pie chart - Row 3
      {
        id: 'widget_7',
        type: 'CHART',
        title: 'Leave Distribution',
        titleAr: 'توزيع الإجازات',
        x: 0,
        y: 4,
        width: 4,
        height: 2,
        config: {
          id: 'chart_leave_dist',
          type: 'PIE',
          title: 'Leave Distribution',
          titleAr: 'توزيع الإجازات',
          series: [
            { field: 'value', name: 'Leave Type', nameAr: 'نوع الإجازة' },
          ],
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        },
      },
      {
        id: 'widget_8',
        type: 'TABLE',
        title: 'Recent Joiners',
        titleAr: 'المنضمون حديثاً',
        x: 4,
        y: 4,
        width: 8,
        height: 2,
        config: {
          columns: [
            { id: 'name', field: 'name', label: 'Name', labelAr: 'الاسم', type: 'STRING', visible: true },
            { id: 'dept', field: 'department', label: 'Department', labelAr: 'القسم', type: 'STRING', visible: true },
            { id: 'date', field: 'joinDate', label: 'Join Date', labelAr: 'تاريخ الانضمام', type: 'DATE', visible: true },
          ],
          pageSize: 5,
          showPagination: false,
          striped: true,
          compact: true,
        },
      },
    ];

    return {
      id: `dash_${Date.now()}`,
      tenantId,
      name: 'HR Executive Dashboard',
      nameAr: 'لوحة المعلومات التنفيذية للموارد البشرية',
      description: 'High-level HR metrics for executives',
      layout: {
        columns: 12,
        rowHeight: 100,
        margin: [16, 16],
      },
      widgets,
      refreshInterval: 300, // 5 minutes
      visibility: 'ORGANIZATION',
      isDefault: true,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get available analytics periods
   */
  static getAnalyticsPeriods(): AnalyticsPeriod[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return [
      {
        label: 'Today',
        labelAr: 'اليوم',
        startDate: today,
        endDate: now,
        comparison: {
          label: 'Yesterday',
          startDate: new Date(today.getTime() - 86400000),
          endDate: new Date(today.getTime() - 1),
        },
      },
      {
        label: 'This Week',
        labelAr: 'هذا الأسبوع',
        startDate: new Date(today.getTime() - today.getDay() * 86400000),
        endDate: now,
        comparison: {
          label: 'Last Week',
          startDate: new Date(today.getTime() - (today.getDay() + 7) * 86400000),
          endDate: new Date(today.getTime() - (today.getDay() + 1) * 86400000),
        },
      },
      {
        label: 'This Month',
        labelAr: 'هذا الشهر',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now,
        comparison: {
          label: 'Last Month',
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          endDate: new Date(now.getFullYear(), now.getMonth(), 0),
        },
      },
      {
        label: 'This Quarter',
        labelAr: 'هذا الربع',
        startDate: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
        endDate: now,
      },
      {
        label: 'This Year',
        labelAr: 'هذا العام',
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: now,
        comparison: {
          label: 'Last Year',
          startDate: new Date(now.getFullYear() - 1, 0, 1),
          endDate: new Date(now.getFullYear() - 1, 11, 31),
        },
      },
    ];
  }
}
