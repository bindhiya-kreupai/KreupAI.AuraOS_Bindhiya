/**
 * Manager Self-Service (MSS) Module - Custom Hook
 * Centralized state management and business logic for managers
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  TeamMember,
  TeamMetrics,
  TeamGoal,
  ApprovalRequest,
  ApprovalSummary,
  ApprovalComment,
  TeamReport,
  ReportType,
  DelegationRule,
  DelegationSummary,
  DelegationSettings,
  DelegationAction,
  ManagerAnalytics,
  ManagerSettings,
} from '../types';
import {
  TeamDashboardService,
  ApprovalCenterService,
  TeamReportsService,
  DelegationService,
  ManagerAnalyticsService,
  ManagerSettingsService,
} from '../services';

export interface UseManagerSelfServiceReturn {
  // Team Dashboard
  teamMembers: TeamMember[];
  teamMetrics: TeamMetrics | null;
  teamGoals: TeamGoal[];
  getTeamMemberById: (memberId: string) => Promise<TeamMember>;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<TeamMember>;
  createTeamGoal: (goal: TeamGoal) => Promise<TeamGoal>;
  updateTeamGoal: (goalId: string, updates: Partial<TeamGoal>) => Promise<TeamGoal>;
  deleteTeamGoal: (goalId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number, remarks: string) => Promise<TeamGoal>;
  calculateTeamMetrics: () => Promise<TeamMetrics>;

  // Approval Center
  approvalRequests: ApprovalRequest[];
  pendingApprovals: ApprovalRequest[];
  approvalSummary: ApprovalSummary | null;
  getApprovalRequestById: (requestId: string) => Promise<ApprovalRequest>;
  approveRequest: (requestId: string, remarks?: string) => Promise<ApprovalRequest>;
  rejectRequest: (requestId: string, reason: string) => Promise<ApprovalRequest>;
  escalateRequest: (requestId: string, escalateTo: string, reason: string) => Promise<ApprovalRequest>;
  addComment: (requestId: string, comment: ApprovalComment) => Promise<ApprovalRequest>;
  bulkApprove: (requestIds: string[], remarks?: string) => Promise<ApprovalRequest[]>;

  // Team Reports
  reports: TeamReport[];
  getReportById: (reportId: string) => Promise<TeamReport>;
  generateReport: (reportType: ReportType, periodStart: Date, periodEnd: Date) => Promise<TeamReport>;
  exportReport: (reportId: string, format: 'pdf' | 'excel' | 'csv' | 'pptx') => Promise<Blob>;
  shareReport: (reportId: string, shareWith: string[]) => Promise<TeamReport>;

  // Delegation
  delegationRules: DelegationRule[];
  delegationSummary: DelegationSummary | null;
  delegationSettings: DelegationSettings | null;
  getDelegationRuleById: (delegationId: string) => Promise<DelegationRule>;
  createDelegationRule: (rule: DelegationRule) => Promise<DelegationRule>;
  updateDelegationRule: (delegationId: string, updates: Partial<DelegationRule>) => Promise<DelegationRule>;
  deleteDelegationRule: (delegationId: string) => Promise<void>;
  activateDelegation: (delegationId: string, reason: string) => Promise<DelegationRule>;
  deactivateDelegation: (delegationId: string) => Promise<DelegationRule>;
  revokeDelegation: (delegationId: string, reason: string) => Promise<DelegationRule>;
  recordDelegationAction: (delegationId: string, action: DelegationAction) => Promise<DelegationRule>;
  updateDelegationSettings: (updates: Partial<DelegationSettings>) => Promise<DelegationSettings>;

  // Analytics & Settings
  analytics: ManagerAnalytics | null;
  settings: ManagerSettings | null;
  updateSettings: (updates: Partial<ManagerSettings>) => Promise<ManagerSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useManagerSelfService(managerId: string = 'manager-001'): UseManagerSelfServiceReturn {
  // State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalSummary, setApprovalSummary] = useState<ApprovalSummary | null>(null);
  const [reports, setReports] = useState<TeamReport[]>([]);
  const [delegationRules, setDelegationRules] = useState<DelegationRule[]>([]);
  const [delegationSummary, setDelegationSummary] = useState<DelegationSummary | null>(null);
  const [delegationSettings, setDelegationSettings] = useState<DelegationSettings | null>(null);
  const [analytics, setAnalytics] = useState<ManagerAnalytics | null>(null);
  const [settings, setSettings] = useState<ManagerSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        membersData,
        metricsData,
        goalsData,
        approvalsData,
        pendingData,
        summaryData,
        reportsData,
        delegationsData,
        delSummaryData,
        delSettingsData,
        analyticsData,
        settingsData,
      ] = await Promise.all([
        TeamDashboardService.getTeamMembers(managerId),
        TeamDashboardService.getTeamMetrics(managerId),
        TeamDashboardService.getTeamGoals(managerId),
        ApprovalCenterService.getApprovalRequests(managerId),
        ApprovalCenterService.getPendingApprovals(managerId),
        ApprovalCenterService.getApprovalSummary(managerId),
        TeamReportsService.getReports(managerId),
        DelegationService.getDelegationRules(managerId),
        DelegationService.getDelegationSummary(managerId),
        DelegationService.getDelegationSettings(managerId),
        ManagerAnalyticsService.getAnalytics(managerId, 'monthly'),
        ManagerSettingsService.getSettings(managerId),
      ]);

      setTeamMembers(membersData);
      setTeamMetrics(metricsData);
      setTeamGoals(goalsData);
      setApprovalRequests(approvalsData);
      setPendingApprovals(pendingData);
      setApprovalSummary(summaryData);
      setReports(reportsData);
      setDelegationRules(delegationsData);
      setDelegationSummary(delSummaryData);
      setDelegationSettings(delSettingsData);
      setAnalytics(analyticsData);
      setSettings(settingsData);
    } catch {
      setError(err instanceof Error ? err.message : 'Failed to load manager data');
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Team Dashboard Methods
  // ============================================================================

  const getTeamMemberById = async (memberId: string): Promise<TeamMember> => {
    return TeamDashboardService.getTeamMemberById(memberId);
  };

  const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
    const updated = await TeamDashboardService.updateTeamMember(memberId, updates);
    setTeamMembers(teamMembers.map((m) => (m.id === memberId ? updated : m)));
    return updated;
  };

  const createTeamGoal = async (goal: TeamGoal): Promise<TeamGoal> => {
    const created = await TeamDashboardService.createTeamGoal(goal);
    setTeamGoals([...teamGoals, created]);
    return created;
  };

  const updateTeamGoal = async (goalId: string, updates: Partial<TeamGoal>): Promise<TeamGoal> => {
    const updated = await TeamDashboardService.updateTeamGoal(goalId, updates);
    setTeamGoals(teamGoals.map((g) => (g.goalId === goalId ? updated : g)));
    return updated;
  };

  const deleteTeamGoal = async (goalId: string): Promise<void> => {
    await TeamDashboardService.deleteTeamGoal(goalId);
    setTeamGoals(teamGoals.filter((g) => g.goalId !== goalId));
  };

  const updateGoalProgress = async (goalId: string, progress: number, remarks: string): Promise<TeamGoal> => {
    const updated = await TeamDashboardService.updateGoalProgress(goalId, progress, remarks);
    setTeamGoals(teamGoals.map((g) => (g.goalId === goalId ? updated : g)));
    return updated;
  };

  const calculateTeamMetrics = async (): Promise<TeamMetrics> => {
    const metrics = await TeamDashboardService.calculateTeamMetrics(managerId);
    setTeamMetrics(metrics);
    return metrics;
  };

  // ============================================================================
  // Approval Center Methods
  // ============================================================================

  const getApprovalRequestById = async (requestId: string): Promise<ApprovalRequest> => {
    return ApprovalCenterService.getApprovalRequestById(requestId);
  };

  const approveRequest = async (requestId: string, remarks?: string): Promise<ApprovalRequest> => {
    const approved = await ApprovalCenterService.approveRequest(requestId, managerId, remarks);
    setApprovalRequests(approvalRequests.map((r) => (r.requestId === requestId ? approved : r)));
    setPendingApprovals(pendingApprovals.filter((r) => r.requestId !== requestId));

    // Refresh approval summary
    const summary = await ApprovalCenterService.getApprovalSummary(managerId);
    setApprovalSummary(summary);

    return approved;
  };

  const rejectRequest = async (requestId: string, reason: string): Promise<ApprovalRequest> => {
    const rejected = await ApprovalCenterService.rejectRequest(requestId, managerId, reason);
    setApprovalRequests(approvalRequests.map((r) => (r.requestId === requestId ? rejected : r)));
    setPendingApprovals(pendingApprovals.filter((r) => r.requestId !== requestId));

    // Refresh approval summary
    const summary = await ApprovalCenterService.getApprovalSummary(managerId);
    setApprovalSummary(summary);

    return rejected;
  };

  const escalateRequest = async (requestId: string, escalateTo: string, reason: string): Promise<ApprovalRequest> => {
    const escalated = await ApprovalCenterService.escalateRequest(requestId, escalateTo, reason);
    setApprovalRequests(approvalRequests.map((r) => (r.requestId === requestId ? escalated : r)));
    setPendingApprovals(pendingApprovals.filter((r) => r.requestId !== requestId));

    // Refresh approval summary
    const summary = await ApprovalCenterService.getApprovalSummary(managerId);
    setApprovalSummary(summary);

    return escalated;
  };

  const addComment = async (requestId: string, comment: ApprovalComment): Promise<ApprovalRequest> => {
    const updated = await ApprovalCenterService.addComment(requestId, comment);
    setApprovalRequests(approvalRequests.map((r) => (r.requestId === requestId ? updated : r)));
    return updated;
  };

  const bulkApprove = async (requestIds: string[], remarks?: string): Promise<ApprovalRequest[]> => {
    const approved = await ApprovalCenterService.bulkApprove(requestIds, managerId, remarks);

    // Update local state
    approved.forEach((approvedRequest) => {
      setApprovalRequests((prev) =>
        prev.map((r) => (r.requestId === approvedRequest.requestId ? approvedRequest : r))
      );
      setPendingApprovals((prev) => prev.filter((r) => r.requestId !== approvedRequest.requestId));
    });

    // Refresh approval summary
    const summary = await ApprovalCenterService.getApprovalSummary(managerId);
    setApprovalSummary(summary);

    return approved;
  };

  // ============================================================================
  // Team Reports Methods
  // ============================================================================

  const getReportById = async (reportId: string): Promise<TeamReport> => {
    return TeamReportsService.getReportById(reportId);
  };

  const generateReport = async (
    reportType: ReportType,
    periodStart: Date,
    periodEnd: Date
  ): Promise<TeamReport> => {
    const report = await TeamReportsService.generateReport(reportType, managerId, periodStart, periodEnd);
    setReports([...reports, report]);
    return report;
  };

  const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv' | 'pptx'): Promise<Blob> => {
    return TeamReportsService.exportReport(reportId, format);
  };

  const shareReport = async (reportId: string, shareWith: string[]): Promise<TeamReport> => {
    const shared = await TeamReportsService.shareReport(reportId, shareWith);
    setReports(reports.map((r) => (r.reportId === reportId ? shared : r)));
    return shared;
  };

  // ============================================================================
  // Delegation Methods
  // ============================================================================

  const getDelegationRuleById = async (delegationId: string): Promise<DelegationRule> => {
    return DelegationService.getDelegationRuleById(delegationId);
  };

  const createDelegationRule = async (rule: DelegationRule): Promise<DelegationRule> => {
    const created = await DelegationService.createDelegationRule(rule);
    setDelegationRules([...delegationRules, created]);

    // Refresh delegation summary
    const summary = await DelegationService.getDelegationSummary(managerId);
    setDelegationSummary(summary);

    return created;
  };

  const updateDelegationRule = async (
    delegationId: string,
    updates: Partial<DelegationRule>
  ): Promise<DelegationRule> => {
    const updated = await DelegationService.updateDelegationRule(delegationId, updates);
    setDelegationRules(delegationRules.map((r) => (r.delegationId === delegationId ? updated : r)));
    return updated;
  };

  const deleteDelegationRule = async (delegationId: string): Promise<void> => {
    await DelegationService.deleteDelegationRule(delegationId);
    setDelegationRules(delegationRules.filter((r) => r.delegationId !== delegationId));

    // Refresh delegation summary
    const summary = await DelegationService.getDelegationSummary(managerId);
    setDelegationSummary(summary);
  };

  const activateDelegation = async (delegationId: string, reason: string): Promise<DelegationRule> => {
    const activated = await DelegationService.activateDelegation(delegationId, reason);
    setDelegationRules(delegationRules.map((r) => (r.delegationId === delegationId ? activated : r)));

    // Refresh delegation summary
    const summary = await DelegationService.getDelegationSummary(managerId);
    setDelegationSummary(summary);

    return activated;
  };

  const deactivateDelegation = async (delegationId: string): Promise<DelegationRule> => {
    const deactivated = await DelegationService.deactivateDelegation(delegationId);
    setDelegationRules(delegationRules.map((r) => (r.delegationId === delegationId ? deactivated : r)));

    // Refresh delegation summary
    const summary = await DelegationService.getDelegationSummary(managerId);
    setDelegationSummary(summary);

    return deactivated;
  };

  const revokeDelegation = async (delegationId: string, reason: string): Promise<DelegationRule> => {
    const revoked = await DelegationService.revokeDelegation(delegationId, reason);
    setDelegationRules(delegationRules.map((r) => (r.delegationId === delegationId ? revoked : r)));

    // Refresh delegation summary
    const summary = await DelegationService.getDelegationSummary(managerId);
    setDelegationSummary(summary);

    return revoked;
  };

  const recordDelegationAction = async (delegationId: string, action: DelegationAction): Promise<DelegationRule> => {
    const updated = await DelegationService.recordDelegationAction(delegationId, action);
    setDelegationRules(delegationRules.map((r) => (r.delegationId === delegationId ? updated : r)));
    return updated;
  };

  const updateDelegationSettings = async (updates: Partial<DelegationSettings>): Promise<DelegationSettings> => {
    const updated = await DelegationService.updateDelegationSettings(managerId, updates);
    setDelegationSettings(updated);
    return updated;
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<ManagerSettings>): Promise<ManagerSettings> => {
    const updated = await ManagerSettingsService.updateSettings(managerId, updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Team Dashboard
    teamMembers,
    teamMetrics,
    teamGoals,
    getTeamMemberById,
    updateTeamMember,
    createTeamGoal,
    updateTeamGoal,
    deleteTeamGoal,
    updateGoalProgress,
    calculateTeamMetrics,

    // Approval Center
    approvalRequests,
    pendingApprovals,
    approvalSummary,
    getApprovalRequestById,
    approveRequest,
    rejectRequest,
    escalateRequest,
    addComment,
    bulkApprove,

    // Team Reports
    reports,
    getReportById,
    generateReport,
    exportReport,
    shareReport,

    // Delegation
    delegationRules,
    delegationSummary,
    delegationSettings,
    getDelegationRuleById,
    createDelegationRule,
    updateDelegationRule,
    deleteDelegationRule,
    activateDelegation,
    deactivateDelegation,
    revokeDelegation,
    recordDelegationAction,
    updateDelegationSettings,

    // Global
    analytics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
