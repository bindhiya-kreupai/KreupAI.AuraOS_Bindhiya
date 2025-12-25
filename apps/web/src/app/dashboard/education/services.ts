/**
 * Education Module Services
 * Handles all business logic for Faculty Tenure, Research Grants, and Adjunct Management
 */

import { APIClient } from '@/lib/api-client';
import type {
  FacultyMember, TenureApplication, ResearchGrant, AdjunctFaculty, AdjunctContract,
  AdjunctPool, EducationSettings, GrantReport, FacultyEvaluation
} from './types';

// ============================================================================
// 1. FACULTY TENURE SERVICE
// ============================================================================

export class FacultyTenureService {
  private static endpoint = '/education/faculty';
  private static tenureEndpoint = '/education/tenure';

  static async getAllFaculty(): Promise<FacultyMember[]> {
    return APIClient.get<FacultyMember[]>(this.endpoint);
  }

  static async getFacultyById(facultyId: string): Promise<FacultyMember | null> {
    return APIClient.get<FacultyMember>(`${this.endpoint}/${facultyId}`);
  }

  static async createFaculty(facultyData: Partial<FacultyMember>): Promise<FacultyMember> {
    return APIClient.post<FacultyMember>(this.endpoint, facultyData);
  }

  static async updateFaculty(facultyId: string, updates: Partial<FacultyMember>): Promise<FacultyMember> {
    return APIClient.put<FacultyMember>(`${this.endpoint}/${facultyId}`, updates);
  }

  static async addPublication(facultyId: string, publication: any): Promise<FacultyMember> {
    return APIClient.post<FacultyMember>(`${this.endpoint}/${facultyId}/publications`, publication);
  }

  static async addEvaluation(facultyId: string, evaluation: FacultyEvaluation): Promise<FacultyMember> {
    return APIClient.post<FacultyMember>(`${this.endpoint}/${facultyId}/evaluations`, evaluation);
  }

  static async getAllTenureApplications(): Promise<TenureApplication[]> {
    return APIClient.get<TenureApplication[]>(this.tenureEndpoint);
  }

  static async getApplicationById(applicationId: string): Promise<TenureApplication | null> {
    return APIClient.get<TenureApplication>(`${this.tenureEndpoint}/${applicationId}`);
  }

  static async createTenureApplication(applicationData: Partial<TenureApplication>): Promise<TenureApplication> {
    return APIClient.post<TenureApplication>(this.tenureEndpoint, applicationData);
  }

  static async updateTenureApplication(applicationId: string, updates: Partial<TenureApplication>): Promise<TenureApplication> {
    return APIClient.put<TenureApplication>(`${this.tenureEndpoint}/${applicationId}`, updates);
  }

  static async submitApplication(applicationId: string): Promise<TenureApplication> {
    return APIClient.post<TenureApplication>(`${this.tenureEndpoint}/${applicationId}/submit`, {});
  }

  static async recordCommitteeVote(applicationId: string, vote: any): Promise<TenureApplication> {
    return APIClient.post<TenureApplication>(`${this.tenureEndpoint}/${applicationId}/votes`, vote);
  }

  static async recordDecision(applicationId: string, decision: any): Promise<TenureApplication> {
    return APIClient.post<TenureApplication>(`${this.tenureEndpoint}/${applicationId}/decision`, decision);
  }
}

// ============================================================================
// 2. RESEARCH GRANTS SERVICE
// ============================================================================

export class ResearchGrantsService {
  private static endpoint = '/education/grants';
  private static reportsEndpoint = '/education/grant-reports';

  static async getAllGrants(): Promise<ResearchGrant[]> {
    return APIClient.get<ResearchGrant[]>(this.endpoint);
  }

  static async getGrantById(grantId: string): Promise<ResearchGrant | null> {
    return APIClient.get<ResearchGrant>(`${this.endpoint}/${grantId}`);
  }

  static async createGrant(grantData: Partial<ResearchGrant>): Promise<ResearchGrant> {
    return APIClient.post<ResearchGrant>(this.endpoint, grantData);
  }

  static async updateGrant(grantId: string, updates: Partial<ResearchGrant>): Promise<ResearchGrant> {
    return APIClient.put<ResearchGrant>(`${this.endpoint}/${grantId}`, updates);
  }

  static async submitGrant(grantId: string): Promise<ResearchGrant> {
    return APIClient.post<ResearchGrant>(`${this.endpoint}/${grantId}/submit`, {});
  }

  static async awardGrant(grantId: string, awardedAmount: number, startDate: string, endDate: string): Promise<ResearchGrant> {
    return APIClient.post<ResearchGrant>(`${this.endpoint}/${grantId}/award`, { awardedAmount, startDate, endDate });
  }

  static async recordExpenditure(grantId: string, expenditure: any): Promise<ResearchGrant> {
    return APIClient.post<ResearchGrant>(`${this.endpoint}/${grantId}/expenditures`, expenditure);
  }

  static async addMilestone(grantId: string, milestone: any): Promise<ResearchGrant> {
    return APIClient.post<ResearchGrant>(`${this.endpoint}/${grantId}/milestones`, milestone);
  }

  static async updateMilestone(grantId: string, milestoneId: string, updates: any): Promise<ResearchGrant> {
    return APIClient.put<ResearchGrant>(`${this.endpoint}/${grantId}/milestones/${milestoneId}`, updates);
  }

