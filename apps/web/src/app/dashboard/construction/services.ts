/**
 * Construction & Real Estate Module - Service Layer
 * Handles all business logic for Project Management, Site Safety, Equipment Leasing, and Subcontractor Portal
 */

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

// Storage keys for localStorage
const STORAGE_KEYS = {
  PROJECTS: 'construction_projects',
  TASKS: 'construction_tasks',
  SAFETY_INSPECTIONS: 'construction_safety_inspections',
  SAFETY_INCIDENTS: 'construction_safety_incidents',
  SAFETY_TRAINING: 'construction_safety_training',
  PPE_TRACKING: 'construction_ppe_tracking',
  HAZARDS: 'construction_hazards',
  EQUIPMENT_LEASES: 'construction_equipment_leases',
  SUBCONTRACTORS: 'construction_subcontractors',
  BID_INVITATIONS: 'construction_bid_invitations',
  BIDS: 'construction_bids',
  CONTRACTS: 'construction_contracts',
  INVOICES: 'construction_invoices',
  SETTINGS: 'construction_settings',
  ALERTS: 'construction_alerts',
};

/**
 * Project Management Service
 * Manages construction projects, tasks, budgets, and timelines
 */
export class ProjectManagementService {
  // TODO: Replace localStorage with actual API calls

  static async getAllProjects(): Promise<ConstructionProject[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectById(projectId: string): Promise<ConstructionProject | null> {
    const projects = await this.getAllProjects();
    return projects.find(p => p.projectId === projectId) || null;
  }

  static async createProject(projectData: Partial<ConstructionProject>): Promise<ConstructionProject> {
    const projects = await this.getAllProjects();
    const newProject: ConstructionProject = {
      projectId: `proj-${Date.now()}`,
      projectName: projectData.projectName || '',
      projectNumber: projectData.projectNumber || `PRJ-${Date.now()}`,
      projectType: projectData.projectType || 'commercial',
      client: projectData.client || {} as any,
      location: projectData.location || {} as any,
      description: projectData.description || '',
      scope: projectData.scope || {} as any,
      timeline: projectData.timeline || {} as any,
      budget: projectData.budget || {} as any,
      team: projectData.team || {} as any,
      milestones: projectData.milestones || [],
      status: projectData.status || 'planning',
      permits: projectData.permits || [],
      risks: projectData.risks || [],
      documents: projectData.documents || [],
      photos: projectData.photos || [],
      createdAt: new Date().toISOString(),
      ...projectData,
    };
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return newProject;
  }

  static async updateProject(projectId: string, updates: Partial<ConstructionProject>): Promise<ConstructionProject> {
    const projects = await this.getAllProjects();
    const index = projects.findIndex(p => p.projectId === projectId);
    if (index === -1) throw new Error('Project not found');

    projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    const projects = await this.getAllProjects();
    const filtered = projects.filter(p => p.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    return true;
  }

  // Task Management
  static async getAllTasks(): Promise<ProjectTask[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(t => t.projectId === projectId);
  }

  static async getTaskById(taskId: string): Promise<ProjectTask | null> {
    const tasks = await this.getAllTasks();
    return tasks.find(t => t.taskId === taskId) || null;
  }

  static async createTask(taskData: Partial<ProjectTask>): Promise<ProjectTask> {
    const tasks = await this.getAllTasks();
    const newTask: ProjectTask = {
      taskId: `task-${Date.now()}`,
      projectId: taskData.projectId || '',
      taskName: taskData.taskName || '',
      description: taskData.description || '',
      assignedTo: taskData.assignedTo || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'not_started',
      startDate: taskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: taskData.actualHours || 0,
      dependencies: taskData.dependencies || [],
      subtasks: taskData.subtasks || [],
      progress: taskData.progress || 0,
      attachments: taskData.attachments || [],
      ...taskData,
    };
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return newTask;
  }

  static async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    const tasks = await this.getAllTasks();
    const index = tasks.findIndex(t => t.taskId === taskId);
    if (index === -1) throw new Error('Task not found');

    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return tasks[index];
  }

  static async deleteTask(taskId: string): Promise<boolean> {
    const tasks = await this.getAllTasks();
    const filtered = tasks.filter(t => t.taskId !== taskId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
    return true;
  }

  static async updateBudget(projectId: string, budgetUpdates: any): Promise<ConstructionProject> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updatedBudget = { ...project.budget, ...budgetUpdates };
    return this.updateProject(projectId, { budget: updatedBudget });
  }

  static async addChangeOrder(projectId: string, changeOrder: any): Promise<ConstructionProject> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    project.budget.changeOrders.push(changeOrder);
    return this.updateProject(projectId, { budget: project.budget });
  }

