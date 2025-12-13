/**
 * Benefits Management Module - Type Definitions
 *
 * Comprehensive TypeScript interfaces for benefits management including:
 * - Benefit Plans & Types
 * - Enrollment & Eligibility
 * - Claims & Providers
 * - Dependents & Coverage
 * - Premium & Cost Sharing
 */

// ============================================================================
// ENUMS & STATUS TYPES
// ============================================================================

export type BenefitCategory =
    | 'health_insurance'
    | 'dental'
    | 'vision'
    | 'life_insurance'
    | 'disability'
    | 'retirement'
    | 'fsa_hsa'
    | 'wellness'
    | 'other';

export type PlanTier = 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type CoverageLevel = 'employee_only' | 'employee_spouse' | 'employee_children' | 'family';

export type EnrollmentStatus =
    | 'not_started'
    | 'in_progress'
    | 'submitted'
    | 'confirmed'
    | 'active'
    | 'cancelled'
    | 'expired';

export type EnrollmentType = 'new_hire' | 'annual' | 'qualifying_event' | 'rehire';

export type ClaimStatus =
    | 'submitted'
    | 'pending_review'
    | 'approved'
    | 'partially_approved'
    | 'denied'
    | 'paid'
    | 'appealed';

export type DependentRelationship =
    | 'spouse'
    | 'domestic_partner'
    | 'child'
    | 'stepchild'
    | 'adopted_child'
    | 'foster_child'
    | 'legal_guardian';

export type DependentStatus = 'active' | 'pending_verification' | 'verified' | 'inactive' | 'aged_out';

export type ProviderType = 'in_network' | 'out_of_network' | 'preferred';

export type QualifyingEventType =
    | 'marriage'
    | 'divorce'
    | 'birth'
    | 'adoption'
    | 'death'
    | 'loss_of_coverage'
    | 'employment_change';

export type PremiumPaymentFrequency = 'monthly' | 'semi_monthly' | 'biweekly' | 'weekly';

export type BenefitPlanStatus = 'active' | 'inactive' | 'draft' | 'archived';

export type EligibilityStatus = 'eligible' | 'ineligible' | 'pending' | 'conditional';

// ============================================================================
// BENEFIT PLAN
// ============================================================================

export interface BenefitPlan {
    id: string;
    planCode: string;
    name: string;
    description: string;
    category: BenefitCategory;
    tier: PlanTier;

    // Plan Details
    carrierName: string;
    carrierId: string;
    policyNumber: string;
    groupNumber: string;

    // Coverage
    coverageLevels: CoverageLevel[];
    annualCoverageLimit?: number;
    lifetimeCoverageLimit?: number;
    deductible: {
        individual: number;
        family: number;
        inNetwork: number;
        outOfNetwork: number;
    };
    outOfPocketMax: {
        individual: number;
        family: number;
    };
    coinsurance: {
        inNetwork: number; // Percentage
        outOfNetwork: number; // Percentage
    };
    copay: {
        primaryCare?: number;
        specialist?: number;
        urgentCare?: number;
        emergencyRoom?: number;
        genericDrug?: number;
        brandDrug?: number;
    };

    // Cost
    premiumRates: PremiumRate[];

    // Eligibility
    eligibilityRules: EligibilityRule[];
    waitingPeriod: number; // Days

    // Features
    features: string[];
    exclusions: string[];
    networkProviders: string[];

    // Plan Documents
    documents: BenefitDocument[];

    // Metadata
    planYear: string; // e.g., "2025"
    effectiveDate: string;
    expiryDate: string;
    status: BenefitPlanStatus;
    isRecommended: boolean;
    displayOrder: number;

    // Audit
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy?: string;
}

export interface PremiumRate {
    id: string;
    benefitPlanId: string;
    coverageLevel: CoverageLevel;
    ageMin?: number;
    ageMax?: number;
    location?: string;

    // Costs
    employeeContribution: number; // Per pay period
    employerContribution: number; // Per pay period
    totalPremium: number; // Per pay period

