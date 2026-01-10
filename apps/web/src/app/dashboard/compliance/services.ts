/**
 * Compliance Management Module - Services
 * API-integrated service layer for compliance operations using APIClient
 */

import { APIClient } from '@/lib/api-client';
import type {
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
            throw error;
    }
  }

  static async getLaborLawById(id: string): Promise<LaborLaw | null> {
    try {
      return await APIClient.get<LaborLaw>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createLaborLaw(data: LaborLaw): Promise<LaborLaw> {
    try {
      return await APIClient.post<LaborLaw>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateLaborLaw(id: string, updates: Partial<LaborLaw>): Promise<LaborLaw> {
    try {
      return await APIClient.put<LaborLaw>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteLaborLaw(id: string): Promise<void> {
    try {
      await APIClient.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
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
            throw error;
    }
  }

  static async getRecordById(id: string): Promise<ComplianceRecord | null> {
    try {
      return await APIClient.get<ComplianceRecord>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async getRecordsByLaw(lawId: string): Promise<ComplianceRecord[]> {
    try {
      return await APIClient.get<ComplianceRecord[]>(this.endpoint, { lawId });
    } catch (error) {
            throw error;
    }
  }

  static async createRecord(data: ComplianceRecord): Promise<ComplianceRecord> {
    try {
      return await APIClient.post<ComplianceRecord>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateRecord(id: string, updates: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    try {
      return await APIClient.put<ComplianceRecord>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
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
            throw error;
    }
  }

  static async getComplaintById(id: string): Promise<POSHComplaint | null> {
    try {
      return await APIClient.get<POSHComplaint>(`${this.complaintsEndpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createComplaint(data: POSHComplaint): Promise<POSHComplaint> {
    try {
      return await APIClient.post<POSHComplaint>(this.complaintsEndpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateComplaint(id: string, updates: Partial<POSHComplaint>): Promise<POSHComplaint> {
    try {
      return await APIClient.put<POSHComplaint>(`${this.complaintsEndpoint}/${id}`, updates);
    } catch (error) {
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
            throw error;
    }
  }

  static async getCommittees(): Promise<POSHCommittee[]> {
    try {
      return await APIClient.get<POSHCommittee[]>(this.committeesEndpoint);
    } catch (error) {
            throw error;
    }
  }

  static async createCommittee(data: POSHCommittee): Promise<POSHCommittee> {
    try {
      return await APIClient.post<POSHCommittee>(this.committeesEndpoint, data);
    } catch (error) {
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
            throw error;
    }
  }

  static async getGrievanceById(id: string): Promise<Grievance | null> {
    try {
      return await APIClient.get<Grievance>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async getGrievancesByEmployee(employeeId: string): Promise<Grievance[]> {
    try {
      return await APIClient.get<Grievance[]>(this.endpoint, { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async createGrievance(data: Grievance): Promise<Grievance> {
    try {
      return await APIClient.post<Grievance>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateGrievance(id: string, updates: Partial<Grievance>): Promise<Grievance> {
    try {
      return await APIClient.put<Grievance>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
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
            throw error;
    }
  }

  static async getRecordById(id: string): Promise<DisciplinaryRecord | null> {
    try {
      return await APIClient.get<DisciplinaryRecord>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async getRecordsByEmployee(employeeId: string): Promise<DisciplinaryRecord[]> {
    try {
      return await APIClient.get<DisciplinaryRecord[]>(this.endpoint, { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async createRecord(data: DisciplinaryRecord): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateRecord(id: string, updates: Partial<DisciplinaryRecord>): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.put<DisciplinaryRecord>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async acknowledgeRecord(id: string, acknowledgedBy: string): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(`${this.endpoint}/${id}/acknowledge`, {
        acknowledgedBy
      });
    } catch (error) {
            throw error;
    }
  }

  static async submitAppeal(id: string, appealReason: string): Promise<DisciplinaryRecord> {
    try {
      return await APIClient.post<DisciplinaryRecord>(`${this.endpoint}/${id}/appeal`, {
        appealReason
      });
    } catch (error) {
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
            throw error;
    }
  }

  static async getAuditById(id: string): Promise<ComplianceAudit | null> {
    try {
      return await APIClient.get<ComplianceAudit>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createAudit(data: ComplianceAudit): Promise<ComplianceAudit> {
    try {
      return await APIClient.post<ComplianceAudit>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateAudit(id: string, updates: Partial<ComplianceAudit>): Promise<ComplianceAudit> {
    try {
      return await APIClient.put<ComplianceAudit>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async startAudit(id: string): Promise<ComplianceAudit> {
    try {
      return await APIClient.post<ComplianceAudit>(`${this.endpoint}/${id}/start`);
    } catch (error) {
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
            throw error;
    }
  }

  static async getUnionById(id: string): Promise<Union | null> {
    try {
      return await APIClient.get<Union>(`${this.unionsEndpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createUnion(data: Union): Promise<Union> {
    try {
      return await APIClient.post<Union>(this.unionsEndpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateUnion(id: string, updates: Partial<Union>): Promise<Union> {
    try {
      return await APIClient.put<Union>(`${this.unionsEndpoint}/${id}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async getCBAgreements(): Promise<CollectiveBargainingAgreement[]> {
    try {
      return await APIClient.get<CollectiveBargainingAgreement[]>(this.cbaEndpoint);
    } catch (error) {
            throw error;
    }
  }

  static async createCBAgreement(data: CollectiveBargainingAgreement): Promise<CollectiveBargainingAgreement> {
    try {
      return await APIClient.post<CollectiveBargainingAgreement>(this.cbaEndpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateCBAgreement(id: string, updates: Partial<CollectiveBargainingAgreement>): Promise<CollectiveBargainingAgreement> {
    try {
      return await APIClient.put<CollectiveBargainingAgreement>(`${this.cbaEndpoint}/${id}`, updates);
    } catch (error) {
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
            throw error;
    }
  }

  static async getReportById(id: string): Promise<WhistleblowerReport | null> {
    try {
      return await APIClient.get<WhistleblowerReport>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createReport(data: WhistleblowerReport): Promise<WhistleblowerReport> {
    try {
      return await APIClient.post<WhistleblowerReport>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateReport(id: string, updates: Partial<WhistleblowerReport>): Promise<WhistleblowerReport> {
    try {
      return await APIClient.put<WhistleblowerReport>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
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
            throw error;
    }
  }

  static async getArbitrationById(id: string): Promise<Arbitration | null> {
    try {
      return await APIClient.get<Arbitration>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createArbitration(data: Arbitration): Promise<Arbitration> {
    try {
      return await APIClient.post<Arbitration>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateArbitration(id: string, updates: Partial<Arbitration>): Promise<Arbitration> {
    try {
      return await APIClient.put<Arbitration>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
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
            throw error;
    }
  }

  static async getStrikeById(id: string): Promise<Strike | null> {
    try {
      return await APIClient.get<Strike>(`${this.endpoint}/${id}`);
    } catch (error) {
            return null;
    }
  }

  static async createStrike(data: Strike): Promise<Strike> {
    try {
      return await APIClient.post<Strike>(this.endpoint, data);
    } catch (error) {
            throw error;
    }
  }

  static async updateStrike(id: string, updates: Partial<Strike>): Promise<Strike> {
    try {
      return await APIClient.put<Strike>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async resolveStrike(id: string, resolutionTerms: string[]): Promise<Strike> {
    try {
      return await APIClient.post<Strike>(`${this.endpoint}/${id}/resolve`, {
        resolutionTerms
      });
    } catch (error) {
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
            throw error;
    }
  }

  static async updateSettings(updates: Partial<ComplianceSettings>): Promise<ComplianceSettings> {
    try {
      return await APIClient.put<ComplianceSettings>(this.endpoint, updates);
    } catch (error) {
            throw error;
    }
  }
}
