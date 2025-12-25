/**
 * Construction & Real Estate Module - Service Layer
 * Handles all business logic for Project Management, Site Safety, Equipment Leasing, and Subcontractor Portal
 */

import { APIClient } from '@/lib/api-client';
import {
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
  ConstructionAlert
} from './types';

/**
 * Project Management Service
 * Manages construction projects, tasks, budgets, and timelines
 */
export class ProjectManagementService {
  private static endpoint = '/construction/projects';
  private static tasksEndpoint = '/construction/tasks';

  static async getAllProjects(): Promise<ConstructionProject[]> {
    return APIClient.get<ConstructionProject[]>(this.endpoint);
  }

  static async getProjectById(projectId: string): Promise<ConstructionProject | null> {
    return APIClient.get<ConstructionProject>(`${this.endpoint}/${projectId}`);
  }

  static async createProject(projectData: Partial<ConstructionProject>): Promise<ConstructionProject> {
    return APIClient.post<ConstructionProject>(this.endpoint, projectData);
  }

  static async updateProject(projectId: string, updates: Partial<ConstructionProject>): Promise<ConstructionProject> {
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
    return APIClient.put<ConstructionProject>(`${this.endpoint}/${projectId}/budget`, budgetUpdates);
  }

  static async addChangeOrder(projectId: string, changeOrder: any): Promise<ConstructionProject> {
    return APIClient.post<ConstructionProject>(`${this.endpoint}/${projectId}/change-orders`, changeOrder);
  }

  static async updateMilestone(projectId: string, milestoneId: string, updates: any): Promise<ConstructionProject> {
    return APIClient.put<ConstructionProject>(`${this.endpoint}/${projectId}/milestones/${milestoneId}`, updates);
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
    return APIClient.get<SafetyInspection[]>(this.inspectionsEndpoint);
  }

  static async getProjectInspections(projectId: string): Promise<SafetyInspection[]> {
    return APIClient.get<SafetyInspection[]>(this.inspectionsEndpoint, { projectId });
  }

  static async getInspectionById(inspectionId: string): Promise<SafetyInspection | null> {
    return APIClient.get<SafetyInspection>(`${this.inspectionsEndpoint}/${inspectionId}`);
  }

  static async createInspection(inspectionData: Partial<SafetyInspection>): Promise<SafetyInspection> {
    return APIClient.post<SafetyInspection>(this.inspectionsEndpoint, inspectionData);
  }

  static async updateInspection(inspectionId: string, updates: Partial<SafetyInspection>): Promise<SafetyInspection> {
    return APIClient.put<SafetyInspection>(`${this.inspectionsEndpoint}/${inspectionId}`, updates);
  }

