/**
 * Domain Events — CloudEvents Spec 1.0
 *
 * All AuraOS domain events follow the CloudEvents specification v1.0.
 * Each event is identified by a structured type string:
 *   com.auraos.<domain>.<action>
 *
 * @module @aura/events
 * @see https://cloudevents.io/
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// CloudEvents Base Interface
// ---------------------------------------------------------------------------

export interface CloudDomainEvent {
  /** Unique identifier for the event */
  id: string;
  /** Source of the event (service URN) */
  source: string;
  /** Structured event type */
  type: string;
  /** Subject of the event (aggregate ID) */
  subject: string;
  /** ISO 8601 timestamp */
  time: string;
  /** Event payload */
  data: Record<string, unknown>;
  /** MIME type of the data */
  datacontenttype: 'application/json';
  /** CloudEvents spec version */
  specversion: '1.0';
  /** Multi-tenant isolation key */
  tenantId: string;
  /** Cross-service correlation ID */
  correlationId: string;
  /** Optional causation ID linking to the triggering event */
  causationId?: string;
  /** Optional schema URI for the data payload */
  dataschema?: string;
}

// ---------------------------------------------------------------------------
// Employee Events
// ---------------------------------------------------------------------------

export type EmployeeDomainEventType =
  | 'com.auraos.employee.created'
  | 'com.auraos.employee.updated'
  | 'com.auraos.employee.onboarded'
  | 'com.auraos.employee.terminated'
  | 'com.auraos.employee.transferred'
  | 'com.auraos.employee.promoted';

export interface EmployeeCreatedData extends Record<string, unknown> {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  designationId: string;
  managerId?: string;
  joinDate: string;
  employmentType: string;
}

export interface EmployeeUpdatedData extends Record<string, unknown> {
  employeeId: string;
  changes: Record<string, { previous: unknown; current: unknown }>;
  updatedBy: string;
}

export interface EmployeeOnboardedData extends Record<string, unknown> {
  employeeId: string;
  onboardingTasksCompleted: string[];
  documentsSubmitted: string[];
  systemAccessGranted: boolean;
}

export interface EmployeeTerminatedData extends Record<string, unknown> {
  employeeId: string;
  exitDate: string;
  exitReason: string;
  noticePeriodDays: number;
  gratuityAmount: number;
  leaveEncashmentAmount: number;
  finalSettlementDate?: string;
}

export interface EmployeeTransferredData extends Record<string, unknown> {
  employeeId: string;
  fromDepartmentId: string;
  toDepartmentId: string;
  fromLocationId?: string;
  toLocationId?: string;
  effectiveDate: string;
  reason: string;
}

export interface EmployeePromotedData extends Record<string, unknown> {
  employeeId: string;
  fromDesignationId: string;
  toDesignationId: string;
  fromGrade?: string;
  toGrade?: string;
  salaryRevision: { from: number; to: number; currency: string };
  effectiveDate: string;
}

// ---------------------------------------------------------------------------
// Leave Events
// ---------------------------------------------------------------------------

export type LeaveDomainEventType =
  | 'com.auraos.leave.requested'
  | 'com.auraos.leave.approved'
  | 'com.auraos.leave.rejected'
  | 'com.auraos.leave.cancelled'
  | 'com.auraos.leave.accrual_processed';

export interface LeaveRequestedData extends Record<string, unknown> {
  leaveRequestId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  halfDay: boolean;
  reason: string;
}

export interface LeaveApprovedData extends Record<string, unknown> {
  leaveRequestId: string;
  employeeId: string;
  approvedBy: string;
  approvalDate: string;
  balanceAfter: number;
}

export interface LeaveRejectedData extends Record<string, unknown> {
  leaveRequestId: string;
  employeeId: string;
  rejectedBy: string;
  rejectionReason: string;
}

export interface LeaveCancelledData extends Record<string, unknown> {
  leaveRequestId: string;
  employeeId: string;
  cancelledBy: string;
  cancellationReason: string;
  balanceRestored: number;
}

export interface LeaveAccrualProcessedData extends Record<string, unknown> {
  batchId: string;
  period: string;
  employeesProcessed: number;
  totalDaysAccrued: number;
}

// ---------------------------------------------------------------------------
// Payroll Events
// ---------------------------------------------------------------------------

export type PayrollDomainEventType =
  | 'com.auraos.payroll.run_created'
  | 'com.auraos.payroll.calculated'
  | 'com.auraos.payroll.finalized'
  | 'com.auraos.payroll.paid'
  | 'com.auraos.payroll.reversed';

