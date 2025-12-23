/**
 * Advanced Reporting Engine Types
 * Phase 3: Intelligence Layer - Reporting & Analytics
 */

// ============================================================================
// REPORT CONFIGURATION
// ============================================================================

export type ReportType =
  | 'PAYROLL'
  | 'ATTENDANCE'
  | 'LEAVE'
  | 'HEADCOUNT'
  | 'ATTRITION'
  | 'PERFORMANCE'
  | 'RECRUITMENT'
  | 'COMPLIANCE'
  | 'CUSTOM';

export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export type ReportFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type ReportStatus = 'DRAFT' | 'SCHEDULED' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ReportDefinition {
  id: string;
  tenantId: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  type: ReportType;
  category?: string;
  template?: string;

  // Data Configuration
  dataSource: ReportDataSource;
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string[];
  orderBy?: ReportOrderBy[];

  // Calculations
  aggregations?: ReportAggregation[];
  calculations?: ReportCalculation[];

  // Display
  charts?: ChartConfig[];
  summaryCards?: SummaryCardConfig[];

  // Output
  defaultFormat: ReportFormat;
  availableFormats: ReportFormat[];

  // Access Control
  visibility: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'ORGANIZATION';
  allowedRoles?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportDataSource {
  type: 'SINGLE' | 'JOIN' | 'UNION' | 'SUBQUERY';
  primary: string; // Table/Entity name
  joins?: DataJoin[];
  conditions?: DataCondition[];
}

export interface DataJoin {
  table: string;
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  on: {
    sourceField: string;
    targetField: string;
  };
}

export interface DataCondition {
  field: string;
  operator: 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'NOT_IN' | 'LIKE' | 'BETWEEN' | 'IS_NULL' | 'IS_NOT_NULL';
  value?: any;
  values?: any[];
}

export interface ReportColumn {
  id: string;
  field: string;
  label: string;
  labelAr?: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'CURRENCY' | 'PERCENTAGE';
  format?: string; // Date format, number format, etc.
  width?: number;
  align?: 'LEFT' | 'CENTER' | 'RIGHT';
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
  aggregate?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
}

export interface ReportFilter {
  id: string;
  field: string;
  label: string;
  labelAr?: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'DATE_RANGE' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN';
  operator: DataCondition['operator'];
  defaultValue?: any;
  options?: { value: any; label: string; labelAr?: string }[];
  required?: boolean;
}

export interface ReportOrderBy {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface ReportAggregation {
  id: string;
  field: string;
  function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'DISTINCT_COUNT';
  label: string;
  labelAr?: string;
  format?: string;
}

export interface ReportCalculation {
  id: string;
  name: string;
  formula: string; // e.g., "{field1} / {field2} * 100"
  type: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY';
  label: string;
  labelAr?: string;
}

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

export interface ChartConfig {
  id: string;
  type: 'BAR' | 'LINE' | 'PIE' | 'DONUT' | 'AREA' | 'SCATTER' | 'RADAR' | 'FUNNEL' | 'GAUGE';
  title: string;
  titleAr?: string;
  xAxis?: {
    field: string;
    label: string;
    labelAr?: string;
  };
  yAxis?: {
    field: string;
    label: string;
    labelAr?: string;
    format?: string;
  };
  series: ChartSeries[];
  colors?: string[];
  legend?: {
    position: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'NONE';
  };
  stacked?: boolean;
  showValues?: boolean;
  height?: number;
}

export interface ChartSeries {
  field: string;
  name: string;
  nameAr?: string;
  type?: 'BAR' | 'LINE' | 'AREA';
  color?: string;
  aggregate?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
}

export interface SummaryCardConfig {
  id: string;
  title: string;
  titleAr?: string;
  field: string;
  aggregate: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  format?: string;
  icon?: string;
  color?: string;
  trend?: {
    field: string;
    period: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  };
}

// ============================================================================
// REPORT EXECUTION
// ============================================================================

export interface ReportExecution {
  id: string;
  tenantId: string;
  reportId: string;
  reportName: string;
  status: ReportStatus;
  format: ReportFormat;

  // Parameters
  parameters: Record<string, any>;
  filterValues: Record<string, any>;

  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Output
  outputUrl?: string;
  outputSize?: number; // bytes
  rowCount?: number;

  // Error handling
  errorMessage?: string;
  retryCount?: number;

  // Audit
  executedBy: string;
  createdAt: Date;
}

export interface ReportSchedule {
  id: string;
  tenantId: string;
  reportId: string;
  name: string;

  // Schedule
  frequency: ReportFrequency;
  cronExpression?: string;
  timezone: string;
  startDate: Date;
  endDate?: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;

  // Configuration
  format: ReportFormat;
  parameters: Record<string, any>;
  filterValues: Record<string, any>;

  // Delivery
  deliveryMethod: 'EMAIL' | 'STORAGE' | 'WEBHOOK' | 'SFTP';
  deliveryConfig: {
    recipients?: string[];
    storagePath?: string;
    webhookUrl?: string;
    sftpConfig?: {
      host: string;
      path: string;
      username: string;
    };
  };

  // Status
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REPORT DATA & RESULTS
// ============================================================================

export interface ReportData {
  columns: ReportColumn[];
  rows: Record<string, any>[];
  totalRows: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  aggregates?: Record<string, any>;
  groupedData?: GroupedReportData[];
}

export interface GroupedReportData {
  groupValue: any;
  groupLabel: string;
  rows: Record<string, any>[];
  subtotals: Record<string, any>;
}

export interface ReportResult {
  id: string;
  executionId: string;
  reportId: string;
  reportName: string;
  generatedAt: Date;

  // Content
  data: ReportData;
  charts?: ChartData[];
  summary?: SummaryData[];

  // Metadata
  parameters: Record<string, any>;
  generationTime: number; // milliseconds
}

export interface ChartData {
  config: ChartConfig;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }[];
  };
}

export interface SummaryData {
  config: SummaryCardConfig;
  value: number | string;
  formattedValue: string;
  trend?: {
    direction: 'UP' | 'DOWN' | 'FLAT';
    percentage: number;
    previousValue: number | string;
  };
}

// ============================================================================
// PREDEFINED REPORT TEMPLATES
// ============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: ReportType;
  category: string;
  icon: string;
  definition: Partial<ReportDefinition>;
  previewImage?: string;
  isSystem: boolean;
}

