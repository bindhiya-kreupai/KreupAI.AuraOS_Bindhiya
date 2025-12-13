// Analytics Module - Service Layer

import {
  StandardReport, CustomReport, Dashboard, ScheduledReport,
  ReportExport, RealtimeMetric, DrilldownReport, CrossModuleReport,
  ComplianceReport, ExecutiveDashboard, PredictiveAnalytics,
  ReportSecurity, AnalyticsSettings
} from './types';

const STORAGE_KEYS = {
  STANDARD_REPORTS: 'analytics_standard_reports',
  CUSTOM_REPORTS: 'analytics_custom_reports',
  DASHBOARDS: 'analytics_dashboards',
  SCHEDULED_REPORTS: 'analytics_scheduled_reports',
  EXPORTS: 'analytics_exports',
  METRICS: 'analytics_realtime_metrics',
  COMPLIANCE: 'analytics_compliance_reports',
  EXECUTIVE: 'analytics_executive_dashboards',
  PREDICTIVE: 'analytics_predictive',
  SECURITY: 'analytics_security',
  SETTINGS: 'analytics_settings',
};

export class StandardReportService {
  static async getAllReports(): Promise<StandardReport[]> {
    const data = localStorage.getItem(STORAGE_KEYS.STANDARD_REPORTS);
    return data ? JSON.parse(data) : [];
  }

  static async getReportById(reportId: string): Promise<StandardReport | null> {
    const reports = await this.getAllReports();
    return reports.find(r => r.reportId === reportId) || null;
  }

  static async generateReport(reportId: string, parameters: any): Promise<StandardReport> {
    const report = await this.getReportById(reportId);
    if (!report) throw new Error('Report not found');
    
    const generated = {
      ...report,
      generatedDate: new Date(),
      generatedBy: 'current-user',
      status: 'published' as const,
    };
    
    return generated;
  }
}

export class CustomReportService {
  static async getAllReports(): Promise<CustomReport[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_REPORTS);
    return data ? JSON.parse(data) : [];
  }

  static async createReport(reportData: Partial<CustomReport>): Promise<CustomReport> {
    const reports = await this.getAllReports();
    const newReport: CustomReport = {
      reportId: \`custom-\${Date.now()}\`,
      reportName: reportData.reportName || 'New Custom Report',
      createdBy: 'current-user',
      filters: reportData.filters || [],
      columns: reportData.columns || [],
      groupings: reportData.groupings || [],
      sortOrder: reportData.sortOrder || [],
      savedDate: new Date(),
      isPublic: reportData.isPublic || false,
      status: 'draft',
      ...reportData,
    };
    
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_REPORTS, JSON.stringify(reports));
    return newReport;
  }

  static async updateReport(reportId: string, updates: Partial<CustomReport>): Promise<CustomReport> {
    const reports = await this.getAllReports();
    const index = reports.findIndex(r => r.reportId === reportId);
    if (index === -1) throw new Error('Report not found');
    
    reports[index] = { ...reports[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CUSTOM_REPORTS, JSON.stringify(reports));
    return reports[index];
  }
}

export class DashboardService {
  static async getAllDashboards(): Promise<Dashboard[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DASHBOARDS);
    return data ? JSON.parse(data) : [];
  }

  static async createDashboard(dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    const dashboards = await this.getAllDashboards();
    const newDashboard: Dashboard = {
      dashboardId: \`dash-\${Date.now()}\`,
      dashboardName: dashboardData.dashboardName || 'New Dashboard',
      widgets: dashboardData.widgets || [],
      layout: dashboardData.layout || { columns: 12, rowHeight: 100, margin: 10, padding: 10 },
      refreshRate: dashboardData.refreshRate || 300,
      filters: dashboardData.filters || [],
      createdBy: 'current-user',
      createdDate: new Date(),
      isDefault: dashboardData.isDefault || false,
      ...dashboardData,
    };
    
    dashboards.push(newDashboard);
    localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(dashboards));
    return newDashboard;
  }

  static async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const dashboards = await this.getAllDashboards();
    const index = dashboards.findIndex(d => d.dashboardId === dashboardId);
    if (index === -1) throw new Error('Dashboard not found');
    
    dashboards[index] = { ...dashboards[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(dashboards));
    return dashboards[index];
  }
}

export class ScheduledReportService {
  static async getAllScheduledReports(): Promise<ScheduledReport[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULED_REPORTS);
    return data ? JSON.parse(data) : [];
  }

  static async createSchedule(scheduleData: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const schedules = await this.getAllScheduledReports();
    const newSchedule: ScheduledReport = {
      scheduleId: \`sched-\${Date.now()}\`,
      reportId: scheduleData.reportId || '',
      reportName: scheduleData.reportName || '',
      frequency: scheduleData.frequency || 'weekly',
      recipients: scheduleData.recipients || [],
      format: scheduleData.format || 'pdf',
      parameters: scheduleData.parameters || {},
      nextRunDate: new Date(),
      enabled: true,
      ...scheduleData,
    };
    
    schedules.push(newSchedule);
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_REPORTS, JSON.stringify(schedules));
    return newSchedule;
  }
}

export class ReportExportService {
  static async exportReport(reportId: string, format: string): Promise<ReportExport> {
    const exportRecord: ReportExport = {
      exportId: \`export-\${Date.now()}\`,
      reportId,
      format: format as any,
      exportDate: new Date(),
      fileUrl: \`/exports/\${reportId}.\${format}\`,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    
    return exportRecord;
  }
}

export class RealtimeMetricsService {
  static async getMetrics(): Promise<RealtimeMetric[]> {
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : [];
  }
}

export class ComplianceReportService {
  static async getAllReports(): Promise<ComplianceReport[]> {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLIANCE);
    return data ? JSON.parse(data) : [];
  }
}

export class ExecutiveDashboardService {
  static async getAllDashboards(): Promise<ExecutiveDashboard[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EXECUTIVE);
    return data ? JSON.parse(data) : [];
  }
}

export class PredictiveAnalyticsService {
  static async getAnalytics(): Promise<PredictiveAnalytics[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PREDICTIVE);
    return data ? JSON.parse(data) : [];
  }
}

export class ReportSecurityService {
  static async getReportSecurity(reportId: string): Promise<ReportSecurity | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SECURITY);
    const securities: ReportSecurity[] = data ? JSON.parse(data) : [];
    return securities.find(s => s.reportId === reportId) || null;
  }
}

export class AnalyticsSettingsService {
  static async getSettings(): Promise<AnalyticsSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return JSON.parse(data);
    
    const defaultSettings: AnalyticsSettings = {
      settingsId: 'settings-1',
      defaultRefreshRate: 300,
      enableRealtime: true,
      dataRetentionDays: 90,
      allowCustomReports: true,
      maxScheduledReports: 50,
      enablePredictive: true,
      exportFormats: ['pdf', 'excel', 'csv'],
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'system',
    };
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<AnalyticsSettings>): Promise<AnalyticsSettings> {
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
    };
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
