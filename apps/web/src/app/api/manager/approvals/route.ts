import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

type ManagerApprovalType =
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

function normalizeApprovalStatus(status: string): 'pending' | 'approved' | 'rejected' {
  if (status === 'APPROVED' || status === 'PROCESSING' || status === 'COMPLETED' || status === 'IN_PROGRESS') {
    return 'approved';
  }

  if (status === 'REJECTED' || status === 'CANCELLED') {
    return 'rejected';
  }

  return 'pending';
}

function normalizeConfirmationApprovalStatus(
  managerApproval?: string | null,
  status?: string | null
): 'pending' | 'approved' | 'rejected' {
  if (managerApproval === 'APPROVED') {
    return 'approved';
  }

  if (managerApproval === 'REJECTED' || status === 'REJECTED') {
    return 'rejected';
  }

  return 'pending';
}

function formatActorName(firstName?: string | null, lastName?: string | null): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || 'Unknown';
}

function buildHistoryEntry(
  id: string,
  action: 'submitted' | 'approved' | 'rejected' | 'commented',
  by: string,
  byName: string,
  date: Date | string,
  remarks?: string,
  level?: number
) {
  return {
    id,
    action,
    by,
    byName,
    date,
    remarks,
    level,
  };
}

async function loadManagerContext(tenantId: string, managerId: string) {
  const teamMembers = await prisma.employee.findMany({
    where: {
      managerId,
      company: { tenantId },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: { select: { name: true } },
    },
  });

  const teamMemberIds = teamMembers.map((member) => member.id);
  const employeeMap = new Map(
    teamMembers.map((member) => [
      member.id,
      {
        name: `${member.firstName} ${member.lastName}`,
        department: member.department?.name || '',
      },
    ])
  );

  return { teamMemberIds, employeeMap };
}