// ============================================================================
// DASHBOARD CONFIGURATION
// ============================================================================

export interface DashboardConfig {
  id: string;
  tenantId: string;
  name: string;
  nameAr?: string;
  description?: string;

  // Layout
  layout: DashboardLayout;
  widgets: DashboardWidget[];

  // Settings
  refreshInterval?: number; // seconds
  defaultDateRange?: string;
  theme?: 'LIGHT' | 'DARK' | 'SYSTEM';

  // Access
  visibility: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'ORGANIZATION';
  isDefault?: boolean;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
}

export interface DashboardWidget {
  id: string;
  type: 'CHART' | 'TABLE' | 'METRIC' | 'TEXT' | 'REPORT' | 'FILTER';
  title: string;
  titleAr?: string;

  // Position
  x: number;
  y: number;
  width: number;
  height: number;

  // Configuration
  config: ChartConfig | SummaryCardConfig | TableWidgetConfig | TextWidgetConfig | FilterWidgetConfig;

  // Data
  reportId?: string;
  dataSource?: ReportDataSource;
  refreshInterval?: number;
}

export interface TableWidgetConfig {
  columns: ReportColumn[];
  pageSize: number;
  showPagination: boolean;
  striped: boolean;
  compact: boolean;
}

export interface TextWidgetConfig {
  content: string;
  contentAr?: string;
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  align: 'LEFT' | 'CENTER' | 'RIGHT';
}

export interface FilterWidgetConfig {
  filters: ReportFilter[];
  layout: 'HORIZONTAL' | 'VERTICAL';
  targetWidgets: string[]; // Widget IDs to filter
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsMetric {
  id: string;
  name: string;
  nameAr: string;
  value: number | string;
  formattedValue: string;
  trend?: {
    direction: 'UP' | 'DOWN' | 'FLAT';
    percentage: number;
    isPositive: boolean;
  };
  sparkline?: number[];
  icon?: string;
  color?: string;
}

export interface AnalyticsPeriod {
  label: string;
  labelAr: string;
  startDate: Date;
  endDate: Date;
  comparison?: {
    label: string;
    startDate: Date;
    endDate: Date;
  };
}

export interface AnalyticsFilter {
  departmentIds?: string[];
  locationIds?: string[];
  employeeTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  customFilters?: Record<string, any>;
}