  static async deleteInspection(inspectionId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.inspectionsEndpoint}/${inspectionId}`);
    return true;
  }

  // Incident Management
  static async getAllIncidents(): Promise<SafetyIncident[]> {
    return APIClient.get<SafetyIncident[]>(this.incidentsEndpoint);
  }

  static async getProjectIncidents(projectId: string): Promise<SafetyIncident[]> {
    return APIClient.get<SafetyIncident[]>(this.incidentsEndpoint, { projectId });
  }

  static async getIncidentById(incidentId: string): Promise<SafetyIncident | null> {
    return APIClient.get<SafetyIncident>(`${this.incidentsEndpoint}/${incidentId}`);
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    return APIClient.post<SafetyIncident>(this.incidentsEndpoint, incidentData);
  }

  static async updateIncident(incidentId: string, updates: Partial<SafetyIncident>): Promise<SafetyIncident> {
    return APIClient.put<SafetyIncident>(`${this.incidentsEndpoint}/${incidentId}`, updates);
  }

  static async deleteIncident(incidentId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.incidentsEndpoint}/${incidentId}`);
    return true;
  }

  // Safety Training
  static async getAllTrainings(): Promise<SafetyTraining[]> {
    return APIClient.get<SafetyTraining[]>(this.trainingsEndpoint);
  }

  static async getTrainingById(trainingId: string): Promise<SafetyTraining | null> {
    return APIClient.get<SafetyTraining>(`${this.trainingsEndpoint}/${trainingId}`);
  }

  static async createTraining(trainingData: Partial<SafetyTraining>): Promise<SafetyTraining> {
    return APIClient.post<SafetyTraining>(this.trainingsEndpoint, trainingData);
  }

  static async updateTraining(trainingId: string, updates: Partial<SafetyTraining>): Promise<SafetyTraining> {
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

  static async updatePPETracking(ppeId: string, updates: Partial<PPETracking>): Promise<PPETracking> {
    return APIClient.put<PPETracking>(`${this.ppeEndpoint}/${ppeId}`, updates);
  }

  // Hazard Identification
  static async getAllHazards(): Promise<HazardIdentification[]> {
    return APIClient.get<HazardIdentification[]>(this.hazardsEndpoint);
  }

  static async getProjectHazards(projectId: string): Promise<HazardIdentification[]> {
    return APIClient.get<HazardIdentification[]>(this.hazardsEndpoint, { projectId });
  }

  static async createHazard(hazardData: Partial<HazardIdentification>): Promise<HazardIdentification> {
    return APIClient.post<HazardIdentification>(this.hazardsEndpoint, hazardData);
  }

  static async updateHazard(hazardId: string, updates: Partial<HazardIdentification>): Promise<HazardIdentification> {
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
    return APIClient.get<EquipmentLease[]>(this.endpoint);
  }

  static async getProjectLeases(projectId: string): Promise<EquipmentLease[]> {
    return APIClient.get<EquipmentLease[]>(this.endpoint, { projectId });
  }

  static async getLeaseById(leaseId: string): Promise<EquipmentLease | null> {
    return APIClient.get<EquipmentLease>(`${this.endpoint}/${leaseId}`);
  }

  static async createLease(leaseData: Partial<EquipmentLease>): Promise<EquipmentLease> {
    return APIClient.post<EquipmentLease>(this.endpoint, leaseData);
  }

  static async updateLease(leaseId: string, updates: Partial<EquipmentLease>): Promise<EquipmentLease> {
    return APIClient.put<EquipmentLease>(`${this.endpoint}/${leaseId}`, updates);
  }

  static async deleteLease(leaseId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.endpoint}/${leaseId}`);
    return true;
  }

  static async recordUtilization(leaseId: string, utilizationData: any): Promise<EquipmentLease> {
    return APIClient.put<EquipmentLease>(`${this.endpoint}/${leaseId}/utilization`, utilizationData);
  }

  static async addMaintenanceRecord(leaseId: string, maintenanceRecord: any): Promise<EquipmentLease> {
    return APIClient.post<EquipmentLease>(`${this.endpoint}/${leaseId}/maintenance`, maintenanceRecord);
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
    return APIClient.get<SubcontractorProfile[]>(this.subcontractorsEndpoint);
  }

  static async getSubcontractorById(subcontractorId: string): Promise<SubcontractorProfile | null> {
    return APIClient.get<SubcontractorProfile>(`${this.subcontractorsEndpoint}/${subcontractorId}`);
  }

  static async createSubcontractor(subcontractorData: Partial<SubcontractorProfile>): Promise<SubcontractorProfile> {
    return APIClient.post<SubcontractorProfile>(this.subcontractorsEndpoint, subcontractorData);
  }

  static async updateSubcontractor(subcontractorId: string, updates: Partial<SubcontractorProfile>): Promise<SubcontractorProfile> {
    return APIClient.put<SubcontractorProfile>(`${this.subcontractorsEndpoint}/${subcontractorId}`, updates);
  }

  static async deleteSubcontractor(subcontractorId: string): Promise<boolean> {
    await APIClient.delete<void>(`${this.subcontractorsEndpoint}/${subcontractorId}`);
    return true;
  }

  // Bid Management
  static async getAllBidInvitations(): Promise<BidInvitation[]> {
    return APIClient.get<BidInvitation[]>(this.bidInvitationsEndpoint);
  }

  static async createBidInvitation(invitationData: Partial<BidInvitation>): Promise<BidInvitation> {
    return APIClient.post<BidInvitation>(this.bidInvitationsEndpoint, invitationData);
  }

  static async getAllBids(): Promise<Bid[]> {
    return APIClient.get<Bid[]>(this.bidsEndpoint);
  }

  static async getProjectBids(projectId: string): Promise<Bid[]> {
    return APIClient.get<Bid[]>(this.bidsEndpoint, { projectId });
  }

  static async createBid(bidData: Partial<Bid>): Promise<Bid> {
    return APIClient.post<Bid>(this.bidsEndpoint, bidData);
  }

  static async updateBid(bidId: string, updates: Partial<Bid>): Promise<Bid> {
    return APIClient.put<Bid>(`${this.bidsEndpoint}/${bidId}`, updates);
  }

  // Contract Management
  static async getAllContracts(): Promise<SubcontractorContract[]> {
    return APIClient.get<SubcontractorContract[]>(this.contractsEndpoint);
  }

  static async getProjectContracts(projectId: string): Promise<SubcontractorContract[]> {
    return APIClient.get<SubcontractorContract[]>(this.contractsEndpoint, { projectId });
  }

  static async createContract(contractData: Partial<SubcontractorContract>): Promise<SubcontractorContract> {
    return APIClient.post<SubcontractorContract>(this.contractsEndpoint, contractData);
  }

  static async updateContract(contractId: string, updates: Partial<SubcontractorContract>): Promise<SubcontractorContract> {
    return APIClient.put<SubcontractorContract>(`${this.contractsEndpoint}/${contractId}`, updates);
  }

  // Invoice Management
  static async getAllInvoices(): Promise<SubcontractorInvoice[]> {
    return APIClient.get<SubcontractorInvoice[]>(this.invoicesEndpoint);
  }

  static async getContractInvoices(contractId: string): Promise<SubcontractorInvoice[]> {
    return APIClient.get<SubcontractorInvoice[]>(this.invoicesEndpoint, { contractId });
  }

  static async createInvoice(invoiceData: Partial<SubcontractorInvoice>): Promise<SubcontractorInvoice> {
    return APIClient.post<SubcontractorInvoice>(this.invoicesEndpoint, invoiceData);
  }

  static async updateInvoice(invoiceId: string, updates: Partial<SubcontractorInvoice>): Promise<SubcontractorInvoice> {
    return APIClient.put<SubcontractorInvoice>(`${this.invoicesEndpoint}/${invoiceId}`, updates);
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

  static async updateSettings(settings: Partial<ConstructionSettings>): Promise<ConstructionSettings> {
    return APIClient.put<ConstructionSettings>(this.endpoint, settings);
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

  static async updateAlert(alertId: string, updates: Partial<ConstructionAlert>): Promise<ConstructionAlert> {
    return APIClient.put<ConstructionAlert>(`${this.endpoint}/${alertId}`, updates);
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<ConstructionAlert> {
    return APIClient.put<ConstructionAlert>(`${this.endpoint}/${alertId}/acknowledge`, { userId });
  }

  static async resolveAlert(alertId: string): Promise<ConstructionAlert> {
    return APIClient.put<ConstructionAlert>(`${this.endpoint}/${alertId}/resolve`, {});
  }
}
