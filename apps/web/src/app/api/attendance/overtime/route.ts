import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

const WORKING_DAYS_PER_MONTH = 22;
const HOURS_PER_DAY = 8;

function getMultiplier(overtimeType: string): number {
  const type = (overtimeType || '').toUpperCase();
  return type === 'WEEKEND' || type === 'HOLIDAY' ? 2.0 : 1.5;
}

async function getHourlyRate(employeeId: string): Promise<number> {
  try {
    // Path 1: Direct lookup by employeeId (UUID — production pattern)
    let salaryStructure = await prisma.employeeSalaryStructure.findFirst({
      where: { employeeId, isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });

    // Path 2: If not found, look up by employeeCode
    // (handles seed/legacy data where EmployeeSalaryStructure.employeeId
    //  stores an employee-code string like 'emp-001' instead of the Employee UUID)
    if (!salaryStructure) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { employeeCode: true },
      });

      if (employee?.employeeCode) {
        // Try both the raw employeeCode and lowercase variant
        // (handles seed data case mismatch: 'EMP-001' vs 'emp-001')
        salaryStructure = await prisma.employeeSalaryStructure.findFirst({
          where: {
            employeeId: { in: [employee.employeeCode, employee.employeeCode.toLowerCase()] },
            isActive: true,
          },
          orderBy: { effectiveFrom: 'desc' },
        });
      }
    }

    if (salaryStructure?.grossSalary) {
      const rate = Number(salaryStructure.grossSalary) / (WORKING_DAYS_PER_MONTH * HOURS_PER_DAY);
      return rate;
    }
  } catch {
    // Fall through to return 0
  }
  return 0;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId: contextEmployeeId } = context;
    const { searchParams } = new URL(request.url);
    const requestedEmployeeId = searchParams.get('employeeId');
    const employeeId =
      !requestedEmployeeId || ['current-user', 'current-user-id'].includes(requestedEmployeeId)
        ? contextEmployeeId || user.userId
        : requestedEmployeeId;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [overtime, hourlyRate] = await Promise.all([
      prisma.overtimeRequest.findMany({ where, orderBy: { createdAt: 'desc' } }),
      employeeId ? getHourlyRate(employeeId) : Promise.resolve(0),
    ]);

    const overtimeWithPayout = overtime.map((r) => {
      const multiplier = getMultiplier(r.overtimeType);
      const hours = r.actualHours ?? (r.totalHours || 0);
      const payout = hourlyRate > 0 ? Math.round(hours * hourlyRate * multiplier * 100) / 100 : 0;
      return { ...r, payout, hourlyRate: Math.round(hourlyRate * 100) / 100, multiplier };
    });

    const totalPendingEstimatedPayout = overtimeWithPayout
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + (r.payout || 0), 0);

    const summary = {
      totalHours: overtime.reduce((sum, r) => sum + r.totalHours, 0),
      totalAmount: overtimeWithPayout.reduce((sum, r) => sum + (r.payout || 0), 0),
      pendingApproval: overtime.filter((r) => r.status === 'PENDING').length,
      approved: overtime.filter((r) => r.status === 'APPROVED').length,
      rejected: overtime.filter((r) => r.status === 'REJECTED').length,
      estimatedPayout: totalPendingEstimatedPayout,
    };

    return NextResponse.json({
      success: true,
      data: {
        overtime: overtimeWithPayout,
        summary,
        employeeId,
        estimatedPayout: totalPendingEstimatedPayout,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch overtime records' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId: contextEmployeeId } = context;
    const body = await request.json();
    const action = body.action || 'submit';

    switch (action) {
      case 'submit': {
        const employeeId =
          !body.employeeId || ['current-user', 'current-user-id'].includes(body.employeeId)
            ? contextEmployeeId || user.userId
            : body.employeeId;

        if (!employeeId || !body.date || !body.overtimeMinutes) {
          return NextResponse.json(
            { error: 'employeeId, date, and overtimeMinutes are required' },
            { status: 400 }
          );
        }

        const record = await prisma.overtimeRequest.create({
          data: {
            tenantId: user.tenantId,
            employeeId,
            overtimeDate: new Date(body.date),
            startTime: body.startTime ? new Date(body.startTime) : new Date(body.date),
            endTime: body.endTime ? new Date(body.endTime) : new Date(body.date),
            totalHours: body.overtimeMinutes / 60,
            overtimeType: body.overtimeType || 'REGULAR',
            reason: body.reason || '',
            workDescription: body.workDescription,
            project: body.project,
            status: 'PENDING',
            compensationType: body.compensationType,
          },
        });

        return NextResponse.json({
          success: true,
          data: record,
        });
      }

      case 'approve': {
        if (!body.overtimeId || !body.approverId) {
          return NextResponse.json(
            { error: 'overtimeId and approverId are required' },
            { status: 400 }
          );
        }

        // tenant-ok: preceded by tenant-scoped findFirst or local tenantId binding
        const approved = await prisma.overtimeRequest.update({
          where: { id: body.overtimeId },
          data: {
            status: 'APPROVED',
            approvedBy: body.approverId,
            approvedAt: new Date(),
            actualHours: body.approvedMinutes ? body.approvedMinutes / 60 : undefined,
          },
        });

        return NextResponse.json({
          success: true,
          data: approved,
        });
      }

      case 'reject': {
        if (!body.overtimeId || !body.approverId || !body.rejectionReason) {
          return NextResponse.json(
            { error: 'overtimeId, approverId, and rejectionReason are required' },
            { status: 400 }
          );
        }

        // tenant-ok: preceded by tenant-scoped findFirst or local tenantId binding
        const rejected = await prisma.overtimeRequest.update({
          where: { id: body.overtimeId },
          data: {
            status: 'REJECTED',
            approvedBy: body.approverId,
            rejectionReason: body.rejectionReason,
          },
        });

        return NextResponse.json({
          success: true,
          data: rejected,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process overtime' },
      { status: 500 }
    );
  }
});
