import { HealthcareProvider, NurseSchedule, LocumProvider, LocumAssignment, HealthcareSettings, HealthcareAlert } from './types';
const STORAGE_KEYS = { PROVIDERS: 'healthcare_providers', SCHEDULES: 'healthcare_schedules', LOCUM_PROVIDERS: 'healthcare_locum_providers', LOCUM_ASSIGNMENTS: 'healthcare_locum_assignments', SETTINGS: 'healthcare_settings', ALERTS: 'healthcare_alerts' };
export class CredentialingService {
  static async getAllProviders(): Promise<HealthcareProvider[]> { const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS); return data ? JSON.parse(data) : []; }
  static async getProviderById(id: string): Promise<HealthcareProvider | null> { const providers = await this.getAllProviders(); return providers.find(p => p.providerId === id) || null; }
  static async createProvider(data: Partial<HealthcareProvider>): Promise<HealthcareProvider> {
    const providers = await this.getAllProviders();
    const newProvider: HealthcareProvider = { providerId: 'prov-' + Date.now(), providerNumber: data.providerNumber || 'PRV-' + Date.now(), personalInfo: data.personalInfo || {} as any, specialty: data.specialty || '', credentials: data.credentials || [], licenses: data.licenses || [], certifications: data.certifications || [], education: data.education || [], workHistory: data.workHistory || [], references: data.references || [], status: data.status || 'pending', nextReviewDate: data.nextReviewDate || '', createdAt: new Date().toISOString(), ...data };
    providers.push(newProvider); localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers)); return newProvider;
  }
  static async updateProvider(id: string, updates: Partial<HealthcareProvider>): Promise<HealthcareProvider> {
    const providers = await this.getAllProviders(); const index = providers.findIndex(p => p.providerId === id);
    if (index === -1) throw new Error('Provider not found');
    providers[index] = { ...providers[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers)); return providers[index];
  }
}
export class NurseRosteringService {
  static async getAllSchedules(): Promise<NurseSchedule[]> { const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES); return data ? JSON.parse(data) : []; }
  static async getScheduleById(id: string): Promise<NurseSchedule | null> { const schedules = await this.getAllSchedules(); return schedules.find(s => s.scheduleId === id) || null; }
  static async createSchedule(data: Partial<NurseSchedule>): Promise<NurseSchedule> {
    const schedules = await this.getAllSchedules();
    const newSchedule: NurseSchedule = { scheduleId: 'sched-' + Date.now(), scheduleName: data.scheduleName || '', startDate: data.startDate || new Date().toISOString().split('T')[0], endDate: data.endDate || '', shifts: data.shifts || [], staffingRequirements: data.staffingRequirements || [], status: data.status || 'draft', createdBy: data.createdBy || '', createdAt: new Date().toISOString(), ...data };
    schedules.push(newSchedule); localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules)); return newSchedule;
  }
  static async updateSchedule(id: string, updates: Partial<NurseSchedule>): Promise<NurseSchedule> {
    const schedules = await this.getAllSchedules(); const index = schedules.findIndex(s => s.scheduleId === id);
    if (index === -1) throw new Error('Schedule not found');
    schedules[index] = { ...schedules[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules)); return schedules[index];
  }
}
export class LocumManagementService {
  static async getAllLocumProviders(): Promise<LocumProvider[]> { const data = localStorage.getItem(STORAGE_KEYS.LOCUM_PROVIDERS); return data ? JSON.parse(data) : []; }
  static async getLocumProviderById(id: string): Promise<LocumProvider | null> { const providers = await this.getAllLocumProviders(); return providers.find(p => p.locumId === id) || null; }
  static async createLocumProvider(data: Partial<LocumProvider>): Promise<LocumProvider> {
    const providers = await this.getAllLocumProviders();
    const newProvider: LocumProvider = { locumId: 'locum-' + Date.now(), providerId: data.providerId || '', providerName: data.providerName || '', specialty: data.specialty || '', licenses: data.licenses || [], availability: data.availability || {} as any, rates: data.rates || {} as any, assignments: data.assignments || [], performanceRating: data.performanceRating || 0, completedAssignments: data.completedAssignments || 0, status: data.status || 'available', createdAt: new Date().toISOString(), ...data };
    providers.push(newProvider); localStorage.setItem(STORAGE_KEYS.LOCUM_PROVIDERS, JSON.stringify(providers)); return newProvider;
  }
  static async updateLocumProvider(id: string, updates: Partial<LocumProvider>): Promise<LocumProvider> {
    const providers = await this.getAllLocumProviders(); const index = providers.findIndex(p => p.locumId === id);
    if (index === -1) throw new Error('Locum provider not found');
    providers[index] = { ...providers[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.LOCUM_PROVIDERS, JSON.stringify(providers)); return providers[index];
  }
  static async getAllAssignments(): Promise<LocumAssignment[]> { const data = localStorage.getItem(STORAGE_KEYS.LOCUM_ASSIGNMENTS); return data ? JSON.parse(data) : []; }
  static async createAssignment(data: Partial<LocumAssignment>): Promise<LocumAssignment> {
    const assignments = await this.getAllAssignments();
    const newAssignment: LocumAssignment = { assignmentId: 'assign-' + Date.now(), locumId: data.locumId || '', facility: data.facility || '', unit: data.unit || '', specialty: data.specialty || '', startDate: data.startDate || '', endDate: data.endDate || '', duration: data.duration || 0, shiftSchedule: data.shiftSchedule || [], rate: data.rate || 0, totalCompensation: data.totalCompensation || 0, status: data.status || 'pending', contract: data.contract || {} as any, timesheet: data.timesheet || [], createdAt: new Date().toISOString(), ...data };
    assignments.push(newAssignment); localStorage.setItem(STORAGE_KEYS.LOCUM_ASSIGNMENTS, JSON.stringify(assignments)); return newAssignment;
  }
  static async updateAssignment(id: string, updates: Partial<LocumAssignment>): Promise<LocumAssignment> {
    const assignments = await this.getAllAssignments(); const index = assignments.findIndex(a => a.assignmentId === id);
    if (index === -1) throw new Error('Assignment not found');
    assignments[index] = { ...assignments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.LOCUM_ASSIGNMENTS, JSON.stringify(assignments)); return assignments[index];
  }
}
export class HealthcareSettingsService {
  static async getSettings(): Promise<HealthcareSettings | null> { const data = localStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : null; }
  static async updateSettings(settings: Partial<HealthcareSettings>): Promise<HealthcareSettings> {
    const current = await this.getSettings();
    const updated: HealthcareSettings = { ...current, ...settings, updatedAt: new Date().toISOString() } as HealthcareSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)); return updated;
  }
}
export class AlertsService {
  static async getAllAlerts(): Promise<HealthcareAlert[]> { const data = localStorage.getItem(STORAGE_KEYS.ALERTS); return data ? JSON.parse(data) : []; }
  static async createAlert(data: Partial<HealthcareAlert>): Promise<HealthcareAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: HealthcareAlert = { alertId: 'alert-' + Date.now(), alertType: data.alertType || 'credential_expiry', severity: data.severity || 'medium', title: data.title || '', message: data.message || '', affectedEntity: data.affectedEntity || {} as any, status: data.status || 'active', createdAt: new Date().toISOString(), ...data };
    alerts.push(newAlert); localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)); return newAlert;
  }
}
