export type CredentialStatus = 'active' | 'expired' | 'pending' | 'suspended' | 'revoked';
export type LicenseType = 'medical' | 'nursing' | 'pharmacy' | 'allied_health';
export type ShiftType = 'day' | 'evening' | 'night' | 'rotating';
export type StaffingStatus = 'adequate' | 'understaffed' | 'overstaffed' | 'critical';

export interface HealthcareProvider {
  providerId: string;
  providerNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
  };
  specialty: string;
  credentials: Credential[];
  licenses: ProfessionalLicense[];
  certifications: Certification[];
  education: Education[];
  workHistory: WorkHistory[];
  references: Reference[];
  status: CredentialStatus;
  nextReviewDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Credential {
  credentialId: string;
  credentialType: string;
  credentialNumber: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  status: CredentialStatus;
  verificationDate?: string;
  verifiedBy?: string;
  documents: string[];
}

export interface ProfessionalLicense {
  licenseId: string;
  licenseType: LicenseType;
  licenseNumber: string;
  issuingState: string;
  issueDate: string;
  expiryDate: string;
  status: CredentialStatus;
  restrictions?: string[];
  primarySourceVerification: boolean;
  verificationDate?: string;
}

export interface Certification {
  certificationId: string;
  certificationName: string;
  certifyingBody: string;
  certificationNumber: string;
  issueDate: string;
  expiryDate: string;
  status: CredentialStatus;
  requiresRenewal: boolean;
  renewalDate?: string;
  cmeCredits?: number;
}

export interface Education {
  educationId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  verified: boolean;
  verificationDate?: string;
}

export interface WorkHistory {
  historyId: string;
  employer: string;
  position: string;
  specialty: string;
  startDate: string;
  endDate?: string;
  reasonForLeaving?: string;
  verified: boolean;
  verificationDate?: string;
}

export interface Reference {
  referenceId: string;
  name: string;
  title: string;
  organization: string;
  phone: string;
  email: string;
  relationship: string;
  contacted: boolean;
  contactDate?: string;
  recommendation: 'highly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
}

export interface NurseSchedule {
  scheduleId: string;
  scheduleName: string;
  startDate: string;
  endDate: string;
  shifts: NurseShift[];
  staffingRequirements: StaffingRequirement[];
  status: 'draft' | 'published' | 'active' | 'completed';
  publishedDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NurseShift {
  shiftId: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  duration: number;
  unit: string;
  requiredStaff: number;
  assignedStaff: StaffAssignment[];
  breakSchedule: Break[];
  status: 'open' | 'filled' | 'overstaffed' | 'understaffed';
}

export interface StaffAssignment {
  assignmentId: string;
  nurseId: string;
  nurseName: string;
  role: string;
  assignmentStatus: 'confirmed' | 'pending' | 'declined' | 'cancelled';
  confirmedDate?: string;
  notes?: string;
}

export interface Break {
  breakType: 'meal' | 'rest';
  duration: number;
  startTime: string;
}

export interface StaffingRequirement {
  requirementId: string;
  unit: string;
  shiftType: ShiftType;
  requiredRNs: number;
  requiredLPNs: number;
  requiredCNAs: number;
  actualRNs: number;
  actualLPNs: number;
  actualCNAs: number;
  patientCensus: number;
  acuityLevel: number;
  status: StaffingStatus;
}

export interface LocumProvider {
  locumId: string;
  providerId: string;
  providerName: string;
  specialty: string;
  licenses: string[];
  availability: LocumAvailability;
  rates: LocumRates;
  assignments: LocumAssignment[];
  performanceRating: number;
  completedAssignments: number;
  status: 'available' | 'on_assignment' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface LocumAvailability {
  startDate: string;
  endDate?: string;
  preferredLocations: string[];
  blackoutDates: string[];
  minimumDuration: number;
  maximumDuration: number;
  willingToTravel: boolean;
  maxTravelDistance?: number;
}

export interface LocumRates {
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  overtimeMultiplier: number;
  travelExpenses: boolean;
  housingAllowance?: number;
}

export interface LocumAssignment {
  assignmentId: string;
  locumId: string;
  facility: string;
  unit: string;
  specialty: string;
  startDate: string;
  endDate: string;
  duration: number;
  shiftSchedule: LocumShift[];
  rate: number;
  totalCompensation: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  contract: AssignmentContract;
  timesheet: Timesheet[];
  performanceReview?: PerformanceReview;
  createdAt: string;
}

export interface LocumShift {
  shiftDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  overtime: number;
}

export interface AssignmentContract {
  contractId: string;
  startDate: string;
  endDate: string;
  terms: string[];
  compensation: number;
  signedDate?: string;
  signedBy?: string;
  documentUrl?: string;
}

export interface Timesheet {
  timesheetId: string;
  weekEnding: string;
  shifts: TimesheetShift[];
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  totalPay: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  submittedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
}

export interface TimesheetShift {
  date: string;
  startTime: string;
  endTime: string;
  regularHours: number;
  overtimeHours: number;
  breakMinutes: number;
}

export interface PerformanceReview {
  reviewId: string;
  reviewDate: string;
  reviewer: string;
  clinicalCompetence: number;
  professionalism: number;
  communication: number;
  teamwork: number;
  reliability: number;
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  wouldRehire: boolean;
  comments: string;
}

export interface HealthcareSettings {
  settingsId: string;
  organizationId: string;
  credentialingSettings: {
    verificationRequired: boolean;
    renewalReminderDays: number;
    expiryAlertDays: number;
  };
  rosteringSettings: {
    advanceSchedulingDays: number;
    shiftSwapAllowed: boolean;
    overtimeThreshold: number;
  };
  locumSettings: {
    minimumNoticeDays: number;
    cancellationPenalty: number;
    performanceReviewRequired: boolean;
  };
  notifications: {
    credentialExpiry: boolean;
    schedulePublished: boolean;
    shiftReminders: boolean;
    timesheetDue: boolean;
  };
  updatedAt: string;
}

export interface HealthcareAlert {
  alertId: string;
  alertType: 'credential_expiry' | 'understaffing' | 'timesheet_overdue' | 'license_renewal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedEntity: { entityType: string; entityId: string; entityName: string };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
