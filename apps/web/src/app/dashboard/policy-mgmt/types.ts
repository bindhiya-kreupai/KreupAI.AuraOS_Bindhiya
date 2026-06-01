export type PolicyStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type AcknowledgementStatus = 'pending' | 'acknowledged' | 'overdue';
export interface Policy { policyId: string; policyName: string; policyNumber: string; category: string; version: number; effectiveDate: string; expiryDate?: string; content: string; approvers: Approver[]; acknowledgements: Acknowledgement[]; status: PolicyStatus; createdBy: string; createdAt: string; updatedAt?: string; }
export interface Approver { approverId: string; approverName: string; role: string; approvalDate?: string; status: 'pending' | 'approved' | 'rejected'; comments?: string; }
export interface Acknowledgement { employeeId: string; employeeName: string; acknowledgedDate?: string; status: AcknowledgementStatus; remindersSent: number; }
export interface PolicySettings { settingsId: string; organizationId: string; approvalSettings: { levelsRequired: number; autoReminder: boolean; }; distributionSettings: { autoDistribute: boolean; reminderFrequencyDays: number; }; complianceSettings: { trackAcknowledgement: boolean; overdueThresholdDays: number; }; notifications: { policyPublished: boolean; acknowledgementDue: boolean; approvalRequired: boolean; }; updatedAt: string; }
export interface PolicyAlert { alertId: string; alertType: 'approval' | 'acknowledgement' | 'expiry'; severity: 'low' | 'medium' | 'high'; title: string; message: string; relatedEntity: { entityType: string; entityId: string; }; status: 'active' | 'resolved'; createdAt: string; }
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
