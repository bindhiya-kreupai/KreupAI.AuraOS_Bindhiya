/**
 * Education Module Services
 * Handles all business logic for Faculty Tenure, Research Grants, and Adjunct Management
 */

import {
  FacultyMember, TenureApplication, ResearchGrant, AdjunctFaculty, AdjunctContract,
  AdjunctPool, EducationSettings, GrantReport, FacultyEvaluation
} from './types';

const STORAGE_KEYS = {
  FACULTY_MEMBERS: 'education_faculty_members',
  TENURE_APPLICATIONS: 'education_tenure_applications',
  RESEARCH_GRANTS: 'education_research_grants',
  GRANT_REPORTS: 'education_grant_reports',
  ADJUNCT_FACULTY: 'education_adjunct_faculty',
  ADJUNCT_CONTRACTS: 'education_adjunct_contracts',
  ADJUNCT_POOLS: 'education_adjunct_pools',
  SETTINGS: 'education_settings',
} as const;

// ============================================================================
// 1. FACULTY TENURE SERVICE
// ============================================================================

export class FacultyTenureService {
  static async getAllFaculty(): Promise<FacultyMember[]> {
    const data = localStorage.getItem(STORAGE_KEYS.FACULTY_MEMBERS);
    return data ? JSON.parse(data) : [];
  }

  static async getFacultyById(facultyId: string): Promise<FacultyMember | null> {
    const faculty = await this.getAllFaculty();
    return faculty.find(f => f.facultyId === facultyId) || null;
  }

  static async createFaculty(facultyData: Partial<FacultyMember>): Promise<FacultyMember> {
    const faculty = await this.getAllFaculty();
    const newFaculty: FacultyMember = {
      facultyId: `faculty-${Date.now()}`,
      employeeId: facultyData.employeeId || '',
      facultyName: facultyData.facultyName || '',
      email: facultyData.email || '',
      department: facultyData.department || '',
      rank: facultyData.rank || 'instructor',
      tenureStatus: facultyData.tenureStatus || 'not_eligible',
      appointmentType: facultyData.appointmentType || 'tenure_track',
      hireDate: facultyData.hireDate || new Date().toISOString(),
      teachingLoad: facultyData.teachingLoad || { currentSemester: { semester: '', year: 0, courses: [], totalCredits: 0, studentCount: 0 }, annualLoad: 0, courseHistory: [], studentEvaluationAverage: 0 },
      researchActivities: facultyData.researchActivities || [],
      publications: facultyData.publications || [],
      serviceActivities: facultyData.serviceActivities || [],
      evaluations: facultyData.evaluations || [],
      awards: facultyData.awards || [],
      status: facultyData.status || 'active',
      createdAt: new Date().toISOString(),
      ...facultyData,
    };
    faculty.push(newFaculty);
    localStorage.setItem(STORAGE_KEYS.FACULTY_MEMBERS, JSON.stringify(faculty));
    return newFaculty;
  }

