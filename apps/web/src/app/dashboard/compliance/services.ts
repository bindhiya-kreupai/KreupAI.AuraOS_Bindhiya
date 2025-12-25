/**
 * Compliance Management Module - Services
 * API-integrated service layer for compliance operations using APIClient
 */

import { APIClient } from '@/lib/api-client';
import {
  LaborLaw,
  ComplianceRecord,
  POSHComplaint,
  POSHCommittee,
  Grievance,
  DisciplinaryRecord,
  ComplianceAudit,
  Union,
  CollectiveBargainingAgreement,
  WhistleblowerReport,
  Arbitration,
  Strike,
  ComplianceMetrics,
  ComplianceSettings
} from './types';

// Labor Law Compliance Service
export class LaborLawService {
  private static endpoint = '/compliance/labor-laws';

  static async getLaborLaws(): Promise<LaborLaw[]> {
    try {
      return await APIClient.get<LaborLaw[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch labor laws:', error);
      throw error;
    }
  }

  static async getLaborLawById(id: string): Promise<LaborLaw | null> {
    try {
      return await APIClient.get<LaborLaw>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch labor law ${id}:`, error);
      return null;
    }
  }

  static async createLaborLaw(data: LaborLaw): Promise<LaborLaw> {
    try {
      return await APIClient.post<LaborLaw>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create labor law:', error);
      throw error;
    }
  }

  static async updateLaborLaw(id: string, updates: Partial<LaborLaw>): Promise<LaborLaw> {
    try {
      return await APIClient.put<LaborLaw>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update labor law ${id}:`, error);
      throw error;
    }
  }

