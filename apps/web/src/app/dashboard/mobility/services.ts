/**
 * Global Mobility Module - Service Layer
 * API-ready services for visa & immigration, relocation packages, and expat tax management
 */

'use client';

import { APIClient } from '@/lib/api-client';
import {
  VisaApplication,
  VisaStage,
  ImmigrationCompliance,
  ComplianceIssue,
  RelocationPackage,
  RelocationTask,
  RelocationVendor,
  ExpatTaxProfile,
  TaxReturn,
  TaxProjection,
  MobilityAnalytics,
  MobilitySettings,
  Document,
} from './types';

// ============================================================================
// Visa & Immigration Service
// ============================================================================

export class VisaImmigrationService {
  private static visaEndpoint = '/mobility/visa-applications';
  private static complianceEndpoint = '/mobility/immigration-compliance';

  // Visa Applications
  static async getVisaApplications(employeeId?: string): Promise<VisaApplication[]> {
    return APIClient.get<VisaApplication[]>(this.visaEndpoint, employeeId ? { employeeId } : undefined);
  }

  static async getVisaApplicationById(applicationId: string): Promise<VisaApplication> {
    return APIClient.get<VisaApplication>(`${this.visaEndpoint}/${applicationId}`);
  }

  static async createVisaApplication(application: VisaApplication): Promise<VisaApplication> {
    return APIClient.post<VisaApplication>(this.visaEndpoint, application);
  }

  static async updateVisaApplication(applicationId: string, updates: Partial<VisaApplication>): Promise<VisaApplication> {
    return APIClient.put<VisaApplication>(`${this.visaEndpoint}/${applicationId}`, updates);
  }

  static async deleteVisaApplication(applicationId: string): Promise<void> {
    return APIClient.delete<void>(`${this.visaEndpoint}/${applicationId}`);
  }

  static async submitVisaApplication(applicationId: string): Promise<VisaApplication> {
    return APIClient.post<VisaApplication>(`${this.visaEndpoint}/${applicationId}/submit`, {});
  }

  static async updateStage(applicationId: string, stageId: string, status: string): Promise<VisaApplication> {
    return APIClient.put<VisaApplication>(`${this.visaEndpoint}/${applicationId}/stages/${stageId}`, { status });
  }

  static async uploadDocument(applicationId: string, document: Document): Promise<VisaApplication> {
    return APIClient.post<VisaApplication>(`${this.visaEndpoint}/${applicationId}/documents`, document);
  }

  static async approveVisa(applicationId: string, visaNumber: string, issueDate: Date, expiryDate: Date): Promise<VisaApplication> {
    return APIClient.post<VisaApplication>(`${this.visaEndpoint}/${applicationId}/approve`, { visaNumber, issueDate, expiryDate });
  }

  static async rejectVisa(applicationId: string, reason: string): Promise<VisaApplication> {
    return APIClient.post<VisaApplication>(`${this.visaEndpoint}/${applicationId}/reject`, { reason });
  }

  // Immigration Compliance
  static async getComplianceRecords(employeeId?: string): Promise<ImmigrationCompliance[]> {
    return APIClient.get<ImmigrationCompliance[]>(this.complianceEndpoint, employeeId ? { employeeId } : undefined);
  }

  static async createComplianceRecord(record: ImmigrationCompliance): Promise<ImmigrationCompliance> {
    return APIClient.post<ImmigrationCompliance>(this.complianceEndpoint, record);
  }

  static async updateComplianceRecord(complianceId: string, updates: Partial<ImmigrationCompliance>): Promise<ImmigrationCompliance> {
    return APIClient.put<ImmigrationCompliance>(`${this.complianceEndpoint}/${complianceId}`, updates);
  }

  static async addComplianceIssue(complianceId: string, issue: ComplianceIssue): Promise<ImmigrationCompliance> {
    return APIClient.post<ImmigrationCompliance>(`${this.complianceEndpoint}/${complianceId}/issues`, issue);
  }
}

// ============================================================================
// Relocation Package Service
// ============================================================================

export class RelocationPackageService {
  private static endpoint = '/mobility/relocation-packages';

  static async getPackages(employeeId?: string): Promise<RelocationPackage[]> {
    return APIClient.get<RelocationPackage[]>(this.endpoint, employeeId ? { employeeId } : undefined);
  }

  static async getPackageById(packageId: string): Promise<RelocationPackage> {
    return APIClient.get<RelocationPackage>(`${this.endpoint}/${packageId}`);
  }

  static async createPackage(relocationPackage: RelocationPackage): Promise<RelocationPackage> {
    return APIClient.post<RelocationPackage>(this.endpoint, relocationPackage);
  }

  static async updatePackage(packageId: string, updates: Partial<RelocationPackage>): Promise<RelocationPackage> {
    return APIClient.put<RelocationPackage>(`${this.endpoint}/${packageId}`, updates);
  }

  static async deletePackage(packageId: string): Promise<void> {
    return APIClient.delete<void>(`${this.endpoint}/${packageId}`);
  }

  static async updateTask(packageId: string, taskId: string, updates: Partial<RelocationTask>): Promise<RelocationPackage> {
    return APIClient.put<RelocationPackage>(`${this.endpoint}/${packageId}/tasks/${taskId}`, updates);
  }

  static async addVendor(packageId: string, vendor: RelocationVendor): Promise<RelocationPackage> {
    return APIClient.post<RelocationPackage>(`${this.endpoint}/${packageId}/vendors`, vendor);
  }