  static async updateFaculty(facultyId: string, updates: Partial<FacultyMember>): Promise<FacultyMember> {
    const faculty = await this.getAllFaculty();
    const index = faculty.findIndex(f => f.facultyId === facultyId);
    if (index === -1) throw new Error('Faculty not found');

    faculty[index] = { ...faculty[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FACULTY_MEMBERS, JSON.stringify(faculty));
    return faculty[index];
  }

  static async addPublication(facultyId: string, publication: any): Promise<FacultyMember> {
    const faculty = await this.getFacultyById(facultyId);
    if (!faculty) throw new Error('Faculty not found');

    const newPublication = {
      publicationId: `pub-${Date.now()}`,
      ...publication,
    };

    return this.updateFaculty(facultyId, {
      publications: [...faculty.publications, newPublication],
    });
  }

  static async addEvaluation(facultyId: string, evaluation: FacultyEvaluation): Promise<FacultyMember> {
    const faculty = await this.getFacultyById(facultyId);
    if (!faculty) throw new Error('Faculty not found');

    return this.updateFaculty(facultyId, {
      evaluations: [...faculty.evaluations, evaluation],
    });
  }

  static async getAllTenureApplications(): Promise<TenureApplication[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TENURE_APPLICATIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getApplicationById(applicationId: string): Promise<TenureApplication | null> {
    const applications = await this.getAllTenureApplications();
    return applications.find(a => a.applicationId === applicationId) || null;
  }

  static async createTenureApplication(applicationData: Partial<TenureApplication>): Promise<TenureApplication> {
    const applications = await this.getAllTenureApplications();
    const newApplication: TenureApplication = {
      applicationId: `app-${Date.now()}`,
      facultyId: applicationData.facultyId || '',
      facultyName: applicationData.facultyName || '',
      department: applicationData.department || '',
      currentRank: applicationData.currentRank || 'assistant_professor',
      requestedRank: applicationData.requestedRank || 'associate_professor',
      submissionDate: applicationData.submissionDate || new Date().toISOString(),
      reviewDeadline: applicationData.reviewDeadline || '',
      dossier: applicationData.dossier || { teachingPortfolio: { philosophy: '', syllabi: [], evaluations: [], innovations: [] }, researchPortfolio: { statement: '', publications: [], grants: [], presentations: [], collaborations: [] }, servicePortfolio: { statement: '', activities: [], leadership: [], mentoring: [] }, supportingDocuments: [], externalReviewers: [] },
      reviewProcess: applicationData.reviewProcess || { stages: [], currentStage: '', timeline: [], committees: [], votes: [] },
      status: applicationData.status || 'draft',
      createdAt: new Date().toISOString(),
      ...applicationData,
    };
    applications.push(newApplication);
    localStorage.setItem(STORAGE_KEYS.TENURE_APPLICATIONS, JSON.stringify(applications));
    return newApplication;
  }

  static async updateTenureApplication(applicationId: string, updates: Partial<TenureApplication>): Promise<TenureApplication> {
    const applications = await this.getAllTenureApplications();
    const index = applications.findIndex(a => a.applicationId === applicationId);
    if (index === -1) throw new Error('Application not found');

    applications[index] = { ...applications[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TENURE_APPLICATIONS, JSON.stringify(applications));
    return applications[index];
  }

  static async submitApplication(applicationId: string): Promise<TenureApplication> {
    return this.updateTenureApplication(applicationId, {
      status: 'submitted',
      submissionDate: new Date().toISOString(),
    });
  }

  static async recordCommitteeVote(applicationId: string, vote: any): Promise<TenureApplication> {
    const application = await this.getApplicationById(applicationId);
    if (!application) throw new Error('Application not found');

    const newVote = {
      voteId: `vote-${Date.now()}`,
      voteDate: new Date().toISOString(),
      ...vote,
    };

    return this.updateTenureApplication(applicationId, {
      reviewProcess: {
        ...application.reviewProcess,
        votes: [...application.reviewProcess.votes, newVote],
      },
    });
  }

  static async recordDecision(applicationId: string, decision: any): Promise<TenureApplication> {
    return this.updateTenureApplication(applicationId, {
      decision: {
        decisionId: `dec-${Date.now()}`,
        decisionDate: new Date().toISOString(),
        notificationSent: false,
        ...decision,
      },
      status: decision.finalDecision === 'approved' ? 'approved' : 'denied',
    });
  }
}

// ============================================================================
// 2. RESEARCH GRANTS SERVICE
// ============================================================================

export class ResearchGrantsService {
  static async getAllGrants(): Promise<ResearchGrant[]> {
    const data = localStorage.getItem(STORAGE_KEYS.RESEARCH_GRANTS);
    return data ? JSON.parse(data) : [];
  }

  static async getGrantById(grantId: string): Promise<ResearchGrant | null> {
    const grants = await this.getAllGrants();
    return grants.find(g => g.grantId === grantId) || null;
  }

  static async createGrant(grantData: Partial<ResearchGrant>): Promise<ResearchGrant> {
    const grants = await this.getAllGrants();
    const grantNumber = `GRT-${Date.now()}`;
    const newGrant: ResearchGrant = {
      grantId: `grant-${Date.now()}`,
      grantNumber,
      grantTitle: grantData.grantTitle || '',
      grantType: grantData.grantType || 'federal',
      fundingAgency: grantData.fundingAgency || { agencyId: '', agencyName: '', agencyType: 'federal' },
      principalInvestigator: grantData.principalInvestigator || { facultyId: '', name: '', email: '', department: '', role: 'pi', effortPercentage: 0, responsibilities: [] },
      coInvestigators: grantData.coInvestigators || [],
      department: grantData.department || '',
      submissionDate: grantData.submissionDate || new Date().toISOString(),
      duration: grantData.duration || 12,
      requestedAmount: grantData.requestedAmount || 0,
      indirectCosts: grantData.indirectCosts || 0,
      directCosts: grantData.directCosts || 0,
      budget: grantData.budget || { totalBudget: 0, directCosts: [], indirectCosts: { rate: 0, base: 0, total: 0, rationale: '' }, budgetJustification: '' },
      status: grantData.status || 'draft',
      compliance: grantData.compliance || { irbRequired: false, iacucRequired: false, environmentalReview: false, humanSubjects: false, animalSubjects: false, exportControl: false, dataManagementPlan: false, conflictOfInterest: [] },
      milestones: grantData.milestones || [],
      deliverables: grantData.deliverables || [],
      financials: grantData.financials || { accountNumber: '', totalAwarded: 0, totalExpended: 0, totalCommitted: 0, availableBalance: 0, expenditures: [], invoices: [], reimbursements: [] },
      reports: grantData.reports || [],
      publications: grantData.publications || [],
      personnel: grantData.personnel || [],
      equipment: grantData.equipment || [],
      createdAt: new Date().toISOString(),
      ...grantData,
    };
    grants.push(newGrant);
    localStorage.setItem(STORAGE_KEYS.RESEARCH_GRANTS, JSON.stringify(grants));
    return newGrant;
  }

  static async updateGrant(grantId: string, updates: Partial<ResearchGrant>): Promise<ResearchGrant> {
    const grants = await this.getAllGrants();
    const index = grants.findIndex(g => g.grantId === grantId);
    if (index === -1) throw new Error('Grant not found');

    grants[index] = { ...grants[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RESEARCH_GRANTS, JSON.stringify(grants));
    return grants[index];
  }

  static async submitGrant(grantId: string): Promise<ResearchGrant> {
    return this.updateGrant(grantId, {
      status: 'submitted',
      submissionDate: new Date().toISOString(),
    });
  }

  static async awardGrant(grantId: string, awardedAmount: number, startDate: string, endDate: string): Promise<ResearchGrant> {
    const grant = await this.getGrantById(grantId);
    if (!grant) throw new Error('Grant not found');

    return this.updateGrant(grantId, {
      status: 'awarded',
      awardedAmount,
      startDate,
      endDate,
      financials: {
        ...grant.financials,
        totalAwarded: awardedAmount,
        availableBalance: awardedAmount,
      },
    });
  }

  static async recordExpenditure(grantId: string, expenditure: any): Promise<ResearchGrant> {
    const grant = await this.getGrantById(grantId);
    if (!grant) throw new Error('Grant not found');

    const newExpenditure = {
      expenditureId: `exp-${Date.now()}`,
      date: new Date().toISOString(),
      ...expenditure,
    };

    const totalExpended = grant.financials.totalExpended + expenditure.amount;
    const availableBalance = grant.financials.totalAwarded - totalExpended;

    return this.updateGrant(grantId, {
      financials: {
        ...grant.financials,
        expenditures: [...grant.financials.expenditures, newExpenditure],
        totalExpended,
        availableBalance,
      },
    });
  }

  static async addMilestone(grantId: string, milestone: any): Promise<ResearchGrant> {
    const grant = await this.getGrantById(grantId);
    if (!grant) throw new Error('Grant not found');

    const newMilestone = {
      milestoneId: `milestone-${Date.now()}`,
      status: 'not_started',
      ...milestone,
    };

    return this.updateGrant(grantId, {
      milestones: [...grant.milestones, newMilestone],
    });
  }

  static async updateMilestone(grantId: string, milestoneId: string, updates: any): Promise<ResearchGrant> {
    const grant = await this.getGrantById(grantId);
    if (!grant) throw new Error('Grant not found');

    const milestones = grant.milestones.map(m =>
      m.milestoneId === milestoneId ? { ...m, ...updates } : m
    );

    return this.updateGrant(grantId, { milestones });
  }

  static async getAllReports(): Promise<GrantReport[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GRANT_REPORTS);
    return data ? JSON.parse(data) : [];
  }

  static async createReport(reportData: Partial<GrantReport>): Promise<GrantReport> {
    const reports = await this.getAllReports();
    const newReport: GrantReport = {
      reportId: `report-${Date.now()}`,
      reportType: reportData.reportType || 'progress',
      reportingPeriod: reportData.reportingPeriod || { startDate: '', endDate: '' },
      dueDate: reportData.dueDate || '',
      status: 'not_started',
      accomplishments: reportData.accomplishments || [],
      challenges: reportData.challenges || [],
      nextSteps: reportData.nextSteps || [],
      ...reportData,
    };
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEYS.GRANT_REPORTS, JSON.stringify(reports));
    return newReport;
  }

  static async submitReport(reportId: string): Promise<GrantReport> {
    const reports = await this.getAllReports();
    const index = reports.findIndex(r => r.reportId === reportId);
    if (index === -1) throw new Error('Report not found');

    reports[index].status = 'submitted';
    reports[index].submittedDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GRANT_REPORTS, JSON.stringify(reports));
    return reports[index];
  }
}

// ============================================================================
// 3. ADJUNCT MANAGEMENT SERVICE
// ============================================================================

export class AdjunctManagementService {
  static async getAllAdjuncts(): Promise<AdjunctFaculty[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ADJUNCT_FACULTY);
    return data ? JSON.parse(data) : [];
  }

