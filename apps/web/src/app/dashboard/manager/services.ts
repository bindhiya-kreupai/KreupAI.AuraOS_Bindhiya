/**
 * Manager Self-Service (MSS) Module - Service Layer
 * API-ready services for team management, approvals, reports, and delegation
 */

'use client';

import { APIClient } from '@/lib/api-client';
import type {
  TeamMember,
  TeamMetrics,
  TeamGoal,
  ApprovalRequest,
  ApprovalSummary,
  TeamReport,
  ReportType,
  DelegationRule,
  DelegationSummary,
  DelegationSettings,
  ManagerAnalytics,
  ManagerSettings,
  ApprovalComment,
  DelegationAction} from './types';
import {
  ApprovalStatus
} from './types';

// ============================================================================
// Team Dashboard Service
// ============================================================================

export class TeamDashboardService {
  // Team Members
  static async getTeamMembers(managerId?: string): Promise<TeamMember[]> {
    const response = await APIClient.get<{ members: TeamMember[]; metrics: TeamMetrics }>('/manager/team', managerId ? { managerId } : undefined);
    return response.members;
  }

  static async getTeamMemberById(memberId: string): Promise<TeamMember> {
    const response = await APIClient.get<{ members: TeamMember[] }>('/manager/team', { managerId: memberId });
    return response.members[0];
  }

  static async updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    return APIClient.put<TeamMember>(`/manager/team`, { memberId, ...updates });
  }

  static async getTeamMetrics(managerId: string, period?: string): Promise<TeamMetrics> {
    const response = await APIClient.get<{ members: TeamMember[]; metrics: TeamMetrics }>('/manager/team', { managerId, period });
    return response.metrics;
  }

  static async calculateTeamMetrics(managerId: string): Promise<TeamMetrics> {
    const members = await this.getTeamMembers(managerId);

    const metrics: TeamMetrics = {
      teamId: `team-${managerId}`,
      teamName: 'My Team',
      managerId,
      managerName: 'Manager Name',
      period: 'monthly',
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      periodEnd: new Date(),

      // Team Composition
      totalHeadcount: members.length,
      activeEmployees: members.filter((m) => m.status === 'active').length,
      newJoiners: members.filter(
        (m) => new Date(m.dateOfJoining) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length,
      separations: 0,

      // Attendance
      averageAttendance: members.reduce((acc, m) => acc + m.attendanceRate, 0) / members.length || 0,
      totalAbsences: 0,
      totalLateComings: 0,

      // Performance
      averagePerformanceRating: members.reduce((acc, m) => acc + m.performanceRating, 0) / members.length || 0,
      highPerformers: members.filter((m) => m.performanceRating >= 4).length,
      lowPerformers: members.filter((m) => m.performanceRating < 2.5).length,

      // Engagement
      averageEngagementScore: members.reduce((acc, m) => acc + m.engagementScore, 0) / members.length || 0,
      atRiskEmployees: members.filter((m) => m.engagementScore < 50).length,

      // Leave
      totalLeavesTaken: 0,
      averageLeaveUtilization: 0,
      pendingLeaveRequests: 0,

      // Goals
      goalsOnTrack: 0,
      goalsOverdue: 0,
      totalActiveGoals: 0,

      // Other
      pendingApprovals: 0,
      pendingReviews: 0,
    };

    return APIClient.post<TeamMetrics>('/manager/team', { managerId, metrics });
  }

  // Team Goals
  static async getTeamGoals(managerId?: string): Promise<TeamGoal[]> {
    return APIClient.get<TeamGoal[]>('/manager/team', managerId ? { managerId } : undefined);
  }

  static async getTeamGoalById(goalId: string): Promise<TeamGoal> {
    return APIClient.get<TeamGoal>('/manager/team', { goalId });
  }

  static async createTeamGoal(goal: TeamGoal): Promise<TeamGoal> {
    return APIClient.post<TeamGoal>('/manager/team', goal);
  }

  static async updateTeamGoal(goalId: string, updates: Partial<TeamGoal>): Promise<TeamGoal> {
    return APIClient.put<TeamGoal>('/manager/team', { goalId, ...updates });
  }

  static async deleteTeamGoal(goalId: string): Promise<void> {
    return APIClient.delete<void>('/manager/team', { goalId });
  }

  static async updateGoalProgress(goalId: string, progress: number, remarks: string): Promise<TeamGoal> {
    const goal = await this.getTeamGoalById(goalId);

    const progressUpdate = {
      updateId: `update-${Date.now()}`,
      updateDate: new Date(),
      updatedBy: 'current-user',
      previousValue: goal.currentValue,
      currentValue: goal.targetValue * (progress / 100),
      progress,
      remarks,
    };

    const updates: Partial<TeamGoal> = {
      progress,
      currentValue: goal.targetValue * (progress / 100),
      progressUpdates: [...goal.progressUpdates, progressUpdate],
      status: progress >= 100 ? 'completed' : progress > 0 ? 'active' : goal.status,
    };

    if (progress >= 100) {
      updates.completionDate = new Date();
    }

    return this.updateTeamGoal(goalId, updates);
  }
}

