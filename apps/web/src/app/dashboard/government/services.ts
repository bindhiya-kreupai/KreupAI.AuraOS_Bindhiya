import {
  CivilServiceGrade,
  SecurityClearance,
  PensionScheme,
  GovernmentSettings,
  GovernmentAlert
} from './types';

const STORAGE_KEYS = {
  CIVIL_SERVICE_GRADES: 'government_civil_service_grades',
  SECURITY_CLEARANCES: 'government_security_clearances',
  PENSION_SCHEMES: 'government_pension_schemes',
  SETTINGS: 'government_settings',
  ALERTS: 'government_alerts'
};

export class CivilServiceGradeService {
  static async getAllGrades(): Promise<CivilServiceGrade[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CIVIL_SERVICE_GRADES);
    return data ? JSON.parse(data) : [];
  }

  static async createGrade(gradeData: Partial<CivilServiceGrade>): Promise<CivilServiceGrade> {
    const grades = await this.getAllGrades();
    const newGrade: CivilServiceGrade = {
      gradeId: 'grade-' + Date.now(),
      employeeId: gradeData.employeeId || '',
      employeeName: gradeData.employeeName || '',
      department: gradeData.department || '',
      position: gradeData.position || '',
      gradeLevel: gradeData.gradeLevel || 'GS-1',
      step: gradeData.step || 1,
      series: gradeData.series || '',
      effectiveDate: gradeData.effectiveDate || new Date().toISOString().split('T')[0],
      salaryInformation: gradeData.salaryInformation || {} as any,
      promotionEligibility: gradeData.promotionEligibility || {} as any,
      performanceHistory: gradeData.performanceHistory || [],
      qualifications: gradeData.qualifications || [],
      status: gradeData.status || 'active',
      createdAt: new Date().toISOString(),
      ...gradeData
    };
    grades.push(newGrade);
    localStorage.setItem(STORAGE_KEYS.CIVIL_SERVICE_GRADES, JSON.stringify(grades));
    return newGrade;
  }

  static async updateGrade(gradeId: string, updates: Partial<CivilServiceGrade>): Promise<CivilServiceGrade> {
    const grades = await this.getAllGrades();
    const index = grades.findIndex(g => g.gradeId === gradeId);
    if (index === -1) throw new Error('Grade not found');
    grades[index] = { ...grades[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CIVIL_SERVICE_GRADES, JSON.stringify(grades));
    return grades[index];
  }

  static async getGradeByEmployeeId(employeeId: string): Promise<CivilServiceGrade | null> {
    const grades = await this.getAllGrades();
    return grades.find(g => g.employeeId === employeeId) || null;
  }
}

export class SecurityClearanceService {
  static async getAllClearances(): Promise<SecurityClearance[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SECURITY_CLEARANCES);
    return data ? JSON.parse(data) : [];
  }

  static async createClearance(clearanceData: Partial<SecurityClearance>): Promise<SecurityClearance> {
    const clearances = await this.getAllClearances();
    const newClearance: SecurityClearance = {
      clearanceId: 'clearance-' + Date.now(),
      employeeId: clearanceData.employeeId || '',
      employeeName: clearanceData.employeeName || '',
      department: clearanceData.department || '',
      position: clearanceData.position || '',
      clearanceLevel: clearanceData.clearanceLevel || 'public_trust',
      status: clearanceData.status || 'pending',
      grantedDate: clearanceData.grantedDate || new Date().toISOString().split('T')[0],
      expiryDate: clearanceData.expiryDate || '',
      investigationType: clearanceData.investigationType || {} as any,
      investigationDetails: clearanceData.investigationDetails || {} as any,
      polygraphRequired: clearanceData.polygraphRequired || false,
      continuousEvaluation: clearanceData.continuousEvaluation || {} as any,
      accessAuthorizations: clearanceData.accessAuthorizations || [],
      suspensionHistory: clearanceData.suspensionHistory || [],
      debriefRequired: clearanceData.debriefRequired || false,
      createdAt: new Date().toISOString(),
      ...clearanceData
    };
    clearances.push(newClearance);
    localStorage.setItem(STORAGE_KEYS.SECURITY_CLEARANCES, JSON.stringify(clearances));
    return newClearance;
  }

  static async updateClearance(clearanceId: string, updates: Partial<SecurityClearance>): Promise<SecurityClearance> {
    const clearances = await this.getAllClearances();
    const index = clearances.findIndex(c => c.clearanceId === clearanceId);
    if (index === -1) throw new Error('Clearance not found');
    clearances[index] = { ...clearances[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SECURITY_CLEARANCES, JSON.stringify(clearances));
    return clearances[index];
  }

  static async getClearanceByEmployeeId(employeeId: string): Promise<SecurityClearance | null> {
    const clearances = await this.getAllClearances();
    return clearances.find(c => c.employeeId === employeeId) || null;
  }

  static async getExpiringSoon(days: number = 90): Promise<SecurityClearance[]> {
    const clearances = await this.getAllClearances();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return clearances.filter(c => {
      const expiryDate = new Date(c.expiryDate);
      return expiryDate <= targetDate && c.status === 'active';
    });
  }
}

