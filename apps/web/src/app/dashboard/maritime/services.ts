import { APIClient } from '@/lib/api-client';
import { CrewMember, PortOperation, OffshoreCompliance, MaritimeSettings, MaritimeAlert } from './types';

export class VesselCrewingService {
  private static endpoint = '/industry-maritime/vessel-crewing';

  static async getAllCrew(): Promise<CrewMember[]> {
    try {
      const response = await APIClient.get<{ crew?: CrewMember[] }>(`${this.endpoint}/crew`);
      return response.crew || [];
    } catch (error) {
      console.error('Error fetching crew members:', error);
      return [];
    }
  }

  static async createCrew(crewData: Partial<CrewMember>): Promise<CrewMember> {
    const response = await APIClient.post<{ crew: CrewMember }>(`${this.endpoint}/crew`, crewData);
    return response.crew;
  }

  static async updateCrew(crewId: string, updates: Partial<CrewMember>): Promise<CrewMember> {
    const response = await APIClient.put<{ crew: CrewMember }>(`${this.endpoint}/crew/${crewId}`, updates);
    return response.crew;
  }
}

export class PortOperationsService {
  private static endpoint = '/industry-maritime/port-operations';

  static async getAllOperations(): Promise<PortOperation[]> {
    try {
      const response = await APIClient.get<{ operations?: PortOperation[] }>(this.endpoint);
      return response.operations || [];
    } catch (error) {
      console.error('Error fetching operations:', error);
      return [];
    }
  }

  static async createOperation(operationData: Partial<PortOperation>): Promise<PortOperation> {
    const response = await APIClient.post<{ operation: PortOperation }>(this.endpoint, operationData);
    return response.operation;
  }

  static async updateOperation(operationId: string, updates: Partial<PortOperation>): Promise<PortOperation> {
    const response = await APIClient.put<{ operation: PortOperation }>(`${this.endpoint}/${operationId}`, updates);
    return response.operation;
  }
}

export class OffshoreComplianceService {
  private static endpoint = '/industry-maritime/offshore-compliance';

  static async getAllCompliance(): Promise<OffshoreCompliance[]> {
    try {
      const response = await APIClient.get<{ compliance?: OffshoreCompliance[] }>(this.endpoint);
      return response.compliance || [];
    } catch (error) {
      console.error('Error fetching compliance:', error);
      return [];
    }
  }

  static async createCompliance(complianceData: Partial<OffshoreCompliance>): Promise<OffshoreCompliance> {
    const response = await APIClient.post<{ compliance: OffshoreCompliance }>(this.endpoint, complianceData);
    return response.compliance;
  }

  static async updateCompliance(complianceId: string, updates: Partial<OffshoreCompliance>): Promise<OffshoreCompliance> {
    const response = await APIClient.put<{ compliance: OffshoreCompliance }>(`${this.endpoint}/${complianceId}`, updates);
    return response.compliance;
  }
}

export class MaritimeSettingsService {
  private static endpoint = '/industry-maritime/settings';

  static async getSettings(): Promise<MaritimeSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: MaritimeSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  static async updateSettings(settings: Partial<MaritimeSettings>): Promise<MaritimeSettings> {
    const response = await APIClient.put<{ settings: MaritimeSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-maritime/alerts';

  static async getAllAlerts(): Promise<MaritimeAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: MaritimeAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  static async createAlert(alertData: Partial<MaritimeAlert>): Promise<MaritimeAlert> {
    const response = await APIClient.post<{ alert: MaritimeAlert }>(this.endpoint, alertData);
    return response.alert;
  }
}
