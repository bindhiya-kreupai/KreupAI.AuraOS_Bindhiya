import { APIClient } from '@/lib/api-client';
import type {
  CivilServiceGrade,
  SecurityClearance,
  PensionScheme,
  GovernmentSettings,
  GovernmentAlert,
} from './types';

export class CivilServiceGradeService {
  private static endpoint = '/industry-government/civil-service';

  static async getAllGrades(): Promise<CivilServiceGrade[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<CivilServiceGrade>(response, 'grades');
    } catch (error: any) {
      return [];
    }
  }

  static async createGrade(gradeData: Partial<CivilServiceGrade>): Promise<CivilServiceGrade> {
    const response = await APIClient.post<{ grade: CivilServiceGrade }>(this.endpoint, gradeData);
    return response.grade;
  }

  static async updateGrade(
    gradeId: string,
    updates: Partial<CivilServiceGrade>
  ): Promise<CivilServiceGrade> {
    const response = await APIClient.put<{ grade: CivilServiceGrade }>(
      `${this.endpoint}/${gradeId}`,
      updates
    );
    return response.grade;
  }

  static async getGradeByEmployeeId(employeeId: string): Promise<CivilServiceGrade | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/employee/${employeeId}`);
      return APIClient.unwrapItem<CivilServiceGrade>(response, 'grade');
    } catch (error: any) {
      return null;
    }
  }
}

export class SecurityClearanceService {
  private static endpoint = '/industry-government/security-clearance';

  static async getAllClearances(): Promise<SecurityClearance[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<SecurityClearance>(response, 'clearances');
    } catch (error: any) {
      return [];
    }
  }

  static async createClearance(
    clearanceData: Partial<SecurityClearance>
  ): Promise<SecurityClearance> {
    const response = await APIClient.post<{ clearance: SecurityClearance }>(
      this.endpoint,
      clearanceData
    );
    return response.clearance;
  }

  static async updateClearance(
    clearanceId: string,
    updates: Partial<SecurityClearance>
  ): Promise<SecurityClearance> {
    const response = await APIClient.put<{ clearance: SecurityClearance }>(
      `${this.endpoint}/${clearanceId}`,
      updates
    );
    return response.clearance;
  }

  static async getClearanceByEmployeeId(employeeId: string): Promise<SecurityClearance | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/employee/${employeeId}`);
      return APIClient.unwrapItem<SecurityClearance>(response, 'clearance');
    } catch (error: any) {
      return null;
    }
  }

  static async getExpiringSoon(days: number = 90): Promise<SecurityClearance[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/expiring`, { days });
      return APIClient.unwrapList<SecurityClearance>(response, 'clearances');
    } catch (error: any) {
      return [];
    }
  }
}

export class PensionSchemeService {
  private static endpoint = '/industry-government/pension';

  static async getAllPensions(): Promise<PensionScheme[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<PensionScheme>(response, 'pensions');
    } catch (error: any) {
      return [];
    }
  }

  static async createPension(pensionData: Partial<PensionScheme>): Promise<PensionScheme> {
    const response = await APIClient.post<{ pension: PensionScheme }>(this.endpoint, pensionData);
    return response.pension;
  }

  static async updatePension(
    pensionId: string,
    updates: Partial<PensionScheme>
  ): Promise<PensionScheme> {
    const response = await APIClient.put<{ pension: PensionScheme }>(
      `${this.endpoint}/${pensionId}`,
      updates
    );
    return response.pension;
  }

  static async getPensionByEmployeeId(employeeId: string): Promise<PensionScheme | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/employee/${employeeId}`);
      return APIClient.unwrapItem<PensionScheme>(response, 'pension');
    } catch (error: any) {
      return null;
    }
  }

  static async getRetirementEligible(): Promise<PensionScheme[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/retirement-eligible`);
      return APIClient.unwrapList<PensionScheme>(response, 'pensions');
    } catch (error: any) {
      return [];
    }
  }
}

export class GovernmentSettingsService {
  private static endpoint = '/industry-government/settings';

  static async getSettings(): Promise<GovernmentSettings | null> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapItem<GovernmentSettings>(response, 'settings');
    } catch (error: any) {
      return null;
    }
  }

  static async updateSettings(settings: Partial<GovernmentSettings>): Promise<GovernmentSettings> {
    const response = await APIClient.put<{ settings: GovernmentSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-government/alerts';

  static async getAllAlerts(): Promise<GovernmentAlert[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<GovernmentAlert>(response, 'alerts');
    } catch (error: any) {
      return [];
    }
  }

  static async createAlert(alertData: Partial<GovernmentAlert>): Promise<GovernmentAlert> {
    const response = await APIClient.post<{ alert: GovernmentAlert }>(this.endpoint, alertData);
    return response.alert;
  }

  static async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<GovernmentAlert> {
    const response = await APIClient.post<{ alert: GovernmentAlert }>(
      `${this.endpoint}/${alertId}/acknowledge`,
      { acknowledgedBy }
    );
    return response.alert;
  }
}