  static async getAllReports(): Promise<GrantReport[]> {
    return APIClient.get<GrantReport[]>(this.reportsEndpoint);
  }

  static async createReport(reportData: Partial<GrantReport>): Promise<GrantReport> {
    return APIClient.post<GrantReport>(this.reportsEndpoint, reportData);
  }

  static async submitReport(reportId: string): Promise<GrantReport> {
    return APIClient.post<GrantReport>(`${this.reportsEndpoint}/${reportId}/submit`, {});
  }
}

// ============================================================================
// 3. ADJUNCT MANAGEMENT SERVICE
// ============================================================================

export class AdjunctManagementService {
  private static endpoint = '/education/adjunct';
  private static contractsEndpoint = '/education/adjunct-contracts';
  private static poolsEndpoint = '/education/adjunct-pools';

  static async getAllAdjuncts(): Promise<AdjunctFaculty[]> {
    return APIClient.get<AdjunctFaculty[]>(this.endpoint);
  }

  static async getAdjunctById(adjunctId: string): Promise<AdjunctFaculty | null> {
    return APIClient.get<AdjunctFaculty>(`${this.endpoint}/${adjunctId}`);
  }

  static async createAdjunct(adjunctData: Partial<AdjunctFaculty>): Promise<AdjunctFaculty> {
    return APIClient.post<AdjunctFaculty>(this.endpoint, adjunctData);
  }

  static async updateAdjunct(adjunctId: string, updates: Partial<AdjunctFaculty>): Promise<AdjunctFaculty> {
    return APIClient.put<AdjunctFaculty>(`${this.endpoint}/${adjunctId}`, updates);
  }

  static async verifyCredentials(adjunctId: string, qualificationId: string, verifiedBy: string): Promise<AdjunctFaculty> {
    return APIClient.post<AdjunctFaculty>(`${this.endpoint}/${adjunctId}/credentials/${qualificationId}/verify`, { verifiedBy });
  }

  static async getAllContracts(): Promise<AdjunctContract[]> {
    return APIClient.get<AdjunctContract[]>(this.contractsEndpoint);
  }

  static async getContractById(contractId: string): Promise<AdjunctContract | null> {
    return APIClient.get<AdjunctContract>(`${this.contractsEndpoint}/${contractId}`);
  }

  static async createContract(contractData: Partial<AdjunctContract>): Promise<AdjunctContract> {
    return APIClient.post<AdjunctContract>(this.contractsEndpoint, contractData);
  }

  static async updateContract(contractId: string, updates: Partial<AdjunctContract>): Promise<AdjunctContract> {
    return APIClient.put<AdjunctContract>(`${this.contractsEndpoint}/${contractId}`, updates);
  }

  static async signContract(contractId: string, signedBy: string): Promise<AdjunctContract> {
    return APIClient.post<AdjunctContract>(`${this.contractsEndpoint}/${contractId}/sign`, { signedBy });
  }

  static async approveContract(contractId: string, approvedBy: string): Promise<AdjunctContract> {
    return APIClient.post<AdjunctContract>(`${this.contractsEndpoint}/${contractId}/approve`, { approvedBy });
  }

  static async processPayment(contractId: string, installmentNumber: number): Promise<AdjunctContract> {
    return APIClient.post<AdjunctContract>(`${this.contractsEndpoint}/${contractId}/payments/${installmentNumber}`, {});
  }

  static async getAllPools(): Promise<AdjunctPool[]> {
    return APIClient.get<AdjunctPool[]>(this.poolsEndpoint);
  }

  static async getPoolByDepartment(department: string): Promise<AdjunctPool | null> {
    return APIClient.get<AdjunctPool>(`${this.poolsEndpoint}/department/${department}`);
  }

  static async updatePool(poolId: string, updates: Partial<AdjunctPool>): Promise<AdjunctPool> {
    return APIClient.put<AdjunctPool>(`${this.poolsEndpoint}/${poolId}`, updates);
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class EducationSettingsService {
  private static endpoint = '/education/settings';

  static async getSettings(): Promise<EducationSettings> {
    return APIClient.get<EducationSettings>(this.endpoint);
  }

  static getDefaultSettings(): EducationSettings {
    return {
      tenureSettings: {
        probationaryPeriod: 6,
        tenureReviewTimeline: 12,
        externalReviewersRequired: 3,
        publicationMinimum: 5,
        teachingEvaluationMinimum: 3.5,
      },
      grantSettings: {
        indirectCostRate: 48,
        costSharingRequired: false,
        reportingFrequency: 'quarterly',
        approvalLevels: [
          { threshold: 50000, approver: 'Department Chair', required: true },
          { threshold: 250000, approver: 'Dean', required: true },
          { threshold: 1000000, approver: 'Provost', required: true },
        ],
      },
      adjunctSettings: {
        maxCoursesPerSemester: 2,
        minQualifications: ['Masters degree in field', '2 years teaching experience'],
        defaultCompensationRate: 3500,
        backgroundCheckRequired: true,
        orientationRequired: true,
        contractRenewalNoticeDays: 60,
      },
    };
  }

  static async updateSettings(updates: Partial<EducationSettings>): Promise<EducationSettings> {
    return APIClient.put<EducationSettings>(this.endpoint, updates);
  }
}
