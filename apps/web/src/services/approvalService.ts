/**
 * @module approvalService
 * @description Unified Approval service backed by real manager approval APIs
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

export type ApprovalType =
  | 'expense'
  | 'employment-history'
  | 'inter-company-transfer'
  | 'leave'
  | 'overtime'
  | 'exit'
  | 'attendance'
  | 'comp-off'
  | 'confirmation'
  | 'shift-swap';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'escalated';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface ApprovalAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface ApprovalComment {
  id: string;
  by: string;
  byName: string;
  date: string;
  text: string;
  isInternal: boolean;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'escalated' | 'withdrawn' | 'commented';
  by: string;
  byName: string;
  date: string;
  remarks?: string;
  level?: number;
}

export interface LeaveDetails {
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  leaveBalance?: number;
  handoverTo?: string;
}

export interface OvertimeDetails {
  overtimeDate: string;
  totalHours: number;
  overtimeType: string;
  reason: string;
}

export interface ExitDetails {
  exitType: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
}

export interface AttendanceDetails {
  attendanceDate: string;
  regularizationType: string;
  requestedClockIn?: string;
  requestedClockOut?: string;
  reason: string;
  rejectionReason?: string;
}

export interface ExpenseDetails {
  expenseDate: string;
  expenseCategory: string;
  totalAmount: number;
  currency: string;
  businessPurpose: string;
  description?: string;
  receiptUrl?: string;
  rejectionReason?: string;
}

export interface EmploymentHistoryDetails {
  changeType: string;
  effectiveDate: string;
  reason?: string;
  notes?: string;
  previousDepartment?: string;
  newDepartment?: string;
  previousJobProfile?: string;
  newJobProfile?: string;
  previousGrade?: string;
  newGrade?: string;
  previousLocation?: string;
  newLocation?: string;
  previousManagerId?: string;
  newManagerId?: string;
  previousSalary?: number;
  newSalary?: number;
  previousEmploymentType?: string;
  newEmploymentType?: string;
}

export interface InterCompanyTransferDetails {
  transferType: string;
  effectiveDate: string;
  fromCompanyId: string;
  fromCompanyName: string;
  toCompanyId: string;
  toCompanyName: string;
  requestedBy: string;
  approvedBy?: string;
  status: string;
}

export interface CompOffDetails {
  workedDate: string;
  workedHours: number;
  creditedDays: number;
  expiryDate: string;
  reason: string;
  projectCode?: string;
  remainingDays?: number;
}

export interface ConfirmationDetails {
  eligibleDate: string;
  requestedDate: string;
  managerApproval: string;
  hrApproval: string;
  confirmationDate?: string;
  newSalary?: number;
}

export interface ShiftSwapDetails {
  requestorDate: string;
  swapWithDate: string;
  requestorShiftId: string;
  swapWithShiftId: string;
  swapWithId: string;
  peerApproval: string;
  managerApproval: string;
  reason: string;
  rejectionReason?: string;
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  requestedByDept: string;
  requestedByAvatar?: string;
  requestDate: string;
  status: ApprovalStatus;
  priority: Priority;
  dueDate?: string;
  details:
    | ExpenseDetails
    | EmploymentHistoryDetails
    | InterCompanyTransferDetails
    | LeaveDetails
    | OvertimeDetails
    | ExitDetails
    | AttendanceDetails
    | CompOffDetails
    | ConfirmationDetails
    | ShiftSwapDetails;
  currentLevel: number;
  totalLevels: number;
  comments: ApprovalComment[];
  history: ApprovalHistoryEntry[];
  attachments: ApprovalAttachment[];
}

export interface ApprovalSummary {
  expense: number;
  'employment-history': number;
  'inter-company-transfer': number;
  leave: number;
  overtime: number;
  exit: number;
  attendance: number;
  'comp-off': number;
  confirmation: number;
  'shift-swap': number;
  total: number;
}

interface ManagerApprovalResponseItem {
  requestId: string;
  requestType: ApprovalType;
  requestTitle: string;
  requestDate: string;
  requestedBy: string;
  requestedByName: string;
  requestedByDepartment: string;
  approvalStatus: ApprovalStatus;
  priority?: Priority;
  dueDate?: string;
  details?: Record<string, unknown>;
  comments?: ApprovalComment[];
  history?: ApprovalHistoryEntry[];
  attachments?: ApprovalAttachment[];
  currentApproverLevel?: number;
  totalApproverLevels?: number;
}

interface ManagerApprovalsResponse {
  approvals: ManagerApprovalResponseItem[];
  summary: ApprovalSummary;
}

export const APPROVAL_TYPE_CONFIG: Record<
  ApprovalType,
  { label: string; color: string; bgColor: string }
> = {
  expense: {
    label: 'Expense Claim',
    color: 'text-quantum-rose',
    bgColor: 'bg-quantum-rose/10',
  },
  'employment-history': {
    label: 'Employment Change',
    color: 'text-orbit-gold',
    bgColor: 'bg-orbit-gold/10',
  },
  'inter-company-transfer': {
    label: 'Company Transfer',
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
  },
  leave: {
    label: 'Leave Request',
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
  },
  overtime: {
    label: 'Overtime Request',
    color: 'text-sunset-amber',
    bgColor: 'bg-sunset-amber/10',
  },
  exit: {
    label: 'Exit Request',
    color: 'text-coral-alert',
    bgColor: 'bg-coral-alert/10',
  },
  attendance: {
    label: 'Attendance Regularization',
    color: 'text-nebula-purple',
    bgColor: 'bg-nebula-purple/10',
  },
  'comp-off': {
    label: 'Comp-Off Request',
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/10',
  },
  confirmation: {
    label: 'Confirmation Request',
    color: 'text-sky-azure',
    bgColor: 'bg-sky-azure/10',
  },
  'shift-swap': {
    label: 'Shift Swap Request',
    color: 'text-aurora-teal',
    bgColor: 'bg-aurora-teal/10',
  },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> =
  {
    low: { label: 'Low', color: 'text-silver-mist', bgColor: 'bg-silver-mist/10' },
    medium: { label: 'Medium', color: 'text-sunset-amber', bgColor: 'bg-sunset-amber/10' },
    high: { label: 'High', color: 'text-coral-alert', bgColor: 'bg-coral-alert/10' },
    critical: { label: 'Critical', color: 'text-coral-alert', bgColor: 'bg-coral-alert/20' },
  };

export const STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: 'Pending', color: 'text-sunset-amber', bgColor: 'bg-sunset-amber/10' },
  approved: { label: 'Approved', color: 'text-neural-mint', bgColor: 'bg-neural-mint/10' },
  rejected: { label: 'Rejected', color: 'text-coral-alert', bgColor: 'bg-coral-alert/10' },
  escalated: { label: 'Escalated', color: 'text-nebula-purple', bgColor: 'bg-nebula-purple/10' },
  withdrawn: { label: 'Withdrawn', color: 'text-silver-mist', bgColor: 'bg-silver-mist/10' },
};

function toISODate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapApproval(item: ManagerApprovalResponseItem): ApprovalRequest {
  const details = item.details || {};

  if (item.requestType === 'expense') {
    return {
      id: item.requestId,
      type: 'expense',
      title: item.requestTitle,
      description: String(details.description || details.businessPurpose || 'Expense approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        expenseDate: toISODate(details.expenseDate) || item.requestDate,
        expenseCategory: String(details.expenseCategory || 'GENERAL'),
        totalAmount: toNumber(details.totalAmount),
        currency: String(details.currency || 'USD'),
        businessPurpose: String(details.businessPurpose || item.requestTitle),
        description: details.description ? String(details.description) : undefined,
        receiptUrl: details.receiptUrl ? String(details.receiptUrl) : undefined,
        rejectionReason: details.rejectionReason ? String(details.rejectionReason) : undefined,
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'employment-history') {
    return {
      id: item.requestId,
      type: 'employment-history',
      title: item.requestTitle,
      description: String(details.reason || details.notes || 'Employment change approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        changeType: String(details.changeType || 'CHANGE'),
        effectiveDate: toISODate(details.effectiveDate) || item.requestDate,
        reason: details.reason ? String(details.reason) : undefined,
        notes: details.notes ? String(details.notes) : undefined,
        previousDepartment: details.previousDepartment ? String(details.previousDepartment) : undefined,
        newDepartment: details.newDepartment ? String(details.newDepartment) : undefined,
        previousJobProfile: details.previousJobProfile ? String(details.previousJobProfile) : undefined,
        newJobProfile: details.newJobProfile ? String(details.newJobProfile) : undefined,
        previousGrade: details.previousGrade ? String(details.previousGrade) : undefined,
        newGrade: details.newGrade ? String(details.newGrade) : undefined,
        previousLocation: details.previousLocation ? String(details.previousLocation) : undefined,
        newLocation: details.newLocation ? String(details.newLocation) : undefined,
        previousManagerId: details.previousManagerId ? String(details.previousManagerId) : undefined,
        newManagerId: details.newManagerId ? String(details.newManagerId) : undefined,
        previousSalary:
          details.previousSalary === undefined ? undefined : toNumber(details.previousSalary),
        newSalary: details.newSalary === undefined ? undefined : toNumber(details.newSalary),
        previousEmploymentType: details.previousEmploymentType ? String(details.previousEmploymentType) : undefined,
        newEmploymentType: details.newEmploymentType ? String(details.newEmploymentType) : undefined,
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'inter-company-transfer') {
    return {
      id: item.requestId,
      type: 'inter-company-transfer',
      title: item.requestTitle,
      description: `Transfer to ${String(details.toCompanyName || details.toCompanyId || 'target company')}`,
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        transferType: String(details.transferType || 'PERMANENT'),
        effectiveDate: toISODate(details.effectiveDate) || item.requestDate,
        fromCompanyId: String(details.fromCompanyId || ''),
        fromCompanyName: String(details.fromCompanyName || details.fromCompanyId || ''),
        toCompanyId: String(details.toCompanyId || ''),
        toCompanyName: String(details.toCompanyName || details.toCompanyId || ''),
        requestedBy: String(details.requestedBy || ''),
        approvedBy: details.approvedBy ? String(details.approvedBy) : undefined,
        status: String(details.status || item.approvalStatus),
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'leave') {
    return {
      id: item.requestId,
      type: 'leave',
      title: item.requestTitle,
      description: String(details.reason || 'Leave approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        leaveType: String(details.leaveType || 'Leave'),
        fromDate: toISODate(details.startDate) || item.requestDate,
        toDate: toISODate(details.endDate) || item.requestDate,
        totalDays: toNumber(details.totalDays),
        reason: String(details.reason || ''),
        leaveBalance:
          details.leaveBalance === undefined ? undefined : toNumber(details.leaveBalance),
        handoverTo: details.handoverTo ? String(details.handoverTo) : undefined,
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'overtime') {
    return {
      id: item.requestId,
      type: 'overtime',
      title: item.requestTitle,
      description: String(details.reason || 'Overtime approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        overtimeDate: toISODate(details.overtimeDate) || item.requestDate,
        totalHours: toNumber(details.totalHours),
        overtimeType: String(details.overtimeType || 'REGULAR'),
        reason: String(details.reason || ''),
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'attendance') {
    return {
      id: item.requestId,
      type: 'attendance',
      title: item.requestTitle,
      description: String(details.reason || 'Attendance regularization approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        attendanceDate: toISODate(details.attendanceDate) || item.requestDate,
        regularizationType: String(details.regularizationType || 'MISSED_PUNCH'),
        requestedClockIn: toISODate(details.requestedClockIn),
        requestedClockOut: toISODate(details.requestedClockOut),
        reason: String(details.reason || ''),
        rejectionReason: details.rejectionReason ? String(details.rejectionReason) : undefined,
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'comp-off') {
    return {
      id: item.requestId,
      type: 'comp-off',
      title: item.requestTitle,
      description: String(details.reason || 'Comp-off approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        workedDate: toISODate(details.workedDate) || item.requestDate,
        workedHours: toNumber(details.workedHours),
        creditedDays: toNumber(details.creditedDays),
        expiryDate: toISODate(details.expiryDate) || item.requestDate,
        reason: String(details.reason || ''),
        projectCode: details.projectCode ? String(details.projectCode) : undefined,
        remainingDays:
          details.remainingDays === undefined ? undefined : toNumber(details.remainingDays),
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'confirmation') {
    return {
      id: item.requestId,
      type: 'confirmation',
      title: item.requestTitle,
      description: 'Employee confirmation approval request',
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        eligibleDate: toISODate(details.eligibleDate) || item.requestDate,
        requestedDate: toISODate(details.requestedDate) || item.requestDate,
        managerApproval: String(details.managerApproval || 'PENDING'),
        hrApproval: String(details.hrApproval || 'PENDING'),
        confirmationDate: toISODate(details.confirmationDate),
        newSalary:
          details.newSalary === undefined ? undefined : toNumber(details.newSalary),
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  if (item.requestType === 'shift-swap') {
    return {
      id: item.requestId,
      type: 'shift-swap',
      title: item.requestTitle,
      description: String(details.reason || 'Shift swap approval request'),
      requestedBy: item.requestedBy,
      requestedByName: item.requestedByName,
      requestedByDept: item.requestedByDepartment,
      requestDate: item.requestDate,
      status: item.approvalStatus,
      priority: item.priority || 'medium',
      dueDate: toISODate(item.dueDate),
      details: {
        requestorDate: toISODate(details.requestorDate) || item.requestDate,
        swapWithDate: toISODate(details.swapWithDate) || item.requestDate,
        requestorShiftId: String(details.requestorShiftId || ''),
        swapWithShiftId: String(details.swapWithShiftId || ''),
        swapWithId: String(details.swapWithId || ''),
        peerApproval: String(details.peerApproval || 'PENDING'),
        managerApproval: String(details.managerApproval || 'PENDING'),
        reason: String(details.reason || ''),
        rejectionReason: details.rejectionReason ? String(details.rejectionReason) : undefined,
      },
      currentLevel: item.currentApproverLevel || 1,
      totalLevels: item.totalApproverLevels || 1,
      comments: item.comments || [],
      history: item.history || [],
      attachments: item.attachments || [],
    };
  }

  return {
    id: item.requestId,
    type: 'exit',
    title: item.requestTitle,
    description: String(details.reason || 'Exit approval request'),
    requestedBy: item.requestedBy,
    requestedByName: item.requestedByName,
    requestedByDept: item.requestedByDepartment,
    requestDate: item.requestDate,
    status: item.approvalStatus,
    priority: item.priority || 'high',
    dueDate: toISODate(item.dueDate),
    details: {
      exitType: String(details.exitType || 'Exit'),
      resignationDate: toISODate(details.resignationDate) || item.requestDate,
      lastWorkingDate: toISODate(details.lastWorkingDate) || item.requestDate,
      reason: String(details.reason || ''),
    },
    currentLevel: item.currentApproverLevel || 1,
    totalLevels: item.totalApproverLevels || 1,
    comments: item.comments || [],
    history: item.history || [],
    attachments: item.attachments || [],
  };
}

async function fetchApprovals(): Promise<ManagerApprovalsResponse> {
  return APIClient.get<ManagerApprovalsResponse>('/manager/approvals', { includeHistory: true });
}

async function getRequestType(id: string): Promise<ApprovalType> {
  const request = await ApprovalService.getRequest(id);
  if (!request) {
    throw new Error('Approval request not found');
  }

  return request.type;
}

export class ApprovalService {
  static async getRequests(status?: ApprovalStatus): Promise<ApprovalRequest[]> {
    const response = await fetchApprovals();
    const items = response.approvals.map(mapApproval);
    return status ? items.filter((item) => item.status === status) : items;
  }

  static async getRequest(id: string): Promise<ApprovalRequest | null> {
    const requests = await this.getRequests();
    return requests.find((request) => request.id === id) || null;
  }

  static async approve(id: string, remarks?: string): Promise<ApprovalRequest> {
    await APIClient.post<{ message: string; messageAr?: string }>('/manager/approvals', {
      requestId: id,
      requestType: await getRequestType(id),
      action: 'approve',
      comments: remarks,
    });

    const updated = await this.getRequest(id);
    if (!updated) {
      throw new Error('Updated approval request not found');
    }
    return updated;
  }

  static async reject(id: string, remarks: string): Promise<ApprovalRequest> {
    await APIClient.post<{ message: string; messageAr?: string }>('/manager/approvals', {
      requestId: id,
      requestType: await getRequestType(id),
      action: 'reject',
      comments: remarks,
    });

    const updated = await this.getRequest(id);
    if (!updated) {
      throw new Error('Updated approval request not found');
    }
    return updated;
  }

  static async bulkApprove(ids: string[], remarks?: string): Promise<void> {
    for (const id of ids) {
      await this.approve(id, remarks);
    }
  }

  static async bulkReject(ids: string[], remarks: string): Promise<void> {
    for (const id of ids) {
      await this.reject(id, remarks);
    }
  }

  static async addComment(id: string, text: string): Promise<void> {
    await APIClient.post<{ message: string; messageAr?: string }>('/manager/approvals', {
      requestId: id,
      requestType: await getRequestType(id),
      action: 'comment',
      comments: text,
    });
  }

  static async getSummary(): Promise<ApprovalSummary> {
    const response = await fetchApprovals();
    return response.summary;
  }
}