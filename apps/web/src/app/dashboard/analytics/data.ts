// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Analytics Module - Sample Data

import type { StandardReport, CustomReport, Dashboard, ScheduledReport, RealtimeMetric, ComplianceReport, ExecutiveDashboard, PredictiveAnalytics, AnalyticsSettings } from './types';

export const sampleStandardReports: StandardReport[] = [
  {
    reportId: 'std-001',
    reportName: 'Employee Headcount Report',
    category: 'HR Analytics',
    description: 'Comprehensive headcount analysis by department, location, and job level',
    parameters: [
      { paramId: 'p1', paramName: 'Start Date', paramType: 'date', required: true },
      { paramId: 'p2', paramName: 'End Date', paramType: 'date', required: true },
      { paramId: 'p3', paramName: 'Department', paramType: 'multiselect', required: false, options: ['Engineering', 'Sales', 'Marketing'] },
    ],
    dataSource: 'HRIS',
    status: 'active',
  },
  {
    reportId: 'std-002',
    reportName: 'Attrition Analysis',
    category: 'HR Analytics',
    description: 'Turnover trends, reasons, and department-wise breakdown',
    parameters: [],
    dataSource: 'HRIS',
    status: 'active',
  },
];

export const sampleCustomReports: CustomReport[] = [
  {
    reportId: 'custom-001',
    reportName: 'Engineering Performance Dashboard',
    createdBy: 'john.doe',
    filters: [
      { field: 'department', operator: 'equals', value: 'Engineering' },
    ],
    columns: [
      { columnId: 'c1', fieldName: 'employeeName', displayName: 'Employee', dataType: 'string' },
      { columnId: 'c2', fieldName: 'performanceScore', displayName: 'Score', dataType: 'number', aggregation: 'avg' },
    ],
    groupings: ['team'],
    sortOrder: [{ field: 'performanceScore', direction: 'desc' }],
    savedDate: new Date(),
    isPublic: true,
    status: 'published',
  },
];

export const sampleDashboards: Dashboard[] = [
  {
    dashboardId: 'dash-001',
    dashboardName: 'HR Overview Dashboard',
    widgets: [
      {
        widgetId: 'w1',
        widgetType: 'metric',
        title: 'Total Employees',
        dataSource: 'employee_count',
        config: { value: 1250, change: 5.2 },
        position: { x: 0, y: 0, w: 3, h: 2 },
      },
      {
        widgetId: 'w2',
        widgetType: 'chart',
        title: 'Headcount Trend',
        dataSource: 'headcount_trend',
        config: { chartType: 'line' },
        position: { x: 3, y: 0, w: 6, h: 4 },
      },
    ],
    layout: { columns: 12, rowHeight: 100, margin: 10, padding: 10 },
    refreshRate: 300,
    filters: [],
    createdBy: 'admin',
    createdDate: new Date(),
    isDefault: true,
  },
];

export const sampleScheduledReports: ScheduledReport[] = [
  {
    scheduleId: 'sched-001',
    reportId: 'std-001',
    reportName: 'Weekly Headcount Report',
    frequency: 'weekly',
    recipients: ['hr-team@company.com', 'ceo@company.com'],
    format: 'pdf',
    parameters: {},
    nextRunDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    enabled: true,
  },
];

export const sampleRealtimeMetrics: RealtimeMetric[] = [
  {
    metricId: 'metric-001',
    metricName: 'Active Employees',
    value: 1250,
    previousValue: 1187,
    change: 63,
    changePercentage: 5.3,
    trend: 'up',
    lastUpdated: new Date(),
  },
  {
    metricId: 'metric-002',
    metricName: 'Open Positions',
    value: 45,
    previousValue: 38,
    change: 7,
    changePercentage: 18.4,
    trend: 'up',
    lastUpdated: new Date(),
  },
];

export const sampleComplianceReports: ComplianceReport[] = [
  {
    reportId: 'comp-001',
    reportType: 'EEO-1',
    complianceStandard: 'EEOC',
    reportingPeriod: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
    findings: [],
    overallScore: 95,
    status: 'compliant',
    generatedDate: new Date(),
  },
];

export const sampleExecutiveDashboards: ExecutiveDashboard[] = [
  {
    dashboardId: 'exec-001',
    title: 'Executive Summary - Q1 2024',
    kpis: [
      {
        kpiId: 'kpi-001',
        name: 'Employee Retention Rate',
        value: 92,
        target: 90,
        achievement: 102,
        trend: 'up',
        status: 'on_track',
      },
      {
        kpiId: 'kpi-002',
        name: 'Time to Fill',
        value: 35,
        target: 30,
        achievement: 86,
        trend: 'down',
        status: 'at_risk',
      },
    ],
    summaries: [
      {
        summaryId: 'sum-001',
        category: 'Workforce',
        headline: 'Headcount increased by 5.3% QoQ',
        details: 'Strong hiring in Engineering and Sales departments',
        metrics: [
          { label: 'Total Headcount', value: 1250 },
          { label: 'New Hires', value: 63 },
        ],
      },
    ],
    insights: ['Retention rates exceeding target', 'Hiring pipeline strong in technical roles'],
    alerts: [
      {
        alertId: 'alert-001',
        severity: 'warning',
        message: 'Time to fill trending above target',
        affectedMetric: 'Time to Fill',
        actionRequired: true,
      },
    ],
    period: 'Q1 2024',
  },
];

export const samplePredictiveAnalytics: PredictiveAnalytics[] = [
  {
    analysisId: 'pred-001',
    analysisType: 'Headcount Forecast',
    predictions: [
      {
        predictionId: 'pred-001-1',
        metric: 'Total Headcount',
        predictedValue: 1320,
        confidenceInterval: { lower: 1280, upper: 1360 },
        factors: ['Hiring plan', 'Attrition trend', 'Business growth'],
        probability: 85,
      },
    ],
    confidence: 85,
    methodology: 'Time series forecasting with trend analysis',
    generatedDate: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
];

export const sampleAnalyticsSettings: AnalyticsSettings = {
  settingsId: 'settings-001',
  defaultRefreshRate: 300,
  enableRealtime: true,
  dataRetentionDays: 90,
  allowCustomReports: true,
  maxScheduledReports: 50,
  enablePredictive: true,
  exportFormats: ['pdf', 'excel', 'csv', 'powerpoint'],
  lastUpdatedDate: new Date(),
  lastUpdatedBy: 'admin',
};
