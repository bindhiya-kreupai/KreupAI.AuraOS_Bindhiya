/**
 * Construction & Real Estate Module - Service Layer
 * Handles all business logic for Project Management, Site Safety, Equipment Leasing, and Subcontractor Portal
 */

import { APIClient } from '@/lib/api-client';
import type {
  ConstructionProject,
  ProjectTask,
  SafetyInspection,
  SafetyIncident,
  SafetyTraining,
  PPETracking,
  HazardIdentification,
  EquipmentLease,
  SubcontractorProfile,
  BidInvitation,
  Bid,
  SubcontractorContract,
  SubcontractorInvoice,
  ConstructionSettings,
  ConstructionAlert,
} from './types';

/**
 * Project Management Service
 * Manages construction projects, tasks, budgets, and timelines
 */
export class ProjectManagementService {
  private static endpoint = '/construction/projects';
  private static tasksEndpoint = '/construction/tasks';

  static async getAllProjects(): Promise<ConstructionProject[]> {
    const response = await APIClient.get<unknown>(this.endpoint);

    return APIClient.unwrapList<ConstructionProject>(response, 'projects');
  }
  static async getProjectById(projectId: string): Promise<ConstructionProject | null> {
    return APIClient.get<ConstructionProject>(`${this.endpoint}/${projectId}`);
  }

  static async createProject(
    projectData: Partial<ConstructionProject>
  ): Promise<ConstructionProject> {
    const response = await APIClient.post<unknown>(this.endpoint, projectData);

    const project = APIClient.unwrapItem<ConstructionProject>(response, 'project');

    if (!project) {
      throw new Error('Project was created, but the API returned an invalid response');
    }

    return project;
  }

  static async updateProject(
    projectId: string,
    updates: Partial<ConstructionProject>
  ): Promise<ConstructionProject> {
    return APIClient.put<ConstructionProject>(`${this.endpoint}/${projectId}`, updates);
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.endpoint}/${projectId}`);
    return true;
  }

  // Task Management
  static async getAllTasks(): Promise<ProjectTask[]> {
    return APIClient.get<ProjectTask[]>(this.tasksEndpoint);
  }

  static async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    return APIClient.get<ProjectTask[]>(this.tasksEndpoint, { projectId });
  }

  static async getTaskById(taskId: string): Promise<ProjectTask | null> {
    return APIClient.get<ProjectTask>(`${this.tasksEndpoint}/${taskId}`);
  }

  static async createTask(taskData: Partial<ProjectTask>): Promise<ProjectTask> {
    return APIClient.post<ProjectTask>(this.tasksEndpoint, taskData);
  }

  static async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    return APIClient.put<ProjectTask>(`${this.tasksEndpoint}/${taskId}`, updates);
  }

  static async deleteTask(taskId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.tasksEndpoint}/${taskId}`);
    return true;
  }

  static async updateBudget(projectId: string, budgetUpdates: any): Promise<ConstructionProject> {
    return APIClient.put<ConstructionProject>(
      `${this.endpoint}/${projectId}/budget`,
      budgetUpdates
    );
  }

  static async addChangeOrder(projectId: string, changeOrder: any): Promise<ConstructionProject> {
    return APIClient.post<ConstructionProject>(
      `${this.endpoint}/${projectId}/change-orders`,
      changeOrder
    );
  }

  static async updateMilestone(
    projectId: string,
    milestoneId: string,
    updates: any
  ): Promise<ConstructionProject> {
    return APIClient.put<ConstructionProject>(
      `${this.endpoint}/${projectId}/milestones/${milestoneId}`,
      updates
    );
  }
}

/**
 * Site Safety Service
 * Manages safety inspections, incidents, training, and hazard identification
 */
export class SiteSafetyService {
  private static inspectionsEndpoint = '/construction/safety/inspections';
  private static incidentsEndpoint = '/construction/safety/incidents';
  private static trainingsEndpoint = '/construction/safety/trainings';
  private static ppeEndpoint = '/construction/safety/ppe';
  private static hazardsEndpoint = '/construction/safety/hazards';
  static async getAllInspections(): Promise<SafetyInspection[]> {
    const response = await APIClient.get<unknown>(this.inspectionsEndpoint);

    return APIClient.unwrapList<SafetyInspection>(response, 'safetyInspections');
  }
  static async getProjectInspections(projectId: string): Promise<SafetyInspection[]> {
    return APIClient.get<SafetyInspection[]>(this.inspectionsEndpoint, { projectId });
  }