// ============================================================================
// Approval Center Service
// ============================================================================

export class ApprovalCenterService {
  static async getApprovalRequests(managerId?: string): Promise<ApprovalRequest[]> {
    return APIClient.get<ApprovalRequest[]>('/manager/approvals', managerId ? { managerId } : undefined);
  }

  static async getApprovalRequestById(requestId: string): Promise<ApprovalRequest> {
    return APIClient.get<ApprovalRequest>('/manager/approvals', { requestId });
  }

  static async getPendingApprovals(managerId: string): Promise<ApprovalRequest[]> {
    return APIClient.get<ApprovalRequest[]>('/manager/approvals', { managerId, status: 'pending' });
  }

  static async getApprovalSummary(managerId: string): Promise<ApprovalSummary> {
    return APIClient.get<ApprovalSummary>('/manager/approvals', { managerId });
  }

  static async approveRequest(requestId: string, approverId: string, remarks?: string): Promise<ApprovalRequest> {
    const request = await this.getApprovalRequestById(requestId);

    // Update workflow step
    const currentStep = request.approvalWorkflow.find(
      (step) => step.stepNumber === request.currentApproverLevel
    );
    if (currentStep) {
      currentStep.status = 'approved';
      currentStep.approvalDate = new Date();
      currentStep.remarks = remarks;
    }

    // Check if there are more approval steps
    const nextStep = request.approvalWorkflow.find(
      (step) => step.stepNumber === request.currentApproverLevel + 1
    );

    const updates: Partial<ApprovalRequest> = {
      approvalStatus: nextStep ? 'pending' : 'approved',
      currentApproverLevel: nextStep ? request.currentApproverLevel + 1 : request.currentApproverLevel,
      currentApproverId: nextStep?.approverId || request.currentApproverId,
      approvalWorkflow: request.approvalWorkflow,
      history: [
        ...request.history,
        {
          historyId: `history-${Date.now()}`,
          action: 'approved',
          actionBy: approverId,
          actionByName: 'Approver Name',
          actionDate: new Date(),
          fromStatus: 'pending',
          toStatus: nextStep ? 'pending' : 'approved',
          remarks,
        },
      ],
    };

    return this.updateApprovalRequest(requestId, updates);
  }

  static async rejectRequest(requestId: string, approverId: string, reason: string): Promise<ApprovalRequest> {
    const request = await this.getApprovalRequestById(requestId);

    // Update workflow step
    const currentStep = request.approvalWorkflow.find(
      (step) => step.stepNumber === request.currentApproverLevel
    );
    if (currentStep) {
      currentStep.status = 'rejected';
      currentStep.approvalDate = new Date();
      currentStep.remarks = reason;
    }

    const updates: Partial<ApprovalRequest> = {
      approvalStatus: 'rejected',
      approvalWorkflow: request.approvalWorkflow,
      history: [
        ...request.history,
        {
          historyId: `history-${Date.now()}`,
          action: 'rejected',
          actionBy: approverId,
          actionByName: 'Approver Name',
          actionDate: new Date(),
          fromStatus: 'pending',
          toStatus: 'rejected',
          remarks: reason,
        },
      ],
    };

    return this.updateApprovalRequest(requestId, updates);
  }

  static async escalateRequest(requestId: string, escalateTo: string, reason: string): Promise<ApprovalRequest> {
    const request = await this.getApprovalRequestById(requestId);

    const updates: Partial<ApprovalRequest> = {
      approvalStatus: 'escalated',
      currentApproverId: escalateTo,
      history: [
        ...request.history,
        {
          historyId: `history-${Date.now()}`,
          action: 'escalated',
          actionBy: request.currentApproverId,
          actionByName: 'Current Approver',
          actionDate: new Date(),
          fromStatus: 'pending',
          toStatus: 'escalated',
          remarks: reason,
        },
      ],
    };

    return this.updateApprovalRequest(requestId, updates);
  }

