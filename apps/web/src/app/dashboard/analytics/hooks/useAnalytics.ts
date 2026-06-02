'use client';

import { useState, useEffect } from 'react';
import type { StandardReport, CustomReport, Dashboard, ScheduledReport, RealtimeMetric, ComplianceReport, ExecutiveDashboard, PredictiveAnalytics, AnalyticsSettings, Toast } from '../types';
import { StandardReportService, CustomReportService, DashboardService, ScheduledReportService, ReportExportService, RealtimeMetricsService, ComplianceReportService, ExecutiveDashboardService, PredictiveAnalyticsService, AnalyticsSettingsService } from '../services';
import { sampleStandardReports, sampleCustomReports, sampleDashboards, sampleScheduledReports, sampleRealtimeMetrics, sampleComplianceReports, sampleExecutiveDashboards, samplePredictiveAnalytics, sampleAnalyticsSettings } from '../data';

export const useAnalytics = () => {
  const [standardReports, setStandardReports] = useState<StandardReport[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetric[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [executiveDashboards, setExecutiveDashboards] = useState<ExecutiveDashboard[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics[]>([]);
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const existing = await StandardReportService.getAllReports();
      if (existing.length === 0) {
        localStorage.setItem('analytics_standard_reports', JSON.stringify(sampleStandardReports));
        localStorage.setItem('analytics_custom_reports', JSON.stringify(sampleCustomReports));
        localStorage.setItem('analytics_dashboards', JSON.stringify(sampleDashboards));
        localStorage.setItem('analytics_scheduled_reports', JSON.stringify(sampleScheduledReports));
        localStorage.setItem('analytics_realtime_metrics', JSON.stringify(sampleRealtimeMetrics));
        localStorage.setItem('analytics_compliance_reports', JSON.stringify(sampleComplianceReports));
        localStorage.setItem('analytics_executive_dashboards', JSON.stringify(sampleExecutiveDashboards));
        localStorage.setItem('analytics_predictive', JSON.stringify(samplePredictiveAnalytics));
      }

      await Promise.all([
        loadStandardReports(),
        loadCustomReports(),
        loadDashboards(),
        loadScheduledReports(),
        loadRealtimeMetrics(),
        loadComplianceReports(),
        loadExecutiveDashboards(),
        loadPredictiveAnalytics(),
        loadSettings(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      addToast({ type: 'error', message: 'Failed to load analytics data' });
    } finally {
      setLoading(false);
    }
  };

  const loadStandardReports = async () => {
    try {
      const reports = await StandardReportService.getAllReports();
      setStandardReports(reports);
    } catch (error: any) {
      console.error('Error loading standard reports:', error);
    }
  };

  const generateStandardReport = async (reportId: string, parameters: any) => {
    setLoading(true);
    try {
      const report = await StandardReportService.generateReport(reportId, parameters);
      addToast({ type: 'success', message: 'Report generated successfully' });
      return report;
    } catch (error: any) {
      console.error('Error generating report:', error);
      addToast({ type: 'error', message: 'Failed to generate report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadCustomReports = async () => {
    try {
      const reports = await CustomReportService.getAllReports();
      setCustomReports(reports);
    } catch (error: any) {
      console.error('Error loading custom reports:', error);
    }
  };

  const createCustomReport = async (reportData: any) => {
    setLoading(true);
    try {
      const report = await CustomReportService.createReport(reportData);
      await loadCustomReports();
      addToast({ type: 'success', message: 'Custom report created' });
      return report;
    } catch (error: any) {
      console.error('Error creating report:', error);
      addToast({ type: 'error', message: 'Failed to create report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadDashboards = async () => {
    try {
      const dashboardList = await DashboardService.getAllDashboards();
      setDashboards(dashboardList);
      const defaultDash = dashboardList.find(d => d.isDefault);
      if (defaultDash) setSelectedDashboard(defaultDash);
    } catch (error: any) {
      console.error('Error loading dashboards:', error);
    }
  };

  const createDashboard = async (dashboardData: any) => {
    setLoading(true);
    try {
      const dashboard = await DashboardService.createDashboard(dashboardData);
      await loadDashboards();
      addToast({ type: 'success', message: 'Dashboard created' });
      return dashboard;
    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      addToast({ type: 'error', message: 'Failed to create dashboard' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadScheduledReports = async () => {
    try {
      const schedules = await ScheduledReportService.getAllScheduledReports();
      setScheduledReports(schedules);
    } catch (error: any) {
      console.error('Error loading scheduled reports:', error);
    }
  };

  const createScheduledReport = async (scheduleData: any) => {
    setLoading(true);
    try {
      const schedule = await ScheduledReportService.createSchedule(scheduleData);
      await loadScheduledReports();
      addToast({ type: 'success', message: 'Report scheduled' });
      return schedule;
    } catch (error: any) {
      console.error('Error scheduling report:', error);
      addToast({ type: 'error', message: 'Failed to schedule report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportId: string, format: string) => {
    setLoading(true);
    try {
      const exportRecord = await ReportExportService.exportReport(reportId, format);
      addToast({ type: 'success', message: `Report exported as ${format.toUpperCase()}` });
      return exportRecord;
    } catch (error: any) {
      console.error('Error exporting report:', error);
      addToast({ type: 'error', message: 'Failed to export report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeMetrics = async () => {
    try {
      const metrics = await RealtimeMetricsService.getMetrics();
      setRealtimeMetrics(metrics);
    } catch (error: any) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadComplianceReports = async () => {
    try {
      const reports = await ComplianceReportService.getAllReports();
      setComplianceReports(reports);
    } catch (error: any) {
      console.error('Error loading compliance reports:', error);
    }
  };

  const loadExecutiveDashboards = async () => {
    try {
      const dashboardList = await ExecutiveDashboardService.getAllDashboards();
      setExecutiveDashboards(dashboardList);
    } catch (error: any) {
      console.error('Error loading executive dashboards:', error);
    }
  };

  const loadPredictiveAnalytics = async () => {
    try {
      const analytics = await PredictiveAnalyticsService.getAnalytics();
      setPredictiveAnalytics(analytics);
    } catch (error: any) {
      console.error('Error loading predictive analytics:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await AnalyticsSettingsService.getSettings();
      setSettings(settingsData);
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<AnalyticsSettings>) => {
    setLoading(true);
    try {
      const updated = await AnalyticsSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated' });
      return updated;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    standardReports,
    customReports,
    dashboards,
    selectedDashboard,
    setSelectedDashboard,
    scheduledReports,
    realtimeMetrics,
    complianceReports,
    executiveDashboards,
    predictiveAnalytics,
    settings,
    loading,
    toasts,
    loadStandardReports,
    generateStandardReport,
    loadCustomReports,
    createCustomReport,
    loadDashboards,
    createDashboard,
    loadScheduledReports,
    createScheduledReport,
    exportReport,
    loadRealtimeMetrics,
    loadComplianceReports,
    loadExecutiveDashboards,
    loadPredictiveAnalytics,
    loadSettings,
    updateSettings,
    addToast,
    removeToast,
  };
};