  static async getInspectionById(inspectionId: string): Promise<SafetyInspection | null> {
    return APIClient.get<SafetyInspection>(`${this.inspectionsEndpoint}/${inspectionId}`);
  }

  static async createInspection(
    inspectionData: Partial<SafetyInspection>
  ): Promise<SafetyInspection> {
    const response = await APIClient.post<unknown>(this.inspectionsEndpoint, inspectionData);

    const inspection = APIClient.unwrapItem<SafetyInspection>(response, 'safetyInspection');

    if (!inspection) {
      throw new Error('Inspection was not returned by the API');
    }

    return inspection;
  }

  static async updateInspection(
    inspectionId: string,
    updates: Partial<SafetyInspection>
  ): Promise<SafetyInspection> {
    return APIClient.put<SafetyInspection>(`${this.inspectionsEndpoint}/${inspectionId}`, updates);
  }

  static async deleteInspection(inspectionId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.inspectionsEndpoint}/${inspectionId}`);
    return true;
  }

  // Incident Management
  static async getAllIncidents(): Promise<SafetyIncident[]> {
    const response = await APIClient.get<unknown>(this.incidentsEndpoint);

    return APIClient.unwrapList<SafetyIncident>(response, 'safetyIncidents');
  }

  static async getProjectIncidents(projectId: string): Promise<SafetyIncident[]> {
    return APIClient.get<SafetyIncident[]>(this.incidentsEndpoint, { projectId });
  }

  static async getIncidentById(incidentId: string): Promise<SafetyIncident | null> {
    return APIClient.get<SafetyIncident>(`${this.incidentsEndpoint}/${incidentId}`);
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const response = await APIClient.post<unknown>(this.incidentsEndpoint, incidentData);

    const incident = APIClient.unwrapItem<SafetyIncident>(response, 'safetyIncident');

    if (!incident) {
      throw new Error('Safety incident was created, but API returned an invalid response');
    }

    return incident;
  }

  static async updateIncident(
    incidentId: string,
    updates: Partial<SafetyIncident>
  ): Promise<SafetyIncident> {
    return APIClient.put<SafetyIncident>(`${this.incidentsEndpoint}/${incidentId}`, updates);
  }

  static async deleteIncident(incidentId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.incidentsEndpoint}/${incidentId}`);
    return true;
  }

  // Safety Training
  static async getAllTrainings(): Promise<SafetyTraining[]> {
    const response = await APIClient.get<unknown>(this.trainingsEndpoint);

    return APIClient.unwrapList<SafetyTraining>(response, 'safetyTrainings');
  }

  static async getTrainingById(trainingId: string): Promise<SafetyTraining | null> {
    return APIClient.get<SafetyTraining>(`${this.trainingsEndpoint}/${trainingId}`);
  }

  static async createTraining(trainingData: Partial<SafetyTraining>): Promise<SafetyTraining> {
    const response = await APIClient.post<unknown>(this.trainingsEndpoint, trainingData);

    const training = APIClient.unwrapItem<SafetyTraining>(response, 'safetyTraining');

    if (!training) {
      throw new Error('Training was not returned by the API');
    }

    return training;
  }

  static async updateTraining(
    trainingId: string,
    updates: Partial<SafetyTraining>
  ): Promise<SafetyTraining> {
    return APIClient.put<SafetyTraining>(`${this.trainingsEndpoint}/${trainingId}`, updates);
  }

  // PPE Tracking
  static async getAllPPETracking(): Promise<PPETracking[]> {
    return APIClient.get<PPETracking[]>(this.ppeEndpoint);
  }

  static async getPPETrackingByEmployeeId(employeeId: string): Promise<PPETracking | null> {
    return APIClient.get<PPETracking>(`${this.ppeEndpoint}/employee/${employeeId}`);
  }

  static async createPPETracking(ppeData: Partial<PPETracking>): Promise<PPETracking> {
    return APIClient.post<PPETracking>(this.ppeEndpoint, ppeData);
  }

  static async updatePPETracking(
    ppeId: string,
    updates: Partial<PPETracking>
  ): Promise<PPETracking> {
    return APIClient.put<PPETracking>(`${this.ppeEndpoint}/${ppeId}`, updates);
  }

  // Hazard Identification
  static async getAllHazards(): Promise<HazardIdentification[]> {
    const response = await APIClient.get<unknown>(this.hazardsEndpoint);

    return APIClient.unwrapList<HazardIdentification>(response, 'hazards');
  }
  static async getProjectHazards(projectId: string): Promise<HazardIdentification[]> {
    return APIClient.get<HazardIdentification[]>(this.hazardsEndpoint, { projectId });
  }

  static async createHazard(
    hazardData: Partial<HazardIdentification>
  ): Promise<HazardIdentification> {
    const response = await APIClient.post<unknown>(this.hazardsEndpoint, hazardData);

    const hazard = APIClient.unwrapItem<HazardIdentification>(response, 'hazard');

    if (!hazard) {
      throw new Error('Hazard was not returned by the API');
    }

    return hazard;
  }

  static async updateHazard(
    hazardId: string,
    updates: Partial<HazardIdentification>
  ): Promise<HazardIdentification> {
    return APIClient.put<HazardIdentification>(`${this.hazardsEndpoint}/${hazardId}`, updates);
  }
}