export interface PayrollRunCreatedData extends Record<string, unknown> {
  payrollRunId: string;
  period: string;
  payFrequency: string;
  employeeCount: number;
  createdBy: string;
}

export interface PayrollCalculatedData extends Record<string, unknown> {
  payrollRunId: string;
  period: string;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  currency: string;
  employeeCount: number;
}

export interface PayrollFinalizedData extends Record<string, unknown> {
  payrollRunId: string;
  finalizedBy: string;
  finalizedAt: string;
  totalDisbursementAmount: number;
  currency: string;
}

export interface PayrollPaidData extends Record<string, unknown> {
  payrollRunId: string;
  paymentDate: string;
  paymentMethod: string;
  transactionIds: string[];
  totalAmount: number;
  currency: string;
}

export interface PayrollReversedData extends Record<string, unknown> {
  payrollRunId: string;
  reversedBy: string;
  reversalReason: string;
  originalPeriod: string;
}

// ---------------------------------------------------------------------------
// Attendance Events
// ---------------------------------------------------------------------------

export type AttendanceDomainEventType =
  | 'com.auraos.attendance.clocked_in'
  | 'com.auraos.attendance.clocked_out'
  | 'com.auraos.attendance.anomaly_detected'
  | 'com.auraos.attendance.regularized';

export interface AttendanceClockedInData extends Record<string, unknown> {
  attendanceId: string;
  employeeId: string;
  clockInTime: string;
  locationId?: string;
  geoCoordinates?: { lat: number; lng: number };
  method: 'biometric' | 'mobile' | 'web' | 'kiosk';
}

export interface AttendanceClockedOutData extends Record<string, unknown> {
  attendanceId: string;
  employeeId: string;
  clockOutTime: string;
  totalWorkMinutes: number;
  overtimeMinutes: number;
}

export interface AttendanceAnomalyDetectedData extends Record<string, unknown> {
  attendanceId: string;
  employeeId: string;
  anomalyType: 'impossible_travel' | 'rapid_reclocking' | 'location_mismatch' | 'time_gap';
  severity: 'low' | 'medium' | 'high';
  details: Record<string, unknown>;
}

