/**
 * Analytics Module - Service Layer
 *
 * API-integrated service layer using APIClient.
 */

import { APIClient } from '@/lib/api-client';
import type {
  StandardReport, CustomReport, Dashboard, ScheduledReport,
  ReportExport, RealtimeMetric, DrilldownReport, CrossModuleReport,
  ComplianceReport, ExecutiveDashboard, PredictiveAnalytics,
  ReportSecurity, AnalyticsSettings
} from './types';

export class StandardReportService {
  static async getAllReports(): Promise<StandardReport[]> {
    try {
      return await APIClient.get<StandardReport[]>('/analytics/reports');
    } catch {
            return [];
    }
  }

  static async getReportById(reportId: string): Promise<StandardReport | null> {
    try {
      return await APIClient.get<StandardReport>(`/analytics/reports/${reportId}`);
    } catch {
            return null;
    }
  }

  static async generateReport(reportId: string, parameters: any): Promise<StandardReport> {
    try {
      return await APIClient.post<StandardReport>(`/analytics/reports/${reportId}/generate`, { parameters });
    } catch {
            throw error;
    }
  }
}

export class CustomReportService {
  static async getAllReports(): Promise<CustomReport[]> {
    try {
      return await APIClient.get<CustomReport[]>('/analytics/custom-reports');
    } catch {
            return [];
    }
  }

  static async createReport(reportData: Partial<CustomReport>): Promise<CustomReport> {
    try {
      return await APIClient.post<CustomReport>('/analytics/custom-reports', reportData);
    } catch {
            throw error;
    }
  }

  static async updateReport(reportId: string, updates: Partial<CustomReport>): Promise<CustomReport> {
    try {
      return await APIClient.put<CustomReport>(`/analytics/custom-reports/${reportId}`, updates);
    } catch {
            throw error;
    }
  }
}

export class DashboardService {
  static async getAllDashboards(): Promise<Dashboard[]> {
    try {
      return await APIClient.get<Dashboard[]>('/analytics/dashboards');
    } catch {
            return [];
    }
  }

  static async createDashboard(dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    try {
      return await APIClient.post<Dashboard>('/analytics/dashboards', dashboardData);
    } catch {
            throw error;
    }
  }

  static async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    try {
      return await APIClient.put<Dashboard>(`/analytics/dashboards/${dashboardId}`, updates);
    } catch {
            throw error;
    }
  }
}

export class ScheduledReportService {
  static async getAllScheduledReports(): Promise<ScheduledReport[]> {
    try {
      return await APIClient.get<ScheduledReport[]>('/analytics/scheduled-reports');
    } catch {
            return [];
    }
  }

  static async createSchedule(scheduleData: Partial<ScheduledReport>): Promise<ScheduledReport> {
    try {
      return await APIClient.post<ScheduledReport>('/analytics/scheduled-reports', scheduleData);
    } catch {
            throw error;
    }
  }
}

export class ReportExportService {
  static async exportReport(reportId: string, format: string): Promise<ReportExport> {
    try {
      return await APIClient.post<ReportExport>(`/analytics/reports/${reportId}/export`, { format });
    } catch {
            throw error;
    }
  }
}

export class RealtimeMetricsService {
  static async getMetrics(): Promise<RealtimeMetric[]> {
    try {
      return await APIClient.get<RealtimeMetric[]>('/analytics/metrics/realtime');
    } catch {
            return [];
    }
  }
}

export class ComplianceReportService {
  static async getAllReports(): Promise<ComplianceReport[]> {
    try {
      return await APIClient.get<ComplianceReport[]>('/analytics/compliance-reports');
    } catch {
            return [];
    }
  }
}

export class ExecutiveDashboardService {
  static async getAllDashboards(): Promise<ExecutiveDashboard[]> {
    try {
      return await APIClient.get<ExecutiveDashboard[]>('/analytics/executive-dashboards');
    } catch {
            return [];
    }
  }
}

export class PredictiveAnalyticsService {
  static async getAnalytics(): Promise<PredictiveAnalytics[]> {
    try {
      return await APIClient.get<PredictiveAnalytics[]>('/analytics/predictive');
    } catch {
            return [];
    }
  }
}

export class ReportSecurityService {
  static async getReportSecurity(reportId: string): Promise<ReportSecurity | null> {
    try {
      return await APIClient.get<ReportSecurity>(`/analytics/security/${reportId}`);
    } catch {
            return null;
    }
  }
}

export class AnalyticsSettingsService {
  static async getSettings(): Promise<AnalyticsSettings> {
    try {
      return await APIClient.get<AnalyticsSettings>('/analytics/settings');
    } catch {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<AnalyticsSettings>): Promise<AnalyticsSettings> {
    try {
      return await APIClient.put<AnalyticsSettings>('/analytics/settings', updates);
    } catch {
            throw error;
    }
  }
}