/**
 * Equipment Leasing Service
 * Manages equipment leases, maintenance, and utilization
 */
export class EquipmentLeasingService {
  private static endpoint = '/construction/equipment/leases';
  static async getAllLeases(): Promise<EquipmentLease[]> {
    const response = await APIClient.get<unknown>(this.endpoint);

    return APIClient.unwrapList<EquipmentLease>(response, 'equipmentLeases');
  }

  static async getProjectLeases(projectId: string): Promise<EquipmentLease[]> {
    return APIClient.get<EquipmentLease[]>(this.endpoint, { projectId });
  }

  static async getLeaseById(leaseId: string): Promise<EquipmentLease | null> {
    return APIClient.get<EquipmentLease>(`${this.endpoint}/${leaseId}`);
  }

  static async createLease(leaseData: Partial<EquipmentLease>): Promise<EquipmentLease> {
    const response = await APIClient.post<unknown>(this.endpoint, leaseData);

    const lease = APIClient.unwrapItem<EquipmentLease>(response, 'equipmentLease');

    if (!lease) {
      throw new Error('Equipment lease was created, but API returned an invalid response');
    }

    return lease;
  }

  static async updateLease(
    leaseId: string,
    updates: Partial<EquipmentLease>
  ): Promise<EquipmentLease> {
    const response = await APIClient.put<unknown>(`${this.endpoint}/${leaseId}`, updates);

    const lease = APIClient.unwrapItem<EquipmentLease>(response, 'equipmentLease');

    if (!lease) {
      throw new Error('Equipment lease was updated, but API returned an invalid response');
    }

    return lease;
  }

