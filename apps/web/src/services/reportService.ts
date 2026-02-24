import axios from 'axios';

const BASE_PATH = '/api/v1/reports';

// Types
export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  filterable?: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export interface Report {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  columns: ReportColumn[];
  filters: ReportFilter[];
  chartType?: 'table' | 'bar' | 'line' | 'pie';
  createdAt: string;
  lastRunAt?: string;
  schedule?: ScheduleConfig;
}

export interface ReportConfig {
  name: string;
  description?: string;
  dataSource: string;
  columns: string[];
  filters: ReportFilter[];
  chartType?: 'table' | 'bar' | 'line' | 'pie';
}

export interface ReportResult {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totalRows: number;
  generatedAt: string;
}

// Service functions
export async function createReport(config: ReportConfig): Promise<Report> {
  const response = await axios.post<Report>(BASE_PATH, config);
  return response.data;
}

export async function listReports(): Promise<Report[]> {
  const response = await axios.get<Report[]>(BASE_PATH);
  return response.data;
}

export async function getReport(id: string): Promise<Report> {
  const response = await axios.get<Report>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function runReport(
  id: string,
  params?: Record<string, unknown>
): Promise<ReportResult> {
  const response = await axios.post<ReportResult>(
    `${BASE_PATH}/${id}/run`,
    params
  );
  return response.data;
}

export async function scheduleReport(
  id: string,
  schedule: ScheduleConfig
): Promise<void> {
  await axios.put(`${BASE_PATH}/${id}/schedule`, schedule);
}

export async function exportReport(
  id: string,
  format: 'pdf' | 'excel' | 'csv'
): Promise<Blob> {
  const response = await axios.get(`${BASE_PATH}/${id}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
}

export async function deleteReport(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/${id}`);
}
