// Grievance Management Services
import type { Grievance, GrievanceUpdate, Investigation, Resolution, GrievancePolicy, GrievanceMetrics, GrievanceSettings } from './types';

const STORAGE_KEYS = {
  GRIEVANCES: 'grievances',
  INVESTIGATIONS: 'grievance_investigations',
  RESOLUTIONS: 'grievance_resolutions',
  POLICIES: 'grievance_policies',
  METRICS: 'grievance_metrics',
  SETTINGS: 'grievance_settings',
};

export class GrievanceService {
  static async getGrievances(filters?: { employeeId?: string; status?: string; departmentId?: string }): Promise<Grievance[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GRIEVANCES);
    let grievances: Grievance[] = data ? JSON.parse(data) : [];
    if (filters) {
      if (filters.employeeId) grievances = grievances.filter(g => g.employeeId === filters.employeeId);
      if (filters.status) grievances = grievances.filter(g => g.status === filters.status);
      if (filters.departmentId) grievances = grievances.filter(g => g.departmentId === filters.departmentId);
    }
    return grievances;
  }

  static async submitGrievance(grievance: Grievance): Promise<Grievance> {
    const grievances = await this.getGrievances();
    grievances.push(grievance);
    localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(grievances));
    return grievance;
  }

  static async updateGrievance(id: string, updates: Partial<Grievance>): Promise<Grievance> {
    const grievances = await this.getGrievances();
    const index = grievances.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Grievance not found');
    grievances[index] = { ...grievances[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(grievances));
    return grievances[index];
  }

  static async addUpdate(id: string, update: GrievanceUpdate): Promise<Grievance> {
    const grievance = (await this.getGrievances()).find(g => g.id === id);
    if (!grievance) throw new Error('Grievance not found');
    grievance.updates.push(update);
    return this.updateGrievance(id, { updates: grievance.updates });
  }

  static async acknowledgeGrievance(id: string, acknowledgedBy: string): Promise<Grievance> {
    return this.updateGrievance(id, { status: 'acknowledged', assignedTo: acknowledgedBy, assignedToName: acknowledgedBy });
  }

  static async escalateGrievance(id: string, newLevel: string, reason: string): Promise<Grievance> {
    return this.updateGrievance(id, { status: 'escalated', currentEscalationLevel: newLevel as any });
  }

  static async resolveGrievance(id: string): Promise<Grievance> {
    return this.updateGrievance(id, { status: 'resolved', actualResolutionDate: new Date().toISOString() });
  }

  static async closeGrievance(id: string): Promise<Grievance> {
    return this.updateGrievance(id, { status: 'closed' });
  }
}

export class InvestigationService {
  static async createInvestigation(investigation: Investigation): Promise<Investigation> {
    const data = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
    const investigations: Investigation[] = data ? JSON.parse(data) : [];
    investigations.push(investigation);
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
    return investigation;
  }

  static async updateInvestigation(id: string, updates: Partial<Investigation>): Promise<Investigation> {
    const data = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
    const investigations: Investigation[] = data ? JSON.parse(data) : [];
    const index = investigations.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Investigation not found');
    investigations[index] = { ...investigations[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
    return investigations[index];
  }

  static async completeInvestigation(id: string, findings: string, recommendations: string[]): Promise<Investigation> {
    return this.updateInvestigation(id, { status: 'completed', endDate: new Date().toISOString(), findings, recommendations });
  }
}

export class ResolutionService {
  static async createResolution(resolution: Resolution): Promise<Resolution> {
    const data = localStorage.getItem(STORAGE_KEYS.RESOLUTIONS);
    const resolutions: Resolution[] = data ? JSON.parse(data) : [];
    resolutions.push(resolution);
    localStorage.setItem(STORAGE_KEYS.RESOLUTIONS, JSON.stringify(resolutions));
    return resolution;
  }
}

export class GrievanceAnalyticsService {
  static async getMetrics(): Promise<GrievanceMetrics> {
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalGrievances: 0, openGrievances: 0, resolvedGrievances: 0, averageResolutionDays: 0,
      grievancesByType: [], grievancesBySeverity: [], grievancesByDepartment: [],
      resolutionRate: 0, satisfactionScore: 0, escalationRate: 0, repeatGrievances: 0
    };
  }
}

export class GrievanceSettingsService {
  static async getSettings(): Promise<GrievanceSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      allowAnonymousGrievances: true, requireManagerNotification: true, autoEscalationEnabled: true,
      escalationThresholdDays: 7, slaTracking: true, satisfactionSurveyEnabled: true,
      confidentialityByDefault: false, notificationEmail: 'hr@company.com', hrEmail: 'hr@company.com'
    };
  }

  static async updateSettings(updates: Partial<GrievanceSettings>): Promise<GrievanceSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
