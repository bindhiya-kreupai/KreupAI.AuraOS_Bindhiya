import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const processApprovalSchema = z.object({
  requestId: z.string().min(1),
  requestType: z.enum(['leave', 'overtime', 'exit']),
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, employeeId } = context;
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || employeeId;

    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager employee ID not found' },
        { status: 400 }
      );
    }

    const teamMembers = await prisma.employee.findMany({
      where: {
        managerId,
        company: { tenantId: user.tenantId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
      },
    });

    const teamMemberIds = teamMembers.map((m) => m.id);
    const employeeMap = new Map(
      teamMembers.map((m) => [
        m.id,
        {
          name: `${m.firstName} ${m.lastName}`,
          department: m.department?.name || '',
        },
      ])
    );

    const [leaveRequests, overtimeRequests, exitRequests] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: 'PENDING',
        },
        orderBy: { appliedAt: 'desc' },
      }),
      prisma.overtimeRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.exitRequest.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: teamMemberIds },
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const approvals: any[] = [];

    for (const req of leaveRequests) {
      const emp = employeeMap.get(req.employeeId);
      approvals.push({
        requestId: req.id,
        requestType: 'leave',
        requestTitle: `Leave Request - ${emp?.name || 'Unknown'}`,
        requestDate: req.appliedAt,
        requestedBy: req.employeeId,
        requestedByName: emp?.name || 'Unknown',
        requestedByDepartment: emp?.department || '',
        approvalStatus: 'pending',
        priority: 'medium',
        details: {
          startDate: req.startDate,
          endDate: req.endDate,
          totalDays: req.totalDays,
          reason: req.reason,
        },
      });
    }

    for (const req of overtimeRequests) {
      const emp = employeeMap.get(req.employeeId);
      approvals.push({
        requestId: req.id,
        requestType: 'overtime',
        requestTitle: `Overtime Request - ${emp?.name || 'Unknown'}`,
        requestDate: req.createdAt,
        requestedBy: req.employeeId,
        requestedByName: emp?.name || 'Unknown',
        requestedByDepartment: emp?.department || '',
        approvalStatus: 'pending',
        priority: 'medium',
        details: {
          overtimeDate: req.overtimeDate,
          totalHours: req.totalHours,
          overtimeType: req.overtimeType,
          reason: req.reason,
        },
      });
    }

    for (const req of exitRequests) {
      const emp = employeeMap.get(req.employeeId);
      approvals.push({
        requestId: req.id,
        requestType: 'exit',
        requestTitle: `Exit Request - ${emp?.name || 'Unknown'}`,
        requestDate: req.createdAt,
        requestedBy: req.employeeId,
        requestedByName: emp?.name || 'Unknown',
        requestedByDepartment: emp?.department || '',
        approvalStatus: 'pending',
        priority: 'high',
        details: {
          exitType: req.exitType,
          resignationDate: req.resignationDate,
          lastWorkingDate: req.lastWorkingDate,
          reason: req.reason,
        },
      });
    }

    const summary = {
      total: approvals.length,
      leave: leaveRequests.length,
      overtime: overtimeRequests.length,
      exit: exitRequests.length,
    };

    return NextResponse.json({ approvals, summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validatedData = processApprovalSchema.parse(body);

    const { requestId, requestType, action, comments } = validatedData;
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    let result;

    switch (requestType) {
      case 'leave': {
        const existing = await prisma.leaveRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            { error: 'Leave request not found' },
            { status: 404 }
          );
        }
        result = await prisma.leaveRequest.update({
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
        break;
      }
      case 'overtime': {
        const existing = await prisma.overtimeRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            { error: 'Overtime request not found' },
            { status: 404 }
          );
        }
        result = await prisma.overtimeRequest.update({
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
        break;
      }
      case 'exit': {
        const existing = await prisma.exitRequest.findFirst({
          where: { id: requestId, tenantId: user.tenantId },
        });
        if (!existing) {
          return NextResponse.json(
            { error: 'Exit request not found' },
            { status: 404 }
          );
        }
        result = await prisma.exitRequest.update({
          where: { id: requestId },
          data: {
            status: newStatus,
          },
        });
        break;
      }
    }

    return NextResponse.json(
      { message: `Request ${action}d successfully`, result },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
