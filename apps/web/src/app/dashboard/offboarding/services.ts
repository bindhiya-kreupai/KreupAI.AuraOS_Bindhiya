// Offboarding Module Services
// Complete service layer for employee offboarding management

import { APIClient } from '@/lib/api-client';
import type {
  ResignationLetter,
  TerminationNotice,
  OffboardingInstance,
  OffboardingTask,
  EquipmentReturn,
  AccessRevocation,
  DepartmentClearance,
  KnowledgeTransfer,
  ExitInterview,
  ExitSurvey,
  FinalSettlement,
  AlumniRecord,
  OffboardingMetrics,
  OffboardingSettings,
  OffboardingStatus,
  KnowledgeTransferSession,
  HandoverItem,
} from './types';

// ============================================================================
// RESIGNATION SERVICE
// ============================================================================

export class ResignationService {
  static async getResignations(filters?: {
    employeeId?: string;
    status?: string;
    departmentId?: string;
  }): Promise<ResignationLetter[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/resignations', filters);
      return APIClient.unwrapList<ResignationLetter>(response, 'resignations');
    } catch (error: any) {
      return [];
    }
  }

  static async getResignationById(id: string): Promise<ResignationLetter | null> {
    try {
      const response = await APIClient.get<unknown>(`/offboarding/resignations/${id}`);
      return APIClient.unwrapItem<ResignationLetter>(response, 'resignation');
    } catch (error: any) {
      return null;
    }
  }

  static async submitResignation(resignation: ResignationLetter): Promise<ResignationLetter> {
    try {
      const response = await APIClient.post<{ resignation?: ResignationLetter }>(
        '/offboarding/resignations',
        resignation
      );
      return response.resignation || resignation;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateResignation(
    id: string,
    updates: Partial<ResignationLetter>
  ): Promise<ResignationLetter> {
    try {
      const response = await APIClient.put<{ resignation?: ResignationLetter }>(
        `/offboarding/resignations/${id}`,
        updates
      );
      return response.resignation || ({ ...updates, id } as ResignationLetter);
    } catch (error: any) {
      throw error;
    }
  }

  static async acceptResignation(id: string, acceptedBy: string): Promise<ResignationLetter> {
    return this.updateResignation(id, {
      status: 'accepted',
      acceptedBy,
      acceptedDate: new Date().toISOString(),
    });
  }

  static async rejectResignation(
    id: string,
    reviewedBy: string,
    comments: string
  ): Promise<ResignationLetter> {
    return this.updateResignation(id, {
      status: 'rejected',
      reviewedBy,
      reviewedDate: new Date().toISOString(),
      reviewComments: comments,
    });
  }

  static async makeCounterOffer(
    id: string,
    reviewedBy: string,
    counterOfferDetails: string
  ): Promise<ResignationLetter> {
    return this.updateResignation(id, {
      status: 'counter_offered',
      reviewedBy,
      reviewedDate: new Date().toISOString(),
      counterOfferMade: true,
      counterOfferDetails,
    });
  }

  static async withdrawResignation(id: string, reason: string): Promise<ResignationLetter> {
    return this.updateResignation(id, {
      status: 'withdrawn',
      withdrawnDate: new Date().toISOString(),
      withdrawalReason: reason,
    });
  }
}

// ============================================================================
// TERMINATION SERVICE
// ============================================================================

export class TerminationService {
  static async getTerminations(filters?: {
    employeeId?: string;
    departmentId?: string;
  }): Promise<TerminationNotice[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/terminations', filters);
      return APIClient.unwrapList<TerminationNotice>(response, 'terminations');
    } catch (error: any) {
      return [];
    }
  }

  static async getTerminationById(id: string): Promise<TerminationNotice | null> {
    try {
      const response = await APIClient.get<unknown>(`/offboarding/terminations/${id}`);
      return APIClient.unwrapItem<TerminationNotice>(response, 'termination');
    } catch (error: any) {
      return null;
    }
  }

  static async createTermination(termination: TerminationNotice): Promise<TerminationNotice> {
    try {
      const response = await APIClient.post<{ termination?: TerminationNotice }>(
        '/offboarding/terminations',
        termination
      );
      return response.termination || termination;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateTermination(
    id: string,
    updates: Partial<TerminationNotice>
  ): Promise<TerminationNotice> {
    try {
      const response = await APIClient.put<{ termination?: TerminationNotice }>(
        `/offboarding/terminations/${id}`,
        updates
      );
      return response.termination || ({ ...updates, id } as TerminationNotice);
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// OFFBOARDING INSTANCE SERVICE
// ============================================================================

export class OffboardingInstanceService {
  static async getInstances(filters?: {
    employeeId?: string;
    status?: OffboardingStatus;
    departmentId?: string;
  }): Promise<OffboardingInstance[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/instances', filters);
      return APIClient.unwrapList<OffboardingInstance>(response, 'instances');
    } catch (error: any) {
      return [];
    }
  }

  static async getInstanceById(id: string): Promise<OffboardingInstance | null> {
    try {
      const response = await APIClient.get<unknown>(`/offboarding/instances/${id}`);
      return APIClient.unwrapItem<OffboardingInstance>(response, 'instance');
    } catch (error: any) {
      return null;
    }
  }

  static async createInstance(instance: OffboardingInstance): Promise<OffboardingInstance> {
    try {
      const response = await APIClient.post<{ instance?: OffboardingInstance }>(
        '/offboarding/instances',
        instance
      );
      return response.instance || instance;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateInstance(
    id: string,
    updates: Partial<OffboardingInstance>
  ): Promise<OffboardingInstance> {
    try {
      const response = await APIClient.put<{ instance?: OffboardingInstance }>(
        `/offboarding/instances/${id}`,
        updates
      );
      return response.instance || ({ ...updates, id } as OffboardingInstance);
    } catch (error: any) {
      throw error;
    }
  }

  static async startOffboarding(id: string): Promise<OffboardingInstance> {
    return this.updateInstance(id, {
      status: 'in_progress',
    });
  }

  static async completeOffboarding(id: string): Promise<OffboardingInstance> {
    return this.updateInstance(id, {
      status: 'completed',
      progress: 100,
    });
  }

  static async cancelOffboarding(id: string, reason: string): Promise<OffboardingInstance> {
    return this.updateInstance(id, {
      status: 'cancelled',
      notes: reason,
    });
  }

  static async updateProgress(id: string): Promise<OffboardingInstance> {
    try {
      const instance = await this.getInstanceById(id);
      if (!instance) throw new Error('Instance not found');

      const completedTasks = instance.tasks.filter((t) => t.status === 'completed').length;
      const totalTasks = instance.tasks.filter((t) => t.isMandatory).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return this.updateInstance(id, {
        completedTasks,
        overdueTasks: instance.tasks.filter((t) => t.status === 'overdue').length,
        progress,
      });
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// OFFBOARDING TASK SERVICE
// ============================================================================

export class OffboardingTaskService {
  static async updateTaskStatus(
    instanceId: string,
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'not_applicable',
    completedBy?: string
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const taskIndex = instance.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) throw new Error('Task not found');

      instance.tasks[taskIndex] = {
        ...instance.tasks[taskIndex],
        status,
        completedDate: status === 'completed' ? new Date().toISOString() : undefined,
        completedBy: status === 'completed' ? completedBy : undefined,
      };

      await OffboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
      return OffboardingInstanceService.updateProgress(instanceId);
    } catch (error: any) {
      throw error;
    }
  }

  static async addTask(instanceId: string, task: OffboardingTask): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      instance.tasks.push(task);
      return OffboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
    } catch (error: any) {
      throw error;
    }
  }

  static async removeTask(instanceId: string, taskId: string): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      instance.tasks = instance.tasks.filter((t) => t.id !== taskId);
      return OffboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// EQUIPMENT RETURN SERVICE
// ============================================================================

export class EquipmentReturnService {
  static async markReturned(
    instanceId: string,
    equipmentId: string,
    receivedBy: string,
    condition: 'good' | 'fair' | 'damaged' | 'lost',
    conditionNotes?: string
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const equipIndex = instance.equipmentReturns.findIndex((e) => e.id === equipmentId);
      if (equipIndex === -1) throw new Error('Equipment not found');

      instance.equipmentReturns[equipIndex] = {
        ...instance.equipmentReturns[equipIndex],
        status: condition === 'lost' ? 'lost' : condition === 'damaged' ? 'damaged' : 'returned',
        actualReturnDate: new Date().toISOString(),
        condition,
        conditionNotes,
        receivedBy,
      };

      return OffboardingInstanceService.updateInstance(instanceId, {
        equipmentReturns: instance.equipmentReturns,
      });
    } catch (error: any) {
      throw error;
    }
  }

  static async applyCharge(
    instanceId: string,
    equipmentId: string,
    chargeType: 'damage' | 'lost',
    amount: number
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const equipIndex = instance.equipmentReturns.findIndex((e) => e.id === equipmentId);
      if (equipIndex === -1) throw new Error('Equipment not found');

      if (chargeType === 'damage') {
        instance.equipmentReturns[equipIndex].damageCharge = amount;
      } else {
        instance.equipmentReturns[equipIndex].lostCharge = amount;
      }

      return OffboardingInstanceService.updateInstance(instanceId, {
        equipmentReturns: instance.equipmentReturns,
      });
    } catch (error: any) {
      throw error;
    }
  }

  static async waiveCharge(
    instanceId: string,
    equipmentId: string,
    reason: string,
    waivedBy: string
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const equipIndex = instance.equipmentReturns.findIndex((e) => e.id === equipmentId);
      if (equipIndex === -1) throw new Error('Equipment not found');

      instance.equipmentReturns[equipIndex] = {
        ...instance.equipmentReturns[equipIndex],
        chargeWaived: true,
        waiverReason: reason,
        waivedBy,
      };

      return OffboardingInstanceService.updateInstance(instanceId, {
        equipmentReturns: instance.equipmentReturns,
      });
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// ACCESS REVOCATION SERVICE
// ============================================================================

export class AccessRevocationService {
  static async revokeAccess(
    instanceId: string,
    accessId: string,
    revokedBy: string
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const accessIndex = instance.accessRevocations.findIndex((a) => a.id === accessId);
      if (accessIndex === -1) throw new Error('Access not found');

      instance.accessRevocations[accessIndex] = {
        ...instance.accessRevocations[accessIndex],
        status: 'revoked',
        actualRevocationDate: new Date().toISOString(),
        revokedBy,
      };

      return OffboardingInstanceService.updateInstance(instanceId, {
        accessRevocations: instance.accessRevocations,
      });
    } catch (error: any) {
      throw error;
    }
  }

  static async markRevocationFailed(
    instanceId: string,
    accessId: string,
    failureReason: string
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const accessIndex = instance.accessRevocations.findIndex((a) => a.id === accessId);
      if (accessIndex === -1) throw new Error('Access not found');

      const currentRetryCount = instance.accessRevocations[accessIndex].retryCount || 0;

      instance.accessRevocations[accessIndex] = {
        ...instance.accessRevocations[accessIndex],
        status: 'failed',
        failureReason,
        retryCount: currentRetryCount + 1,
      };

      return OffboardingInstanceService.updateInstance(instanceId, {
        accessRevocations: instance.accessRevocations,
      });
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// CLEARANCE SERVICE
// ============================================================================

export class ClearanceService {
  static async clearDepartment(
    instanceId: string,
    clearanceId: string,
    clearedBy: string,
    comments?: string
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const clearanceIndex = instance.clearances.findIndex((c) => c.id === clearanceId);
      if (clearanceIndex === -1) throw new Error('Clearance not found');

      instance.clearances[clearanceIndex] = {
        ...instance.clearances[clearanceIndex],
        status: 'cleared',
        clearedDate: new Date().toISOString(),
        clearedBy,
        comments,
      };

      return OffboardingInstanceService.updateInstance(instanceId, {
        clearances: instance.clearances,
      });
    } catch (error: any) {
      throw error;
    }
  }

  static async reportIssue(
    instanceId: string,
    clearanceId: string,
    issue: {
      issueType: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      amountDue?: number;
    }
  ): Promise<OffboardingInstance> {
    try {
      const instance = await OffboardingInstanceService.getInstanceById(instanceId);
      if (!instance) throw new Error('Instance not found');

      const clearanceIndex = instance.clearances.findIndex((c) => c.id === clearanceId);
      if (clearanceIndex === -1) throw new Error('Clearance not found');

      const issues = instance.clearances[clearanceIndex].issues || [];
      issues.push(issue);

      instance.clearances[clearanceIndex] = {
        ...instance.clearances[clearanceIndex],
        status: 'issues',
        issues,
      };

      return OffboardingInstanceService.updateInstance(instanceId, {
        clearances: instance.clearances,
      });
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// KNOWLEDGE TRANSFER SERVICE
// ============================================================================

export class KnowledgeTransferService {
  static async getKnowledgeTransfers(filters?: {
    offboardingId?: string;
    employeeId?: string;
  }): Promise<KnowledgeTransfer[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/knowledge-transfers', filters);
      return APIClient.unwrapList<KnowledgeTransfer>(response, 'transfers');
    } catch (error: any) {
      return [];
    }
  }

  static async createKnowledgeTransfer(transfer: KnowledgeTransfer): Promise<KnowledgeTransfer> {
    try {
      const response = await APIClient.post<{ transfer?: KnowledgeTransfer }>(
        '/offboarding/knowledge-transfers',
        transfer
      );
      return response.transfer || transfer;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateKnowledgeTransfer(
    id: string,
    updates: Partial<KnowledgeTransfer>
  ): Promise<KnowledgeTransfer> {
    try {
      const response = await APIClient.put<{ transfer?: KnowledgeTransfer }>(
        `/offboarding/knowledge-transfers/${id}`,
        updates
      );
      return response.transfer || ({ ...updates, id } as KnowledgeTransfer);
    } catch (error: any) {
      throw error;
    }
  }

  static async addSession(
    id: string,
    session: KnowledgeTransferSession
  ): Promise<KnowledgeTransfer> {
    try {
      const transfers = await this.getKnowledgeTransfers();
      const transfer = transfers.find((t) => t.id === id);
      if (!transfer) throw new Error('Knowledge transfer not found');

      const sessions = [...transfer.sessions, session];
      return this.updateKnowledgeTransfer(id, { sessions });
    } catch (error: any) {
      throw error;
    }
  }

  static async completeHandoverItem(id: string, itemId: string): Promise<KnowledgeTransfer> {
    try {
      const transfers = await this.getKnowledgeTransfers();
      const transfer = transfers.find((t) => t.id === id);
      if (!transfer) throw new Error('Knowledge transfer not found');

      const handoverChecklist = transfer.handoverChecklist.map((item) =>
        item.id === itemId
          ? { ...item, status: 'completed' as const, completedDate: new Date().toISOString() }
          : item
      );

      const completedItems = handoverChecklist.filter((i) => i.status === 'completed').length;
      const progress = Math.round((completedItems / handoverChecklist.length) * 100);

      return this.updateKnowledgeTransfer(id, {
        handoverChecklist,
        completedItems,
        progress,
      });
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// EXIT INTERVIEW SERVICE
// ============================================================================

export class ExitInterviewService {
  static async getExitInterviews(filters?: {
    offboardingId?: string;
    status?: string;
  }): Promise<ExitInterview[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/exit-interviews', filters);
      return APIClient.unwrapList<ExitInterview>(response, 'interviews');
    } catch (error: any) {
      return [];
    }
  }

  static async createExitInterview(interview: ExitInterview): Promise<ExitInterview> {
    try {
      const response = await APIClient.post<{ interview?: ExitInterview }>(
        '/offboarding/exit-interviews',
        interview
      );
      return response.interview || interview;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateExitInterview(
    id: string,
    updates: Partial<ExitInterview>
  ): Promise<ExitInterview> {
    try {
      const response = await APIClient.put<{ interview?: ExitInterview }>(
        `/offboarding/exit-interviews/${id}`,
        updates
      );
      return response.interview || ({ ...updates, id } as ExitInterview);
    } catch (error: any) {
      throw error;
    }
  }

  static async completeInterview(id: string, conductedBy: string): Promise<ExitInterview> {
    return this.updateExitInterview(id, {
      status: 'completed',
      conductedDate: new Date().toISOString(),
      conductedBy,
    });
  }
}

// ============================================================================
// EXIT SURVEY SERVICE
// ============================================================================

export class ExitSurveyService {
  static async getExitSurveys(filters?: {
    offboardingId?: string;
    status?: string;
  }): Promise<ExitSurvey[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/exit-surveys', filters);
      return APIClient.unwrapList<ExitSurvey>(response, 'surveys');
    } catch (error: any) {
      return [];
    }
  }

  static async createExitSurvey(survey: ExitSurvey): Promise<ExitSurvey> {
    try {
      const response = await APIClient.post<{ survey?: ExitSurvey }>(
        '/offboarding/exit-surveys',
        survey
      );
      return response.survey || survey;
    } catch (error: any) {
      throw error;
    }
  }

  static async submitSurvey(
    id: string,
    answers: ExitSurvey['questions'],
    overallRating?: number,
    wouldReturn?: boolean,
    wouldRecommend?: boolean,
    comments?: string
  ): Promise<ExitSurvey> {
    try {
      const response = await APIClient.put<{ survey?: ExitSurvey }>(
        `/offboarding/exit-surveys/${id}/submit`,
        {
          questions: answers,
          overallRating,
          wouldReturn: wouldReturn ?? false,
          wouldRecommend: wouldRecommend ?? false,
          comments,
          status: 'completed',
          completedDate: new Date().toISOString(),
        }
      );
      return response.survey || ({ id, status: 'completed' } as ExitSurvey);
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// FINAL SETTLEMENT SERVICE
// ============================================================================

export class FinalSettlementService {
  static async getFinalSettlements(filters?: {
    offboardingId?: string;
    status?: string;
  }): Promise<FinalSettlement[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/final-settlements', filters);
      return APIClient.unwrapList<FinalSettlement>(response, 'settlements');
    } catch (error: any) {
      return [];
    }
  }

  static async createFinalSettlement(settlement: FinalSettlement): Promise<FinalSettlement> {
    try {
      const response = await APIClient.post<{ settlement?: FinalSettlement }>(
        '/offboarding/final-settlements',
        settlement
      );
      return response.settlement || settlement;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateFinalSettlement(
    id: string,
    updates: Partial<FinalSettlement>
  ): Promise<FinalSettlement> {
    try {
      const response = await APIClient.put<{ settlement?: FinalSettlement }>(
        `/offboarding/final-settlements/${id}`,
        updates
      );
      return response.settlement || ({ ...updates, id } as FinalSettlement);
    } catch (error: any) {
      throw error;
    }
  }

  static async approveSettlement(id: string, approvedBy: string): Promise<FinalSettlement> {
    return this.updateFinalSettlement(id, {
      status: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  }

  static async markPaid(
    id: string,
    paidBy: string,
    paymentReference: string
  ): Promise<FinalSettlement> {
    return this.updateFinalSettlement(id, {
      status: 'paid',
      paidBy,
      paymentDate: new Date().toISOString(),
      paymentReference,
    });
  }
}

// ============================================================================
// ALUMNI SERVICE
// ============================================================================

export class AlumniService {
  static async getAlumni(filters?: {
    status?: string;
    departmentId?: string;
  }): Promise<AlumniRecord[]> {
    try {
      const response = await APIClient.get<unknown>('/offboarding/alumni', filters);
      return APIClient.unwrapList<AlumniRecord>(response, 'alumni');
    } catch (error: any) {
      return [];
    }
  }

  static async createAlumniRecord(record: AlumniRecord): Promise<AlumniRecord> {
    try {
      const response = await APIClient.post<{ alumniRecord?: AlumniRecord }>(
        '/offboarding/alumni',
        record
      );
      return response.alumniRecord || record;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateAlumniRecord(
    id: string,
    updates: Partial<AlumniRecord>
  ): Promise<AlumniRecord> {
    try {
      const response = await APIClient.put<{ alumniRecord?: AlumniRecord }>(
        `/offboarding/alumni/${id}`,
        updates
      );
      return response.alumniRecord || ({ ...updates, id } as AlumniRecord);
    } catch (error: any) {
      throw error;
    }
  }

  static async optOut(id: string): Promise<AlumniRecord> {
    return this.updateAlumniRecord(id, {
      status: 'opted_out',
      optedOutDate: new Date().toISOString(),
    });
  }
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class OffboardingAnalyticsService {
  static async getMetrics(): Promise<OffboardingMetrics> {
    try {
      const response = await APIClient.get<{ metrics?: OffboardingMetrics }>(
        '/offboarding/analytics/metrics'
      );
      return (
        response.metrics || {
          totalOffboarding: 0,
          activeOffboarding: 0,
          completedOffboarding: 0,
          averageCompletionTime: 0,
          averageNoticePeriod: 0,
          offboardingByType: [],
          offboardingByDepartment: [],
          turnoverRate: 0,
          voluntaryTurnover: 0,
          involuntaryTurnover: 0,
          retirementRate: 0,
          avgTenure: 0,
          topExitReasons: [],
          rehireEligibilityStats: {
            eligible: 0,
            notEligible: 0,
            restricted: 0,
            underReview: 0,
          },
          exitInterviewParticipation: 0,
          exitSurveyResponse: 0,
          averageExitRating: 0,
          npsScore: 0,
          equipmentReturnRate: 0,
          clearanceCompletionRate: 0,
          knowledgeTransferCompletionRate: 0,
          alumniEngagementRate: 0,
          costPerOffboarding: 0,
          retentionRiskDepartments: [],
        }
      );
    } catch (error: any) {
      return {} as OffboardingMetrics;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class OffboardingSettingsService {
  static async getSettings(): Promise<OffboardingSettings> {
    try {
      const response = await APIClient.get<{ settings?: OffboardingSettings }>(
        '/offboarding/settings'
      );
      return (
        response.settings || {
          defaultNoticePeriod: 30,
          autoInitiateOffboarding: true,
          requireExitInterview: true,
          requireExitSurvey: true,
          exitSurveyAnonymous: false,
          exitSurveyExpiry: 30,
          sendExitSurveyAfter: 0,
          requireKnowledgeTransfer: true,
          knowledgeTransferDuration: 14,
          autoRevokeAccessOnExit: true,
          accessRevocationLeadTime: 0,
          autoCreateAlumniRecord: true,
          alumniOptInRequired: false,
          equipmentReturnReminder: 7,
          clearanceReminderFrequency: 'weekly',
          finalSettlementDays: 45,
          allowCounterOffer: true,
          counterOfferApprovalRequired: true,
          notificationEmail: 'hr@company.com',
          hrNotificationEmail: 'hr@company.com',
          itNotificationEmail: 'it@company.com',
          financeNotificationEmail: 'finance@company.com',
        }
      );
    } catch (error: any) {
      return {} as OffboardingSettings;
    }
  }

  static async updateSettings(updates: Partial<OffboardingSettings>): Promise<OffboardingSettings> {
    try {
      const response = await APIClient.put<{ settings?: OffboardingSettings }>(
        '/offboarding/settings',
        updates
      );
      return response.settings || (updates as OffboardingSettings);
    } catch (error: any) {
      throw error;
    }
  }
}
