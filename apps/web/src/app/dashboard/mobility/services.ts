/**
 * Global Mobility Module - Service Layer
 * API-ready services for visa & immigration, relocation packages, and expat tax management
 */

'use client';

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
  private static VISA_APPLICATIONS_KEY = 'mobility_visa_applications';
  private static COMPLIANCE_KEY = 'mobility_immigration_compliance';

  // Visa Applications
  static async getVisaApplications(employeeId?: string): Promise<VisaApplication[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.VISA_APPLICATIONS_KEY);
    const applications: VisaApplication[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      return applications.filter((app) => app.employeeId === employeeId);
    }
    return applications;
  }

  static async getVisaApplicationById(applicationId: string): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const applications = await this.getVisaApplications();
    const application = applications.find((app) => app.applicationId === applicationId);
    if (!application) throw new Error('Visa application not found');
    return application;
  }

  static async createVisaApplication(application: VisaApplication): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const applications = await this.getVisaApplications();

    const newApplication = {
      ...application,
      applicationDate: new Date(),
      documentCompletionRate: 0,
      actualSpent: 0,
      audit: {
        createdAt: new Date(),
        createdBy: application.employeeId,
        updatedAt: new Date(),
        updatedBy: application.employeeId,
      },
    };

    applications.push(newApplication);
    localStorage.setItem(this.VISA_APPLICATIONS_KEY, JSON.stringify(applications));
    return newApplication;
  }

  static async updateVisaApplication(
    applicationId: string,
    updates: Partial<VisaApplication>
  ): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const applications = await this.getVisaApplications();
    const index = applications.findIndex((app) => app.applicationId === applicationId);
    if (index === -1) throw new Error('Visa application not found');

    const updated = {
      ...applications[index],
      ...updates,
      audit: {
        ...applications[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    applications[index] = updated;
    localStorage.setItem(this.VISA_APPLICATIONS_KEY, JSON.stringify(applications));
    return updated;
  }

  static async deleteVisaApplication(applicationId: string): Promise<void> {
    // TODO: Replace with actual API call
    const applications = await this.getVisaApplications();
    const filtered = applications.filter((app) => app.applicationId !== applicationId);
    localStorage.setItem(this.VISA_APPLICATIONS_KEY, JSON.stringify(filtered));
  }

  static async submitVisaApplication(applicationId: string): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const application = await this.getVisaApplicationById(applicationId);

    // Check if all required documents are submitted
    const requiredDocs = application.requiredDocuments.filter((doc) => doc.isMandatory);
    const submittedRequiredDocs = requiredDocs.filter((doc) => doc.isSubmitted);

    if (submittedRequiredDocs.length < requiredDocs.length) {
      throw new Error('All required documents must be submitted before application submission');
    }

    const updates: Partial<VisaApplication> = {
      applicationStatus: 'submitted',
      submissionDate: new Date(),
      currentStage: {
        ...application.currentStage,
        status: 'completed',
        completionDate: new Date(),
      },
    };

    // Move to next stage
    const nextStageIndex = application.stages.findIndex((s) => s.stageId === application.currentStage.stageId) + 1;
    if (nextStageIndex < application.stages.length) {
      updates.currentStage = {
        ...application.stages[nextStageIndex],
        status: 'in_progress',
        startDate: new Date(),
      };
    }

    return this.updateVisaApplication(applicationId, updates);
  }

  static async updateStage(applicationId: string, stageId: string, status: string): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const application = await this.getVisaApplicationById(applicationId);

    const stages = application.stages.map((stage) => {
      if (stage.stageId === stageId) {
        return {
          ...stage,
          status: status as any,
          completionDate: status === 'completed' ? new Date() : stage.completionDate,
        };
      }
      return stage;
    });

    return this.updateVisaApplication(applicationId, { stages });
  }

  static async uploadDocument(applicationId: string, document: Document): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const application = await this.getVisaApplicationById(applicationId);

    application.submittedDocuments.push(document);

    // Update required documents status
    const requiredDoc = application.requiredDocuments.find((rd) => rd.documentType === document.documentType);
    if (requiredDoc) {
      requiredDoc.isSubmitted = true;
      requiredDoc.submittedDocumentId = document.documentId;
    }

    // Update completion rate
    const totalRequired = application.requiredDocuments.length;
    const submitted = application.requiredDocuments.filter((rd) => rd.isSubmitted).length;
    const completionRate = (submitted / totalRequired) * 100;

    return this.updateVisaApplication(applicationId, {
      submittedDocuments: application.submittedDocuments,
      requiredDocuments: application.requiredDocuments,
      documentCompletionRate: completionRate,
    });
  }

  static async approveVisa(
    applicationId: string,
    visaNumber: string,
    issueDate: Date,
    expiryDate: Date
  ): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    const application = await this.getVisaApplicationById(applicationId);

    const processingTime = Math.ceil(
      (new Date().getTime() - new Date(application.submissionDate!).getTime()) / (1000 * 60 * 60 * 24)
    );

    return this.updateVisaApplication(applicationId, {
      applicationStatus: 'approved',
      approvalDate: new Date(),
      visaNumber,
      visaIssueDate: issueDate,
      visaExpiryDate: expiryDate,
      actualProcessingTime: processingTime,
    });
  }

  static async rejectVisa(applicationId: string, reason: string): Promise<VisaApplication> {
    // TODO: Replace with actual API call
    return this.updateVisaApplication(applicationId, {
      applicationStatus: 'rejected',
      rejectionDate: new Date(),
      rejectionReason: reason,
    });
  }

  // Immigration Compliance
  static async getComplianceRecords(employeeId?: string): Promise<ImmigrationCompliance[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.COMPLIANCE_KEY);
    const records: ImmigrationCompliance[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      return records.filter((rec) => rec.employeeId === employeeId);
    }
    return records;
  }

  static async createComplianceRecord(record: ImmigrationCompliance): Promise<ImmigrationCompliance> {
    // TODO: Replace with actual API call
    const records = await this.getComplianceRecords();

    const newRecord = {
      ...record,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    };

    records.push(newRecord);
    localStorage.setItem(this.COMPLIANCE_KEY, JSON.stringify(records));
    return newRecord;
  }

  static async updateComplianceRecord(
    complianceId: string,
    updates: Partial<ImmigrationCompliance>
  ): Promise<ImmigrationCompliance> {
    // TODO: Replace with actual API call
    const records = await this.getComplianceRecords();
    const index = records.findIndex((rec) => rec.complianceId === complianceId);
    if (index === -1) throw new Error('Compliance record not found');

    const updated = {
      ...records[index],
      ...updates,
      audit: {
        ...records[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    records[index] = updated;
    localStorage.setItem(this.COMPLIANCE_KEY, JSON.stringify(records));
    return updated;
  }

  static async addComplianceIssue(complianceId: string, issue: ComplianceIssue): Promise<ImmigrationCompliance> {
    // TODO: Replace with actual API call
    const records = await this.getComplianceRecords();
    const record = records.find((rec) => rec.complianceId === complianceId);
    if (!record) throw new Error('Compliance record not found');

    record.issues.push(issue);
    record.complianceStatus = issue.severity === 'critical' || issue.severity === 'high' ? 'at_risk' : record.complianceStatus;

    return this.updateComplianceRecord(complianceId, {
      issues: record.issues,
      complianceStatus: record.complianceStatus,
    });
  }
}

// ============================================================================
// Relocation Package Service
// ============================================================================

export class RelocationPackageService {
  private static PACKAGES_KEY = 'mobility_relocation_packages';

  static async getPackages(employeeId?: string): Promise<RelocationPackage[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.PACKAGES_KEY);
    const packages: RelocationPackage[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      return packages.filter((pkg) => pkg.employeeId === employeeId);
    }
    return packages;
  }

  static async getPackageById(packageId: string): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    const packages = await this.getPackages();
    const pkg = packages.find((p) => p.packageId === packageId);
    if (!pkg) throw new Error('Relocation package not found');
    return pkg;
  }

  static async createPackage(relocationPackage: RelocationPackage): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    const packages = await this.getPackages();

    const newPackage = {
      ...relocationPackage,
      requestDate: new Date(),
      actualSpent: 0,
      remainingBudget: relocationPackage.approvedBudget,
      feedbackReceived: false,
      audit: {
        createdAt: new Date(),
        createdBy: relocationPackage.coordinatorId,
        updatedAt: new Date(),
        updatedBy: relocationPackage.coordinatorId,
      },
    };

    packages.push(newPackage);
    localStorage.setItem(this.PACKAGES_KEY, JSON.stringify(packages));
    return newPackage;
  }

  static async updatePackage(packageId: string, updates: Partial<RelocationPackage>): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    const packages = await this.getPackages();
    const index = packages.findIndex((p) => p.packageId === packageId);
    if (index === -1) throw new Error('Relocation package not found');

    const updated = {
      ...packages[index],
      ...updates,
      audit: {
        ...packages[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    packages[index] = updated;
    localStorage.setItem(this.PACKAGES_KEY, JSON.stringify(packages));
    return updated;
  }

  static async deletePackage(packageId: string): Promise<void> {
    // TODO: Replace with actual API call
    const packages = await this.getPackages();
    const filtered = packages.filter((p) => p.packageId !== packageId);
    localStorage.setItem(this.PACKAGES_KEY, JSON.stringify(filtered));
  }

  static async updateTask(packageId: string, taskId: string, updates: Partial<RelocationTask>): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    const pkg = await this.getPackageById(packageId);

    const tasks = pkg.tasks.map((task) => {
      if (task.taskId === taskId) {
        return {
          ...task,
          ...updates,
          completionDate: updates.status === 'completed' ? new Date() : task.completionDate,
        };
      }
      return task;
    });

    return this.updatePackage(packageId, { tasks });
  }

  static async addVendor(packageId: string, vendor: RelocationVendor): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    const pkg = await this.getPackageById(packageId);

    pkg.vendors.push(vendor);

    return this.updatePackage(packageId, {
      vendors: pkg.vendors,
    });
  }

  static async recordExpense(packageId: string, category: string, amount: number): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    const pkg = await this.getPackageById(packageId);

    const newActualSpent = pkg.actualSpent + amount;
    const newRemainingBudget = pkg.approvedBudget - newActualSpent;

    // Update budget breakdown
    const budgetItem = pkg.budgetBreakdown.find((item) => item.category === category);
    if (budgetItem) {
      budgetItem.actualCost += amount;
      budgetItem.variance = budgetItem.estimatedCost - budgetItem.actualCost;
    }

    return this.updatePackage(packageId, {
      actualSpent: newActualSpent,
      remainingBudget: newRemainingBudget,
      budgetBreakdown: pkg.budgetBreakdown,
    });
  }

  static async completePackage(packageId: string, satisfaction: number, feedback?: string): Promise<RelocationPackage> {
    // TODO: Replace with actual API call
    return this.updatePackage(packageId, {
      status: 'completed',
      completionDate: new Date(),
      employeeSatisfaction: satisfaction,
      feedback,
      feedbackReceived: true,
    });
  }
}

