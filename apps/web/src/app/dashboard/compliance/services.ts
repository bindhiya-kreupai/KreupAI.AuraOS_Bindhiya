/**
 * Compliance Management Module - Services
 * API-integrated service layer for compliance operations using APIClient.
 *
 * All list endpoints return the shared list envelope
 * { success, data: { items, total, page, pageSize, hasNextPage } } and all
 * item endpoints return { success, data: <entity> }. The APIClient.unwrapList
 * / unwrapItem helpers normalise those shapes so callers always receive plain
 * arrays / objects.
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
  ComplianceSettings,
  ComplianceCatalog,
} from './types';

// Labor Law Compliance Service
export class LaborLawService {
  private static endpoint = '/compliance/labor-laws';

  static async getLaborLaws(): Promise<LaborLaw[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<LaborLaw>(res, 'items');
  }

  static async getLaborLawById(id: string): Promise<LaborLaw | null> {
    try {
      const res = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<LaborLaw>(res);
    } catch {
      return null;
    }
  }

  static async createLaborLaw(data: Partial<LaborLaw>): Promise<LaborLaw> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<LaborLaw>(res) as LaborLaw;
  }

  static async updateLaborLaw(id: string, updates: Partial<LaborLaw>): Promise<LaborLaw> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<LaborLaw>(res) as LaborLaw;
  }

  static async deleteLaborLaw(id: string): Promise<void> {
    await APIClient.delete<void>(`${this.endpoint}/${id}`);
  }
}

// Compliance Record Service
export class ComplianceRecordService {
  private static endpoint = '/compliance/records';

  static async getRecords(): Promise<ComplianceRecord[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<ComplianceRecord>(res, 'items');
  }

  static async getRecordsByLaw(lawId: string): Promise<ComplianceRecord[]> {
    const res = await APIClient.get<unknown>(this.endpoint, { lawId });
    return APIClient.unwrapList<ComplianceRecord>(res, 'items');
  }

  static async createRecord(data: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<ComplianceRecord>(res) as ComplianceRecord;
  }

  static async updateRecord(
    id: string,
    updates: Partial<ComplianceRecord>
  ): Promise<ComplianceRecord> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<ComplianceRecord>(res) as ComplianceRecord;
  }
}

// POSH Service
export class POSHService {
  private static complaintsEndpoint = '/compliance/posh/complaints';
  private static committeesEndpoint = '/compliance/posh/committees';

  static async getComplaints(): Promise<POSHComplaint[]> {
    const res = await APIClient.get<unknown>(this.complaintsEndpoint);
    return APIClient.unwrapList<POSHComplaint>(res, 'items');
  }

  static async createComplaint(data: Partial<POSHComplaint>): Promise<POSHComplaint> {
    const res = await APIClient.post<unknown>(this.complaintsEndpoint, data);
    return APIClient.unwrapItem<POSHComplaint>(res) as POSHComplaint;
  }

  static async updateComplaint(
    id: string,
    updates: Partial<POSHComplaint>
  ): Promise<POSHComplaint> {
    const res = await APIClient.put<unknown>(`${this.complaintsEndpoint}/${id}`, updates);
    return APIClient.unwrapItem<POSHComplaint>(res) as POSHComplaint;
  }

  static async getCommittees(): Promise<POSHCommittee[]> {
    const res = await APIClient.get<unknown>(this.committeesEndpoint);
    return APIClient.unwrapList<POSHCommittee>(res, 'items');
  }

  static async createCommittee(data: Partial<POSHCommittee>): Promise<POSHCommittee> {
    const res = await APIClient.post<unknown>(this.committeesEndpoint, data);
    return APIClient.unwrapItem<POSHCommittee>(res) as POSHCommittee;
  }

  static async updateCommittee(
    id: string,
    updates: Record<string, unknown>
  ): Promise<POSHCommittee> {
    const res = await APIClient.put<unknown>(`${this.committeesEndpoint}/${id}`, updates);
    return APIClient.unwrapItem<POSHCommittee>(res) as POSHCommittee;
  }
}

// Grievance Service
export class GrievanceService {
  private static endpoint = '/compliance/grievances';

  static async getGrievances(): Promise<Grievance[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<Grievance>(res, 'items');
  }

  static async getGrievanceById(id: string): Promise<Grievance | null> {
    try {
      const res = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<Grievance>(res);
    } catch {
      return null;
    }
  }

  static async createGrievance(
    data: Partial<Grievance> & { grievanceType: string }
  ): Promise<Grievance> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<Grievance>(res) as Grievance;
  }

  static async updateGrievance(id: string, updates: Record<string, unknown>): Promise<Grievance> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<Grievance>(res) as Grievance;
  }
}

// Disciplinary Action Service
export class DisciplinaryService {
  private static endpoint = '/compliance/disciplinary';

  static async getRecords(): Promise<DisciplinaryRecord[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<DisciplinaryRecord>(res, 'items');
  }

  static async createRecord(data: Record<string, unknown>): Promise<DisciplinaryRecord> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<DisciplinaryRecord>(res) as DisciplinaryRecord;
  }

  static async updateRecord(
    id: string,
    updates: Record<string, unknown>
  ): Promise<DisciplinaryRecord> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<DisciplinaryRecord>(res) as DisciplinaryRecord;
  }
}

// Compliance Audit Service
export class ComplianceAuditService {
  private static endpoint = '/compliance/audits';

  static async getAudits(): Promise<ComplianceAudit[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<ComplianceAudit>(res, 'items');
  }

  static async createAudit(data: Record<string, unknown>): Promise<ComplianceAudit> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<ComplianceAudit>(res) as ComplianceAudit;
  }

  static async updateAudit(id: string, updates: Record<string, unknown>): Promise<ComplianceAudit> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<ComplianceAudit>(res) as ComplianceAudit;
  }
}

// Union Service
export class UnionService {
  private static unionsEndpoint = '/compliance/unions';
  private static cbaEndpoint = '/compliance/unions/cba';

  static async getUnions(): Promise<Union[]> {
    const res = await APIClient.get<unknown>(this.unionsEndpoint);
    return APIClient.unwrapList<Union>(res, 'items');
  }

  static async createUnion(data: Record<string, unknown>): Promise<Union> {
    const res = await APIClient.post<unknown>(this.unionsEndpoint, data);
    return APIClient.unwrapItem<Union>(res) as Union;
  }

  static async updateUnion(id: string, updates: Record<string, unknown>): Promise<Union> {
    const res = await APIClient.put<unknown>(`${this.unionsEndpoint}/${id}`, updates);
    return APIClient.unwrapItem<Union>(res) as Union;
  }

  static async getCBAgreements(): Promise<CollectiveBargainingAgreement[]> {
    const res = await APIClient.get<unknown>(this.cbaEndpoint);
    return APIClient.unwrapList<CollectiveBargainingAgreement>(res, 'items');
  }

  static async createCBAgreement(
    data: Record<string, unknown>
  ): Promise<CollectiveBargainingAgreement> {
    const res = await APIClient.post<unknown>(this.cbaEndpoint, data);
    return APIClient.unwrapItem<CollectiveBargainingAgreement>(
      res
    ) as CollectiveBargainingAgreement;
  }
}

// Whistleblower Service
export class WhistleblowerService {
  private static endpoint = '/compliance/whistleblower';

  static async getReports(): Promise<WhistleblowerReport[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<WhistleblowerReport>(res, 'items');
  }

  static async getReportByCode(reportCode: string): Promise<WhistleblowerReport | null> {
    const res = await APIClient.get<unknown>(this.endpoint, { reportCode });
    const list = APIClient.unwrapList<WhistleblowerReport>(res, 'items');
    return list[0] ?? null;
  }

  static async createReport(data: Record<string, unknown>): Promise<WhistleblowerReport> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<WhistleblowerReport>(res) as WhistleblowerReport;
  }

  static async updateReport(
    id: string,
    updates: Record<string, unknown>
  ): Promise<WhistleblowerReport> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<WhistleblowerReport>(res) as WhistleblowerReport;
  }
}

// Arbitration Service
export class ArbitrationService {
  private static endpoint = '/compliance/arbitrations';

  static async getArbitrations(): Promise<Arbitration[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<Arbitration>(res, 'items');
  }

  static async createArbitration(data: Record<string, unknown>): Promise<Arbitration> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<Arbitration>(res) as Arbitration;
  }

  static async updateArbitration(
    id: string,
    updates: Record<string, unknown>
  ): Promise<Arbitration> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<Arbitration>(res) as Arbitration;
  }
}

// Strike Service
export class StrikeService {
  private static endpoint = '/compliance/strikes';

  static async getStrikes(): Promise<Strike[]> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapList<Strike>(res, 'items');
  }

  static async createStrike(data: Record<string, unknown>): Promise<Strike> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<Strike>(res) as Strike;
  }

  static async updateStrike(id: string, updates: Record<string, unknown>): Promise<Strike> {
    const res = await APIClient.put<unknown>(`${this.endpoint}/${id}`, updates);
    return APIClient.unwrapItem<Strike>(res) as Strike;
  }
}

// Communication Log Service
export interface CommunicationLogEntry {
  id: string;
  communicationDate: string;
  communicationType: string;
  category: string;
  subject: string;
  summary?: string;
  fromParty?: string;
  toParty?: string;
}

export class CommunicationLogService {
  private static endpoint = '/compliance/communication-log';

  static async getLogs(filters?: {
    category?: string;
    communicationType?: string;
  }): Promise<CommunicationLogEntry[]> {
    const res = await APIClient.get<unknown>(this.endpoint, filters);
    return APIClient.unwrapList<CommunicationLogEntry>(res, 'items');
  }

  static async createLog(data: Record<string, unknown>): Promise<CommunicationLogEntry> {
    const res = await APIClient.post<unknown>(this.endpoint, data);
    return APIClient.unwrapItem<CommunicationLogEntry>(res) as CommunicationLogEntry;
  }
}

// Compliance Catalog Service — root GET /api/compliance overview endpoint.
// Returns the static statutory-service catalogue (supported countries,
// service surfaces, platform features). Public metadata only, no tenant data.
export class ComplianceCatalogApi {
  private static endpoint = '/compliance';

  static async getCatalog(): Promise<ComplianceCatalog> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapItem<ComplianceCatalog>(res) as ComplianceCatalog;
  }
}

// Compliance Analytics Service
export class ComplianceAnalyticsService {
  private static endpoint = '/compliance/analytics';

  static async getMetrics(): Promise<ComplianceMetrics> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapItem<ComplianceMetrics>(res) as ComplianceMetrics;
  }
}

// Compliance Settings Service
export class ComplianceSettingsService {
  private static endpoint = '/compliance/settings';

  static async getSettings(): Promise<ComplianceSettings> {
    const res = await APIClient.get<unknown>(this.endpoint);
    return APIClient.unwrapItem<ComplianceSettings>(res) as ComplianceSettings;
  }

  static async updateSettings(updates: Partial<ComplianceSettings>): Promise<ComplianceSettings> {
    const res = await APIClient.put<unknown>(this.endpoint, { settings: updates });
    return APIClient.unwrapItem<ComplianceSettings>(res) as ComplianceSettings;
  }
}