    // Payment
    paymentFrequency: PremiumPaymentFrequency;

    effectiveDate: string;
    expiryDate: string;
}

export interface BenefitDocument {
    id: string;
    name: string;
    type: 'summary_plan_description' | 'certificate_of_coverage' | 'evidence_of_coverage' | 'rider' | 'other';
    url: string;
    uploadedDate: string;
    fileSize: number;
}

// ============================================================================
// ELIGIBILITY
// ============================================================================

export interface EligibilityRule {
    id: string;
    name: string;
    description: string;

    // Criteria
    employmentType?: string[]; // ['full_time', 'part_time']
    jobLevel?: string[]; // ['entry', 'mid', 'senior', 'executive']
    department?: string[];
    location?: string[];

    minTenure?: number; // Days
    minHoursPerWeek?: number;

    // Age requirements
    minAge?: number;
    maxAge?: number;

    // Exclusions
    excludedPositions?: string[];
    excludedDepartments?: string[];

    isActive: boolean;
    priority: number;
}

export interface EmployeeEligibility {
    id: string;
    employeeId: string;
    employeeName: string;
    benefitPlanId: string;
    benefitPlanName: string;

    status: EligibilityStatus;
    reason: string;

    eligibleDate: string;
    ineligibleReasons?: string[];

    calculatedAt: string;
}

// ============================================================================
// ENROLLMENT
// ============================================================================

export interface EnrollmentWindow {
    id: string;
    name: string;
    type: EnrollmentType;
    planYear: string;

    // Dates
    startDate: string;
    endDate: string;
    effectiveDate: string; // When coverage starts

    // Eligibility
    eligibleEmployees: string[]; // Employee IDs

    // Configuration
    allowedBenefitCategories: BenefitCategory[];
    requiresDependentVerification: boolean;
    reminderSchedule: string[]; // ISO dates for reminders

    // Status
    isActive: boolean;
    completionRate: number; // Percentage
    enrolledCount: number;
    eligibleCount: number;

    // Notifications
    notificationsSent: number;

    // Audit
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface BenefitEnrollment {
    id: string;
    enrollmentNumber: string;

    // Employee Info
    employeeId: string;
    employeeName: string;
    employeeEmail: string;

    // Enrollment Context
    enrollmentWindowId: string;
    enrollmentType: EnrollmentType;
    qualifyingEventId?: string;

    // Plan Selection
    benefitPlanId: string;
    benefitPlanName: string;
    coverageLevel: CoverageLevel;

    // Dependents
    dependents: EnrolledDependent[];

    // Cost
    employeeContribution: number; // Per pay period
    employerContribution: number; // Per pay period
    totalPremium: number; // Per pay period
    annualCost: number;

    // Coverage Period
    effectiveDate: string;
    expiryDate: string;

    // Status & Workflow
    status: EnrollmentStatus;
    submittedDate?: string;
    confirmedDate?: string;
    approvedBy?: string;
    approvedDate?: string;

    // Evidence of Insurability (for life/disability)
    requiresEOI: boolean;
    eoiStatus?: 'pending' | 'submitted' | 'approved' | 'denied';
    eoiSubmittedDate?: string;

    // Waived Coverage
    isWaived: boolean;
    waiverReason?: string;
    waiverDate?: string;

    // Documents
    documents: EnrollmentDocument[];

    // Notes
    notes?: string;

    // Audit
    createdAt: string;
    updatedAt: string;
}

export interface EnrolledDependent {
    dependentId: string;
    name: string;
    relationship: DependentRelationship;
    dateOfBirth: string;
    ssn?: string;
    isVerified: boolean;
}

export interface EnrollmentDocument {
    id: string;
    name: string;
    type: 'dependent_verification' | 'marriage_certificate' | 'birth_certificate' | 'adoption_papers' | 'other';
    url: string;
    uploadedDate: string;
}

// ============================================================================
// DEPENDENTS
// ============================================================================

export interface Dependent {
    id: string;
    employeeId: string;

    // Personal Info
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    ssn?: string;