// ============================================================================
// Expat Tax Manager Service
// ============================================================================

export class ExpatTaxService {
  private static PROFILES_KEY = 'mobility_expat_tax_profiles';
  private static PROJECTIONS_KEY = 'mobility_tax_projections';

  // Tax Profiles
  static async getTaxProfiles(employeeId?: string): Promise<ExpatTaxProfile[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.PROFILES_KEY);
    const profiles: ExpatTaxProfile[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      return profiles.filter((profile) => profile.employeeId === employeeId);
    }
    return profiles;
  }

  static async getTaxProfileById(profileId: string): Promise<ExpatTaxProfile> {
    // TODO: Replace with actual API call
    const profiles = await this.getTaxProfiles();
    const profile = profiles.find((p) => p.profileId === profileId);
    if (!profile) throw new Error('Tax profile not found');
    return profile;
  }

  static async createTaxProfile(profile: ExpatTaxProfile): Promise<ExpatTaxProfile> {
    // TODO: Replace with actual API call
    const profiles = await this.getTaxProfiles();

    const newProfile = {
      ...profile,
      complianceStatus: 'pending',
      audit: {
        createdAt: new Date(),
        createdBy: profile.employeeId,
        updatedAt: new Date(),
        updatedBy: profile.employeeId,
      },
    };

    profiles.push(newProfile);
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    return newProfile;
  }

  static async updateTaxProfile(profileId: string, updates: Partial<ExpatTaxProfile>): Promise<ExpatTaxProfile> {
    // TODO: Replace with actual API call
    const profiles = await this.getTaxProfiles();
    const index = profiles.findIndex((p) => p.profileId === profileId);
    if (index === -1) throw new Error('Tax profile not found');

    const updated = {
      ...profiles[index],
      ...updates,
      audit: {
        ...profiles[index].audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    profiles[index] = updated;
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
    return updated;
  }

  static async deleteTaxProfile(profileId: string): Promise<void> {
    // TODO: Replace with actual API call
    const profiles = await this.getTaxProfiles();
    const filtered = profiles.filter((p) => p.profileId !== profileId);
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(filtered));
  }

  // Tax Returns
  static async createTaxReturn(profileId: string, taxReturn: TaxReturn): Promise<ExpatTaxProfile> {
    // TODO: Replace with actual API call
    const profile = await this.getTaxProfileById(profileId);

    const newReturn = {
      ...taxReturn,
      audit: {
        createdAt: new Date(),
        createdBy: 'current-user',
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };

    profile.taxReturns.push(newReturn);

    return this.updateTaxProfile(profileId, {
      taxReturns: profile.taxReturns,
    });
  }

  static async updateTaxReturn(profileId: string, returnId: string, updates: Partial<TaxReturn>): Promise<ExpatTaxProfile> {
    // TODO: Replace with actual API call
    const profile = await this.getTaxProfileById(profileId);

    const taxReturns = profile.taxReturns.map((tr) => {
      if (tr.returnId === returnId) {
        return {
          ...tr,
          ...updates,
          audit: {
            ...tr.audit,
            updatedAt: new Date(),
            updatedBy: 'current-user',
          },
        };
      }
      return tr;
    });

    return this.updateTaxProfile(profileId, { taxReturns });
  }

  static async fileTaxReturn(profileId: string, returnId: string): Promise<ExpatTaxProfile> {
    // TODO: Replace with actual API call
    const updates: Partial<TaxReturn> = {
      filingStatus: 'filed',
      filingDate: new Date(),
      filedBy: 'current-user',
    };

    return this.updateTaxReturn(profileId, returnId, updates);
  }

  static async calculateTaxLiability(profileId: string, taxYear: number): Promise<number> {
    // TODO: Replace with actual tax calculation logic
    const profile = await this.getTaxProfileById(profileId);

    // Simple calculation for demonstration
    const totalIncome = profile.incomeSources
      .filter((source) => source.isTaxable)
      .reduce((sum, source) => sum + source.amount, 0);

    const totalDeductions = profile.deductions
      .filter((ded) => ded.isApproved)
      .reduce((sum, ded) => sum + ded.amount, 0);

    const totalCredits = profile.credits
      .filter((credit) => credit.isApproved)
      .reduce((sum, credit) => sum + credit.amount, 0);

    const taxableIncome = totalIncome - totalDeductions;
    const taxLiability = Math.max(0, taxableIncome * 0.25 - totalCredits); // 25% flat rate for demo

    return taxLiability;
  }

  // Tax Projections
  static async getProjections(employeeId?: string): Promise<TaxProjection[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.PROJECTIONS_KEY);
    const projections: TaxProjection[] = data ? JSON.parse(data) : [];

    if (employeeId) {
      return projections.filter((proj) => proj.employeeId === employeeId);
    }
    return projections;
  }

  static async createProjection(projection: TaxProjection): Promise<TaxProjection> {
    // TODO: Replace with actual API call
    const projections = await this.getProjections();

    const newProjection = {
      ...projection,
      projectionDate: new Date(),
    };

    projections.push(newProjection);
    localStorage.setItem(this.PROJECTIONS_KEY, JSON.stringify(projections));
    return newProjection;
  }

  static async calculateProjection(profileId: string, taxYear: number): Promise<TaxProjection> {
    // TODO: Replace with actual projection logic
    const profile = await this.getTaxProfileById(profileId);

    const projectedGrossIncome = profile.incomeSources.reduce((sum, source) => sum + source.amount, 0);
    const projectedDeductions = profile.deductions.reduce((sum, ded) => sum + ded.amount, 0);
    const projectedTaxableIncome = projectedGrossIncome - projectedDeductions;

    const homeCountryTax = projectedTaxableIncome * 0.25; // 25% for demo
    const hostCountryTax = projectedTaxableIncome * 0.30; // 30% for demo
    const totalTaxLiability = homeCountryTax + hostCountryTax;

    const hypotheticalTax = profile.hypotheticalTax;
    const taxEqualizationAdjustment = totalTaxLiability - hypotheticalTax;

    const projection: TaxProjection = {
      projectionId: `proj-${Date.now()}`,
      employeeId: profile.employeeId,
      taxYear,
      projectionDate: new Date(),
      projectedGrossIncome,
      projectedDeductions,
      projectedTaxableIncome,
      homeCountryTaxLiability: homeCountryTax,
      hostCountryTaxLiability: hostCountryTax,
      totalTaxLiability,
      hypotheticalTax,
      actualTax: totalTaxLiability,
      taxEqualizationAdjustment,
      employeeNetImpact: -taxEqualizationAdjustment,
      companyNetCost: taxEqualizationAdjustment,
      currency: profile.currency,
      assumptions: [
        'Assumes current income levels remain constant',
        'Does not account for tax law changes',
        'Foreign tax credits not included',
      ],
      confidenceLevel: 'medium',
      scenarios: [],
    };

    return this.createProjection(projection);
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class MobilityAnalyticsService {
  static async getAnalytics(period: string): Promise<MobilityAnalytics> {
    // TODO: Replace with actual API call
    const visaApplications = await VisaImmigrationService.getVisaApplications();
    const relocationPackages = await RelocationPackageService.getPackages();
    const taxProfiles = await ExpatTaxService.getTaxProfiles();

    return {
      period: period as any,
      periodStart: new Date(new Date().setDate(1)),
      periodEnd: new Date(),

      visaMetrics: {
        totalApplications: visaApplications.length,
        approvedApplications: visaApplications.filter((app) => app.applicationStatus === 'approved').length,
        rejectedApplications: visaApplications.filter((app) => app.applicationStatus === 'rejected').length,
        pendingApplications: visaApplications.filter((app) =>
          ['submitted', 'under_review', 'in_preparation'].includes(app.applicationStatus)
        ).length,
        approvalRate: (visaApplications.filter((app) => app.applicationStatus === 'approved').length / visaApplications.length || 1) * 100,
        averageProcessingTime: visaApplications
          .filter((app) => app.actualProcessingTime)
          .reduce((sum, app) => sum + (app.actualProcessingTime || 0), 0) / visaApplications.length || 0,
        totalCost: visaApplications.reduce((sum, app) => sum + app.totalCost, 0),
        currency: 'USD',
      },

      relocationMetrics: {
        totalRelocations: relocationPackages.length,
        domesticRelocations: relocationPackages.filter((pkg) => pkg.assignmentType === 'domestic').length,
        internationalRelocations: relocationPackages.filter((pkg) => pkg.assignmentType === 'international').length,
        activeRelocations: relocationPackages.filter((pkg) => pkg.status === 'active').length,
        completedRelocations: relocationPackages.filter((pkg) => pkg.status === 'completed').length,
        averageCost: relocationPackages.reduce((sum, pkg) => sum + pkg.actualSpent, 0) / relocationPackages.length || 0,
        totalCost: relocationPackages.reduce((sum, pkg) => sum + pkg.actualSpent, 0),
        employeeSatisfaction: relocationPackages
          .filter((pkg) => pkg.employeeSatisfaction)
          .reduce((sum, pkg) => sum + (pkg.employeeSatisfaction || 0), 0) / relocationPackages.length || 0,
        currency: 'USD',
      },

      taxMetrics: {
        totalExpatProfiles: taxProfiles.length,
        taxReturnsToFile: taxProfiles.reduce((sum, profile) =>
          sum + profile.taxReturns.filter((tr) => tr.filingStatus !== 'filed').length, 0
        ),
        taxReturnsFiled: taxProfiles.reduce((sum, profile) =>
          sum + profile.taxReturns.filter((tr) => tr.filingStatus === 'filed').length, 0
        ),
        taxReturnsOverdue: taxProfiles.reduce((sum, profile) =>
          sum + profile.taxReturns.filter((tr) =>
            tr.filingStatus !== 'filed' && new Date(tr.filingDeadline) < new Date()
          ).length, 0
        ),
        totalTaxLiability: 0,
        totalEqualizationCost: 0,
        currency: 'USD',
      },

      assignmentMetrics: {
        totalAssignments: relocationPackages.length,
        shortTermAssignments: 0,
        longTermAssignments: 0,
        permanentAssignments: relocationPackages.filter((pkg) => pkg.relocationType === 'permanent').length,
        topDestinations: [],
        topOrigins: [],
      },
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class MobilitySettingsService {
  private static SETTINGS_KEY = 'mobility_settings';

  static async getSettings(): Promise<MobilitySettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(this.SETTINGS_KEY);
    if (data) return JSON.parse(data);

    return this.getDefaultSettings();
  }

  static async updateSettings(updates: Partial<MobilitySettings>): Promise<MobilitySettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      audit: {
        ...settings.audit,
        updatedAt: new Date(),
        updatedBy: 'current-user',
      },
    };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    return updated;
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
