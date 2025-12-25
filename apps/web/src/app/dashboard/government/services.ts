import { APIClient } from '@/lib/api-client';
import type {
  CivilServiceGrade,
  SecurityClearance,
  PensionScheme,
  GovernmentSettings,
  GovernmentAlert
} from './types';

export class CivilServiceGradeService {
  private static endpoint = '/industry-government/civil-service';

  static async getAllGrades(): Promise<CivilServiceGrade[]> {
    try {
      const response = await APIClient.get<{ grades?: CivilServiceGrade[] }>(this.endpoint);
      return response.grades || [];
    } catch {
            return [];
    }
  }

  static async createGrade(gradeData: Partial<CivilServiceGrade>): Promise<CivilServiceGrade> {
    const response = await APIClient.post<{ grade: CivilServiceGrade }>(this.endpoint, gradeData);
    return response.grade;
  }

  static async updateGrade(gradeId: string, updates: Partial<CivilServiceGrade>): Promise<CivilServiceGrade> {
    const response = await APIClient.put<{ grade: CivilServiceGrade }>(`${this.endpoint}/${gradeId}`, updates);
    return response.grade;
  }

  static async getGradeByEmployeeId(employeeId: string): Promise<CivilServiceGrade | null> {
    try {
      const response = await APIClient.get<{ grade?: CivilServiceGrade }>(`${this.endpoint}/employee/${employeeId}`);
      return response.grade || null;
    } catch {
            return null;
    }
  }
}

export class SecurityClearanceService {
  private static endpoint = '/industry-government/security-clearance';

  static async getAllClearances(): Promise<SecurityClearance[]> {
    try {
      const response = await APIClient.get<{ clearances?: SecurityClearance[] }>(this.endpoint);
      return response.clearances || [];
    } catch {
            return [];
    }
  }

  static async createClearance(clearanceData: Partial<SecurityClearance>): Promise<SecurityClearance> {
    const response = await APIClient.post<{ clearance: SecurityClearance }>(this.endpoint, clearanceData);
    return response.clearance;
  }

  static async updateClearance(clearanceId: string, updates: Partial<SecurityClearance>): Promise<SecurityClearance> {
    const response = await APIClient.put<{ clearance: SecurityClearance }>(`${this.endpoint}/${clearanceId}`, updates);
    return response.clearance;
  }

  static async getClearanceByEmployeeId(employeeId: string): Promise<SecurityClearance | null> {
    try {
      const response = await APIClient.get<{ clearance?: SecurityClearance }>(`${this.endpoint}/employee/${employeeId}`);
      return response.clearance || null;
    } catch {
            return null;
    }
  }

  static async getExpiringSoon(days: number = 90): Promise<SecurityClearance[]> {
    try {
      const response = await APIClient.get<{ clearances?: SecurityClearance[] }>(`${this.endpoint}/expiring`, { days });
      return response.clearances || [];
    } catch {
            return [];
    }
  }
}

export class PensionSchemeService {
  private static endpoint = '/industry-government/pension';

  static async getAllPensions(): Promise<PensionScheme[]> {
    try {
      const response = await APIClient.get<{ pensions?: PensionScheme[] }>(this.endpoint);
      return response.pensions || [];
    } catch {
            return [];
    }
  }

  static async createPension(pensionData: Partial<PensionScheme>): Promise<PensionScheme> {
    const response = await APIClient.post<{ pension: PensionScheme }>(this.endpoint, pensionData);
    return response.pension;
  }

  static async updatePension(pensionId: string, updates: Partial<PensionScheme>): Promise<PensionScheme> {
    const response = await APIClient.put<{ pension: PensionScheme }>(`${this.endpoint}/${pensionId}`, updates);
    return response.pension;
  }

  static async getPensionByEmployeeId(employeeId: string): Promise<PensionScheme | null> {
    try {
      const response = await APIClient.get<{ pension?: PensionScheme }>(`${this.endpoint}/employee/${employeeId}`);
      return response.pension || null;
    } catch {
            return null;
    }
  }

  static async getRetirementEligible(): Promise<PensionScheme[]> {
    try {
      const response = await APIClient.get<{ pensions?: PensionScheme[] }>(`${this.endpoint}/retirement-eligible`);
      return response.pensions || [];
    } catch {
            return [];
    }
  }
}

export class GovernmentSettingsService {
  private static endpoint = '/industry-government/settings';

  static async getSettings(): Promise<GovernmentSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: GovernmentSettings }>(this.endpoint);
      return response.settings || null;
    } catch {
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
      const response = await APIClient.get<{ alerts?: GovernmentAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch {
            return [];
    }
  }

  static async createAlert(alertData: Partial<GovernmentAlert>): Promise<GovernmentAlert> {
    const response = await APIClient.post<{ alert: GovernmentAlert }>(this.endpoint, alertData);
    return response.alert;
  }

  static async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<GovernmentAlert> {
    const response = await APIClient.post<{ alert: GovernmentAlert }>(`${this.endpoint}/${alertId}/acknowledge`, { acknowledgedBy });
    return response.alert;
  }
}