    // Relationship
    relationship: DependentRelationship;

    // Address (if different from employee)
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };

    // Contact
    phone?: string;
    email?: string;

    // Student Status (for dependent eligibility)
    isStudent: boolean;
    studentInfo?: {
        schoolName: string;
        expectedGraduation: string;
        isFullTime: boolean;
    };

    // Disability Status
    isDisabled: boolean;
    disabilityDescription?: string;

    // Verification
    status: DependentStatus;
    verificationDocuments: DependentDocument[];
    verifiedDate?: string;
    verifiedBy?: string;

    // Coverage
    enrolledPlans: string[]; // Benefit Plan IDs

    // Audit
    createdAt: string;
    updatedAt: string;
}

export interface DependentDocument {
    id: string;
    type: 'birth_certificate' | 'marriage_certificate' | 'adoption_papers' | 'custody_agreement' | 'disability_certification' | 'student_id' | 'other';
    name: string;
    url: string;
    uploadedDate: string;
    isVerified: boolean;
    verifiedDate?: string;
}

// ============================================================================
// CLAIMS
// ============================================================================

export interface BenefitClaim {
    id: string;
    claimNumber: string;

    // Employee Info
    employeeId: string;
    employeeName: string;
    enrollmentId: string;
    benefitPlanId: string;
    benefitPlanName: string;

    // Claim Details
    serviceDate: string;
    submittedDate: string;
    providerName: string;
    providerId: string;
    providerType: ProviderType;

    // Patient
    patientName: string; // Employee or dependent
    patientRelationship: 'self' | DependentRelationship;

    // Amounts
    claimedAmount: number;
    approvedAmount: number;
    deductibleApplied: number;
    coinsuranceApplied: number;
    copayApplied: number;
    paidAmount: number;
    patientResponsibility: number;

    // Diagnosis & Treatment
    diagnosisCodes: string[];
    procedureCodes: string[];
    treatmentDescription: string;

    // Status & Processing
    status: ClaimStatus;
    statusReason?: string;
    processedDate?: string;
    processedBy?: string;
    paymentDate?: string;

    // Denial/Appeal
    denialReason?: string;
    appealDate?: string;
    appealStatus?: 'pending' | 'approved' | 'denied';
    appealResolution?: string;

    // Documents
    receipts: ClaimDocument[];
    explanationOfBenefits?: string; // URL to EOB

    // Notes
    notes?: string;

    // Audit
    createdAt: string;
    updatedAt: string;
}

export interface ClaimDocument {
    id: string;
    type: 'receipt' | 'invoice' | 'prescription' | 'medical_report' | 'referral' | 'other';
    name: string;
    url: string;
    uploadedDate: string;
}

// ============================================================================
// PROVIDERS
// ============================================================================

export interface HealthcareProvider {
    id: string;

    // Provider Info
    name: string;
    type: 'hospital' | 'clinic' | 'physician' | 'specialist' | 'pharmacy' | 'dental' | 'vision' | 'other';
    specialty?: string;

    // Network
    providerType: ProviderType;
    networkIds: string[];
    acceptedBenefitPlanIds: string[];

    // Contact
    phone: string;
    email?: string;
    website?: string;

    // Address
    address: {
        street: string;
        suite?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };

    // Location
    coordinates?: {
        latitude: number;
        longitude: number;
    };

    // Hours
    hours?: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
    };

    // Ratings
    rating?: number; // 1-5
    reviewCount?: number;

    // Accepting Patients
    acceptingNewPatients: boolean;

    // Languages
    languagesSpoken?: string[];

    // Accessibility
    wheelchairAccessible: boolean;

    // Status
    isActive: boolean;

    // Audit
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// QUALIFYING LIFE EVENTS
// ============================================================================

export interface QualifyingEvent {
    id: string;

    // Employee
    employeeId: string;
    employeeName: string;

    // Event Details
    eventType: QualifyingEventType;
    eventDate: string;
    description: string;

    // Enrollment Window
    specialEnrollmentWindowStart: string;
    specialEnrollmentWindowEnd: string; // Typically 30 or 60 days after event