async function loadUserName(userId?: string | null): Promise<string> {
  if (!userId) {
    return 'Unknown';
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  return formatActorName(actor?.firstName, actor?.lastName);
}

function getEntityType(
  requestType: ManagerApprovalType
):
  | 'ExpenseClaim'
  | 'EmploymentHistory'
  | 'InterCompanyTransfer'
  | 'LeaveRequest'
  | 'OvertimeRequest'
  | 'ExitRequest'
  | 'AttendanceRegularization'
  | 'CompOffEarned'
  | 'ConfirmationRequest'
  | 'ShiftSwapRequest' {
  switch (requestType) {
    case 'expense':
      return 'ExpenseClaim';
    case 'employment-history':
      return 'EmploymentHistory';
    case 'inter-company-transfer':
      return 'InterCompanyTransfer';
    case 'leave':
      return 'LeaveRequest';
    case 'overtime':
      return 'OvertimeRequest';
    case 'exit':
      return 'ExitRequest';
    case 'attendance':
      return 'AttendanceRegularization';
    case 'comp-off':
      return 'CompOffEarned';
    case 'confirmation':
      return 'ConfirmationRequest';
    case 'shift-swap':
      return 'ShiftSwapRequest';
  }
}

function getRequestTypeFromEntity(entityType: string): ManagerApprovalType | null {
  switch (entityType) {
    case 'ExpenseClaim':
      return 'expense';
    case 'EmploymentHistory':
      return 'employment-history';
    case 'InterCompanyTransfer':
      return 'inter-company-transfer';
    case 'LeaveRequest':
      return 'leave';
    case 'OvertimeRequest':
      return 'overtime';
    case 'ExitRequest':
      return 'exit';
    case 'AttendanceRegularization':
      return 'attendance';
    case 'CompOffEarned':
      return 'comp-off';
    case 'ConfirmationRequest':
      return 'confirmation';
    case 'ShiftSwapRequest':
      return 'shift-swap';
    default:
      return null;
  }
}

function getCommentAction(entityType: ReturnType<typeof getEntityType>) {
  switch (entityType) {
    case 'ExpenseClaim':
      return 'COMMENT_EXPENSE_CLAIM';
    case 'EmploymentHistory':
      return 'COMMENT_EMPLOYMENT_HISTORY';
    case 'InterCompanyTransfer':
      return 'COMMENT_INTER_COMPANY_TRANSFER';
    case 'LeaveRequest':
      return 'COMMENT_LEAVE_REQUEST';
    case 'OvertimeRequest':
      return 'COMMENT_OVERTIME_REQUEST';
    case 'ExitRequest':
      return 'COMMENT_EXIT_REQUEST';
    case 'AttendanceRegularization':
      return 'COMMENT_ATTENDANCE_REGULARIZATION';
    case 'CompOffEarned':
      return 'COMMENT_COMP_OFF_REQUEST';
    case 'ConfirmationRequest':
      return 'COMMENT_CONFIRMATION_REQUEST';
    case 'ShiftSwapRequest':
      return 'COMMENT_SHIFT_SWAP_REQUEST';
  }
}

function buildAuditComment(log: any, actorName: string) {
  const metadata = (log.metadata || {}) as Record<string, any>;
  const text = typeof metadata.comments === 'string' ? metadata.comments : '';

  if (!text.trim()) {
    return null;
  }

  return {
    id: `audit-comment-${log.id}`,
    by: log.userId || 'unknown',
    byName: actorName,
    date: log.timestamp,
    text,
    isInternal: false,
  };
}

function buildAuditCommentHistory(log: any, actorName: string) {
  const metadata = (log.metadata || {}) as Record<string, any>;
  const text = typeof metadata.comments === 'string' ? metadata.comments : '';

  if (!text.trim()) {
    return null;
  }

  return buildHistoryEntry(
    `audit-history-${log.id}`,
    'commented',
    log.userId || 'unknown',
    actorName,
    log.timestamp,
    text
  );
}

function buildLeaveApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `leave-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.appliedAt,
      req.reason,
      req.currentApproverLevel
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `leave-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt,
        undefined,
        req.currentApproverLevel
      )
    );
  }

  if (req.status === 'REJECTED' && req.rejectedAt) {
    history.push(
      buildHistoryEntry(
        `leave-rejected-${req.id}`,
        'rejected',
        req.rejectedBy || 'unknown',
        approverName || 'Approver',
        req.rejectedAt,
        req.rejectionReason || undefined,
        req.currentApproverLevel
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'leave' as ManagerApprovalType,
    requestTitle: `Leave Request - ${employee?.name || 'Unknown'}`,
    requestDate: req.appliedAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority: 'medium',
    dueDate: req.startDate,
    currentApproverLevel: req.currentApproverLevel,
    totalApproverLevels: Array.isArray(req.approvers) ? req.approvers.length : 1,
    details: {
      leaveType: req.leaveType?.name || 'Leave',
      startDate: req.startDate,
      endDate: req.endDate,
      totalDays: Number(req.totalDays),
      reason: req.reason,
      leaveBalance: 0,
      handoverTo: req.delegateToEmployeeId || undefined,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: Array.isArray(req.documents)
      ? req.documents.map((doc: any, index: number) => ({
          id: `${req.id}-doc-${index}`,
          name: doc.fileName || `document-${index + 1}`,
          size: doc.size || 'Unknown size',
          type: doc.fileType || 'file',
        }))
      : [],
  };
}

function buildExpenseApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `expense-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.description || req.title
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `expense-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  if (req.status === 'REJECTED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `expense-rejected-${req.id}`,
        'rejected',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt,
        req.rejectionReason || undefined
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'expense' as ManagerApprovalType,
    requestTitle: `Expense Claim - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority: req.amount >= 1000 ? 'high' : req.amount >= 250 ? 'medium' : 'low',
    dueDate: req.date,
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      expenseDate: req.date,
      expenseCategory: req.category,
      totalAmount: req.amount,
      currency: req.currency,
      businessPurpose: req.title,
      description: req.description || undefined,
      receiptUrl: req.receiptUrl || undefined,
      rejectionReason: req.rejectionReason || undefined,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: req.receiptUrl
      ? [
          {
            id: `${req.id}-receipt`,
            name: 'Receipt',
            size: 'Attached',
            type: 'receipt',
          },
        ]
      : [],
  };
}

function buildEmploymentHistoryApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `employment-history-submitted-${req.id}`,
      'submitted',
      req.requestedBy || req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.reason || req.notes || undefined
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `employment-history-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  if (req.status === 'REJECTED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `employment-history-rejected-${req.id}`,
        'rejected',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt,
        req.notes || undefined
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'employment-history' as ManagerApprovalType,
    requestTitle: `${req.changeType.replace(/_/g, ' ')} - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority:
      req.changeType === 'PROMOTION' || req.changeType === 'TERMINATION' || req.changeType === 'TRANSFER'
        ? 'high'
        : 'medium',
    dueDate: req.effectiveDate,
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      changeType: req.changeType,
      effectiveDate: req.effectiveDate,
      reason: req.reason || undefined,
      notes: req.notes || undefined,
      previousDepartment: req.previousDepartment?.name || undefined,
      newDepartment: req.newDepartment?.name || undefined,
      previousJobProfile: req.previousJobProfile?.title || undefined,
      newJobProfile: req.newJobProfile?.title || undefined,
      previousGrade: req.previousGrade?.name || undefined,
      newGrade: req.newGrade?.name || undefined,
      previousLocation: req.previousLocation?.name || undefined,
      newLocation: req.newLocation?.name || undefined,
      previousManagerId: req.previousManagerId || undefined,
      newManagerId: req.newManagerId || undefined,
      previousSalary: req.previousSalary ? Number(req.previousSalary) : undefined,
      newSalary: req.newSalary ? Number(req.newSalary) : undefined,
      previousEmploymentType: req.previousEmploymentType || undefined,
      newEmploymentType: req.newEmploymentType || undefined,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: [],
  };
}

function buildInterCompanyTransferApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `transfer-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      `${req.transferType} transfer`
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `transfer-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  if (req.status === 'CANCELLED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `transfer-rejected-${req.id}`,
        'rejected',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'inter-company-transfer' as ManagerApprovalType,
    requestTitle: `Inter-Company Transfer - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority: req.transferType === 'PERMANENT' ? 'high' : 'medium',
    dueDate: req.effectiveDate,
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      transferType: req.transferType,
      effectiveDate: req.effectiveDate,
      fromCompanyId: req.fromCompanyId,
      fromCompanyName: req.fromCompany?.name || req.fromCompanyId,
      toCompanyId: req.toCompanyId,
      toCompanyName: req.toCompany?.name || req.toCompanyId,
      requestedBy: req.requestedBy,
      approvedBy: req.approvedBy || undefined,
      status: req.status,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: [],
  };
}

function buildOvertimeApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `overtime-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.reason
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `overtime-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  if (req.status === 'REJECTED' && req.updatedAt) {
    history.push(
      buildHistoryEntry(
        `overtime-rejected-${req.id}`,
        'rejected',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.updatedAt,
        req.rejectionReason || undefined
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'overtime' as ManagerApprovalType,
    requestTitle: `Overtime Request - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority: 'medium',
    dueDate: req.overtimeDate,
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      overtimeDate: req.overtimeDate,
      totalHours: req.totalHours,
      overtimeType: req.overtimeType,
      reason: req.reason,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: [],
  };
}

function buildExitApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  extraComments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const normalizedStatus = normalizeApprovalStatus(req.status);
  const history = [
    buildHistoryEntry(
      `exit-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.reason || undefined
    ),
  ];

  if (req.status !== 'PENDING') {
    history.push(
      buildHistoryEntry(
        `exit-${normalizedStatus}-${req.id}`,
        normalizedStatus === 'rejected' ? 'rejected' : 'approved',
        req.employeeId,
        'Approver',
        req.updatedAt,
        req.comments || undefined
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'exit' as ManagerApprovalType,
    requestTitle: `Exit Request - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizedStatus,
    priority: 'high',
    dueDate: req.lastWorkingDate,
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      exitType: req.exitType,
      resignationDate: req.resignationDate,
      lastWorkingDate: req.lastWorkingDate,
      reason: req.reason || '',
    },
    comments: [
      ...(req.comments
        ? [
            {
              id: `exit-comment-${req.id}`,
              by: req.employeeId,
              byName: employee?.name || 'Unknown',
              date: req.updatedAt,
              text: req.comments,
              isInternal: false,
            },
          ]
        : []),
      ...extraComments,
    ],
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: [],
  };
}

function buildAttendanceApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `attendance-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.reason
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `attendance-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  if (req.status === 'REJECTED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `attendance-rejected-${req.id}`,
        'rejected',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt,
        req.rejectionReason || undefined
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'attendance' as ManagerApprovalType,
    requestTitle: `Attendance Regularization - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority: 'medium',
    dueDate: req.date,
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      attendanceDate: req.date,
      regularizationType: req.regularizationType,
      requestedClockIn: req.requestedClockIn,
      requestedClockOut: req.requestedClockOut,
      reason: req.reason,
      rejectionReason: req.rejectionReason || undefined,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: Array.isArray(req.attachments)
      ? req.attachments.map((name: string, index: number) => ({
          id: `${req.id}-attachment-${index}`,
          name,
          size: 'Attached',
          type: 'attachment',
        }))
      : [],
  };
}

function buildCompOffApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const history = [
    buildHistoryEntry(
      `comp-off-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.reason
    ),
  ];

  if (req.status === 'APPROVED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `comp-off-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt
      )
    );
  }

  if (req.status === 'REJECTED' && req.updatedAt) {
    history.push(
      buildHistoryEntry(
        `comp-off-rejected-${req.id}`,
        'rejected',
        req.rejectedBy || 'unknown',
        approverName || 'Approver',
        req.updatedAt,
        req.rejectionReason || undefined
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'comp-off' as ManagerApprovalType,
    requestTitle: `Comp-Off Request - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizeApprovalStatus(req.status),
    priority: 'medium',
    currentApproverLevel: 1,
    totalApproverLevels: 1,
    details: {
      workedDate: req.workedDate,
      workedHours: req.workedHours,
      creditedDays: req.creditedDays,
      expiryDate: req.expiryDate,
      reason: req.reason,
      projectCode: req.projectCode || undefined,
      remainingDays: req.remainingDays,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: [],
  };
}

function buildConfirmationApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.employeeId);
  const normalizedStatus = normalizeConfirmationApprovalStatus(req.managerApproval, req.status);
  const history = [
    buildHistoryEntry(
      `confirmation-submitted-${req.id}`,
      'submitted',
      req.employeeId,
      employee?.name || 'Unknown',
      req.requestedDate || req.createdAt,
      req.newSalary ? `Recommended salary: ${req.newSalary}` : undefined,
      1
    ),
  ];
  const hasDecisionHistory = extraHistory.some(
    (entry) => entry.action === 'approved' || entry.action === 'rejected'
  );

  if (!hasDecisionHistory && normalizedStatus !== 'pending') {
    history.push(
      buildHistoryEntry(
        `confirmation-${normalizedStatus}-${req.id}`,
        normalizedStatus === 'approved' ? 'approved' : 'rejected',
        'unknown',
        'Manager',
        req.updatedAt,
        undefined,
        1
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'confirmation' as ManagerApprovalType,
    requestTitle: `Confirmation Request - ${employee?.name || 'Unknown'}`,
    requestDate: req.requestedDate || req.createdAt,
    requestedBy: req.employeeId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus: normalizedStatus,
    priority: 'medium',
    dueDate: req.eligibleDate,
    currentApproverLevel: normalizedStatus === 'pending' ? 1 : 2,
    totalApproverLevels: 2,
    details: {
      eligibleDate: req.eligibleDate,
      requestedDate: req.requestedDate,
      newSalary: req.newSalary,
      managerApproval: req.managerApproval || 'PENDING',
      hrApproval: req.hrApproval || 'PENDING',
      confirmationDate: req.confirmationDate || undefined,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: req.confirmationLetterUrl
      ? [
          {
            id: `${req.id}-confirmation-letter`,
            name: 'Confirmation Letter',
            size: 'Attached',
            type: 'document',
          },
        ]
      : [],
  };
}

function buildShiftSwapApproval(
  req: any,
  employeeMap: Map<string, { name: string; department: string }>,
  approverName?: string,
  comments: any[] = [],
  extraHistory: any[] = []
) {
  const employee = employeeMap.get(req.requestorId);
  const history = [
    buildHistoryEntry(
      `shift-swap-submitted-${req.id}`,
      'submitted',
      req.requestorId,
      employee?.name || 'Unknown',
      req.createdAt,
      req.reason
    ),
  ];

  if ((req.status === 'COMPLETED' || req.managerApproval === 'APPROVED') && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `shift-swap-approved-${req.id}`,
        'approved',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt,
        undefined,
        2
      )
    );
  }

  if (req.status === 'REJECTED' && req.approvedAt) {
    history.push(
      buildHistoryEntry(
        `shift-swap-rejected-${req.id}`,
        'rejected',
        req.approvedBy || 'unknown',
        approverName || 'Approver',
        req.approvedAt,
        req.rejectionReason || undefined,
        2
      )
    );
  }

  return {
    requestId: req.id,
    requestType: 'shift-swap' as ManagerApprovalType,
    requestTitle: `Shift Swap Request - ${employee?.name || 'Unknown'}`,
    requestDate: req.createdAt,
    requestedBy: req.requestorId,
    requestedByName: employee?.name || 'Unknown',
    requestedByDepartment: employee?.department || '',
    approvalStatus:
      req.status === 'REJECTED'
        ? 'rejected'
        : req.status === 'COMPLETED' || req.managerApproval === 'APPROVED'
          ? 'approved'
          : 'pending',
    priority: 'medium',
    dueDate: req.requestorDate,
    currentApproverLevel: 2,
    totalApproverLevels: 2,
    details: {
      requestorDate: req.requestorDate,
      swapWithDate: req.swapWithDate,
      requestorShiftId: req.requestorShiftId,
      swapWithShiftId: req.swapWithShiftId,
      swapWithId: req.swapWithId,
      peerApproval: req.swapWithApproval,
      managerApproval: req.managerApproval,
      reason: req.reason,
      rejectionReason: req.rejectionReason || undefined,
    },
    comments,
    history: [...history, ...extraHistory].sort(
      (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
    ),
    attachments: [],
  };
}

async function validateManagedRequest(tenantId: string, managerId: string, employeeId: string) {
  const managedEmployee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      managerId,
      company: { tenantId },
    },
    select: { id: true },
  });

  return Boolean(managedEmployee);
}

const processApprovalSchema = z.object({
  requestId: z.string().min(1),
  requestType: z.enum(['expense', 'employment-history', 'inter-company-transfer', 'leave', 'overtime', 'exit', 'attendance', 'comp-off', 'confirmation', 'shift-swap']),
  action: z.enum(['approve', 'reject', 'comment']),
  comments: z.string().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, employeeId } = context;
    const { searchParams } = new URL(request.url);
    const managerId = employeeId;
    const includeHistory = searchParams.get('includeHistory') === 'true';

    if (!managerId) {
      return NextResponse.json(
        {
          error: 'Manager employee ID not found',
          message: 'Manager employee ID not found',
          messageAr: 'لم يتم العثور على معرف الموظف الخاص بالمدير',
        },
        { status: 400 }
      );
    }

    const { teamMemberIds, employeeMap } = await loadManagerContext(user.tenantId, managerId);

    if (teamMemberIds.length === 0) {
      return NextResponse.json(
        {
          approvals: [],
          summary: {
            total: 0,
            expense: 0,
            'employment-history': 0,
            'inter-company-transfer': 0,
            leave: 0,
            overtime: 0,
            exit: 0,
            attendance: 0,
            'comp-off': 0,
            confirmation: 0,
            'shift-swap': 0,
          },
        },
        { status: 200 }
      );
    }

    const leaveStatuses = includeHistory ? ['PENDING', 'APPROVED', 'REJECTED'] : ['PENDING'];
    const overtimeStatuses = includeHistory ? ['PENDING', 'APPROVED', 'REJECTED'] : ['PENDING'];
    const exitStatuses = includeHistory
      ? ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED']
      : ['PENDING'];
    const attendanceStatuses = includeHistory ? ['PENDING', 'APPROVED', 'REJECTED'] : ['PENDING'];
    const compOffStatuses = includeHistory ? ['PENDING', 'APPROVED', 'REJECTED'] : ['PENDING'];

    const [expenseRequests, employmentHistoryRequests, interCompanyTransferRequests, leaveRequests, overtimeRequests, exitRequests, attendanceRequests, compOffRequests, confirmationRequests, shiftSwapRequests] = await Promise.all([
      prisma.expenseClaim.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: includeHistory ? ['PENDING', 'APPROVED', 'REJECTED'] : ['PENDING'] },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employmentHistory.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: includeHistory ? ['PENDING', 'APPROVED', 'REJECTED'] : ['PENDING'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          previousDepartment: { select: { name: true } },
          newDepartment: { select: { name: true } },
          previousJobProfile: { select: { title: true } },
          newJobProfile: { select: { title: true } },
          previousGrade: { select: { name: true } },
          newGrade: { select: { name: true } },
          previousLocation: { select: { name: true } },
          newLocation: { select: { name: true } },
        },
      }),
      prisma.interCompanyTransfer.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: {
            in: includeHistory
              ? ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
              : ['PENDING'],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          fromCompany: { select: { id: true, name: true, code: true } },
          toCompany: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: leaveStatuses },
        },
        orderBy: { appliedAt: 'desc' },
        include: {
          leaveType: { select: { name: true } },
        },
      }),
      prisma.overtimeRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: overtimeStatuses },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.exitRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: exitStatuses },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.attendanceRegularization.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: attendanceStatuses },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.compOffEarned.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: { in: compOffStatuses },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.confirmationRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          ...(includeHistory
            ? {}
            : {
                status: 'PENDING',
                OR: [{ managerApproval: null }, { managerApproval: 'PENDING' }],
              }),
        },
        orderBy: { requestedDate: 'desc' },
      }),
      prisma.shiftSwapRequest.findMany({
        where: {
          tenantId: user.tenantId,
          requestorId: { in: teamMemberIds },
          status: { in: includeHistory ? ['APPROVED_BY_PEER', 'APPROVED_BY_MANAGER', 'COMPLETED', 'REJECTED'] : ['APPROVED_BY_PEER'] },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const approvalEntityKeys = [
      ...expenseRequests.map((req) => ({ entityType: 'ExpenseClaim', entityId: req.id })),
      ...employmentHistoryRequests.map((req) => ({ entityType: 'EmploymentHistory', entityId: req.id })),
      ...interCompanyTransferRequests.map((req) => ({ entityType: 'InterCompanyTransfer', entityId: req.id })),
      ...leaveRequests.map((req) => ({ entityType: 'LeaveRequest', entityId: req.id })),
      ...overtimeRequests.map((req) => ({ entityType: 'OvertimeRequest', entityId: req.id })),
      ...exitRequests.map((req) => ({ entityType: 'ExitRequest', entityId: req.id })),
      ...attendanceRequests.map((req) => ({ entityType: 'AttendanceRegularization', entityId: req.id })),
      ...compOffRequests.map((req) => ({ entityType: 'CompOffEarned', entityId: req.id })),
      ...confirmationRequests.map((req) => ({ entityType: 'ConfirmationRequest', entityId: req.id })),
      ...shiftSwapRequests.map((req) => ({ entityType: 'ShiftSwapRequest', entityId: req.id })),
    ];

    const commentLogs = approvalEntityKeys.length
      ? await prisma.auditLog.findMany({
          where: {
            tenantId: user.tenantId,
            OR: approvalEntityKeys,
            action: {
              in: [
                'COMMENT_EXPENSE_CLAIM',
                'COMMENT_EMPLOYMENT_HISTORY',
                'COMMENT_INTER_COMPANY_TRANSFER',
                'COMMENT_LEAVE_REQUEST',
                'COMMENT_OVERTIME_REQUEST',
                'COMMENT_EXIT_REQUEST',
                'COMMENT_ATTENDANCE_REGULARIZATION',
                'COMMENT_COMP_OFF_REQUEST',
                'COMMENT_CONFIRMATION_REQUEST',
                'COMMENT_SHIFT_SWAP_REQUEST',
              ],
            },
          },
          orderBy: { timestamp: 'asc' },
        })
      : [];

    const confirmationDecisionLogs = confirmationRequests.length
      ? await prisma.auditLog.findMany({
          where: {
            tenantId: user.tenantId,
            OR: confirmationRequests.map((req) => ({
              entityType: 'ConfirmationRequest',
              entityId: req.id,
            })),
            action: {
              in: ['APPROVE_CONFIRMATION_REQUEST', 'REJECT_CONFIRMATION_REQUEST'],
            },
          },
          orderBy: { timestamp: 'asc' },
        })
      : [];

    const approverIds = Array.from(
      new Set(
        [
          ...expenseRequests.flatMap((req) => [req.approvedBy]),
          ...employmentHistoryRequests.flatMap((req) => [req.approvedBy, req.requestedBy]),
          ...interCompanyTransferRequests.flatMap((req) => [req.approvedBy, req.requestedBy]),
          ...leaveRequests.flatMap((req) => [req.approvedBy, req.rejectedBy]),
          ...overtimeRequests.flatMap((req) => [req.approvedBy]),
          ...attendanceRequests.flatMap((req) => [req.approvedBy]),
          ...compOffRequests.flatMap((req) => [req.approvedBy, req.rejectedBy]),
          ...shiftSwapRequests.flatMap((req) => [req.approvedBy]),
          ...commentLogs.map((log) => log.userId),
          ...confirmationDecisionLogs.map((log) => log.userId),
        ].filter(Boolean)
      )
    );

    const approverNames = new Map<string, string>();
    await Promise.all(
      approverIds.map(async (approverId) => {
        approverNames.set(approverId as string, await loadUserName(approverId as string));
      })
    );

    const commentMap = new Map<string, any[]>();
    const historyMap = new Map<string, any[]>();

    for (const log of commentLogs) {
      const requestType = getRequestTypeFromEntity(log.entityType);
      if (!requestType || !log.entityId) {
        continue;
      }

      const key = `${requestType}:${log.entityId}`;
      const actorName = approverNames.get(log.userId || '') || 'Unknown';
      const comment = buildAuditComment(log, actorName);
      const commentHistory = buildAuditCommentHistory(log, actorName);

      if (comment) {
        commentMap.set(key, [...(commentMap.get(key) || []), comment]);
      }

      if (commentHistory) {
        historyMap.set(key, [...(historyMap.get(key) || []), commentHistory]);
      }
    }

    for (const log of confirmationDecisionLogs) {
      if (!log.entityId) {
        continue;
      }

      const key = `confirmation:${log.entityId}`;
      const actorName = approverNames.get(log.userId || '') || 'Manager';
      const metadata = (log.metadata || {}) as Record<string, any>;
      const action = log.action === 'APPROVE_CONFIRMATION_REQUEST' ? 'approved' : 'rejected';

      historyMap.set(key, [
        ...(historyMap.get(key) || []),
        buildHistoryEntry(
          `confirmation-audit-${log.id}`,
          action,
          log.userId || 'unknown',
          actorName,
          log.timestamp,
          typeof metadata.comments === 'string' ? metadata.comments : undefined,
          1
        ),
      ]);
    }

    const approvals = [
      ...expenseRequests.map((req) =>
        buildExpenseApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || ''),
          commentMap.get(`expense:${req.id}`) || [],
          historyMap.get(`expense:${req.id}`) || []
        )
      ),
      ...employmentHistoryRequests.map((req) =>
        buildEmploymentHistoryApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || ''),
          commentMap.get(`employment-history:${req.id}`) || [],
          historyMap.get(`employment-history:${req.id}`) || []
        )
      ),
      ...interCompanyTransferRequests.map((req) =>
        buildInterCompanyTransferApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || ''),
          commentMap.get(`inter-company-transfer:${req.id}`) || [],
          historyMap.get(`inter-company-transfer:${req.id}`) || []
        )
      ),
      ...leaveRequests.map((req) =>
        buildLeaveApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || req.rejectedBy || ''),
          commentMap.get(`leave:${req.id}`) || [],
          historyMap.get(`leave:${req.id}`) || []
        )
      ),
      ...overtimeRequests.map((req) =>
        buildOvertimeApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || ''),
          commentMap.get(`overtime:${req.id}`) || [],
          historyMap.get(`overtime:${req.id}`) || []
        )
      ),
      ...exitRequests.map((req) =>
        buildExitApproval(
          req,
          employeeMap,
          commentMap.get(`exit:${req.id}`) || [],
          historyMap.get(`exit:${req.id}`) || []
        )
      ),
      ...attendanceRequests.map((req) =>
        buildAttendanceApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || ''),
          commentMap.get(`attendance:${req.id}`) || [],
          historyMap.get(`attendance:${req.id}`) || []
        )
      ),
      ...compOffRequests.map((req) =>
        buildCompOffApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || req.rejectedBy || ''),
          commentMap.get(`comp-off:${req.id}`) || [],
          historyMap.get(`comp-off:${req.id}`) || []
        )
      ),
      ...confirmationRequests.map((req) =>
        buildConfirmationApproval(
          req,
          employeeMap,
          commentMap.get(`confirmation:${req.id}`) || [],
          historyMap.get(`confirmation:${req.id}`) || []
        )
      ),
      ...shiftSwapRequests.map((req) =>
        buildShiftSwapApproval(
          req,
          employeeMap,
          approverNames.get(req.approvedBy || ''),
          commentMap.get(`shift-swap:${req.id}`) || [],
          historyMap.get(`shift-swap:${req.id}`) || []
        )
      ),
    ].sort(
      (left, right) => new Date(right.requestDate).getTime() - new Date(left.requestDate).getTime()
    );

    const summary = {
      total: approvals.filter((approval) => approval.approvalStatus === 'pending').length,
      expense: approvals.filter(
        (approval) => approval.requestType === 'expense' && approval.approvalStatus === 'pending'
      ).length,
      'employment-history': approvals.filter(
        (approval) =>
          approval.requestType === 'employment-history' && approval.approvalStatus === 'pending'
      ).length,
      'inter-company-transfer': approvals.filter(
        (approval) =>
          approval.requestType === 'inter-company-transfer' && approval.approvalStatus === 'pending'
      ).length,
      leave: approvals.filter(
        (approval) => approval.requestType === 'leave' && approval.approvalStatus === 'pending'
      ).length,
      overtime: approvals.filter(
        (approval) => approval.requestType === 'overtime' && approval.approvalStatus === 'pending'
      ).length,
      exit: approvals.filter(
        (approval) => approval.requestType === 'exit' && approval.approvalStatus === 'pending'
      ).length,
      attendance: approvals.filter(
        (approval) => approval.requestType === 'attendance' && approval.approvalStatus === 'pending'
      ).length,
      'comp-off': approvals.filter(
        (approval) => approval.requestType === 'comp-off' && approval.approvalStatus === 'pending'
      ).length,
      confirmation: approvals.filter(
        (approval) =>
          approval.requestType === 'confirmation' && approval.approvalStatus === 'pending'
      ).length,
      'shift-swap': approvals.filter(
        (approval) =>
          approval.requestType === 'shift-swap' && approval.approvalStatus === 'pending'
      ).length,
    };

    return NextResponse.json({ approvals, summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Internal server error',
        messageAr: 'خطأ داخلي في الخادم',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user, employeeId } = context;
    const body = await request.json();
    const validatedData = processApprovalSchema.parse(body);

    const { requestId, requestType, action, comments } = validatedData;
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    if (action === 'comment' && !comments?.trim()) {
      return NextResponse.json(
        {
          error: 'Comment text is required',
          message: 'Comment text is required',
          messageAr: 'نص التعليق مطلوب',
        },
        { status: 400 }
      );
    }

    if (!employeeId) {
      return NextResponse.json(
        {
          error: 'Manager employee ID not found',
          message: 'Manager employee ID not found',
          messageAr: 'لم يتم العثور على معرف الموظف الخاص بالمدير',
        },
        { status: 400 }
      );
    }

    let result;

    switch (requestType) {
      case 'expense': {
        const existing = await prisma.expenseClaim.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Expense claim not found',
              message: 'Expense claim not found',
              messageAr: 'لم يتم العثور على مطالبة المصروفات',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this expense claim',
              message: 'You are not authorized to process this expense claim',
              messageAr: 'لست مخولاً لمعالجة مطالبة المصروفات هذه',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.expenseClaim.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              approvedBy: user.userId,
              approvedAt: new Date(),
              rejectionReason: action === 'reject' ? comments || '' : null,
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action: action === 'approve' ? 'APPROVE_EXPENSE_CLAIM' : 'REJECT_EXPENSE_CLAIM',
              entityType: 'ExpenseClaim',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Expense claim approved | تمت الموافقة على مطالبة المصروفات'
                  : 'Expense claim rejected | تم رفض مطالبة المصروفات',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'employment-history': {
        const existing = await prisma.employmentHistory.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Employment history change not found',
              message: 'Employment history change not found',
              messageAr: 'لم يتم العثور على سجل تغيير التوظيف',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this employment change',
              message: 'You are not authorized to process this employment change',
              messageAr: 'لست مخولاً لمعالجة تغيير التوظيف هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.employmentHistory.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              approvedBy: user.userId,
              approvedAt: new Date(),
              notes:
                action === 'reject'
                  ? comments
                    ? `${existing.notes || ''}${existing.notes ? '\n\n' : ''}Rejection Reason: ${comments}`
                    : existing.notes
                  : existing.notes,
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action:
                action === 'approve'
                  ? 'APPROVE_EMPLOYMENT_HISTORY_CHANGE'
                  : 'REJECT_EMPLOYMENT_HISTORY_CHANGE',
              entityType: 'EmploymentHistory',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Employment history change approved | تمت الموافقة على تغيير التوظيف'
                  : 'Employment history change rejected | تم رفض تغيير التوظيف',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'inter-company-transfer': {
        const existing = await prisma.interCompanyTransfer.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Inter-company transfer not found',
              message: 'Inter-company transfer not found',
              messageAr: 'لم يتم العثور على طلب النقل بين الشركات',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this transfer request',
              message: 'You are not authorized to process this transfer request',
              messageAr: 'لست مخولاً لمعالجة طلب النقل هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.interCompanyTransfer.update({
            where: { id: requestId },
            data: {
              status: action === 'approve' ? 'APPROVED' : 'CANCELLED',
              approvedBy: user.userId,
              approvedAt: new Date(),
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action:
                action === 'approve'
                  ? 'APPROVE_INTER_COMPANY_TRANSFER'
                  : 'REJECT_INTER_COMPANY_TRANSFER',
              entityType: 'InterCompanyTransfer',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Inter-company transfer approved | تمت الموافقة على النقل بين الشركات'
                  : 'Inter-company transfer rejected | تم رفض النقل بين الشركات',
              metadata: {
                requestType,
                status: action === 'approve' ? 'APPROVED' : 'CANCELLED',
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'leave': {
        const existing = await prisma.leaveRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Leave request not found',
              message: 'Leave request not found',
              messageAr: 'لم يتم العثور على طلب الإجازة',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this leave request',
              message: 'You are not authorized to process this leave request',
              messageAr: 'لست مخولاً لمعالجة طلب الإجازة هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.leaveRequest.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              ...(action === 'approve'
                ? { approvedBy: user.userId, approvedAt: new Date() }
                : {
                    rejectedBy: user.userId,
                    rejectedAt: new Date(),
                    rejectionReason: comments || '',
                  }),
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action: action === 'approve' ? 'APPROVE_LEAVE_REQUEST' : 'REJECT_LEAVE_REQUEST',
              entityType: 'LeaveRequest',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Leave request approved | تمت الموافقة على طلب الإجازة'
                  : 'Leave request rejected | تم رفض طلب الإجازة',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'overtime': {
        const existing = await prisma.overtimeRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Overtime request not found',
              message: 'Overtime request not found',
              messageAr: 'لم يتم العثور على طلب العمل الإضافي',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this overtime request',
              message: 'You are not authorized to process this overtime request',
              messageAr: 'لست مخولاً لمعالجة طلب العمل الإضافي هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.overtimeRequest.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              ...(action === 'approve'
                ? { approvedBy: user.userId, approvedAt: new Date() }
                : {
                    rejectionReason: comments || '',
                  }),
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action: action === 'approve' ? 'APPROVE_OVERTIME_REQUEST' : 'REJECT_OVERTIME_REQUEST',
              entityType: 'OvertimeRequest',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Overtime request approved | تمت الموافقة على طلب العمل الإضافي'
                  : 'Overtime request rejected | تم رفض طلب العمل الإضافي',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'exit': {
        const existing = await prisma.exitRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Exit request not found',
              message: 'Exit request not found',
              messageAr: 'لم يتم العثور على طلب الخروج',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this exit request',
              message: 'You are not authorized to process this exit request',
              messageAr: 'لست مخولاً لمعالجة طلب الخروج هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.exitRequest.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              comments: comments || existing.comments,
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action: action === 'approve' ? 'APPROVE_EXIT_REQUEST' : 'REJECT_EXIT_REQUEST',
              entityType: 'ExitRequest',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Exit request approved | تمت الموافقة على طلب الخروج'
                  : 'Exit request rejected | تم رفض طلب الخروج',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'attendance': {
        const existing = await prisma.attendanceRegularization.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Attendance regularization not found',
              message: 'Attendance regularization not found',
              messageAr: 'لم يتم العثور على طلب تسوية الحضور',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this attendance request',
              message: 'You are not authorized to process this attendance request',
              messageAr: 'لست مخولاً لمعالجة طلب الحضور هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          if (action === 'approve' && (existing.requestedClockIn || existing.requestedClockOut)) {
            await tx.attendanceRecord.updateMany({
              where: {
                tenantId: user.tenantId,
                employeeId: existing.employeeId,
                date: existing.date,
              },
              data: {
                clockIn: existing.requestedClockIn || undefined,
                clockOut: existing.requestedClockOut || undefined,
                isRegularized: true,
                regularizationId: requestId,
              },
            });
          }

          const updated = await tx.attendanceRegularization.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              approvedBy: user.userId,
              approvedAt: new Date(),
              rejectionReason: action === 'reject' ? comments || '' : null,
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action:
                action === 'approve'
                  ? 'APPROVE_ATTENDANCE_REGULARIZATION'
                  : 'REJECT_ATTENDANCE_REGULARIZATION',
              entityType: 'AttendanceRegularization',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Attendance regularization approved | تمت الموافقة على تسوية الحضور'
                  : 'Attendance regularization rejected | تم رفض تسوية الحضور',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'comp-off': {
        const existing = await prisma.compOffEarned.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Comp-off request not found',
              message: 'Comp-off request not found',
              messageAr: 'لم يتم العثور على طلب التعويض',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this comp-off request',
              message: 'You are not authorized to process this comp-off request',
              messageAr: 'لست مخولاً لمعالجة طلب التعويض هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.compOffEarned.update({
            where: { id: requestId },
            data: {
              status: newStatus,
              ...(action === 'approve'
                ? {
                    approvedBy: user.userId,
                    approvedAt: new Date(),
                    rejectedBy: null,
                    rejectionReason: null,
                  }
                : {
                    rejectedBy: user.userId,
                    rejectionReason: comments || '',
                  }),
            },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action: action === 'approve' ? 'APPROVE_COMP_OFF_REQUEST' : 'REJECT_COMP_OFF_REQUEST',
              entityType: 'CompOffEarned',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Comp-off request approved | تمت الموافقة على طلب التعويض'
                  : 'Comp-off request rejected | تم رفض طلب التعويض',
              metadata: {
                requestType,
                status: newStatus,
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'confirmation': {
        const existing = await prisma.confirmationRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Confirmation request not found',
              message: 'Confirmation request not found',
              messageAr: 'لم يتم العثور على طلب التثبيت',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this confirmation request',
              message: 'You are not authorized to process this confirmation request',
              messageAr: 'لست مخولاً لمعالجة طلب التثبيت هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.confirmationRequest.update({
            where: { id: requestId },
            data:
              action === 'approve'
                ? {
                    managerApproval: 'APPROVED',
                  }
                : {
                    managerApproval: 'REJECTED',
                    status: 'REJECTED',
                  },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action:
                action === 'approve'
                  ? 'APPROVE_CONFIRMATION_REQUEST'
                  : 'REJECT_CONFIRMATION_REQUEST',
              entityType: 'ConfirmationRequest',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Confirmation request manager-approved | تمت الموافقة الإدارية على طلب التثبيت'
                  : 'Confirmation request manager-rejected | تم رفض طلب التثبيت من المدير',
              metadata: {
                requestType,
                status: action === 'approve' ? 'APPROVED' : 'REJECTED',
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
      case 'shift-swap': {
        const existing = await prisma.shiftSwapRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            {
              error: 'Shift swap request not found',
              message: 'Shift swap request not found',
              messageAr: 'لم يتم العثور على طلب تبديل الوردية',
            },
            { status: 404 }
          );
        }

        const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.requestorId);
        if (!isManaged) {
          return NextResponse.json(
            {
              error: 'You are not authorized to process this shift swap request',
              message: 'You are not authorized to process this shift swap request',
              messageAr: 'لست مخولاً لمعالجة طلب تبديل الوردية هذا',
            },
            { status: 403 }
          );
        }

        result = await prisma.$transaction(async (tx: any) => {
          const updated = await tx.shiftSwapRequest.update({
            where: { id: requestId },
            data:
              action === 'approve'
                ? {
                    managerApproval: 'APPROVED',
                    status: 'COMPLETED',
                    approvedBy: user.userId,
                    approvedAt: new Date(),
                    rejectionReason: null,
                  }
                : {
                    managerApproval: 'REJECTED',
                    status: 'REJECTED',
                    approvedBy: user.userId,
                    approvedAt: new Date(),
                    rejectionReason: comments || '',
                  },
          });

          await tx.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.userId,
              action:
                action === 'approve'
                  ? 'APPROVE_SHIFT_SWAP_REQUEST'
                  : 'REJECT_SHIFT_SWAP_REQUEST',
              entityType: 'ShiftSwapRequest',
              entityId: requestId,
              details:
                action === 'approve'
                  ? 'Shift swap request approved | تمت الموافقة على طلب تبديل الوردية'
                  : 'Shift swap request rejected | تم رفض طلب تبديل الوردية',
              metadata: {
                requestType,
                status: action === 'approve' ? 'COMPLETED' : 'REJECTED',
                comments: comments || null,
                actorEmployeeId: employeeId,
              },
              createdBy: user.userId,
              updatedBy: user.userId,
            },
          });

          return updated;
        });
        break;
      }
    }

    if (action === 'comment') {
      let existing;

      switch (requestType) {
        case 'expense':
          existing = await prisma.expenseClaim.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'employment-history':
          existing = await prisma.employmentHistory.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'inter-company-transfer':
          existing = await prisma.interCompanyTransfer.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'leave':
          existing = await prisma.leaveRequest.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'overtime':
          existing = await prisma.overtimeRequest.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'exit':
          existing = await prisma.exitRequest.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'attendance':
          existing = await prisma.attendanceRegularization.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'comp-off':
          existing = await prisma.compOffEarned.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'confirmation':
          existing = await prisma.confirmationRequest.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, employeeId: true },
          });
          break;
        case 'shift-swap':
          existing = await prisma.shiftSwapRequest.findFirst({
            where: { id: requestId, tenantId: user.tenantId },
            select: { id: true, requestorId: true },
          });
          if (existing) {
            existing = { id: existing.id, employeeId: existing.requestorId };
          }
          break;
      }

      if (!existing) {
        return NextResponse.json(
          {
            error: 'Approval request not found',
            message: 'Approval request not found',
            messageAr: 'لم يتم العثور على طلب الموافقة',
          },
          { status: 404 }
        );
      }

      const isManaged = await validateManagedRequest(user.tenantId, employeeId, existing.employeeId);
      if (!isManaged) {
        return NextResponse.json(
          {
            error: 'You are not authorized to comment on this approval request',
            message: 'You are not authorized to comment on this approval request',
            messageAr: 'لست مخولاً للتعليق على طلب الموافقة هذا',
          },
          { status: 403 }
        );
      }

      const entityType = getEntityType(requestType);

      result = await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: getCommentAction(entityType),
          entityType,
          entityId: requestId,
          details: 'Approval comment added | تمت إضافة تعليق على الموافقة',
          metadata: {
            requestType,
            comments: comments?.trim(),
            actorEmployeeId: employeeId,
          },
          createdBy: user.userId,
          updatedBy: user.userId,
        },
      });
    }

    return NextResponse.json(
      {
        message:
          action === 'comment' ? 'Comment added successfully' : `Request ${action}d successfully`,
        messageAr:
          action === 'approve'
            ? 'تمت الموافقة على الطلب بنجاح'
            : action === 'reject'
              ? 'تم رفض الطلب بنجاح'
              : 'تمت إضافة التعليق بنجاح',
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Validation error',
          messageAr: 'خطأ في التحقق من صحة البيانات',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('Error processing approval:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Internal server error',
        messageAr: 'خطأ داخلي في الخادم',
      },
      { status: 500 }
    );
  }
});