  static async addComment(requestId: string, comment: ApprovalComment): Promise<ApprovalRequest> {
    return APIClient.post<ApprovalRequest>('/manager/approvals', { requestId, comment });
  }

  static async bulkApprove(requestIds: string[], approverId: string, remarks?: string): Promise<ApprovalRequest[]> {
    const approved: ApprovalRequest[] = [];
    for (const requestId of requestIds) {
      try {
        const result = await this.approveRequest(requestId, approverId, remarks);
        approved.push(result);
      } catch (error: any) {
        console.error(`Failed to approve request ${requestId}:`, error);
      }
    }
    return approved;
  }

  private static async updateApprovalRequest(
    requestId: string,
    updates: Partial<ApprovalRequest>
  ): Promise<ApprovalRequest> {
    return APIClient.put<ApprovalRequest>('/manager/approvals', { requestId, ...updates });
  }
}

// ============================================================================
// Team Reports Service
// ============================================================================

export class TeamReportsService {
  static async getReports(managerId?: string): Promise<TeamReport[]> {
    return APIClient.get<TeamReport[]>('/manager/reports', managerId ? { managerId } : undefined);
  }

  static async getReportById(reportId: string): Promise<TeamReport> {
    return APIClient.get<TeamReport>('/manager/reports', { reportId });
  }