  static async deleteLease(leaseId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.endpoint}/${leaseId}`);
    return true;
  }

  static async recordUtilization(leaseId: string, utilizationData: any): Promise<EquipmentLease> {
    return APIClient.put<EquipmentLease>(
      `${this.endpoint}/${leaseId}/utilization`,
      utilizationData
    );
  }

  static async addMaintenanceRecord(
    leaseId: string,
    maintenanceRecord: any
  ): Promise<EquipmentLease> {
    return APIClient.post<EquipmentLease>(
      `${this.endpoint}/${leaseId}/maintenance`,
      maintenanceRecord
    );
  }

  static async addInspection(leaseId: string, inspection: any): Promise<EquipmentLease> {
    return APIClient.post<EquipmentLease>(`${this.endpoint}/${leaseId}/inspections`, inspection);
  }
}

/**
 * Subcontractor Portal Service
 * Manages subcontractor profiles, bids, contracts, and invoices
 */
export class SubcontractorPortalService {
  private static subcontractorsEndpoint = '/construction/subcontractors';
  private static bidInvitationsEndpoint = '/construction/bid-invitations';
  private static bidsEndpoint = '/construction/bids';
  private static contractsEndpoint = '/construction/contracts';
  private static invoicesEndpoint = '/construction/invoices';

  static async getAllSubcontractors(): Promise<SubcontractorProfile[]> {
    const response = await APIClient.get<unknown>(this.subcontractorsEndpoint);

    return APIClient.unwrapList<SubcontractorProfile>(response, 'subcontractors');
  }

  static async getSubcontractorById(subcontractorId: string): Promise<SubcontractorProfile | null> {
    const response = await APIClient.get<unknown>(
      `${this.subcontractorsEndpoint}/${subcontractorId}`
    );

    return APIClient.unwrapItem<SubcontractorProfile>(response, 'subcontractor');
  }

  static async createSubcontractor(
    subcontractorData: Partial<SubcontractorProfile>
  ): Promise<SubcontractorProfile> {
    const response = await APIClient.post<unknown>(this.subcontractorsEndpoint, subcontractorData);

    const subcontractor = APIClient.unwrapItem<SubcontractorProfile>(response, 'subcontractor');

    if (!subcontractor) {
      throw new Error('Subcontractor was created, but API returned an invalid response');
    }

    return subcontractor;
  }

  static async updateSubcontractor(
    subcontractorId: string,
    updates: Partial<SubcontractorProfile>
  ): Promise<SubcontractorProfile> {
    const response = await APIClient.put<unknown>(
      `${this.subcontractorsEndpoint}/${subcontractorId}`,
      updates
    );

    const subcontractor = APIClient.unwrapItem<SubcontractorProfile>(response, 'subcontractor');

    if (!subcontractor) {
      throw new Error('Subcontractor was updated, but API returned an invalid response');
    }

    return subcontractor;
  }

  static async deleteSubcontractor(subcontractorId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.subcontractorsEndpoint}/${subcontractorId}`);
    return true;
  }

  // Bid Management
  static async getAllBidInvitations(): Promise<BidInvitation[]> {
    const response = await APIClient.get<unknown>(this.bidInvitationsEndpoint);

    return APIClient.unwrapList<BidInvitation>(response, 'bidInvitations');
  }

  static async createBidInvitation(invitationData: Partial<BidInvitation>): Promise<BidInvitation> {
    const response = await APIClient.post<unknown>(this.bidInvitationsEndpoint, invitationData);

    const invitation = APIClient.unwrapItem<BidInvitation>(response, 'bidInvitation');

    if (!invitation) {
      throw new Error('Bid invitation was created, but API returned an invalid response');
    }

    return invitation;
  }

  static async getAllBids(): Promise<Bid[]> {
    const response = await APIClient.get<unknown>(this.bidsEndpoint);

    return APIClient.unwrapList<Bid>(response, 'bids');
  }

  static async getProjectBids(projectId: string): Promise<Bid[]> {
    const response = await APIClient.get<unknown>(this.bidsEndpoint, { projectId });

    return APIClient.unwrapList<Bid>(response, 'bids');
  }

  static async createBid(bidData: Partial<Bid>): Promise<Bid> {
    const response = await APIClient.post<unknown>(this.bidsEndpoint, bidData);

    const bid = APIClient.unwrapItem<Bid>(response, 'bid');

    if (!bid) {
      throw new Error('Bid was created, but API returned an invalid response');
    }

    return bid;
  }

  static async updateBid(bidId: string, updates: Partial<Bid>): Promise<Bid> {
    const response = await APIClient.put<unknown>(`${this.bidsEndpoint}/${bidId}`, updates);

    const bid = APIClient.unwrapItem<Bid>(response, 'bid');

    if (!bid) {
      throw new Error('Bid was updated, but API returned an invalid response');
    }

    return bid;
  }

  // Contract Management
  static async getAllContracts(): Promise<SubcontractorContract[]> {
    const response = await APIClient.get<unknown>(this.contractsEndpoint);

    return APIClient.unwrapList<SubcontractorContract>(response, 'contracts');
  }

  static async getProjectContracts(projectId: string): Promise<SubcontractorContract[]> {
    const response = await APIClient.get<unknown>(this.contractsEndpoint, {
      projectId,
    });

    return APIClient.unwrapList<SubcontractorContract>(response, 'contracts');
  }

  static async createContract(
    contractData: Partial<SubcontractorContract>
  ): Promise<SubcontractorContract> {
    const response = await APIClient.post<unknown>(this.contractsEndpoint, contractData);

    const contract = APIClient.unwrapItem<SubcontractorContract>(response, 'contract');

    if (!contract) {
      throw new Error('Contract was created, but API returned an invalid response');
    }

    return contract;
  }

  static async updateContract(
    contractId: string,
    updates: Partial<SubcontractorContract>
  ): Promise<SubcontractorContract> {
    const response = await APIClient.put<unknown>(
      `${this.contractsEndpoint}/${contractId}`,
      updates
    );

    const contract = APIClient.unwrapItem<SubcontractorContract>(response, 'contract');

    if (!contract) {
      throw new Error('Contract was updated, but API returned an invalid response');
    }

    return contract;
  }

  // Invoice Management
  static async getAllInvoices(): Promise<SubcontractorInvoice[]> {
    const response = await APIClient.get<unknown>(this.invoicesEndpoint);

    return APIClient.unwrapList<SubcontractorInvoice>(response, 'invoices');
  }

  static async getContractInvoices(contractId: string): Promise<SubcontractorInvoice[]> {
    const response = await APIClient.get<unknown>(this.invoicesEndpoint, {
      contractId,
    });

    return APIClient.unwrapList<SubcontractorInvoice>(response, 'invoices');
  }

  static async createInvoice(
    invoiceData: Partial<SubcontractorInvoice>
  ): Promise<SubcontractorInvoice> {
    const response = await APIClient.post<unknown>(this.invoicesEndpoint, invoiceData);

    const invoice = APIClient.unwrapItem<SubcontractorInvoice>(response, 'invoice');

    if (!invoice) {
      throw new Error('Invoice was created, but API returned an invalid response');
    }

    return invoice;
  }

  static async updateInvoice(
    invoiceId: string,
    updates: Partial<SubcontractorInvoice>
  ): Promise<SubcontractorInvoice> {
    const response = await APIClient.put<unknown>(`${this.invoicesEndpoint}/${invoiceId}`, updates);

    const invoice = APIClient.unwrapItem<SubcontractorInvoice>(response, 'invoice');

    if (!invoice) {
      throw new Error('Invoice was updated, but API returned an invalid response');
    }

    return invoice;
  }
}