  static async getAdjunctById(adjunctId: string): Promise<AdjunctFaculty | null> {
    const adjuncts = await this.getAllAdjuncts();
    return adjuncts.find(a => a.adjunctId === adjunctId) || null;
  }

  static async createAdjunct(adjunctData: Partial<AdjunctFaculty>): Promise<AdjunctFaculty> {
    const adjuncts = await this.getAllAdjuncts();
    const newAdjunct: AdjunctFaculty = {
      adjunctId: `adjunct-${Date.now()}`,
      employeeId: adjunctData.employeeId || '',
      name: adjunctData.name || '',
      email: adjunctData.email || '',
      department: adjunctData.department || '',
      expertise: adjunctData.expertise || [],
      qualifications: adjunctData.qualifications || [],
      employmentStatus: adjunctData.employmentStatus || 'new',
      contractType: adjunctData.contractType || 'per_course',
      contracts: adjunctData.contracts || [],
      courseHistory: adjunctData.courseHistory || [],
      availability: adjunctData.availability || { preferredDays: [], preferredTimes: [], maxCourses: 2, maxCredits: 6, willingToTeachOnline: false, campusPreferences: [] },
      compensation: adjunctData.compensation || { rateType: 'per_course', baseRate: 0, bonuses: [], totalEarnings: 0, fiscalYear: new Date().getFullYear() },
      evaluations: adjunctData.evaluations || [],
      onboardingStatus: adjunctData.onboardingStatus || { applicationSubmitted: false, backgroundCheckCompleted: false, credentialsVerified: false, orientationCompleted: false, technologyTrainingCompleted: false, lmsAccessGranted: false, facultyIdIssued: false, status: 'not_started' },
      professionalDevelopment: adjunctData.professionalDevelopment || [],
      status: adjunctData.status || 'active',
      createdAt: new Date().toISOString(),
      ...adjunctData,
    };
    adjuncts.push(newAdjunct);
    localStorage.setItem(STORAGE_KEYS.ADJUNCT_FACULTY, JSON.stringify(adjuncts));
    return newAdjunct;
  }

