// Offboarding Module Services
// Complete service layer for employee offboarding management

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

// Storage keys
const STORAGE_KEYS = {
  RESIGNATIONS: 'offboarding_resignations',
  TERMINATIONS: 'offboarding_terminations',
  INSTANCES: 'offboarding_instances',
  EQUIPMENT_RETURNS: 'offboarding_equipment_returns',
  ACCESS_REVOCATIONS: 'offboarding_access_revocations',
  CLEARANCES: 'offboarding_clearances',
  KNOWLEDGE_TRANSFERS: 'offboarding_knowledge_transfers',
  EXIT_INTERVIEWS: 'offboarding_exit_interviews',
  EXIT_SURVEYS: 'offboarding_exit_surveys',
  FINAL_SETTLEMENTS: 'offboarding_final_settlements',
  ALUMNI: 'offboarding_alumni',
  METRICS: 'offboarding_metrics',
  SETTINGS: 'offboarding_settings',
};

// ============================================================================
// RESIGNATION SERVICE
// ============================================================================

export class ResignationService {
  static async getResignations(filters?: {
    employeeId?: string;
    status?: string;
    departmentId?: string;
  }): Promise<ResignationLetter[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.RESIGNATIONS);
    let resignations: ResignationLetter[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) {
        resignations = resignations.filter((r) => r.employeeId === filters.employeeId);
      }
      if (filters.status) {
        resignations = resignations.filter((r) => r.status === filters.status);
      }
      if (filters.departmentId) {
        resignations = resignations.filter((r) => r.departmentId === filters.departmentId);
      }
    }

    return resignations;
  }

  static async getResignationById(id: string): Promise<ResignationLetter | null> {
    const resignations = await this.getResignations();
    return resignations.find((r) => r.id === id) || null;
  }

  static async submitResignation(resignation: ResignationLetter): Promise<ResignationLetter> {
    // TODO: Replace with actual API call
    const resignations = await this.getResignations();
    resignations.push(resignation);
    localStorage.setItem(STORAGE_KEYS.RESIGNATIONS, JSON.stringify(resignations));
    return resignation;
  }

  static async updateResignation(
    id: string,
    updates: Partial<ResignationLetter>
  ): Promise<ResignationLetter> {
    // TODO: Replace with actual API call
    const resignations = await this.getResignations();
    const index = resignations.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new Error('Resignation not found');
    }

    resignations[index] = { ...resignations[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RESIGNATIONS, JSON.stringify(resignations));
    return resignations[index];
  }

  static async acceptResignation(
    id: string,
    acceptedBy: string
  ): Promise<ResignationLetter> {
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TERMINATIONS);
    let terminations: TerminationNotice[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) {
        terminations = terminations.filter((t) => t.employeeId === filters.employeeId);
      }
      if (filters.departmentId) {
        terminations = terminations.filter((t) => t.departmentId === filters.departmentId);
      }
    }

    return terminations;
  }

  static async getTerminationById(id: string): Promise<TerminationNotice | null> {
    const terminations = await this.getTerminations();
    return terminations.find((t) => t.id === id) || null;
  }

  static async createTermination(termination: TerminationNotice): Promise<TerminationNotice> {
    // TODO: Replace with actual API call
    const terminations = await this.getTerminations();
    terminations.push(termination);
    localStorage.setItem(STORAGE_KEYS.TERMINATIONS, JSON.stringify(terminations));
    return termination;
  }

  static async updateTermination(
    id: string,
    updates: Partial<TerminationNotice>
  ): Promise<TerminationNotice> {
    // TODO: Replace with actual API call
    const terminations = await this.getTerminations();
    const index = terminations.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('Termination notice not found');
    }

    terminations[index] = { ...terminations[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TERMINATIONS, JSON.stringify(terminations));
    return terminations[index];
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.INSTANCES);
    let instances: OffboardingInstance[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) {
        instances = instances.filter((i) => i.employeeId === filters.employeeId);
      }
      if (filters.status) {
        instances = instances.filter((i) => i.status === filters.status);
      }
      if (filters.departmentId) {
        instances = instances.filter((i) => i.departmentId === filters.departmentId);
      }
    }

    return instances;
  }

  static async getInstanceById(id: string): Promise<OffboardingInstance | null> {
    const instances = await this.getInstances();
    return instances.find((i) => i.id === id) || null;
  }

  static async createInstance(instance: OffboardingInstance): Promise<OffboardingInstance> {
    // TODO: Replace with actual API call
    const instances = await this.getInstances();
    instances.push(instance);
    localStorage.setItem(STORAGE_KEYS.INSTANCES, JSON.stringify(instances));
    return instance;
  }

  static async updateInstance(
    id: string,
    updates: Partial<OffboardingInstance>
  ): Promise<OffboardingInstance> {
    // TODO: Replace with actual API call
    const instances = await this.getInstances();
    const index = instances.findIndex((i) => i.id === id);

    if (index === -1) {
      throw new Error('Offboarding instance not found');
    }

    instances[index] = {
      ...instances[index],
      ...updates,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.INSTANCES, JSON.stringify(instances));
    return instances[index];
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
  }

  static async addTask(instanceId: string, task: OffboardingTask): Promise<OffboardingInstance> {
    const instance = await OffboardingInstanceService.getInstanceById(instanceId);
    if (!instance) throw new Error('Instance not found');

    instance.tasks.push(task);
    return OffboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
  }

  static async removeTask(instanceId: string, taskId: string): Promise<OffboardingInstance> {
    const instance = await OffboardingInstanceService.getInstanceById(instanceId);
    if (!instance) throw new Error('Instance not found');

    instance.tasks = instance.tasks.filter((t) => t.id !== taskId);
    return OffboardingInstanceService.updateInstance(instanceId, { tasks: instance.tasks });
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
  }

  static async applyCharge(
    instanceId: string,
    equipmentId: string,
    chargeType: 'damage' | 'lost',
    amount: number
  ): Promise<OffboardingInstance> {
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
  }

  static async waiveCharge(
    instanceId: string,
    equipmentId: string,
    reason: string,
    waivedBy: string
  ): Promise<OffboardingInstance> {
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
  }

  static async markRevocationFailed(
    instanceId: string,
    accessId: string,
    failureReason: string
  ): Promise<OffboardingInstance> {
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_TRANSFERS);
    let transfers: KnowledgeTransfer[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.offboardingId) {
        transfers = transfers.filter((t) => t.offboardingId === filters.offboardingId);
      }
      if (filters.employeeId) {
        transfers = transfers.filter((t) => t.employeeId === filters.employeeId);
      }
    }

    return transfers;
  }

  static async createKnowledgeTransfer(transfer: KnowledgeTransfer): Promise<KnowledgeTransfer> {
    // TODO: Replace with actual API call
    const transfers = await this.getKnowledgeTransfers();
    transfers.push(transfer);
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_TRANSFERS, JSON.stringify(transfers));
    return transfer;
  }

  static async updateKnowledgeTransfer(
    id: string,
    updates: Partial<KnowledgeTransfer>
  ): Promise<KnowledgeTransfer> {
    // TODO: Replace with actual API call
    const transfers = await this.getKnowledgeTransfers();
    const index = transfers.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('Knowledge transfer not found');
    }

    transfers[index] = { ...transfers[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_TRANSFERS, JSON.stringify(transfers));
    return transfers[index];
  }

  static async addSession(
    id: string,
    session: KnowledgeTransferSession
  ): Promise<KnowledgeTransfer> {
    const transfer = (await this.getKnowledgeTransfers()).find((t) => t.id === id);
    if (!transfer) throw new Error('Knowledge transfer not found');

    const sessions = [...transfer.sessions, session];
    return this.updateKnowledgeTransfer(id, { sessions });
  }

  static async completeHandoverItem(
    id: string,
    itemId: string
  ): Promise<KnowledgeTransfer> {
    const transfer = (await this.getKnowledgeTransfers()).find((t) => t.id === id);
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EXIT_INTERVIEWS);
    let interviews: ExitInterview[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.offboardingId) {
        interviews = interviews.filter((i) => i.offboardingId === filters.offboardingId);
      }
      if (filters.status) {
        interviews = interviews.filter((i) => i.status === filters.status);
      }
    }

    return interviews;
  }

  static async createExitInterview(interview: ExitInterview): Promise<ExitInterview> {
    // TODO: Replace with actual API call
    const interviews = await this.getExitInterviews();
    interviews.push(interview);
    localStorage.setItem(STORAGE_KEYS.EXIT_INTERVIEWS, JSON.stringify(interviews));
    return interview;
  }

  static async updateExitInterview(
    id: string,
    updates: Partial<ExitInterview>
  ): Promise<ExitInterview> {
    // TODO: Replace with actual API call
    const interviews = await this.getExitInterviews();
    const index = interviews.findIndex((i) => i.id === id);

    if (index === -1) {
      throw new Error('Exit interview not found');
    }

    interviews[index] = { ...interviews[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EXIT_INTERVIEWS, JSON.stringify(interviews));
    return interviews[index];
  }

  static async completeInterview(
    id: string,
    conductedBy: string
  ): Promise<ExitInterview> {
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.EXIT_SURVEYS);
    let surveys: ExitSurvey[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.offboardingId) {
        surveys = surveys.filter((s) => s.offboardingId === filters.offboardingId);
      }
      if (filters.status) {
        surveys = surveys.filter((s) => s.status === filters.status);
      }
    }

    return surveys;
  }

  static async createExitSurvey(survey: ExitSurvey): Promise<ExitSurvey> {
    // TODO: Replace with actual API call
    const surveys = await this.getExitSurveys();
    surveys.push(survey);
    localStorage.setItem(STORAGE_KEYS.EXIT_SURVEYS, JSON.stringify(surveys));
    return survey;
  }

  static async submitSurvey(
    id: string,
    answers: ExitSurvey['questions'],
    overallRating?: number,
    wouldReturn?: boolean,
    wouldRecommend?: boolean,
    comments?: string
  ): Promise<ExitSurvey> {
    // TODO: Replace with actual API call
    const surveys = await this.getExitSurveys();
    const index = surveys.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Exit survey not found');
    }

    surveys[index] = {
      ...surveys[index],
      status: 'completed',
      completedDate: new Date().toISOString(),
      questions: answers,
      overallRating,
      wouldReturn: wouldReturn ?? false,
      wouldRecommend: wouldRecommend ?? false,
      comments,
    };

    localStorage.setItem(STORAGE_KEYS.EXIT_SURVEYS, JSON.stringify(surveys));
    return surveys[index];
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.FINAL_SETTLEMENTS);
    let settlements: FinalSettlement[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.offboardingId) {
        settlements = settlements.filter((s) => s.offboardingId === filters.offboardingId);
      }
      if (filters.status) {
        settlements = settlements.filter((s) => s.status === filters.status);
      }
    }

    return settlements;
  }

  static async createFinalSettlement(settlement: FinalSettlement): Promise<FinalSettlement> {
    // TODO: Replace with actual API call
    const settlements = await this.getFinalSettlements();
    settlements.push(settlement);
    localStorage.setItem(STORAGE_KEYS.FINAL_SETTLEMENTS, JSON.stringify(settlements));
    return settlement;
  }

  static async updateFinalSettlement(
    id: string,
    updates: Partial<FinalSettlement>
  ): Promise<FinalSettlement> {
    // TODO: Replace with actual API call
    const settlements = await this.getFinalSettlements();
    const index = settlements.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Final settlement not found');
    }

    settlements[index] = { ...settlements[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.FINAL_SETTLEMENTS, JSON.stringify(settlements));
    return settlements[index];
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ALUMNI);
    let alumni: AlumniRecord[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.status) {
        alumni = alumni.filter((a) => a.status === filters.status);
      }
      if (filters.departmentId) {
        alumni = alumni.filter((a) => a.departmentId === filters.departmentId);
      }
    }

    return alumni;
  }

  static async createAlumniRecord(record: AlumniRecord): Promise<AlumniRecord> {
    // TODO: Replace with actual API call
    const alumni = await this.getAlumni();
    alumni.push(record);
    localStorage.setItem(STORAGE_KEYS.ALUMNI, JSON.stringify(alumni));
    return record;
  }

  static async updateAlumniRecord(
    id: string,
    updates: Partial<AlumniRecord>
  ): Promise<AlumniRecord> {
    // TODO: Replace with actual API call
    const alumni = await this.getAlumni();
    const index = alumni.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Alumni record not found');
    }

    alumni[index] = { ...alumni[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ALUMNI, JSON.stringify(alumni));
    return alumni[index];
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
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    if (data) {
      return JSON.parse(data);
    }

    // Return default metrics
    return {
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
    };
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class OffboardingSettingsService {
  static async getSettings(): Promise<OffboardingSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }

    // Return default settings
    return {
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
    };
  }

  static async updateSettings(
    updates: Partial<OffboardingSettings>
  ): Promise<OffboardingSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