  static async updateMilestone(projectId: string, milestoneId: string, updates: any): Promise<ConstructionProject> {
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const milestoneIndex = project.milestones.findIndex(m => m.milestoneId === milestoneId);
    if (milestoneIndex !== -1) {
      project.milestones[milestoneIndex] = { ...project.milestones[milestoneIndex], ...updates };
      return this.updateProject(projectId, { milestones: project.milestones });
    }
    throw new Error('Milestone not found');
  }
}

/**
 * Site Safety Service
 * Manages safety inspections, incidents, training, and hazard identification
 */
export class SiteSafetyService {
  // TODO: Replace localStorage with actual API calls

  static async getAllInspections(): Promise<SafetyInspection[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_INSPECTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectInspections(projectId: string): Promise<SafetyInspection[]> {
    const inspections = await this.getAllInspections();
    return inspections.filter(i => i.projectId === projectId);
  }

  static async getInspectionById(inspectionId: string): Promise<SafetyInspection | null> {
    const inspections = await this.getAllInspections();
    return inspections.find(i => i.inspectionId === inspectionId) || null;
  }

  static async createInspection(inspectionData: Partial<SafetyInspection>): Promise<SafetyInspection> {
    const inspections = await this.getAllInspections();
    const newInspection: SafetyInspection = {
      inspectionId: `insp-${Date.now()}`,
      projectId: inspectionData.projectId || '',
      inspectionType: inspectionData.inspectionType || 'daily',
      inspectionDate: inspectionData.inspectionDate || new Date().toISOString().split('T')[0],
      inspector: inspectionData.inspector || {} as any,
      areas: inspectionData.areas || [],
      findings: inspectionData.findings || [],
      overallScore: inspectionData.overallScore || 100,
      status: inspectionData.status || 'scheduled',
      createdAt: new Date().toISOString(),
      ...inspectionData,
    };
    inspections.push(newInspection);
    localStorage.setItem(STORAGE_KEYS.SAFETY_INSPECTIONS, JSON.stringify(inspections));
    return newInspection;
  }

  static async updateInspection(inspectionId: string, updates: Partial<SafetyInspection>): Promise<SafetyInspection> {
    const inspections = await this.getAllInspections();
    const index = inspections.findIndex(i => i.inspectionId === inspectionId);
    if (index === -1) throw new Error('Inspection not found');

    inspections[index] = { ...inspections[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFETY_INSPECTIONS, JSON.stringify(inspections));
    return inspections[index];
  }

  static async deleteInspection(inspectionId: string): Promise<boolean> {
    const inspections = await this.getAllInspections();
    const filtered = inspections.filter(i => i.inspectionId !== inspectionId);
    localStorage.setItem(STORAGE_KEYS.SAFETY_INSPECTIONS, JSON.stringify(filtered));
    return true;
  }

  // Incident Management
  static async getAllIncidents(): Promise<SafetyIncident[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_INCIDENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectIncidents(projectId: string): Promise<SafetyIncident[]> {
    const incidents = await this.getAllIncidents();
    return incidents.filter(i => i.projectId === projectId);
  }

  static async getIncidentById(incidentId: string): Promise<SafetyIncident | null> {
    const incidents = await this.getAllIncidents();
    return incidents.find(i => i.incidentId === incidentId) || null;
  }

  static async createIncident(incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const incidents = await this.getAllIncidents();
    const newIncident: SafetyIncident = {
      incidentId: `inc-${Date.now()}`,
      projectId: incidentData.projectId || '',
      incidentType: incidentData.incidentType || 'near_miss',
      severity: incidentData.severity || 'minor',
      incidentDate: incidentData.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: incidentData.incidentTime || new Date().toTimeString().split(' ')[0],
      location: incidentData.location || '',
      description: incidentData.description || '',
      injured: incidentData.injured || [],
      witnesses: incidentData.witnesses || [],
      immediateAction: incidentData.immediateAction || '',
      investigation: incidentData.investigation || {} as any,
      correctiveActions: incidentData.correctiveActions || [],
      preventiveMeasures: incidentData.preventiveMeasures || [],
      reportedBy: incidentData.reportedBy || '',
      reportedDate: incidentData.reportedDate || new Date().toISOString().split('T')[0],
      status: incidentData.status || 'reported',
      regulatoryNotification: incidentData.regulatoryNotification || [],
      documents: incidentData.documents || [],
      photos: incidentData.photos || [],
      createdAt: new Date().toISOString(),
      ...incidentData,
    };
    incidents.push(newIncident);
    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify(incidents));
    return newIncident;
  }

  static async updateIncident(incidentId: string, updates: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const incidents = await this.getAllIncidents();
    const index = incidents.findIndex(i => i.incidentId === incidentId);
    if (index === -1) throw new Error('Incident not found');

    incidents[index] = { ...incidents[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify(incidents));
    return incidents[index];
  }

  static async deleteIncident(incidentId: string): Promise<boolean> {
    const incidents = await this.getAllIncidents();
    const filtered = incidents.filter(i => i.incidentId !== incidentId);
    localStorage.setItem(STORAGE_KEYS.SAFETY_INCIDENTS, JSON.stringify(filtered));
    return true;
  }

  // Safety Training
  static async getAllTrainings(): Promise<SafetyTraining[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_TRAINING);
    return data ? JSON.parse(data) : [];
  }

  static async getTrainingById(trainingId: string): Promise<SafetyTraining | null> {
    const trainings = await this.getAllTrainings();
    return trainings.find(t => t.trainingId === trainingId) || null;
  }

  static async createTraining(trainingData: Partial<SafetyTraining>): Promise<SafetyTraining> {
    const trainings = await this.getAllTrainings();
    const newTraining: SafetyTraining = {
      trainingId: `train-${Date.now()}`,
      trainingName: trainingData.trainingName || '',
      trainingType: trainingData.trainingType || 'orientation',
      description: trainingData.description || '',
      trainer: trainingData.trainer || '',
      trainingDate: trainingData.trainingDate || new Date().toISOString().split('T')[0],
      duration: trainingData.duration || 0,
      attendees: trainingData.attendees || [],
      topics: trainingData.topics || [],
      materials: trainingData.materials || [],
      certificateIssued: trainingData.certificateIssued || false,
      ...trainingData,
    };
    trainings.push(newTraining);
    localStorage.setItem(STORAGE_KEYS.SAFETY_TRAINING, JSON.stringify(trainings));
    return newTraining;
  }

  static async updateTraining(trainingId: string, updates: Partial<SafetyTraining>): Promise<SafetyTraining> {
    const trainings = await this.getAllTrainings();
    const index = trainings.findIndex(t => t.trainingId === trainingId);
    if (index === -1) throw new Error('Training not found');

    trainings[index] = { ...trainings[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFETY_TRAINING, JSON.stringify(trainings));
    return trainings[index];
  }

  // PPE Tracking
  static async getAllPPETracking(): Promise<PPETracking[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PPE_TRACKING);
    return data ? JSON.parse(data) : [];
  }

  static async getPPETrackingByEmployeeId(employeeId: string): Promise<PPETracking | null> {
    const ppeTracking = await this.getAllPPETracking();
    return ppeTracking.find(p => p.employeeId === employeeId) || null;
  }

  static async createPPETracking(ppeData: Partial<PPETracking>): Promise<PPETracking> {
    const ppeTracking = await this.getAllPPETracking();
    const newPPE: PPETracking = {
      ppeId: `ppe-${Date.now()}`,
      employeeId: ppeData.employeeId || '',
      employeeName: ppeData.employeeName || '',
      equipmentIssued: ppeData.equipmentIssued || [],
      complianceScore: ppeData.complianceScore || 100,
      lastInspectionDate: ppeData.lastInspectionDate || new Date().toISOString().split('T')[0],
      nextInspectionDue: ppeData.nextInspectionDue || '',
      ...ppeData,
    };
    ppeTracking.push(newPPE);
    localStorage.setItem(STORAGE_KEYS.PPE_TRACKING, JSON.stringify(ppeTracking));
    return newPPE;
  }

  static async updatePPETracking(ppeId: string, updates: Partial<PPETracking>): Promise<PPETracking> {
    const ppeTracking = await this.getAllPPETracking();
    const index = ppeTracking.findIndex(p => p.ppeId === ppeId);
    if (index === -1) throw new Error('PPE tracking not found');

    ppeTracking[index] = { ...ppeTracking[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PPE_TRACKING, JSON.stringify(ppeTracking));
    return ppeTracking[index];
  }

  // Hazard Identification
  static async getAllHazards(): Promise<HazardIdentification[]> {
    const data = localStorage.getItem(STORAGE_KEYS.HAZARDS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectHazards(projectId: string): Promise<HazardIdentification[]> {
    const hazards = await this.getAllHazards();
    return hazards.filter(h => h.projectId === projectId);
  }

  static async createHazard(hazardData: Partial<HazardIdentification>): Promise<HazardIdentification> {
    const hazards = await this.getAllHazards();
    const newHazard: HazardIdentification = {
      hazardId: `haz-${Date.now()}`,
      projectId: hazardData.projectId || '',
      hazardType: hazardData.hazardType || '',
      hazardLevel: hazardData.hazardLevel || 'medium',
      location: hazardData.location || '',
      description: hazardData.description || '',
      identifiedBy: hazardData.identifiedBy || '',
      identificationDate: hazardData.identificationDate || new Date().toISOString().split('T')[0],
      affectedPersonnel: hazardData.affectedPersonnel || 0,
      controls: hazardData.controls || [],
      status: hazardData.status || 'identified',
      reviewDate: hazardData.reviewDate || '',
      ...hazardData,
    };
    hazards.push(newHazard);
    localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(hazards));
    return newHazard;
  }

  static async updateHazard(hazardId: string, updates: Partial<HazardIdentification>): Promise<HazardIdentification> {
    const hazards = await this.getAllHazards();
    const index = hazards.findIndex(h => h.hazardId === hazardId);
    if (index === -1) throw new Error('Hazard not found');

    hazards[index] = { ...hazards[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(hazards));
    return hazards[index];
  }
}

/**
 * Equipment Leasing Service
 * Manages equipment leases, maintenance, and utilization
 */
export class EquipmentLeasingService {
  // TODO: Replace localStorage with actual API calls

  static async getAllLeases(): Promise<EquipmentLease[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_LEASES);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectLeases(projectId: string): Promise<EquipmentLease[]> {
    const leases = await this.getAllLeases();
    return leases.filter(l => l.projectId === projectId);
  }

  static async getLeaseById(leaseId: string): Promise<EquipmentLease | null> {
    const leases = await this.getAllLeases();
    return leases.find(l => l.leaseId === leaseId) || null;
  }

  static async createLease(leaseData: Partial<EquipmentLease>): Promise<EquipmentLease> {
    const leases = await this.getAllLeases();
    const newLease: EquipmentLease = {
      leaseId: `lease-${Date.now()}`,
      projectId: leaseData.projectId || '',
      equipment: leaseData.equipment || {} as any,
      lessor: leaseData.lessor || {} as any,
      leaseTerms: leaseData.leaseTerms || {} as any,
      delivery: leaseData.delivery || {} as any,
      maintenance: leaseData.maintenance || {} as any,
      insurance: leaseData.insurance || {} as any,
      costs: leaseData.costs || {} as any,
      utilization: leaseData.utilization || {
        totalHours: 0,
        hoursPerDay: {},
        utilizationRate: 0,
        idleTime: 0,
        productiveTime: 0
      },
      inspection: leaseData.inspection || [],
      status: leaseData.status || 'pending',
      documents: leaseData.documents || [],
      createdAt: new Date().toISOString(),
      ...leaseData,
    };
    leases.push(newLease);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_LEASES, JSON.stringify(leases));
    return newLease;
  }

  static async updateLease(leaseId: string, updates: Partial<EquipmentLease>): Promise<EquipmentLease> {
    const leases = await this.getAllLeases();
    const index = leases.findIndex(l => l.leaseId === leaseId);
    if (index === -1) throw new Error('Lease not found');

    leases[index] = { ...leases[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_LEASES, JSON.stringify(leases));
    return leases[index];
  }

  static async deleteLease(leaseId: string): Promise<boolean> {
    const leases = await this.getAllLeases();
    const filtered = leases.filter(l => l.leaseId !== leaseId);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_LEASES, JSON.stringify(filtered));
    return true;
  }

  static async recordUtilization(leaseId: string, utilizationData: any): Promise<EquipmentLease> {
    const lease = await this.getLeaseById(leaseId);
    if (!lease) throw new Error('Lease not found');

    const updatedUtilization = { ...lease.utilization, ...utilizationData };
    return this.updateLease(leaseId, { utilization: updatedUtilization });
  }

  static async addMaintenance Record(leaseId: string, maintenanceRecord: any): Promise<EquipmentLease> {
    const lease = await this.getLeaseById(leaseId);
    if (!lease) throw new Error('Lease not found');

    lease.maintenance.maintenanceRecords.push(maintenanceRecord);
    return this.updateLease(leaseId, { maintenance: lease.maintenance });
  }

  static async addInspection(leaseId: string, inspection: any): Promise<EquipmentLease> {
    const lease = await this.getLeaseById(leaseId);
    if (!lease) throw new Error('Lease not found');

    lease.inspection.push(inspection);
    return this.updateLease(leaseId, { inspection: lease.inspection });
  }
}

/**
 * Subcontractor Portal Service
 * Manages subcontractor profiles, bids, contracts, and invoices
 */
export class SubcontractorPortalService {
  // TODO: Replace localStorage with actual API calls

  static async getAllSubcontractors(): Promise<SubcontractorProfile[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SUBCONTRACTORS);
    return data ? JSON.parse(data) : [];
  }

  static async getSubcontractorById(subcontractorId: string): Promise<SubcontractorProfile | null> {
    const subcontractors = await this.getAllSubcontractors();
    return subcontractors.find(s => s.subcontractorId === subcontractorId) || null;
  }

  static async createSubcontractor(subcontractorData: Partial<SubcontractorProfile>): Promise<SubcontractorProfile> {
    const subcontractors = await this.getAllSubcontractors();
    const newSubcontractor: SubcontractorProfile = {
      subcontractorId: `sub-${Date.now()}`,
      companyName: subcontractorData.companyName || '',
      businessRegistration: subcontractorData.businessRegistration || '',
      taxId: subcontractorData.taxId || '',
      specialty: subcontractorData.specialty || [],
      contactInfo: subcontractorData.contactInfo || {} as any,
      address: subcontractorData.address || {} as any,
      qualifications: subcontractorData.qualifications || [],
      certifications: subcontractorData.certifications || [],
      insurance: subcontractorData.insurance || {} as any,
      licenses: subcontractorData.licenses || [],
      experience: subcontractorData.experience || [],
      references: subcontractorData.references || [],
      financialInfo: subcontractorData.financialInfo || {} as any,
      performanceRating: subcontractorData.performanceRating || {
        overallRating: 0,
        projectsCompleted: 0,
        onTimeCompletion: 0,
        budgetCompliance: 0,
        qualityRating: 0,
        safetyRating: 0,
        communicationRating: 0,
        reviews: [],
        lastReviewDate: ''
      },
      status: subcontractorData.status || 'pending',
      documents: subcontractorData.documents || [],
      createdAt: new Date().toISOString(),
      ...subcontractorData,
    };
    subcontractors.push(newSubcontractor);
    localStorage.setItem(STORAGE_KEYS.SUBCONTRACTORS, JSON.stringify(subcontractors));
    return newSubcontractor;
  }

  static async updateSubcontractor(subcontractorId: string, updates: Partial<SubcontractorProfile>): Promise<SubcontractorProfile> {
    const subcontractors = await this.getAllSubcontractors();
    const index = subcontractors.findIndex(s => s.subcontractorId === subcontractorId);
    if (index === -1) throw new Error('Subcontractor not found');

    subcontractors[index] = { ...subcontractors[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SUBCONTRACTORS, JSON.stringify(subcontractors));
    return subcontractors[index];
  }

  static async deleteSubcontractor(subcontractorId: string): Promise<boolean> {
    const subcontractors = await this.getAllSubcontractors();
    const filtered = subcontractors.filter(s => s.subcontractorId !== subcontractorId);
    localStorage.setItem(STORAGE_KEYS.SUBCONTRACTORS, JSON.stringify(filtered));
    return true;
  }

  // Bid Management
  static async getAllBidInvitations(): Promise<BidInvitation[]> {
    const data = localStorage.getItem(STORAGE_KEYS.BID_INVITATIONS);
    return data ? JSON.parse(data) : [];
  }

  static async createBidInvitation(invitationData: Partial<BidInvitation>): Promise<BidInvitation> {
    const invitations = await this.getAllBidInvitations();
    const newInvitation: BidInvitation = {
      invitationId: `inv-${Date.now()}`,
      projectId: invitationData.projectId || '',
      projectName: invitationData.projectName || '',
      scope: invitationData.scope || '',
      invitedSubcontractors: invitationData.invitedSubcontractors || [],
      bidDeadline: invitationData.bidDeadline || '',
      specifications: invitationData.specifications || [],
      drawings: invitationData.drawings || [],
      terms: invitationData.terms || [],
      evaluationCriteria: invitationData.evaluationCriteria || {} as any,
      status: invitationData.status || 'open',
      createdAt: new Date().toISOString(),
      ...invitationData,
    };
    invitations.push(newInvitation);
    localStorage.setItem(STORAGE_KEYS.BID_INVITATIONS, JSON.stringify(invitations));
    return newInvitation;
  }

  static async getAllBids(): Promise<Bid[]> {
    const data = localStorage.getItem(STORAGE_KEYS.BIDS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectBids(projectId: string): Promise<Bid[]> {
    const bids = await this.getAllBids();
    return bids.filter(b => b.projectId === projectId);
  }

  static async createBid(bidData: Partial<Bid>): Promise<Bid> {
    const bids = await this.getAllBids();
    const newBid: Bid = {
      bidId: `bid-${Date.now()}`,
      invitationId: bidData.invitationId || '',
      subcontractorId: bidData.subcontractorId || '',
      projectId: bidData.projectId || '',
      submissionDate: bidData.submissionDate || new Date().toISOString().split('T')[0],
      pricing: bidData.pricing || {} as any,
      schedule: bidData.schedule || {} as any,
      scope: bidData.scope || '',
      exclusions: bidData.exclusions || [],
      assumptions: bidData.assumptions || [],
      alternates: bidData.alternates || [],
      qualifications: bidData.qualifications || [],
      references: bidData.references || [],
      validity: bidData.validity || 30,
      status: bidData.status || 'submitted',
      documents: bidData.documents || [],
      createdAt: new Date().toISOString(),
      ...bidData,
    };
    bids.push(newBid);
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(bids));
    return newBid;
  }

  static async updateBid(bidId: string, updates: Partial<Bid>): Promise<Bid> {
    const bids = await this.getAllBids();
    const index = bids.findIndex(b => b.bidId === bidId);
    if (index === -1) throw new Error('Bid not found');

    bids[index] = { ...bids[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(bids));
    return bids[index];
  }

  // Contract Management
  static async getAllContracts(): Promise<SubcontractorContract[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return data ? JSON.parse(data) : [];
  }

  static async getProjectContracts(projectId: string): Promise<SubcontractorContract[]> {
    const contracts = await this.getAllContracts();
    return contracts.filter(c => c.projectId === projectId);
  }

  static async createContract(contractData: Partial<SubcontractorContract>): Promise<SubcontractorContract> {
    const contracts = await this.getAllContracts();
    const newContract: SubcontractorContract = {
      contractId: `cont-${Date.now()}`,
      contractNumber: contractData.contractNumber || `CONT-${Date.now()}`,
      projectId: contractData.projectId || '',
      subcontractorId: contractData.subcontractorId || '',
      scope: contractData.scope || '',
      terms: contractData.terms || {} as any,
      pricing: contractData.pricing || {} as any,
      schedule: contractData.schedule || {} as any,
      insurance: contractData.insurance || {} as any,
      compliance: contractData.compliance || {} as any,
      changeOrders: contractData.changeOrders || [],
      status: contractData.status || 'draft',
      documents: contractData.documents || [],
      signatures: contractData.signatures || [],
      createdAt: new Date().toISOString(),
      ...contractData,
    };
    contracts.push(newContract);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return newContract;
  }

  static async updateContract(contractId: string, updates: Partial<SubcontractorContract>): Promise<SubcontractorContract> {
    const contracts = await this.getAllContracts();
    const index = contracts.findIndex(c => c.contractId === contractId);
    if (index === -1) throw new Error('Contract not found');

    contracts[index] = { ...contracts[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return contracts[index];
  }

  // Invoice Management
  static async getAllInvoices(): Promise<SubcontractorInvoice[]> {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  }

  static async getContractInvoices(contractId: string): Promise<SubcontractorInvoice[]> {
    const invoices = await this.getAllInvoices();
    return invoices.filter(i => i.contractId === contractId);
  }

  static async createInvoice(invoiceData: Partial<SubcontractorInvoice>): Promise<SubcontractorInvoice> {
    const invoices = await this.getAllInvoices();
    const newInvoice: SubcontractorInvoice = {
      invoiceId: `inv-${Date.now()}`,
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      contractId: invoiceData.contractId || '',
      subcontractorId: invoiceData.subcontractorId || '',
      projectId: invoiceData.projectId || '',
      billingPeriod: invoiceData.billingPeriod || {} as any,
      lineItems: invoiceData.lineItems || [],
      subtotal: invoiceData.subtotal || 0,
      retainage: invoiceData.retainage || 0,
      previousPayments: invoiceData.previousPayments || 0,
      currentDue: invoiceData.currentDue || 0,
      totalDue: invoiceData.totalDue || 0,
      dueDate: invoiceData.dueDate || '',
      status: invoiceData.status || 'draft',
      submittedDate: invoiceData.submittedDate || new Date().toISOString().split('T')[0],
      documents: invoiceData.documents || [],
      createdAt: new Date().toISOString(),
      ...invoiceData,
    };
    invoices.push(newInvoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return newInvoice;
  }

  static async updateInvoice(invoiceId: string, updates: Partial<SubcontractorInvoice>): Promise<SubcontractorInvoice> {
    const invoices = await this.getAllInvoices();
    const index = invoices.findIndex(i => i.invoiceId === invoiceId);
    if (index === -1) throw new Error('Invoice not found');

    invoices[index] = { ...invoices[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoices[index];
  }
}

/**
 * Construction Settings Service
 * Manages module settings and configurations
 */
export class ConstructionSettingsService {
  // TODO: Replace localStorage with actual API calls

  static async getSettings(): Promise<ConstructionSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  static async updateSettings(settings: Partial<ConstructionSettings>): Promise<ConstructionSettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings: ConstructionSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    } as ConstructionSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  }
}

/**
 * Alerts Service
 * Manages alerts and notifications
 */
export class AlertsService {
  // TODO: Replace localStorage with actual API calls

  static async getAllAlerts(): Promise<ConstructionAlert[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAlert(alertData: Partial<ConstructionAlert>): Promise<ConstructionAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: ConstructionAlert = {
      alertId: `alert-${Date.now()}`,
      alertType: alertData.alertType || 'budget',
      severity: alertData.severity || 'medium',
      title: alertData.title || '',
      message: alertData.message || '',
      affectedEntity: alertData.affectedEntity || {} as any,
      status: alertData.status || 'active',
      createdAt: new Date().toISOString(),
      ...alertData,
    };
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return newAlert;
  }

  static async updateAlert(alertId: string, updates: Partial<ConstructionAlert>): Promise<ConstructionAlert> {
    const alerts = await this.getAllAlerts();
    const index = alerts.findIndex(a => a.alertId === alertId);
    if (index === -1) throw new Error('Alert not found');

    alerts[index] = { ...alerts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return alerts[index];
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<ConstructionAlert> {
    return this.updateAlert(alertId, {
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userId,
    });
  }

  static async resolveAlert(alertId: string): Promise<ConstructionAlert> {
    return this.updateAlert(alertId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });
  }
}