  static async updateAdjunct(adjunctId: string, updates: Partial<AdjunctFaculty>): Promise<AdjunctFaculty> {
    const adjuncts = await this.getAllAdjuncts();
    const index = adjuncts.findIndex(a => a.adjunctId === adjunctId);
    if (index === -1) throw new Error('Adjunct not found');

    adjuncts[index] = { ...adjuncts[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ADJUNCT_FACULTY, JSON.stringify(adjuncts));
    return adjuncts[index];
  }

  static async verifyCredentials(adjunctId: string, qualificationId: string, verifiedBy: string): Promise<AdjunctFaculty> {
    const adjunct = await this.getAdjunctById(adjunctId);
    if (!adjunct) throw new Error('Adjunct not found');

    const qualifications = adjunct.qualifications.map(q =>
      q.qualificationId === qualificationId
        ? { ...q, verified: true, verifiedBy, verifiedDate: new Date().toISOString() }
        : q
    );

    return this.updateAdjunct(adjunctId, { qualifications });
  }

  static async getAllContracts(): Promise<AdjunctContract[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ADJUNCT_CONTRACTS);
    return data ? JSON.parse(data) : [];
  }

  static async getContractById(contractId: string): Promise<AdjunctContract | null> {
    const contracts = await this.getAllContracts();
    return contracts.find(c => c.contractId === contractId) || null;
  }

