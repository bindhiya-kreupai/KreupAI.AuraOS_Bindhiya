// Analytics Module - Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'draft' | 'published';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'powerpoint';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface StandardReport {
  reportId: string;
  reportName: string;
  category: string;
  description: string;
  parameters: ReportParameter[];
  dataSource: string;
  generatedDate?: Date;
  generatedBy?: string;
  status: Status;
}

export interface CustomReport {
  reportId: string;
  reportName: string;
  createdBy: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  groupings: string[];
  sortOrder: SortConfig[];
  chartType?: string;
  savedDate: Date;
  isPublic: boolean;
  status: Status;
}

export interface Dashboard {
  dashboardId: string;
  dashboardName: string;
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  refreshRate: number;
  filters: GlobalFilter[];
  createdBy: string;
  createdDate: Date;
  isDefault: boolean;
}

export interface DashboardWidget {
  widgetId: string;
  widgetType: 'chart' | 'metric' | 'table' | 'gauge';
  title: string;
  dataSource: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval?: number;
}

export interface ScheduledReport {
  scheduleId: string;
  reportId: string;
  reportName: string;
  frequency: ScheduleFrequency;
  recipients: string[];
  format: ReportFormat;
  parameters: any;
  nextRunDate: Date;
  lastRunDate?: Date;
  enabled: boolean;
}

export interface ReportExport {
  exportId: string;
  reportId: string;
  format: ReportFormat;
  exportDate: Date;
  fileUrl: string;
  expiryDate: Date;
}

export interface RealtimeMetric {
  metricId: string;
  metricName: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface DrilldownReport {
  reportId: string;
  title: string;
  levels: DrilldownLevel[];
  currentLevel: number;
  breadcrumb: string[];
}

export interface DrilldownLevel {
  levelName: string;
  data: any[];
  aggregations: Aggregation[];
}

export interface CrossModuleReport {
  reportId: string;
  reportName: string;
  modules: string[];
  dataConnections: DataConnection[];
  joinType: 'inner' | 'left' | 'right' | 'full';
  generatedDate: Date;
}

export interface ComplianceReport {
  reportId: string;
  reportType: string;
  complianceStandard: string;
  reportingPeriod: { start: Date; end: Date };
  findings: ComplianceFinding[];
  overallScore: number;
  status: 'compliant' | 'non_compliant' | 'needs_review';
  generatedDate: Date;
  submittedDate?: Date;
}

export interface ComplianceFinding {
  findingId: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface ExecutiveDashboard {
  dashboardId: string;
  title: string;
  kpis: KPI[];
  summaries: ExecutiveSummary[];
  insights: string[];
  alerts: Alert[];
  period: string;
}

export interface KPI {
  kpiId: string;
  name: string;
  value: number;
  target: number;
  achievement: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on_track' | 'at_risk' | 'off_track';
}

export interface ExecutiveSummary {
  summaryId: string;
  category: string;
  headline: string;
  details: string;
  metrics: { label: string; value: any }[];
}

export interface PredictiveAnalytics {
  analysisId: string;
  analysisType: string;
  predictions: Prediction[];
  confidence: number;
  methodology: string;
  generatedDate: Date;
  validUntil: Date;
}

export interface Prediction {
  predictionId: string;
  metric: string;
  predictedValue: number;
  confidenceInterval: { lower: number; upper: number };
  factors: string[];
  probability: number;
}

export interface ReportSecurity {
  securityId: string;
  reportId: string;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  allowedRoles: string[];
  allowedUsers: string[];
  restrictions: SecurityRestriction[];
}

export interface SecurityRestriction {
  restrictionType: string;
  field: string;
  condition: string;
}

export interface ReportParameter {
  paramId: string;
  paramName: string;
  paramType: 'text' | 'number' | 'date' | 'dropdown' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ReportColumn {
  columnId: string;
  fieldName: string;
  displayName: string;
  dataType: string;
  format?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface LayoutConfig {
  columns: number;
  rowHeight: number;
  margin: number;
  padding: number;
}

export interface GlobalFilter {
  filterId: string;
  filterName: string;
  field: string;
  value: any;
}

export interface Aggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  alias: string;
}

export interface DataConnection {
  connectionId: string;
  sourceModule: string;
  targetModule: string;
  joinField: string;
}

export interface Alert {
  alertId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedMetric: string;
  actionRequired: boolean;
}

export interface AnalyticsSettings {
  settingsId: string;
  defaultRefreshRate: number;
  enableRealtime: boolean;
  dataRetentionDays: number;
  allowCustomReports: boolean;
  maxScheduledReports: number;
  enablePredictive: boolean;
  exportFormats: ReportFormat[];
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