  static async generateReport(
    reportType: ReportType,
    managerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<TeamReport> {
    let reportData: any;
    let charts: any[] = [];

    switch (reportType) {
      case 'performance':
        reportData = await this.generatePerformanceReportData(managerId, periodStart, periodEnd);
        charts = this.generatePerformanceCharts(reportData);
        break;
      case 'attendance':
        reportData = await this.generateAttendanceReportData(managerId, periodStart, periodEnd);
        charts = this.generateAttendanceCharts(reportData);
        break;
      case 'compensation':
        reportData = await this.generateCompensationReportData(managerId, periodStart, periodEnd);
        charts = this.generateCompensationCharts(reportData);
        break;
      case 'skills_gap':
        reportData = await this.generateSkillsGapReportData(managerId, periodStart, periodEnd);
        charts = this.generateSkillsGapCharts(reportData);
        break;
      default:
        reportData = {};
        break;
    }

    const report: TeamReport = {
      reportId: `report-${Date.now()}`,
      reportCode: `${reportType.toUpperCase()}-${Date.now()}`,
      reportName: `${reportType.replace('_', ' ').toUpperCase()} Report`,
      reportType,
      description: `${reportType} report for the period ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
      generatedFor: managerId,
      generatedForName: 'Manager Name',
      period: 'custom',
      periodStart,
      periodEnd,
      reportData,
      charts,
      status: 'generated',
      generatedDate: new Date(),
      generatedBy: 'current-user',
      sharedWith: [],
      isConfidential: reportType === 'compensation',
      exportFormats: ['pdf', 'excel', 'csv'],
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };

    return APIClient.post<TeamReport>('/manager/reports', report);
  }

  private static async generatePerformanceReportData(
    managerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<any> {
    // TODO: Fetch actual performance data
    return {
      teamId: `team-${managerId}`,
      teamName: 'My Team',
      totalEmployees: 15,
      performanceDistribution: [
        { rating: 5, count: 3, percentage: 20 },
        { rating: 4, count: 6, percentage: 40 },
        { rating: 3, count: 4, percentage: 26.7 },
        { rating: 2, count: 2, percentage: 13.3 },
        { rating: 1, count: 0, percentage: 0 },
      ],
      employeePerformance: [],
      averageRating: 3.7,
      topPerformers: [],
      needsImprovement: [],
      totalTeamGoals: 25,
      goalsCompleted: 18,
      goalsOnTrack: 5,
      goalsAtRisk: 1,
      goalsOverdue: 1,
    };
  }

  private static async generateAttendanceReportData(
    managerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<any> {
    // TODO: Fetch actual attendance data
    return {
      teamId: `team-${managerId}`,
      teamName: 'My Team',
      totalWorkingDays: 22,
      averageAttendance: 96.5,
      perfectAttendance: [],
      employeeAttendance: [],
      totalLeavesTaken: 45,
      leavesByType: [
        { leaveType: 'Annual Leave', count: 25, totalDays: 25 },
        { leaveType: 'Sick Leave', count: 15, totalDays: 15 },
        { leaveType: 'Casual Leave', count: 5, totalDays: 5 },
      ],
      attendanceTrend: [],
    };
  }

  private static async generateCompensationReportData(
    managerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<any> {
    // TODO: Fetch actual compensation data
    return {
      teamId: `team-${managerId}`,
      teamName: 'My Team',
      totalEmployees: 15,
      totalCompensation: 2250000,
      averageCompensation: 150000,
      medianCompensation: 145000,
      compensationBands: [
        { band: 'Junior', count: 5, minSalary: 100000, maxSalary: 130000, avgSalary: 115000 },
        { band: 'Mid', count: 7, minSalary: 130000, maxSalary: 170000, avgSalary: 150000 },
        { band: 'Senior', count: 3, minSalary: 170000, maxSalary: 220000, avgSalary: 195000 },
      ],
      employeeCompensation: [],
      budgetAllocated: 2500000,
      budgetUtilized: 2250000,
      budgetRemaining: 250000,
      upcomingReviews: 8,
      projectedIncrements: 350000,
    };
  }

  private static async generateSkillsGapReportData(
    managerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<any> {
    // TODO: Fetch actual skills gap data
    return {
      teamId: `team-${managerId}`,
      teamName: 'My Team',
      skillsInventory: [
        { skillName: 'React', skillCategory: 'Frontend', requiredCount: 10, availableCount: 12, gap: -2, criticalSkill: true },
        { skillName: 'Node.js', skillCategory: 'Backend', requiredCount: 8, availableCount: 6, gap: 2, criticalSkill: true },
        { skillName: 'AWS', skillCategory: 'Cloud', requiredCount: 5, availableCount: 3, gap: 2, criticalSkill: false },
      ],
      employeeSkills: [],
      trainingRecommendations: [],
      certificationsExpiring: [],
    };
  }

  private static generatePerformanceCharts(data: any): any[] {
    return [
      {
        chartId: 'chart-1',
        chartType: 'bar',
        chartTitle: 'Performance Distribution',
        chartData: data.performanceDistribution,
        position: 1,
      },
      {
        chartId: 'chart-2',
        chartType: 'pie',
        chartTitle: 'Goals Status',
        chartData: {
          completed: data.goalsCompleted,
          onTrack: data.goalsOnTrack,
          atRisk: data.goalsAtRisk,
          overdue: data.goalsOverdue,
        },
        position: 2,
      },
    ];
  }

  private static generateAttendanceCharts(data: any): any[] {
    return [
      {
        chartId: 'chart-1',
        chartType: 'line',
        chartTitle: 'Attendance Trend',
        chartData: data.attendanceTrend,
        position: 1,
      },
      {
        chartId: 'chart-2',
        chartType: 'donut',
        chartTitle: 'Leave Types Distribution',
        chartData: data.leavesByType,
        position: 2,
      },
    ];
  }

  private static generateCompensationCharts(data: any): any[] {
    return [
      {
        chartId: 'chart-1',
        chartType: 'bar',
        chartTitle: 'Compensation Bands',
        chartData: data.compensationBands,
        position: 1,
      },
    ];
  }

  private static generateSkillsGapCharts(data: any): any[] {
    return [
      {
        chartId: 'chart-1',
        chartType: 'bar',
        chartTitle: 'Skills Gap Analysis',
        chartData: data.skillsInventory,
        position: 1,
      },
    ];
  }

  static async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv' | 'pptx'): Promise<Blob> {
    const report = await this.getReportById(reportId);

    // Mock export
    const content = JSON.stringify(report, null, 2);
    return new Blob([content], { type: 'application/json' });
  }

  static async shareReport(reportId: string, shareWith: string[]): Promise<TeamReport> {
    return APIClient.post<TeamReport>('/manager/reports', { reportId, shareWith });
  }

  private static async updateReport(reportId: string, updates: Partial<TeamReport>): Promise<TeamReport> {
    return APIClient.put<TeamReport>('/manager/reports', { reportId, ...updates });
  }
}

// ============================================================================
// Delegation Service
// ============================================================================

export class DelegationService {
  static async getDelegationRules(managerId?: string): Promise<DelegationRule[]> {
    return APIClient.get<DelegationRule[]>('/manager/delegation', managerId ? { managerId } : undefined);
  }

  static async getDelegationRuleById(delegationId: string): Promise<DelegationRule> {
    return APIClient.get<DelegationRule>(`/manager/delegation?id=${delegationId}`);
  }

  static async createDelegationRule(rule: DelegationRule): Promise<DelegationRule> {
    return APIClient.post<DelegationRule>('/manager/delegation', rule);
  }

  static async updateDelegationRule(delegationId: string, updates: Partial<DelegationRule>): Promise<DelegationRule> {
    return APIClient.put<DelegationRule>('/manager/delegation', { id: delegationId, ...updates });
  }

  static async deleteDelegationRule(delegationId: string): Promise<void> {
    return APIClient.delete<void>(`/manager/delegation?id=${delegationId}`);
  }

  static async activateDelegation(delegationId: string, reason: string): Promise<DelegationRule> {
    const rule = await this.getDelegationRuleById(delegationId);

    const activation = {
      activationId: `activation-${Date.now()}`,
      activationDate: new Date(),
      reason,
      triggeredBy: 'manual' as const,
      isActive: true,
    };

    const updates: Partial<DelegationRule> = {
      status: 'active',
      activations: [...rule.activations, activation],
    };

    return this.updateDelegationRule(delegationId, updates);
  }

  static async deactivateDelegation(delegationId: string): Promise<DelegationRule> {
    const rule = await this.getDelegationRuleById(delegationId);

    const currentActivation = rule.activations.find((a) => a.isActive);
    if (currentActivation) {
      currentActivation.isActive = false;
      currentActivation.deactivationDate = new Date();
    }

    const updates: Partial<DelegationRule> = {
      status: 'inactive',
      activations: rule.activations,
    };

    return this.updateDelegationRule(delegationId, updates);
  }

  static async revokeDelegation(delegationId: string, reason: string): Promise<DelegationRule> {
    const updates: Partial<DelegationRule> = {
      status: 'revoked',
      revocationReason: reason,
    };

    return this.updateDelegationRule(delegationId, updates);
  }

  static async getDelegationSummary(managerId: string): Promise<DelegationSummary> {
    return APIClient.get<DelegationSummary>('/manager/delegation', { managerId });
  }

  static async recordDelegationAction(delegationId: string, action: DelegationAction): Promise<DelegationRule> {
    return APIClient.post<DelegationRule>('/manager/delegation', { id: delegationId, ...action });
  }

  // Delegation Settings
  static async getDelegationSettings(managerId: string): Promise<DelegationSettings> {
    return APIClient.get<DelegationSettings>('/manager/settings', { managerId });
  }

  static async updateDelegationSettings(
    managerId: string,
    updates: Partial<DelegationSettings>
  ): Promise<DelegationSettings> {
    return APIClient.put<DelegationSettings>('/manager/settings', { managerId, ...updates });
  }

  private static getDefaultSettings(managerId: string): DelegationSettings {
    return {
      settingsId: `settings-${managerId}`,
      managerId,
      enableAutoDelegation: true,
      autoDelegateOnLeave: true,
      autoDelegateOnTravel: false,
      notifyOnDelegation: true,
      notifyOnDelegateAction: true,
      dailyDigest: true,
      requireApprovalForDelegation: false,
      maxDelegationDuration: 90,
      allowChainDelegation: false,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };
  }
}

// ============================================================================
// Manager Analytics Service
// ============================================================================

export class ManagerAnalyticsService {
  static async getAnalytics(managerId: string, period: string): Promise<ManagerAnalytics> {
    return APIClient.get<ManagerAnalytics>('/manager/analytics', { managerId, period });
  }
}

// ============================================================================
// Manager Settings Service
// ============================================================================

export class ManagerSettingsService {
  static async getSettings(managerId: string): Promise<ManagerSettings> {
    return APIClient.get<ManagerSettings>('/manager/settings', { managerId });
  }

  static async updateSettings(managerId: string, updates: Partial<ManagerSettings>): Promise<ManagerSettings> {
    return APIClient.put<ManagerSettings>('/manager/settings', { managerId, ...updates });
  }

  private static getDefaultSettings(managerId: string): ManagerSettings {
    const delegationSettings = DelegationService['getDefaultSettings'](managerId);

    return {
      settingsId: `settings-${managerId}`,
      managerId,
      dashboardLayout: [],
      defaultView: 'overview',
      refreshInterval: 5,
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnNewApproval: true,
        notifyOnApprovalOverdue: true,
        notifyOnTeamMilestone: true,
        notifyOnPerformanceAlert: true,
        dailyDigest: true,
        weeklyDigest: false,
      },
      approvalSettings: {
        requireCommentsOnRejection: true,
        allowBulkApproval: true,
        escalationTimeout: 48,
      },
      reportSettings: {
        favoriteReports: [],
        autoGenerateReports: false,
        reportFrequency: 'monthly',
        reportDeliveryEmail: '',
      },
      delegationSettings,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };
  }
}
