import { CrewMember, PortOperation, OffshoreCompliance, MaritimeSettings, MaritimeAlert } from './types';

const STORAGE_KEYS = { CREW_MEMBERS: 'maritime_crew_members', PORT_OPERATIONS: 'maritime_port_operations', OFFSHORE_COMPLIANCE: 'maritime_offshore_compliance', SETTINGS: 'maritime_settings', ALERTS: 'maritime_alerts' };

export class VesselCrewingService {
  static async getAllCrew(): Promise<CrewMember[]> { const data = localStorage.getItem(STORAGE_KEYS.CREW_MEMBERS); return data ? JSON.parse(data) : []; }
  static async createCrew(crewData: Partial<CrewMember>): Promise<CrewMember> { const crew = await this.getAllCrew(); const newCrew: CrewMember = { crewId: 'crew-' + Date.now(), employeeId: crewData.employeeId || '', employeeName: crewData.employeeName || '', nationality: crewData.nationality || '', rank: crewData.rank || 'ordinary_seaman', certificates: crewData.certificates || [], seamanBook: crewData.seamanBook || {} as any, medicalCertificate: crewData.medicalCertificate || {} as any, contracts: crewData.contracts || [], seaService: crewData.seaService || {} as any, status: crewData.status || 'active', createdAt: new Date().toISOString(), ...crewData }; crew.push(newCrew); localStorage.setItem(STORAGE_KEYS.CREW_MEMBERS, JSON.stringify(crew)); return newCrew; }
  static async updateCrew(crewId: string, updates: Partial<CrewMember>): Promise<CrewMember> { const crew = await this.getAllCrew(); const index = crew.findIndex(c => c.crewId === crewId); if (index === -1) throw new Error('Crew member not found'); crew[index] = { ...crew[index], ...updates }; localStorage.setItem(STORAGE_KEYS.CREW_MEMBERS, JSON.stringify(crew)); return crew[index]; }
}

export class PortOperationsService {
  static async getAllOperations(): Promise<PortOperation[]> { const data = localStorage.getItem(STORAGE_KEYS.PORT_OPERATIONS); return data ? JSON.parse(data) : []; }
  static async createOperation(operationData: Partial<PortOperation>): Promise<PortOperation> { const operations = await this.getAllOperations(); const newOperation: PortOperation = { operationId: 'op-' + Date.now(), operationType: operationData.operationType || 'loading', vesselId: operationData.vesselId || '', vesselName: operationData.vesselName || '', portName: operationData.portName || '', portCode: operationData.portCode || '', country: operationData.country || '', eta: operationData.eta || '', etd: operationData.etd || '', services: operationData.services || [], costs: operationData.costs || [], status: operationData.status || 'scheduled', createdAt: new Date().toISOString(), ...operationData }; operations.push(newOperation); localStorage.setItem(STORAGE_KEYS.PORT_OPERATIONS, JSON.stringify(operations)); return newOperation; }
  static async updateOperation(operationId: string, updates: Partial<PortOperation>): Promise<PortOperation> { const operations = await this.getAllOperations(); const index = operations.findIndex(o => o.operationId === operationId); if (index === -1) throw new Error('Operation not found'); operations[index] = { ...operations[index], ...updates }; localStorage.setItem(STORAGE_KEYS.PORT_OPERATIONS, JSON.stringify(operations)); return operations[index]; }
}

export class OffshoreComplianceService {
  static async getAllCompliance(): Promise<OffshoreCompliance[]> { const data = localStorage.getItem(STORAGE_KEYS.OFFSHORE_COMPLIANCE); return data ? JSON.parse(data) : []; }
  static async createCompliance(complianceData: Partial<OffshoreCompliance>): Promise<OffshoreCompliance> { const compliance = await this.getAllCompliance(); const newCompliance: OffshoreCompliance = { complianceId: 'comp-' + Date.now(), vesselId: complianceData.vesselId || '', vesselName: complianceData.vesselName || '', complianceType: complianceData.complianceType || 'safety', regulation: complianceData.regulation || '', inspectionDate: complianceData.inspectionDate || new Date().toISOString().split('T')[0], inspector: complianceData.inspector || '', findings: complianceData.findings || [], correctiveActions: complianceData.correctiveActions || [], status: complianceData.status || 'compliant', certificateIssued: complianceData.certificateIssued || false, createdAt: new Date().toISOString(), ...complianceData }; compliance.push(newCompliance); localStorage.setItem(STORAGE_KEYS.OFFSHORE_COMPLIANCE, JSON.stringify(compliance)); return newCompliance; }
  static async updateCompliance(complianceId: string, updates: Partial<OffshoreCompliance>): Promise<OffshoreCompliance> { const compliance = await this.getAllCompliance(); const index = compliance.findIndex(c => c.complianceId === complianceId); if (index === -1) throw new Error('Compliance record not found'); compliance[index] = { ...compliance[index], ...updates }; localStorage.setItem(STORAGE_KEYS.OFFSHORE_COMPLIANCE, JSON.stringify(compliance)); return compliance[index]; }
}

export class MaritimeSettingsService {
  static async getSettings(): Promise<MaritimeSettings | null> { const data = localStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : null; }
  static async updateSettings(settings: Partial<MaritimeSettings>): Promise<MaritimeSettings> { const current = await this.getSettings(); const updated: MaritimeSettings = { ...current, ...settings, updatedAt: new Date().toISOString() } as MaritimeSettings; localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)); return updated; }
}

export class AlertsService {
  static async getAllAlerts(): Promise<MaritimeAlert[]> { const data = localStorage.getItem(STORAGE_KEYS.ALERTS); return data ? JSON.parse(data) : []; }
  static async createAlert(alertData: Partial<MaritimeAlert>): Promise<MaritimeAlert> { const alerts = await this.getAllAlerts(); const newAlert: MaritimeAlert = { alertId: 'alert-' + Date.now(), alertType: alertData.alertType || 'crew', severity: alertData.severity || 'low', title: alertData.title || '', message: alertData.message || '', relatedEntity: alertData.relatedEntity || {} as any, status: alertData.status || 'active', createdAt: new Date().toISOString(), ...alertData }; alerts.push(newAlert); localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)); return newAlert; }
}