export interface AttendanceRegularizedData extends Record<string, unknown> {
  attendanceId: string;
  employeeId: string;
  regularizedBy: string;
  reason: string;
  originalEntry: Record<string, unknown>;
  correctedEntry: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Document Events
// ---------------------------------------------------------------------------

export type DocumentDomainEventType =
  | 'com.auraos.document.uploaded'
  | 'com.auraos.document.signed'
  | 'com.auraos.document.expired'
  | 'com.auraos.document.archived';

export interface DocumentUploadedData extends Record<string, unknown> {
  documentId: string;
  employeeId?: string;
  documentType: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey: string;
  uploadedBy: string;
}

export interface DocumentSignedData extends Record<string, unknown> {
  documentId: string;
  signedBy: string;
  signedAt: string;
  signatureMethod: 'docusign' | 'adobesign' | 'digital' | 'wet';
  signatureHash?: string;
}

export interface DocumentExpiredData extends Record<string, unknown> {
  documentId: string;
  documentType: string;
  expiryDate: string;
  employeeId?: string;
  notificationSent: boolean;
}

export interface DocumentArchivedData extends Record<string, unknown> {
  documentId: string;
  archivedBy: string;
  archivalReason: string;
  retentionUntil: string;
}

// ---------------------------------------------------------------------------
// Notification Events
// ---------------------------------------------------------------------------

export type NotificationDomainEventType =
  | 'com.auraos.notification.sent'
  | 'com.auraos.notification.delivered'
  | 'com.auraos.notification.failed'
  | 'com.auraos.notification.read';

export interface NotificationSentData extends Record<string, unknown> {
  notificationId: string;
  recipientId: string;
  channel: 'email' | 'sms' | 'push' | 'in_app' | 'slack' | 'teams';
  templateId: string;
  subject?: string;
}

export interface NotificationDeliveredData extends Record<string, unknown> {
  notificationId: string;
  recipientId: string;
  deliveredAt: string;
  channel: string;
}

export interface NotificationFailedData extends Record<string, unknown> {
  notificationId: string;
  recipientId: string;
  channel: string;
  errorCode: string;
  errorMessage: string;
  retryCount: number;
}

export interface NotificationReadData extends Record<string, unknown> {
  notificationId: string;
  recipientId: string;
  readAt: string;
}

// ---------------------------------------------------------------------------
// Workflow Events
// ---------------------------------------------------------------------------

export type WorkflowDomainEventType =
  | 'com.auraos.workflow.started'
  | 'com.auraos.workflow.step_completed'
  | 'com.auraos.workflow.completed'
  | 'com.auraos.workflow.failed'
  | 'com.auraos.workflow.escalated';

export interface WorkflowStartedData extends Record<string, unknown> {
  workflowId: string;
  workflowDefinitionId: string;
  initiatedBy: string;
  entityType: string;
  entityId: string;
}

export interface WorkflowStepCompletedData extends Record<string, unknown> {
  workflowId: string;
  stepId: string;
  stepName: string;
  completedBy: string;
  decision: 'approved' | 'rejected' | 'delegated' | 'skipped';
  comments?: string;
}

export interface WorkflowCompletedData extends Record<string, unknown> {
  workflowId: string;
  finalOutcome: 'approved' | 'rejected' | 'cancelled';
  completedAt: string;
  totalDurationMs: number;
}

export interface WorkflowFailedData extends Record<string, unknown> {
  workflowId: string;
  failedStepId: string;
  errorCode: string;
  errorMessage: string;
}

export interface WorkflowEscalatedData extends Record<string, unknown> {
  workflowId: string;
  stepId: string;
  escalatedTo: string;
  escalationReason: 'sla_breach' | 'manual' | 'absence';
  originalAssigneeId: string;
}

// ---------------------------------------------------------------------------
// Compliance Events
// ---------------------------------------------------------------------------

export type ComplianceDomainEventType =
  | 'com.auraos.compliance.violation_detected'
  | 'com.auraos.compliance.report_generated'
  | 'com.auraos.compliance.filing_submitted';

export interface ComplianceViolationDetectedData extends Record<string, unknown> {
  violationId: string;
  complianceType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  entityType: string;
  entityId: string;
  description: string;
  regulatoryReference?: string;
}

export interface ComplianceReportGeneratedData extends Record<string, unknown> {
  reportId: string;
  reportType: string;
  period: string;
  generatedBy: string;
  storageKey: string;
}

export interface ComplianceFilingSubmittedData extends Record<string, unknown> {
  filingId: string;
  authority: string;
  filingType: string;
  period: string;
  submittedBy: string;
  confirmationNumber?: string;
}

// ---------------------------------------------------------------------------
// Benefits Events
// ---------------------------------------------------------------------------

export type BenefitsDomainEventType =
  | 'com.auraos.benefits.enrolled'
  | 'com.auraos.benefits.claim_submitted'
  | 'com.auraos.benefits.claim_adjudicated';

export interface BenefitsEnrolledData extends Record<string, unknown> {
  enrollmentId: string;
  employeeId: string;
  planId: string;
  planType: 'health' | 'dental' | 'vision' | 'life' | 'hsa' | 'fsa' | '401k';
  coverageStartDate: string;
  employeeContribution: number;
  employerContribution: number;
  currency: string;
}

export interface BenefitsClaimSubmittedData extends Record<string, unknown> {
  claimId: string;
  employeeId: string;
  planId: string;
  claimType: string;
  claimAmount: number;
  currency: string;
  serviceDate: string;
  documents: string[];
}

export interface BenefitsClaimAdjudicatedData extends Record<string, unknown> {
  claimId: string;
  employeeId: string;
  adjudicatedBy: string;
  decision: 'approved' | 'partially_approved' | 'denied';
  approvedAmount: number;
  denialReason?: string;
  currency: string;
}

// ---------------------------------------------------------------------------
// Union of All Domain Event Types
// ---------------------------------------------------------------------------

export type AuraDomainEventType =
  | EmployeeDomainEventType
  | LeaveDomainEventType
  | PayrollDomainEventType
  | AttendanceDomainEventType
  | DocumentDomainEventType
  | NotificationDomainEventType
  | WorkflowDomainEventType
  | ComplianceDomainEventType
  | BenefitsDomainEventType;

// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------

/**
 * Create a CloudEvents-compliant domain event.
 */
export function createCloudEvent<T extends Record<string, unknown>>(params: {
  type: AuraDomainEventType;
  source: string;
  subject: string;
  data: T;
  tenantId: string;
  correlationId?: string;
  causationId?: string;
}): CloudDomainEvent {
  return {
    id: randomUUID(),
    specversion: '1.0',
    datacontenttype: 'application/json',
    type: params.type,
    source: params.source,
    subject: params.subject,
    time: new Date().toISOString(),
    data: params.data,
    tenantId: params.tenantId,
    correlationId: params.correlationId ?? randomUUID(),
    causationId: params.causationId,
  };
}