  static async deleteLaborLaw(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete labor law ${id}:`, error);
      throw error;
    }
  }
}

// Compliance Record Service
export class ComplianceRecordService {
  private static endpoint = '/compliance/records';

  static async getRecords(): Promise<ComplianceRecord[]> {
    try {
      return await APIClient.get<ComplianceRecord[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch compliance records:', error);
      throw error;
    }
  }

  static async getRecordById(id: string): Promise<ComplianceRecord | null> {
    try {
      return await APIClient.get<ComplianceRecord>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch compliance record ${id}:`, error);
      return null;
    }
  }

  static async getRecordsByLaw(lawId: string): Promise<ComplianceRecord[]> {
    try {
      return await APIClient.get<ComplianceRecord[]>(this.endpoint, { lawId });
    } catch (error) {
      console.error(`Failed to fetch records for law ${lawId}:`, error);
      throw error;
    }
  }

  static async createRecord(data: ComplianceRecord): Promise<ComplianceRecord> {
    try {
      return await APIClient.post<ComplianceRecord>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create compliance record:', error);
      throw error;
    }
  }

  static async updateRecord(id: string, updates: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    try {
      return await APIClient.put<ComplianceRecord>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update compliance record ${id}:`, error);
      throw error;
    }
  }

  static async verifyCompliance(id: string, verifiedBy: string, verifiedByName: string, findings: string): Promise<ComplianceRecord> {
    try {
      return await APIClient.post<ComplianceRecord>(`${this.endpoint}/${id}/verify`, {
        verifiedBy,
        verifiedByName,
        findings
      });
    } catch (error) {
      console.error(`Failed to verify compliance record ${id}:`, error);
      throw error;
    }
  }
}

// POSH Service
export class POSHService {
  private static complaintsEndpoint = '/compliance/posh/complaints';
  private static committeesEndpoint = '/compliance/posh/committees';

  static async getComplaints(): Promise<POSHComplaint[]> {
    try {
      return await APIClient.get<POSHComplaint[]>(this.complaintsEndpoint);
    } catch (error) {
      console.error('Failed to fetch POSH complaints:', error);
      throw error;
    }
  }

  static async getComplaintById(id: string): Promise<POSHComplaint | null> {
    try {
      return await APIClient.get<POSHComplaint>(`${this.complaintsEndpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch POSH complaint ${id}:`, error);
      return null;
    }
  }

  static async createComplaint(data: POSHComplaint): Promise<POSHComplaint> {
    try {
      return await APIClient.post<POSHComplaint>(this.complaintsEndpoint, data);
    } catch (error) {
      console.error('Failed to create POSH complaint:', error);
      throw error;
    }
  }

  static async updateComplaint(id: string, updates: Partial<POSHComplaint>): Promise<POSHComplaint> {
    try {
      return await APIClient.put<POSHComplaint>(`${this.complaintsEndpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update POSH complaint ${id}:`, error);
      throw error;
    }
  }

  static async assignCommittee(id: string, committeeId: string, committeeName: string): Promise<POSHComplaint> {
    try {
      return await APIClient.post<POSHComplaint>(`${this.complaintsEndpoint}/${id}/assign-committee`, {
        committeeId,
        committeeName
      });
    } catch (error) {
      console.error(`Failed to assign committee to POSH complaint ${id}:`, error);
      throw error;
    }
  }

  static async getCommittees(): Promise<POSHCommittee[]> {
    try {
      return await APIClient.get<POSHCommittee[]>(this.committeesEndpoint);
    } catch (error) {
      console.error('Failed to fetch POSH committees:', error);
      throw error;
    }
  }

  static async createCommittee(data: POSHCommittee): Promise<POSHCommittee> {
    try {
      return await APIClient.post<POSHCommittee>(this.committeesEndpoint, data);
    } catch (error) {
      console.error('Failed to create POSH committee:', error);
      throw error;
    }
  }
}

// Grievance Service
export class GrievanceService {
  private static endpoint = '/compliance/grievances';

  static async getGrievances(): Promise<Grievance[]> {
    try {
      return await APIClient.get<Grievance[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch grievances:', error);
      throw error;
    }
  }

  static async getGrievanceById(id: string): Promise<Grievance | null> {
    try {
      return await APIClient.get<Grievance>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch grievance ${id}:`, error);
      return null;
    }
  }

  static async getGrievancesByEmployee(employeeId: string): Promise<Grievance[]> {
    try {
      return await APIClient.get<Grievance[]>(this.endpoint, { employeeId });
    } catch (error) {
      console.error(`Failed to fetch grievances for employee ${employeeId}:`, error);
      throw error;
    }
  }

  static async createGrievance(data: Grievance): Promise<Grievance> {
    try {
      return await APIClient.post<Grievance>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create grievance:', error);
      throw error;
    }
  }

  static async updateGrievance(id: string, updates: Partial<Grievance>): Promise<Grievance> {
    try {
      return await APIClient.put<Grievance>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update grievance ${id}:`, error);
      throw error;
    }
  }

  static async assignGrievance(id: string, assignedTo: string, assignedToName: string): Promise<Grievance> {
    try {
      return await APIClient.post<Grievance>(`${this.endpoint}/${id}/assign`, {
        assignedTo,
        assignedToName
      });
    } catch (error) {
      console.error(`Failed to assign grievance ${id}:`, error);
      throw error;
    }
  }

  static async resolveGrievance(id: string, resolutionDetails: string, satisfactionRating?: number): Promise<Grievance> {
    try {
      return await APIClient.post<Grievance>(`${this.endpoint}/${id}/resolve`, {
        resolutionDetails,
        satisfactionRating
      });
    } catch (error) {
      console.error(`Failed to resolve grievance ${id}:`, error);
      throw error;
    }
  }

  static async escalateGrievance(id: string, escalatedTo: string, escalatedToName: string, reason: string): Promise<Grievance> {
    try {
      return await APIClient.post<Grievance>(`${this.endpoint}/${id}/escalate`, {
        escalatedTo,
        escalatedToName,
        reason
      });
    } catch (error) {
      console.error(`Failed to escalate grievance ${id}:`, error);
      throw error;
    }
  }
}

// Disciplinary Action Service
export class DisciplinaryService {
  private static endpoint = '/compliance/disciplinary';

  static async getRecords(): Promise<DisciplinaryRecord[]> {
    try {
      return await APIClient.get<DisciplinaryRecord[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch disciplinary records:', error);
      throw error;
    }
  }

  static async getRecordById(id: string): Promise<DisciplinaryRecord | null> {
    try {
      return await APIClient.get<DisciplinaryRecord>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch disciplinary record ${id}:`, error);
      return null;
    }
  }

  static async getRecordsByEmployee(employeeId: string): Promise<DisciplinaryRecord[]> {
    try {
      return await APIClient.get<DisciplinaryRecord[]>(this.endpoint, { employeeId });
    } catch (error) {
      console.error(`Failed to fetch disciplinary records for employee ${employeeId}:`, error);
      throw error;
    }
  }

  static async createRecord(data: DisciplinaryRecord): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create disciplinary record:', error);
      throw error;
    }
  }

  static async updateRecord(id: string, updates: Partial<DisciplinaryRecord>): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.put<DisciplinaryRecord>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update disciplinary record ${id}:`, error);
      throw error;
    }
  }

  static async acknowledgeRecord(id: string, acknowledgedBy: string): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(`${this.endpoint}/${id}/acknowledge`, {
        acknowledgedBy
      });
    } catch (error) {
      console.error(`Failed to acknowledge disciplinary record ${id}:`, error);
      throw error;
    }
  }

  static async submitAppeal(id: string, appealReason: string): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(`${this.endpoint}/${id}/appeal`, {
        appealReason
      });
    } catch (error) {
      console.error(`Failed to submit appeal for disciplinary record ${id}:`, error);
      throw error;
    }
  }

  static async reviewAppeal(id: string, reviewedBy: string, decision: string, isApproved: boolean): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(`${this.endpoint}/${id}/review-appeal`, {
        reviewedBy,
        decision,
        isApproved
      });
    } catch (error) {
      console.error(`Failed to review appeal for disciplinary record ${id}:`, error);
      throw error;
    }
  }
}

// Compliance Audit Service
export class ComplianceAuditService {
  private static endpoint = '/compliance/audits';

  static async getAudits(): Promise<ComplianceAudit[]> {
    try {
      return await APIClient.get<ComplianceAudit[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch compliance audits:', error);
      throw error;
    }
  }

  static async getAuditById(id: string): Promise<ComplianceAudit | null> {
    try {
      return await APIClient.get<ComplianceAudit>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch compliance audit ${id}:`, error);
      return null;
    }
  }

  static async createAudit(data: ComplianceAudit): Promise<ComplianceAudit> {
    try {
      return await APIClient.post<ComplianceAudit>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create compliance audit:', error);
      throw error;
    }
  }

  static async updateAudit(id: string, updates: Partial<ComplianceAudit>): Promise<ComplianceAudit> {
    try {
      return await APIClient.put<ComplianceAudit>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update compliance audit ${id}:`, error);
      throw error;
    }
  }

  static async startAudit(id: string): Promise<ComplianceAudit> {
    try {
      return await APIClient.post<ComplianceAudit>(`${this.endpoint}/${id}/start`);
    } catch (error) {
      console.error(`Failed to start compliance audit ${id}:`, error);
      throw error;
    }
  }

  static async completeAudit(id: string, overallRating: any, complianceScore: number): Promise<ComplianceAudit> {
    try {
      return await APIClient.post<ComplianceAudit>(`${this.endpoint}/${id}/complete`, {
        overallRating,
        complianceScore
      });
    } catch (error) {
      console.error(`Failed to complete compliance audit ${id}:`, error);
      throw error;
    }
  }
}

// Union Service
export class UnionService {
  private static unionsEndpoint = '/compliance/unions';
  private static cbaEndpoint = '/compliance/unions/cba';

  static async getUnions(): Promise<Union[]> {
    try {
      return await APIClient.get<Union[]>(this.unionsEndpoint);
    } catch (error) {
      console.error('Failed to fetch unions:', error);
      throw error;
    }
  }

  static async getUnionById(id: string): Promise<Union | null> {
    try {
      return await APIClient.get<Union>(`${this.unionsEndpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch union ${id}:`, error);
      return null;
    }
  }

  static async createUnion(data: Union): Promise<Union> {
    try {
      return await APIClient.post<Union>(this.unionsEndpoint, data);
    } catch (error) {
      console.error('Failed to create union:', error);
      throw error;
    }
  }

  static async updateUnion(id: string, updates: Partial<Union>): Promise<Union> {
    try {
      return await APIClient.put<Union>(`${this.unionsEndpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update union ${id}:`, error);
      throw error;
    }
  }

  static async getCBAgreements(): Promise<CollectiveBargainingAgreement[]> {
    try {
      return await APIClient.get<CollectiveBargainingAgreement[]>(this.cbaEndpoint);
    } catch (error) {
      console.error('Failed to fetch CBA agreements:', error);
      throw error;
    }
  }

  static async createCBAgreement(data: CollectiveBargainingAgreement): Promise<CollectiveBargainingAgreement> {
    try {
      return await APIClient.post<CollectiveBargainingAgreement>(this.cbaEndpoint, data);
    } catch (error) {
      console.error('Failed to create CBA agreement:', error);
      throw error;
    }
  }

  static async updateCBAgreement(id: string, updates: Partial<CollectiveBargainingAgreement>): Promise<CollectiveBargainingAgreement> {
    try {
      return await APIClient.put<CollectiveBargainingAgreement>(`${this.cbaEndpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update CBA agreement ${id}:`, error);
      throw error;
    }
  }
}

// Whistleblower Service
export class WhistleblowerService {
  private static endpoint = '/compliance/whistleblower';

  static async getReports(): Promise<WhistleblowerReport[]> {
    try {
      return await APIClient.get<WhistleblowerReport[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch whistleblower reports:', error);
      throw error;
    }
  }

  static async getReportById(id: string): Promise<WhistleblowerReport | null> {
    try {
      return await APIClient.get<WhistleblowerReport>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch whistleblower report ${id}:`, error);
      return null;
    }
  }

  static async createReport(data: WhistleblowerReport): Promise<WhistleblowerReport> {
    try {
      return await APIClient.post<WhistleblowerReport>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create whistleblower report:', error);
      throw error;
    }
  }

  static async updateReport(id: string, updates: Partial<WhistleblowerReport>): Promise<WhistleblowerReport> {
    try {
      return await APIClient.put<WhistleblowerReport>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update whistleblower report ${id}:`, error);
      throw error;
    }
  }

  static async assignInvestigator(id: string, investigatorId: string, investigatorName: string): Promise<WhistleblowerReport> {
    try {
      return await APIClient.post<WhistleblowerReport>(`${this.endpoint}/${id}/assign-investigator`, {
        investigatorId,
        investigatorName
      });
    } catch (error) {
      console.error(`Failed to assign investigator to whistleblower report ${id}:`, error);
      throw error;
    }
  }
}

// Arbitration Service
export class ArbitrationService {
  private static endpoint = '/compliance/arbitrations';

  static async getArbitrations(): Promise<Arbitration[]> {
    try {
      return await APIClient.get<Arbitration[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch arbitrations:', error);
      throw error;
    }
  }

  static async getArbitrationById(id: string): Promise<Arbitration | null> {
    try {
      return await APIClient.get<Arbitration>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch arbitration ${id}:`, error);
      return null;
    }
  }

  static async createArbitration(data: Arbitration): Promise<Arbitration> {
    try {
      return await APIClient.post<Arbitration>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create arbitration:', error);
      throw error;
    }
  }

  static async updateArbitration(id: string, updates: Partial<Arbitration>): Promise<Arbitration> {
    try {
      return await APIClient.put<Arbitration>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update arbitration ${id}:`, error);
      throw error;
    }
  }
}

// Strike Service
export class StrikeService {
  private static endpoint = '/compliance/strikes';

  static async getStrikes(): Promise<Strike[]> {
    try {
      return await APIClient.get<Strike[]>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch strikes:', error);
      throw error;
    }
  }

  static async getStrikeById(id: string): Promise<Strike | null> {
    try {
      return await APIClient.get<Strike>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch strike ${id}:`, error);
      return null;
    }
  }

  static async createStrike(data: Strike): Promise<Strike> {
    try {
      return await APIClient.post<Strike>(this.endpoint, data);
    } catch (error) {
      console.error('Failed to create strike:', error);
      throw error;
    }
  }

  static async updateStrike(id: string, updates: Partial<Strike>): Promise<Strike> {
    try {
      return await APIClient.put<Strike>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update strike ${id}:`, error);
      throw error;
    }
  }

  static async resolveStrike(id: string, resolutionTerms: string[]): Promise<Strike> {
    try {
      return await APIClient.post<Strike>(`${this.endpoint}/${id}/resolve`, {
        resolutionTerms
      });
    } catch (error) {
      console.error(`Failed to resolve strike ${id}:`, error);
      throw error;
    }
  }
}

// Compliance Analytics Service
export class ComplianceAnalyticsService {
  private static endpoint = '/compliance/analytics';

  static async getMetrics(): Promise<ComplianceMetrics> {
    try {
      return await APIClient.get<ComplianceMetrics>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch compliance metrics:', error);
      throw error;
    }
  }
}

// Compliance Settings Service
export class ComplianceSettingsService {
  private static endpoint = '/compliance/settings';

  static async getSettings(): Promise<ComplianceSettings> {
    try {
      return await APIClient.get<ComplianceSettings>(this.endpoint);
    } catch (error) {
      console.error('Failed to fetch compliance settings:', error);
      throw error;
    }
  }

  static async updateSettings(updates: Partial<ComplianceSettings>): Promise<ComplianceSettings> {
    try {
      return await APIClient.put<ComplianceSettings>(this.endpoint, updates);
    } catch (error) {
      console.error('Failed to update compliance settings:', error);
      throw error;
    }
  }
}