export class PensionSchemeService {
  static async getAllPensions(): Promise<PensionScheme[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PENSION_SCHEMES);
    return data ? JSON.parse(data) : [];
  }

  static async createPension(pensionData: Partial<PensionScheme>): Promise<PensionScheme> {
    const pensions = await this.getAllPensions();
    const newPension: PensionScheme = {
      pensionId: 'pension-' + Date.now(),
      employeeId: pensionData.employeeId || '',
      employeeName: pensionData.employeeName || '',
      department: pensionData.department || '',
      pensionType: pensionData.pensionType || 'fers',
      enrollmentDate: pensionData.enrollmentDate || new Date().toISOString().split('T')[0],
      serviceComputationDate: pensionData.serviceComputationDate || new Date().toISOString().split('T')[0],
      yearsOfService: pensionData.yearsOfService || 0,
      vestingStatus: pensionData.vestingStatus || 'not_vested',
      retirementEligibility: pensionData.retirementEligibility || {} as any,
      contributions: pensionData.contributions || {} as any,
      projections: pensionData.projections || {} as any,
      beneficiaries: pensionData.beneficiaries || [],
      thriftSavingsPlan: pensionData.thriftSavingsPlan || {} as any,
      status: pensionData.status || 'active',
      createdAt: new Date().toISOString(),
      ...pensionData
    };
    pensions.push(newPension);
    localStorage.setItem(STORAGE_KEYS.PENSION_SCHEMES, JSON.stringify(pensions));
    return newPension;
  }

  static async updatePension(pensionId: string, updates: Partial<PensionScheme>): Promise<PensionScheme> {
    const pensions = await this.getAllPensions();
    const index = pensions.findIndex(p => p.pensionId === pensionId);
    if (index === -1) throw new Error('Pension not found');
    pensions[index] = { ...pensions[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PENSION_SCHEMES, JSON.stringify(pensions));
    return pensions[index];
  }

  static async getPensionByEmployeeId(employeeId: string): Promise<PensionScheme | null> {
    const pensions = await this.getAllPensions();
    return pensions.find(p => p.employeeId === employeeId) || null;
  }

  static async getRetirementEligible(): Promise<PensionScheme[]> {
    const pensions = await this.getAllPensions();
    return pensions.filter(p => p.retirementEligibility.immediateRetirement && p.status === 'active');
  }
}

export class GovernmentSettingsService {
  static async getSettings(): Promise<GovernmentSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  static async updateSettings(settings: Partial<GovernmentSettings>): Promise<GovernmentSettings> {
    const current = await this.getSettings();
    const updated: GovernmentSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString()
    } as GovernmentSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<GovernmentAlert[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAlert(alertData: Partial<GovernmentAlert>): Promise<GovernmentAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: GovernmentAlert = {
      alertId: 'alert-' + Date.now(),
      alertType: alertData.alertType || 'compliance',
      severity: alertData.severity || 'low',
      title: alertData.title || '',
      message: alertData.message || '',
      relatedEntity: alertData.relatedEntity || {} as any,
      status: alertData.status || 'active',
      createdAt: new Date().toISOString(),
      ...alertData
    };
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return newAlert;
  }

  static async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<GovernmentAlert> {
    const alerts = await this.getAllAlerts();
    const index = alerts.findIndex(a => a.alertId === alertId);
    if (index === -1) throw new Error('Alert not found');

    alerts[index] = {
      ...alerts[index],
      status: 'acknowledged',
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return alerts[index];
  }
}