  static async createContract(contractData: Partial<AdjunctContract>): Promise<AdjunctContract> {
    const contracts = await this.getAllContracts();
    const contractNumber = `ADJ-CON-${Date.now()}`;
    const newContract: AdjunctContract = {
      contractId: `contract-${Date.now()}`,
      contractNumber,
      contractType: contractData.contractType || 'per_course',
      academicYear: contractData.academicYear || '',
      startDate: contractData.startDate || '',
      endDate: contractData.endDate || '',
      courses: contractData.courses || [],
      totalCompensation: contractData.totalCompensation || 0,
      paymentSchedule: contractData.paymentSchedule || { totalAmount: 0, installments: [], paymentMethod: 'direct_deposit' },
      terms: contractData.terms || { teachingResponsibilities: [], officeHours: '', assessmentRequirements: [], professionalConduct: [], termination: { noticePeriod: 30, conditions: [] } },
      status: contractData.status || 'draft',
      createdAt: new Date().toISOString(),
      ...contractData,
    };
    contracts.push(newContract);
    localStorage.setItem(STORAGE_KEYS.ADJUNCT_CONTRACTS, JSON.stringify(contracts));
    return newContract;
  }

  static async updateContract(contractId: string, updates: Partial<AdjunctContract>): Promise<AdjunctContract> {
    const contracts = await this.getAllContracts();
    const index = contracts.findIndex(c => c.contractId === contractId);
    if (index === -1) throw new Error('Contract not found');

    contracts[index] = { ...contracts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ADJUNCT_CONTRACTS, JSON.stringify(contracts));
    return contracts[index];
  }

  static async signContract(contractId: string, signedBy: string): Promise<AdjunctContract> {
    return this.updateContract(contractId, {
      status: 'pending_approval',
      signedDate: new Date().toISOString(),
      signedBy,
    });
  }

  static async approveContract(contractId: string, approvedBy: string): Promise<AdjunctContract> {
    return this.updateContract(contractId, {
      status: 'active',
      approvedBy,
      approvalDate: new Date().toISOString(),
    });
  }

  static async processPayment(contractId: string, installmentNumber: number): Promise<AdjunctContract> {
    const contract = await this.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');

    const paymentSchedule = { ...contract.paymentSchedule };
    const installment = paymentSchedule.installments.find(i => i.installmentNumber === installmentNumber);
    if (!installment) throw new Error('Installment not found');

    installment.status = 'paid';
    installment.paidDate = new Date().toISOString();

    return this.updateContract(contractId, { paymentSchedule });
  }

  static async getAllPools(): Promise<AdjunctPool[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ADJUNCT_POOLS);
    return data ? JSON.parse(data) : [];
  }

  static async getPoolByDepartment(department: string): Promise<AdjunctPool | null> {
    const pools = await this.getAllPools();
    return pools.find(p => p.department === department) || null;
  }

  static async updatePool(poolId: string, updates: Partial<AdjunctPool>): Promise<AdjunctPool> {
    const pools = await this.getAllPools();
    const index = pools.findIndex(p => p.poolId === poolId);
    if (index === -1) throw new Error('Pool not found');

    pools[index] = { ...pools[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ADJUNCT_POOLS, JSON.stringify(pools));
    return pools[index];
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class EducationSettingsService {
  static async getSettings(): Promise<EducationSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : this.getDefaultSettings();
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
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  }
}
