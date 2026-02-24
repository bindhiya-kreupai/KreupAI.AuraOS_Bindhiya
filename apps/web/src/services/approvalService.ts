/**
 * @module approvalService
 * @description Unified Approval service — CRUD for leave, expense, timesheet, requisition, document approvals
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type ApprovalType = 'leave' | 'expense' | 'timesheet' | 'requisition' | 'document';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'withdrawn';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

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
  amount?: number;
  currency?: string;

  // Type-specific details
  details: LeaveDetails | ExpenseDetails | TimesheetDetails | RequisitionDetails | DocumentDetails;

  // Workflow
  currentLevel: number;
  totalLevels: number;
  comments: ApprovalComment[];
  history: ApprovalHistoryEntry[];
  attachments: { id: string; name: string; size: string; type: string }[];
}

export interface LeaveDetails {
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  leaveBalance: number;
  handoverTo?: string;
}

export interface ExpenseDetails {
  category: string;
  totalAmount: number;
  currency: string;
  expenseDate: string;
  purpose: string;
  project?: string;
  receiptCount: number;
  lineItems: { description: string; amount: number }[];
}

export interface TimesheetDetails {
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  projects: { name: string; hours: number }[];
  violations: number;
}

export interface RequisitionDetails {
  positionTitle: string;
  department: string;
  headcount: number;
  employmentType: string;
  salaryRange: { min: number; max: number; currency: string };
  justification: string;
  urgency: Priority;
  isReplacement: boolean;
}

export interface DocumentDetails {
  documentName: string;
  documentType: string;
  version: string;
  description: string;
  requiresSignature: boolean;
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

// ── Constants ──────────────────────────────────────────────────────────────────

export const APPROVAL_TYPE_CONFIG: Record<
  ApprovalType,
  { label: string; color: string; bgColor: string }
> = {
  leave: {
    label: 'Leave Request',
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
  },
  expense: { label: 'Expense Claim', color: 'text-sunset-amber', bgColor: 'bg-sunset-amber/10' },
  timesheet: { label: 'Timesheet', color: 'text-nebula-purple', bgColor: 'bg-nebula-purple/10' },
  requisition: { label: 'Requisition', color: 'text-quantum-rose', bgColor: 'bg-quantum-rose/10' },
  document: { label: 'Document', color: 'text-neural-mint', bgColor: 'bg-neural-mint/10' },
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

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_REQUESTS: ApprovalRequest[] = [
  {
    id: 'apr-001',
    type: 'leave',
    title: 'Annual Leave - 5 days',
    description: 'Family vacation',
    requestedBy: 'emp-001',
    requestedByName: 'Sarah Johnson',
    requestedByDept: 'Engineering',
    requestDate: '2026-02-20',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-02-25',
    currentLevel: 1,
    totalLevels: 1,
    details: {
      leaveType: 'Annual',
      fromDate: '2026-03-10',
      toDate: '2026-03-14',
      totalDays: 5,
      reason: 'Family vacation',
      leaveBalance: 12,
      handoverTo: 'Michael Chen',
    },
    comments: [],
    history: [
      { id: 'h1', action: 'submitted', by: 'emp-001', byName: 'Sarah Johnson', date: '2026-02-20' },
    ],
    attachments: [],
  },
  {
    id: 'apr-002',
    type: 'expense',
    title: 'Client Meeting Expenses - $1,250',
    description: 'Q1 client engagement dinner',
    requestedBy: 'emp-004',
    requestedByName: 'David Kim',
    requestedByDept: 'Product',
    requestDate: '2026-02-18',
    status: 'pending',
    priority: 'medium',
    amount: 1250,
    currency: 'USD',
    dueDate: '2026-02-26',
    currentLevel: 1,
    totalLevels: 2,
    details: {
      category: 'Client Entertainment',
      totalAmount: 1250,
      currency: 'USD',
      expenseDate: '2026-02-15',
      purpose: 'Q1 client engagement dinner with Acme Corp',
      project: 'PRJ-042',
      receiptCount: 3,
      lineItems: [
        { description: 'Dinner at Nobu', amount: 850 },
        { description: 'Transportation', amount: 120 },
        { description: 'Parking', amount: 280 },
      ],
    },
    comments: [
      {
        id: 'c1',
        by: 'emp-004',
        byName: 'David Kim',
        date: '2026-02-18',
        text: 'Receipts attached. Meeting was pre-approved by VP Sales.',
        isInternal: false,
      },
    ],
    history: [
      { id: 'h2', action: 'submitted', by: 'emp-004', byName: 'David Kim', date: '2026-02-18' },
    ],
    attachments: [
      { id: 'att-1', name: 'receipt-nobu.pdf', size: '245 KB', type: 'pdf' },
      { id: 'att-2', name: 'receipt-uber.pdf', size: '128 KB', type: 'pdf' },
    ],
  },
  {
    id: 'apr-003',
    type: 'timesheet',
    title: 'Weekly Timesheet - Feb 10-16',
    description: 'Regular weekly timesheet',
    requestedBy: 'emp-003',
    requestedByName: 'Emily Rodriguez',
    requestedByDept: 'Engineering',
    requestDate: '2026-02-17',
    status: 'pending',
    priority: 'low',
    dueDate: '2026-02-24',
    currentLevel: 1,
    totalLevels: 1,
    details: {
      periodStart: '2026-02-10',
      periodEnd: '2026-02-16',
      totalHours: 42,
      regularHours: 40,
      overtimeHours: 2,
      projects: [
        { name: 'AuraOS Frontend', hours: 32 },
        { name: 'Tech Debt Sprint', hours: 10 },
      ],
      violations: 0,
    },
    comments: [],
    history: [
      {
        id: 'h3',
        action: 'submitted',
        by: 'emp-003',
        byName: 'Emily Rodriguez',
        date: '2026-02-17',
      },
    ],
    attachments: [],
  },
  {
    id: 'apr-004',
    type: 'requisition',
    title: 'Senior Backend Engineer',
    description: 'New headcount for payments team',
    requestedBy: 'emp-006',
    requestedByName: 'Alex Rivera',
    requestedByDept: 'Engineering',
    requestDate: '2026-02-15',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-02-28',
    currentLevel: 1,
    totalLevels: 3,
    details: {
      positionTitle: 'Senior Backend Engineer',
      department: 'Engineering - Payments',
      headcount: 1,
      employmentType: 'Full-time',
      salaryRange: { min: 11000, max: 15000, currency: 'USD' },
      justification:
        'Increased payment processing volume requires additional backend capacity. Current team at 95% utilization.',
      urgency: 'high' as Priority,
      isReplacement: false,
    },
    comments: [],
    history: [
      { id: 'h4', action: 'submitted', by: 'emp-006', byName: 'Alex Rivera', date: '2026-02-15' },
    ],
    attachments: [],
  },
  {
    id: 'apr-005',
    type: 'document',
    title: 'Remote Work Policy v3.0',
    description: 'Updated remote work guidelines',
    requestedBy: 'emp-008',
    requestedByName: 'Marcus Johnson',
    requestedByDept: 'HR',
    requestDate: '2026-02-22',
    status: 'pending',
    priority: 'medium',
    currentLevel: 1,
    totalLevels: 2,
    details: {
      documentName: 'Remote Work Policy',
      documentType: 'Policy Document',
      version: '3.0',
      description:
        'Updated remote work guidelines with hybrid schedule requirements and equipment allowance changes.',
      requiresSignature: true,
    },
    comments: [],
    history: [
      {
        id: 'h5',
        action: 'submitted',
        by: 'emp-008',
        byName: 'Marcus Johnson',
        date: '2026-02-22',
      },
    ],
    attachments: [{ id: 'att-3', name: 'remote-work-policy-v3.pdf', size: '1.2 MB', type: 'pdf' }],
  },
  {
    id: 'apr-006',
    type: 'leave',
    title: 'Sick Leave - 2 days',
    description: 'Medical appointment and recovery',
    requestedBy: 'emp-005',
    requestedByName: 'Jessica Martinez',
    requestedByDept: 'Design',
    requestDate: '2026-02-23',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-02-24',
    currentLevel: 1,
    totalLevels: 1,
    details: {
      leaveType: 'Sick',
      fromDate: '2026-02-24',
      toDate: '2026-02-25',
      totalDays: 2,
      reason: 'Medical appointment and recovery',
      leaveBalance: 8,
    },
    comments: [],
    history: [
      {
        id: 'h6',
        action: 'submitted',
        by: 'emp-005',
        byName: 'Jessica Martinez',
        date: '2026-02-23',
      },
    ],
    attachments: [{ id: 'att-4', name: 'doctor-note.pdf', size: '85 KB', type: 'pdf' }],
  },
  {
    id: 'apr-007',
    type: 'expense',
    title: 'AWS Training Course - $499',
    description: 'Online certification course',
    requestedBy: 'emp-002',
    requestedByName: 'Michael Chen',
    requestedByDept: 'Engineering',
    requestDate: '2026-02-10',
    status: 'approved',
    priority: 'low',
    amount: 499,
    currency: 'USD',
    currentLevel: 1,
    totalLevels: 1,
    details: {
      category: 'Training & Development',
      totalAmount: 499,
      currency: 'USD',
      expenseDate: '2026-02-08',
      purpose: 'AWS Solutions Architect Professional preparation course',
      receiptCount: 1,
      lineItems: [{ description: 'Udemy - AWS SAP Course', amount: 499 }],
    },
    comments: [
      {
        id: 'c2',
        by: 'mgr-001',
        byName: 'Sarah Chen',
        date: '2026-02-12',
        text: 'Approved. Aligns with career development plan.',
        isInternal: false,
      },
    ],
    history: [
      { id: 'h7', action: 'submitted', by: 'emp-002', byName: 'Michael Chen', date: '2026-02-10' },
      {
        id: 'h8',
        action: 'approved',
        by: 'mgr-001',
        byName: 'Sarah Chen',
        date: '2026-02-12',
        remarks: 'Aligns with career development plan',
        level: 1,
      },
    ],
    attachments: [],
  },
  {
    id: 'apr-008',
    type: 'leave',
    title: 'Annual Leave - 3 days',
    description: 'Personal time off',
    requestedBy: 'emp-007',
    requestedByName: 'Priya Sharma',
    requestedByDept: 'Engineering',
    requestDate: '2026-02-05',
    status: 'rejected',
    priority: 'medium',
    currentLevel: 1,
    totalLevels: 1,
    details: {
      leaveType: 'Annual',
      fromDate: '2026-02-28',
      toDate: '2026-03-02',
      totalDays: 3,
      reason: 'Personal time off',
      leaveBalance: 14,
    },
    comments: [
      {
        id: 'c3',
        by: 'mgr-001',
        byName: 'Sarah Chen',
        date: '2026-02-07',
        text: 'Sprint deadline conflict. Please reschedule to the following week.',
        isInternal: false,
      },
    ],
    history: [
      { id: 'h9', action: 'submitted', by: 'emp-007', byName: 'Priya Sharma', date: '2026-02-05' },
      {
        id: 'h10',
        action: 'rejected',
        by: 'mgr-001',
        byName: 'Sarah Chen',
        date: '2026-02-07',
        remarks: 'Sprint deadline conflict',
        level: 1,
      },
    ],
    attachments: [],
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

export class ApprovalService {
  static async getRequests(status?: ApprovalStatus): Promise<ApprovalRequest[]> {
    try {
      return await APIClient.get<ApprovalRequest[]>('/v1/approvals', { status });
    } catch {
      return status ? MOCK_REQUESTS.filter((r) => r.status === status) : MOCK_REQUESTS;
    }
  }

  static async getRequest(id: string): Promise<ApprovalRequest | null> {
    try {
      return await APIClient.get<ApprovalRequest>(`/v1/approvals/${id}`);
    } catch {
      return MOCK_REQUESTS.find((r) => r.id === id) || null;
    }
  }

  static async approve(id: string, remarks?: string): Promise<ApprovalRequest> {
    const idx = MOCK_REQUESTS.findIndex((r) => r.id === id);
    if (idx >= 0) {
      MOCK_REQUESTS[idx] = {
        ...MOCK_REQUESTS[idx],
        status: 'approved',
        history: [
          ...MOCK_REQUESTS[idx].history,
          {
            id: `h-${Date.now()}`,
            action: 'approved',
            by: 'mgr-001',
            byName: 'Sarah Chen',
            date: new Date().toISOString(),
            remarks,
            level: MOCK_REQUESTS[idx].currentLevel,
          },
        ],
      };
      return MOCK_REQUESTS[idx];
    }
    throw new Error('Not found');
  }

  static async reject(id: string, remarks: string): Promise<ApprovalRequest> {
    const idx = MOCK_REQUESTS.findIndex((r) => r.id === id);
    if (idx >= 0) {
      MOCK_REQUESTS[idx] = {
        ...MOCK_REQUESTS[idx],
        status: 'rejected',
        history: [
          ...MOCK_REQUESTS[idx].history,
          {
            id: `h-${Date.now()}`,
            action: 'rejected',
            by: 'mgr-001',
            byName: 'Sarah Chen',
            date: new Date().toISOString(),
            remarks,
            level: MOCK_REQUESTS[idx].currentLevel,
          },
        ],
      };
      return MOCK_REQUESTS[idx];
    }
    throw new Error('Not found');
  }

  static async escalate(id: string, remarks?: string): Promise<ApprovalRequest> {
    const idx = MOCK_REQUESTS.findIndex((r) => r.id === id);
    if (idx >= 0) {
      MOCK_REQUESTS[idx] = {
        ...MOCK_REQUESTS[idx],
        status: 'escalated',
        history: [
          ...MOCK_REQUESTS[idx].history,
          {
            id: `h-${Date.now()}`,
            action: 'escalated',
            by: 'mgr-001',
            byName: 'Sarah Chen',
            date: new Date().toISOString(),
            remarks,
          },
        ],
      };
      return MOCK_REQUESTS[idx];
    }
    throw new Error('Not found');
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
    const idx = MOCK_REQUESTS.findIndex((r) => r.id === id);
    if (idx >= 0) {
      MOCK_REQUESTS[idx].comments.push({
        id: `c-${Date.now()}`,
        by: 'mgr-001',
        byName: 'Sarah Chen',
        date: new Date().toISOString(),
        text,
        isInternal: false,
      });
    }
  }

  static async getSummary(): Promise<Record<ApprovalType, number>> {
    const pending = MOCK_REQUESTS.filter((r) => r.status === 'pending');
    return {
      leave: pending.filter((r) => r.type === 'leave').length,
      expense: pending.filter((r) => r.type === 'expense').length,
      timesheet: pending.filter((r) => r.type === 'timesheet').length,
      requisition: pending.filter((r) => r.type === 'requisition').length,
      document: pending.filter((r) => r.type === 'document').length,
    };
  }
}