  static async recordExpense(packageId: string, category: string, amount: number): Promise<RelocationPackage> {
    return APIClient.post<RelocationPackage>(`${this.endpoint}/${packageId}/expenses`, { category, amount });
  }

  static async completePackage(packageId: string, satisfaction: number, feedback?: string): Promise<RelocationPackage> {
    return APIClient.post<RelocationPackage>(`${this.endpoint}/${packageId}/complete`, { satisfaction, feedback });
  }
}

// ============================================================================
// Expat Tax Manager Service
// ============================================================================

export class ExpatTaxService {
  private static profilesEndpoint = '/mobility/expat-tax-profiles';
  private static projectionsEndpoint = '/mobility/tax-projections';

  // Tax Profiles
  static async getTaxProfiles(employeeId?: string): Promise<ExpatTaxProfile[]> {
    return APIClient.get<ExpatTaxProfile[]>(this.profilesEndpoint, employeeId ? { employeeId } : undefined);
  }

  static async getTaxProfileById(profileId: string): Promise<ExpatTaxProfile> {
    return APIClient.get<ExpatTaxProfile>(`${this.profilesEndpoint}/${profileId}`);
  }

  static async createTaxProfile(profile: ExpatTaxProfile): Promise<ExpatTaxProfile> {
    return APIClient.post<ExpatTaxProfile>(this.profilesEndpoint, profile);
  }

  static async updateTaxProfile(profileId: string, updates: Partial<ExpatTaxProfile>): Promise<ExpatTaxProfile> {
    return APIClient.put<ExpatTaxProfile>(`${this.profilesEndpoint}/${profileId}`, updates);
  }

  static async deleteTaxProfile(profileId: string): Promise<void> {
    return APIClient.delete<void>(`${this.profilesEndpoint}/${profileId}`);
  }

  // Tax Returns
  static async createTaxReturn(profileId: string, taxReturn: TaxReturn): Promise<ExpatTaxProfile> {
    return APIClient.post<ExpatTaxProfile>(`${this.profilesEndpoint}/${profileId}/returns`, taxReturn);
  }

  static async updateTaxReturn(profileId: string, returnId: string, updates: Partial<TaxReturn>): Promise<ExpatTaxProfile> {
    return APIClient.put<ExpatTaxProfile>(`${this.profilesEndpoint}/${profileId}/returns/${returnId}`, updates);
  }

  static async fileTaxReturn(profileId: string, returnId: string): Promise<ExpatTaxProfile> {
    return APIClient.post<ExpatTaxProfile>(`${this.profilesEndpoint}/${profileId}/returns/${returnId}/file`, {});
  }

  static async calculateTaxLiability(profileId: string, taxYear: number): Promise<number> {
    const response = await APIClient.post<{ liability: number }>(`${this.profilesEndpoint}/${profileId}/calculate-liability`, { taxYear });
    return response.liability;
  }

  // Tax Projections
  static async getProjections(employeeId?: string): Promise<TaxProjection[]> {
    return APIClient.get<TaxProjection[]>(this.projectionsEndpoint, employeeId ? { employeeId } : undefined);
  }

  static async createProjection(projection: TaxProjection): Promise<TaxProjection> {
    return APIClient.post<TaxProjection>(this.projectionsEndpoint, projection);
  }

  static async calculateProjection(profileId: string, taxYear: number): Promise<TaxProjection> {
    return APIClient.post<TaxProjection>(`${this.profilesEndpoint}/${profileId}/calculate-projection`, { taxYear });
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class MobilityAnalyticsService {
  private static endpoint = '/mobility/analytics';

  static async getAnalytics(period: string): Promise<MobilityAnalytics> {
    return APIClient.get<MobilityAnalytics>(this.endpoint, { period });
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class MobilitySettingsService {
  private static endpoint = '/mobility/settings';

  static async getSettings(): Promise<MobilitySettings> {
    return APIClient.get<MobilitySettings>(this.endpoint);
  }

  static async updateSettings(updates: Partial<MobilitySettings>): Promise<MobilitySettings> {
    return APIClient.put<MobilitySettings>(this.endpoint, updates);
  }

  private static getDefaultSettings(): MobilitySettings {
    return {
      settingsId: 'default-settings',

      visaSettings: {
        enabled: true,
        autoNotifications: true,
        expiryReminderDays: 90,
        requireLegalReview: true,
        defaultProcessingTime: 60,
      },

      relocationSettings: {
        enabled: true,
        defaultPolicyTier: 'standard',
        requireBudgetApproval: true,
        budgetApprovalThreshold: 50000,
        employeeFeedbackRequired: true,
        vendorRatingRequired: true,
      },

      taxSettings: {
        enabled: true,
        taxEqualizationEnabled: true,
        defaultTaxEqualizationType: 'gross_up',
        requireAdvisorReview: true,
        filingReminderDays: 30,
        autoCalculateProjections: true,
      },

      notificationSettings: {
        notifyOnVisaApproval: true,
        notifyOnVisaRejection: true,
        notifyOnDocumentExpiry: true,
        notifyOnTaskDue: true,
        notifyOnBudgetExceeded: true,
        notifyOnTaxDeadline: true,
        digestFrequency: 'weekly',
      },

      complianceSettings: {
        autoComplianceCheck: true,
        complianceReviewFrequency: 30,
        escalateHighRiskIssues: true,
        escalationRecipients: [],
      },

      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };
  }
}