    // Verification
    requiresDocumentation: boolean;
    documents: QualifyingEventDocument[];
    isVerified: boolean;
    verifiedDate?: string;
    verifiedBy?: string;

    // Enrollment Changes
    allowedChanges: string[]; // e.g., ['add_dependent', 'change_coverage_level', 'enroll_in_plan']
    enrollmentChanges: string[]; // Enrollment IDs affected

    // Status
    status: 'pending' | 'verified' | 'expired' | 'denied';

    // Audit
    reportedDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface QualifyingEventDocument {
    id: string;
    type: 'marriage_certificate' | 'divorce_decree' | 'birth_certificate' | 'death_certificate' | 'loss_of_coverage_letter' | 'other';
    name: string;
    url: string;
    uploadedDate: string;
}

// ============================================================================
// PREMIUM & COST SHARING
// ============================================================================

export interface PremiumDeduction {
    id: string;

    // Employee & Enrollment
    employeeId: string;
    enrollmentId: string;
    benefitPlanId: string;

    // Payroll Period
    payrollPeriodStart: string;
    payrollPeriodEnd: string;
    payDate: string;

    // Amounts
    employeeContribution: number;
    employerContribution: number;
    totalPremium: number;

    // Pre-Tax/Post-Tax
    isPreTax: boolean;
    taxSavings?: number;

    // Adjustment
    isAdjustment: boolean;
    adjustmentReason?: string;
    originalDeductionId?: string;

    // Status
    status: 'pending' | 'processed' | 'cancelled' | 'reversed';
    processedDate?: string;

    // Audit
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// BENEFIT SETTINGS & CONFIGURATION
// ============================================================================

export interface BenefitSettings {
    id: string;
    organizationId: string;

    // Enrollment
    defaultEnrollmentWindowDays: number; // e.g., 30 days
    requireDependentVerification: boolean;
    allowMidYearChanges: boolean;
    qualifyingEventWindowDays: number; // e.g., 60 days

    // New Hire
    newHireEnrollmentPeriodDays: number; // e.g., 30 days from hire
    newHireWaitingPeriodDays: number; // Days before eligible

    // Costs
    defaultPaymentFrequency: PremiumPaymentFrequency;
    allowEmployerContributionVariance: boolean;

    // Compliance
    requireACACompliance: boolean;
    requireCOBRANotifications: boolean;
    requireHIPAACompliance: boolean;

    // Notifications
    sendEnrollmentReminders: boolean;
    reminderDaysBefore: number[];
    sendCoverageChangeNotifications: boolean;

    // Providers
    enableProviderDirectory: boolean;
    requireInNetworkPreAuthorization: boolean;

    // Claims
    enableOnlineClaims: boolean;
    requireClaimReceipts: boolean;
    claimSubmissionDeadlineDays: number;

    // Audit
    updatedAt: string;
    updatedBy: string;
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export interface BenefitStats {
    // Enrollment
    totalEnrollments: number;
    activeEnrollments: number;
    enrollmentRate: number; // Percentage

    // By Category
    enrollmentsByCategory: Record<BenefitCategory, number>;

    // By Plan
    enrollmentsByPlan: {
        planId: string;
        planName: string;
        count: number;
        percentage: number;
    }[];

    // Costs
    totalPremiums: number;
    employeeContributions: number;
    employerContributions: number;
    averagePremiumPerEmployee: number;

    // Claims
    totalClaims: number;
    approvedClaims: number;
    deniedClaims: number;
    totalClaimAmount: number;
    totalPaidAmount: number;
    averageClaimAmount: number;
    claimApprovalRate: number; // Percentage

    // Dependents
    totalDependents: number;
    averageDependentsPerEmployee: number;

    // Trending
    enrollmentTrend: 'increasing' | 'decreasing' | 'stable';
    costTrend: 'increasing' | 'decreasing' | 'stable';
}

// ============================================================================
// TOAST NOTIFICATION (for UI feedback)
// ============================================================================

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
