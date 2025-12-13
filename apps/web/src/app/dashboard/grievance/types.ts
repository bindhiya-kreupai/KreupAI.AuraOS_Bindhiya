// Grievance Management Module Types
export type GrievanceType = 'harassment' | 'discrimination' | 'compensation' | 'work_environment' | 'manager_conflict' | 'policy_violation' | 'safety' | 'workload' | 'career_growth' | 'benefits' | 'other';
export type GrievanceSeverity = 'low' | 'medium' | 'high' | 'critical';
export type GrievanceStatus = 'submitted' | 'acknowledged' | 'under_investigation' | 'pending_resolution' | 'resolved' | 'closed' | 'escalated' | 'rejected';
export type EscalationLevel = 'manager' | 'hr' | 'senior_management' | 'executive' | 'legal';
export type ResolutionType = 'mediation' | 'policy_change' | 'training' | 'disciplinary_action' | 'counseling' | 'transfer' | 'compensation' | 'apology' | 'other';

export interface Grievance {
  id: string;
  grievanceCode: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  submittedDate: string;
  grievanceType: GrievanceType;
  severity: GrievanceSeverity;
  status: GrievanceStatus;
  subject: string;
  description: string;
  against?: string;
  againstType?: 'employee' | 'manager' | 'department' | 'policy' | 'system';
  isAnonymous: boolean;
  isConfidential: boolean;
  attachments?: string[];
  assignedTo?: string;
  assignedToName?: string;
  currentEscalationLevel: EscalationLevel;
  targetResolutionDate?: string;
  actualResolutionDate?: string;
  daysOpen: number;
  updates: GrievanceUpdate[];
  investigation?: Investigation;
  resolution?: Resolution;
  satisfactionRating?: number;
  employeeFeedback?: string;
  createdDate: string;
  lastModified: string;
}

export interface GrievanceUpdate {
  id: string;
  updateDate: string;
  updatedBy: string;
  updatedByName: string;
  updateType: 'status_change' | 'comment' | 'escalation' | 'assignment' | 'resolution';
  previousStatus?: GrievanceStatus;
  newStatus?: GrievanceStatus;
  comments: string;
  isVisibleToEmployee: boolean;
  attachments?: string[];
}

export interface Investigation {
  id: string;
  grievanceId: string;
  investigatorId: string;
  investigatorName: string;
  startDate: string;
  endDate?: string;
  status: 'initiated' | 'in_progress' | 'completed';
  witnesses: Witness[];
  evidence: Evidence[];
  findings: string;
  recommendations: string[];
  reportUrl?: string;
  createdDate: string;
}

export interface Witness {
  id: string;
  witnessId?: string;
  witnessName: string;
  role: string;
  interviewDate: string;
  statement: string;
  isConfidential: boolean;
}

export interface Evidence {
  id: string;
  evidenceType: 'document' | 'email' | 'message' | 'photo' | 'video' | 'audio' | 'other';
  description: string;
  fileUrl: string;
  uploadedDate: string;
  uploadedBy: string;
}

export interface Resolution {
  id: string;
  grievanceId: string;
  resolutionType: ResolutionType;
  resolutionDate: string;
  resolvedBy: string;
  resolvedByName: string;
  description: string;
  actionsTaken: string[];
  preventiveMeasures: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  employeeNotified: boolean;
  notificationDate?: string;
  createdDate: string;
}

export interface GrievancePolicy {
  id: string;
  policyName: string;
  description: string;
  isActive: boolean;
  allowAnonymous: boolean;
  autoAssignmentEnabled: boolean;
  escalationEnabled: boolean;
  escalationDays: number;
  resolutionSLA: { [key in GrievanceSeverity]: number };
  notifyManager: boolean;
  notifyHR: boolean;
  requireInvestigation: GrievanceType[];
  createdBy: string;
  createdDate: string;
}

export interface GrievanceMetrics {
  totalGrievances: number;
  openGrievances: number;
  resolvedGrievances: number;
  averageResolutionDays: number;
  grievancesByType: { type: GrievanceType; count: number }[];
  grievancesBySeverity: { severity: GrievanceSeverity; count: number }[];
  grievancesByDepartment: { departmentId: string; departmentName: string; count: number }[];
  resolutionRate: number;
  satisfactionScore: number;
  escalationRate: number;
  repeatGrievances: number;
}

export interface GrievanceSettings {
  allowAnonymousGrievances: boolean;
  requireManagerNotification: boolean;
  autoEscalationEnabled: boolean;
  escalationThresholdDays: number;
  slaTracking: boolean;
  satisfactionSurveyEnabled: boolean;
  confidentialityByDefault: boolean;
  notificationEmail: string;
  hrEmail: string;
}
