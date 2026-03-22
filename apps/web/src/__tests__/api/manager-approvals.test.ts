import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
  employeeId: 'mgr-1',
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    leaveRequest: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    overtimeRequest: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    exitRequest: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    attendanceRegularization: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    expenseClaim: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    employmentHistory: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    interCompanyTransfer: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    compOffEarned: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    confirmationRequest: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    shiftSwapRequest: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    attendanceRecord: {
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/manager/approvals/route';

describe('manager approvals API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.employee.findMany.mockResolvedValue([
      {
        id: 'emp-1',
        firstName: 'Jane',
        lastName: 'Doe',
        department: { name: 'Engineering' },
      },
    ]);
    prismaMock.overtimeRequest.findMany.mockResolvedValue([]);
    prismaMock.exitRequest.findMany.mockResolvedValue([]);
    prismaMock.attendanceRegularization.findMany.mockResolvedValue([]);
    prismaMock.expenseClaim.findMany.mockResolvedValue([]);
    prismaMock.employmentHistory.findMany.mockResolvedValue([]);
    prismaMock.interCompanyTransfer.findMany.mockResolvedValue([]);
    prismaMock.compOffEarned.findMany.mockResolvedValue([]);
    prismaMock.confirmationRequest.findMany.mockResolvedValue([]);
    prismaMock.shiftSwapRequest.findMany.mockResolvedValue([]);
    prismaMock.auditLog.findMany.mockResolvedValue([]);
    prismaMock.user.findUnique.mockResolvedValue({ firstName: 'Manager', lastName: 'One' });
  });

  it('returns current and completed approvals when includeHistory is enabled', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([
      {
        id: 'leave-pending',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'PENDING',
        appliedAt: new Date('2026-03-20T00:00:00.000Z'),
        startDate: new Date('2026-03-25T00:00:00.000Z'),
        endDate: new Date('2026-03-26T00:00:00.000Z'),
        totalDays: '2',
        reason: 'Vacation',
        currentApproverLevel: 1,
        approvers: [{ level: 1 }],
        leaveType: { name: 'Annual' },
        documents: [],
      },
      {
        id: 'leave-approved',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'APPROVED',
        appliedAt: new Date('2026-03-18T00:00:00.000Z'),
        startDate: new Date('2026-03-22T00:00:00.000Z'),
        endDate: new Date('2026-03-23T00:00:00.000Z'),
        totalDays: '2',
        reason: 'Family event',
        currentApproverLevel: 1,
        approvers: [{ level: 1 }],
        leaveType: { name: 'Annual' },
        approvedBy: 'user-99',
        approvedAt: new Date('2026-03-19T00:00:00.000Z'),
        documents: [],
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.approvals).toHaveLength(2);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 1, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 });
    expect(payload.approvals[1].history.at(-1).action).toBe('approved');
  });

  it('returns audit-backed comments in approval history', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([
      {
        id: 'leave-pending',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'PENDING',
        appliedAt: new Date('2026-03-20T00:00:00.000Z'),
        startDate: new Date('2026-03-25T00:00:00.000Z'),
        endDate: new Date('2026-03-26T00:00:00.000Z'),
        totalDays: '2',
        reason: 'Vacation',
        currentApproverLevel: 1,
        approvers: [{ level: 1 }],
        leaveType: { name: 'Annual' },
        documents: [],
      },
    ]);
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        id: 'audit-comment-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'COMMENT_LEAVE_REQUEST',
        entityType: 'LeaveRequest',
        entityId: 'leave-pending',
        metadata: { comments: 'Please verify project coverage before leave.' },
        timestamp: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.approvals[0].comments).toHaveLength(1);
    expect(payload.approvals[0].comments[0].text).toBe('Please verify project coverage before leave.');
    expect(payload.approvals[0].history.at(-1).action).toBe('commented');
  });

  it('returns attendance regularizations in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.attendanceRegularization.findMany.mockResolvedValue([
      {
        id: 'att-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        date: new Date('2026-03-20T00:00:00.000Z'),
        regularizationType: 'MISSED_PUNCH',
        requestedClockIn: new Date('2026-03-20T09:05:00.000Z'),
        requestedClockOut: new Date('2026-03-20T18:10:00.000Z'),
        reason: 'Biometric device failed.',
        attachments: ['biometric-screenshot.png'],
        status: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 1, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'att-1',
      requestType: 'attendance',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      regularizationType: 'MISSED_PUNCH',
      reason: 'Biometric device failed.',
    });
  });

  it('returns comp-off requests in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.compOffEarned.findMany.mockResolvedValue([
      {
        id: 'co-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        workedDate: new Date('2026-03-20T00:00:00.000Z'),
        workedHours: 8,
        reason: 'Weekend production release.',
        projectCode: 'REL-24',
        creditedDays: 1,
        expiryDate: new Date('2026-06-20T00:00:00.000Z'),
        isUsed: false,
        usedDate: null,
        usedLeaveRequestId: null,
        remainingDays: 1,
        status: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectionReason: null,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 1, confirmation: 0, 'shift-swap': 0 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'co-1',
      requestType: 'comp-off',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      creditedDays: 1,
      projectCode: 'REL-24',
      reason: 'Weekend production release.',
    });
  });

  it('returns confirmation requests in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.confirmationRequest.findMany.mockResolvedValue([
      {
        id: 'cf-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        eligibleDate: new Date('2026-04-01T00:00:00.000Z'),
        requestedDate: new Date('2026-03-21T00:00:00.000Z'),
        status: 'PENDING',
        managerApproval: 'PENDING',
        hrApproval: 'PENDING',
        confirmationDate: null,
        confirmationLetterUrl: null,
        newSalary: '95000',
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 1, 'shift-swap': 0 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'cf-1',
      requestType: 'confirmation',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      managerApproval: 'PENDING',
      hrApproval: 'PENDING',
    });
  });

  it('returns shift swap requests in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.shiftSwapRequest.findMany.mockResolvedValue([
      {
        id: 'swap-1',
        tenantId: 'tenant-1',
        requestorId: 'emp-1',
        swapWithId: 'emp-2',
        requestorDate: new Date('2026-03-25T00:00:00.000Z'),
        requestorShiftId: 'shift-a',
        swapWithDate: new Date('2026-03-26T00:00:00.000Z'),
        swapWithShiftId: 'shift-b',
        reason: 'Medical appointment coverage.',
        status: 'APPROVED_BY_PEER',
        swapWithApproval: 'APPROVED',
        managerApproval: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 1 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'swap-1',
      requestType: 'shift-swap',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      peerApproval: 'APPROVED',
      managerApproval: 'PENDING',
    });
  });

  it('returns expense claims in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.expenseClaim.findMany.mockResolvedValue([
      {
        id: 'exp-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        title: 'Client site visit',
        amount: 1450.75,
        currency: 'USD',
        category: 'TRAVEL',
        date: new Date('2026-03-20T00:00:00.000Z'),
        receiptUrl: 'https://example.com/receipt.pdf',
        description: 'Taxi and accommodation',
        status: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 1, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'exp-1',
      requestType: 'expense',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      expenseCategory: 'TRAVEL',
      totalAmount: 1450.75,
      businessPurpose: 'Client site visit',
    });
  });

  it('returns employment history changes in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.employmentHistory.findMany.mockResolvedValue([
      {
        id: 'eh-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        changeType: 'PROMOTION',
        effectiveDate: new Date('2026-04-01T00:00:00.000Z'),
        reason: 'Strong review cycle performance',
        notes: null,
        previousDepartment: { name: 'Engineering' },
        newDepartment: { name: 'Engineering' },
        previousJobProfile: { title: 'Senior Engineer' },
        newJobProfile: { title: 'Staff Engineer' },
        previousGrade: { name: 'G6' },
        newGrade: { name: 'G7' },
        previousLocation: null,
        newLocation: null,
        previousManagerId: 'mgr-1',
        newManagerId: 'mgr-1',
        previousSalary: '90000',
        newSalary: '105000',
        previousEmploymentType: 'FULL_TIME',
        newEmploymentType: 'FULL_TIME',
        requestedBy: 'user-2',
        approvedBy: null,
        approvedAt: null,
        status: 'PENDING',
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 1, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'eh-1',
      requestType: 'employment-history',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      changeType: 'PROMOTION',
      newGrade: 'G7',
      newSalary: 105000,
    });
  });

  it('returns inter-company transfers in the manager approval feed', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([]);
    prismaMock.interCompanyTransfer.findMany.mockResolvedValue([
      {
        id: 'trf-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        fromCompanyId: 'COMP-1',
        toCompanyId: 'COMP-2',
        transferType: 'PERMANENT',
        effectiveDate: new Date('2026-04-15T00:00:00.000Z'),
        status: 'PENDING',
        requestedBy: 'user-2',
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        fromCompany: { id: 'COMP-1', name: 'Aura Dubai', code: 'DXB' },
        toCompany: { id: 'COMP-2', name: 'Aura Riyadh', code: 'RUH' },
      },
    ]);

    const request = new NextRequest('http://localhost/api/manager/approvals?includeHistory=true');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.summary).toEqual({ total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 1, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 });
    expect(payload.approvals[0]).toMatchObject({
      requestId: 'trf-1',
      requestType: 'inter-company-transfer',
      approvalStatus: 'pending',
    });
    expect(payload.approvals[0].details).toMatchObject({
      transferType: 'PERMANENT',
      fromCompanyName: 'Aura Dubai',
      toCompanyName: 'Aura Riyadh',
    });
  });

  it('writes an audit log when a manager approves a leave request', async () => {
    prismaMock.leaveRequest.findFirst.mockResolvedValue({
      id: 'leave-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      comments: null,
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: {
        update: vi.fn().mockResolvedValue({ id: 'leave-1', status: 'APPROVED' }),
      },
      expenseClaim: { update: vi.fn() },
      interCompanyTransfer: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: { update: vi.fn() },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'leave-1',
        requestType: 'leave',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.leaveRequest.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'LeaveRequest',
          entityId: 'leave-1',
          tenantId: 'tenant-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager adds a comment', async () => {
    prismaMock.leaveRequest.findFirst.mockResolvedValue({
      id: 'leave-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prismaMock.auditLog.create.mockResolvedValue({ id: 'audit-comment-1' });

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'leave-1',
        requestType: 'leave',
        action: 'comment',
        comments: 'Need handover confirmation before approval.',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toBe('Comment added successfully');
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'COMMENT_LEAVE_REQUEST',
          entityType: 'LeaveRequest',
          entityId: 'leave-1',
        }),
      })
    );
  });

  it('updates attendance records and audit log when a manager approves an attendance regularization', async () => {
    prismaMock.attendanceRegularization.findFirst.mockResolvedValue({
      id: 'att-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      date: new Date('2026-03-20T00:00:00.000Z'),
      requestedClockIn: new Date('2026-03-20T09:05:00.000Z'),
      requestedClockOut: new Date('2026-03-20T18:10:00.000Z'),
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: { update: vi.fn() },
      interCompanyTransfer: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: { update: vi.fn() },
      attendanceRegularization: {
        update: vi.fn().mockResolvedValue({ id: 'att-1', status: 'APPROVED' }),
      },
      attendanceRecord: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-att-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'att-1',
        requestType: 'attendance',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.attendanceRecord.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ employeeId: 'emp-1', tenantId: 'tenant-1' }),
        data: expect.objectContaining({ isRegularized: true, regularizationId: 'att-1' }),
      })
    );
    expect(tx.attendanceRegularization.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_ATTENDANCE_REGULARIZATION',
          entityType: 'AttendanceRegularization',
          entityId: 'att-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager approves a comp-off request', async () => {
    prismaMock.compOffEarned.findFirst.mockResolvedValue({
      id: 'co-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      status: 'PENDING',
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: { update: vi.fn() },
      interCompanyTransfer: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: { update: vi.fn() },
      attendanceRegularization: { update: vi.fn() },
      attendanceRecord: { updateMany: vi.fn() },
      compOffEarned: {
        update: vi.fn().mockResolvedValue({ id: 'co-1', status: 'APPROVED' }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-co-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'co-1',
        requestType: 'comp-off',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.compOffEarned.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_COMP_OFF_REQUEST',
          entityType: 'CompOffEarned',
          entityId: 'co-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager approves a confirmation request', async () => {
    prismaMock.confirmationRequest.findFirst.mockResolvedValue({
      id: 'cf-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      status: 'PENDING',
      managerApproval: 'PENDING',
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: { update: vi.fn() },
      interCompanyTransfer: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      attendanceRegularization: { update: vi.fn() },
      attendanceRecord: { updateMany: vi.fn() },
      compOffEarned: { update: vi.fn() },
      confirmationRequest: {
        update: vi.fn().mockResolvedValue({ id: 'cf-1', managerApproval: 'APPROVED' }),
      },
      shiftSwapRequest: { update: vi.fn() },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-cf-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'cf-1',
        requestType: 'confirmation',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.confirmationRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ managerApproval: 'APPROVED' }),
      })
    );
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_CONFIRMATION_REQUEST',
          entityType: 'ConfirmationRequest',
          entityId: 'cf-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager approves a shift swap request', async () => {
    prismaMock.shiftSwapRequest.findFirst.mockResolvedValue({
      id: 'swap-1',
      tenantId: 'tenant-1',
      requestorId: 'emp-1',
      status: 'APPROVED_BY_PEER',
      managerApproval: 'PENDING',
      swapWithApproval: 'APPROVED',
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: { update: vi.fn() },
      interCompanyTransfer: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      attendanceRegularization: { update: vi.fn() },
      attendanceRecord: { updateMany: vi.fn() },
      compOffEarned: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: {
        update: vi.fn().mockResolvedValue({ id: 'swap-1', managerApproval: 'APPROVED', status: 'COMPLETED' }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-swap-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'swap-1',
        requestType: 'shift-swap',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.shiftSwapRequest.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_SHIFT_SWAP_REQUEST',
          entityType: 'ShiftSwapRequest',
          entityId: 'swap-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager approves an expense claim', async () => {
    prismaMock.expenseClaim.findFirst.mockResolvedValue({
      id: 'exp-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      status: 'PENDING',
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: {
        update: vi.fn().mockResolvedValue({ id: 'exp-1', status: 'APPROVED' }),
      },
      interCompanyTransfer: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      attendanceRegularization: { update: vi.fn() },
      attendanceRecord: { updateMany: vi.fn() },
      compOffEarned: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: { update: vi.fn() },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-exp-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'exp-1',
        requestType: 'expense',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.expenseClaim.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_EXPENSE_CLAIM',
          entityType: 'ExpenseClaim',
          entityId: 'exp-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager approves an inter-company transfer', async () => {
    prismaMock.interCompanyTransfer.findFirst.mockResolvedValue({
      id: 'trf-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      status: 'PENDING',
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: { update: vi.fn() },
      interCompanyTransfer: {
        update: vi.fn().mockResolvedValue({ id: 'trf-1', status: 'APPROVED' }),
      },
      employmentHistory: { update: vi.fn() },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      attendanceRegularization: { update: vi.fn() },
      attendanceRecord: { updateMany: vi.fn() },
      compOffEarned: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: { update: vi.fn() },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-trf-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'trf-1',
        requestType: 'inter-company-transfer',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.interCompanyTransfer.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_INTER_COMPANY_TRANSFER',
          entityType: 'InterCompanyTransfer',
          entityId: 'trf-1',
        }),
      })
    );
  });

  it('writes an audit log when a manager approves an employment history change', async () => {
    prismaMock.employmentHistory.findFirst.mockResolvedValue({
      id: 'eh-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      status: 'PENDING',
      notes: null,
    });
    prismaMock.employee.findFirst.mockResolvedValue({ id: 'emp-1' });

    const tx = {
      leaveRequest: { update: vi.fn() },
      expenseClaim: { update: vi.fn() },
      employmentHistory: {
        update: vi.fn().mockResolvedValue({ id: 'eh-1', status: 'APPROVED' }),
      },
      overtimeRequest: { update: vi.fn() },
      exitRequest: { update: vi.fn() },
      attendanceRegularization: { update: vi.fn() },
      attendanceRecord: { updateMany: vi.fn() },
      compOffEarned: { update: vi.fn() },
      confirmationRequest: { update: vi.fn() },
      shiftSwapRequest: { update: vi.fn() },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-eh-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const request = new NextRequest('http://localhost/api/manager/approvals', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'eh-1',
        requestType: 'employment-history',
        action: 'approve',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.messageAr).toBe('تمت الموافقة على الطلب بنجاح');
    expect(tx.employmentHistory.update).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'APPROVE_EMPLOYMENT_HISTORY_CHANGE',
          entityType: 'EmploymentHistory',
          entityId: 'eh-1',
        }),
      })
    );
  });
});