/**
 * Construction Settings Service
 * Manages module settings and configurations
 */
export class ConstructionSettingsService {
  private static endpoint = '/construction/settings';

  static async getSettings(): Promise<ConstructionSettings | null> {
    return APIClient.get<ConstructionSettings>(this.endpoint);
  }

  static async updateSettings(
    settings: Partial<ConstructionSettings>
  ): Promise<ConstructionSettings> {
    return APIClient.put<ConstructionSettings>(this.endpoint, settings);
  }
}

/**
 * Staffing Service
 * Manages crew allocations across construction sites.
 * Backed by /api/construction/staffing.
 */
export class StaffingService {
  private static endpoint = '/construction/staffing';

  static async getAllAllocations(): Promise<any[]> {
    const response = await APIClient.get<unknown>(this.endpoint);

    return APIClient.unwrapList<any>(response, 'staffingAllocations');
  }

  static async createAllocation(data: any): Promise<any> {
    const response = await APIClient.post<unknown>(this.endpoint, data);

    const allocation = APIClient.unwrapItem<any>(response, 'staffingAllocation');

    if (!allocation) {
      throw new Error('Staffing allocation was created, but API returned an invalid response');
    }

    return allocation;
  }

  static async updateAllocation(allocationId: string, updates: any): Promise<any> {
    const response = await APIClient.put<unknown>(`${this.endpoint}/${allocationId}`, updates);

    const allocation = APIClient.unwrapItem<any>(response, 'staffingAllocation');

    if (!allocation) {
      throw new Error('Staffing allocation was updated, but API returned an invalid response');
    }

    return allocation;
  }

  static async deleteAllocation(allocationId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.endpoint}/${allocationId}`);

    return true;
  }
}

/**
 * Alerts Service
 * Manages alerts and notifications
 */
export class AlertsService {
  private static endpoint = '/construction/alerts';

  static async getAllAlerts(): Promise<ConstructionAlert[]> {
    return APIClient.get<ConstructionAlert[]>(this.endpoint);
  }

  static async createAlert(alertData: Partial<ConstructionAlert>): Promise<ConstructionAlert> {
    return APIClient.post<ConstructionAlert>(this.endpoint, alertData);
  }

  static async updateAlert(
    alertId: string,
    updates: Partial<ConstructionAlert>
  ): Promise<ConstructionAlert> {
    return APIClient.put<ConstructionAlert>(`${this.endpoint}/${alertId}`, updates);
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<ConstructionAlert> {
    return APIClient.put<ConstructionAlert>(`${this.endpoint}/${alertId}/acknowledge`, { userId });
  }

  static async resolveAlert(alertId: string): Promise<ConstructionAlert> {
    return APIClient.put<ConstructionAlert>(`${this.endpoint}/${alertId}/resolve`, {});
  }
}
