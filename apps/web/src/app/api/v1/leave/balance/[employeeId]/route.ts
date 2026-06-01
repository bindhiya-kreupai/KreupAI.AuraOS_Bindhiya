import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/leave/balance/:employeeId
 * Get leave balance for an employee across all leave types
 *
 * Query Parameters:
 * - year (optional): Year for leave balance (defaults to current year)
 */
export const GET = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { params: { employeeId: string } } & Record<string, any>
  ) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('leave:read')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave:read permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { employeeId } = context.params;
      const { searchParams } = new URL(request.url);
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

      // Verify the employee belongs to the same tenant
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          company: { tenantId: user.tenantId },
        },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!employee) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Employee not found',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 404 }
        );
      }

      // Get all leave balances for this employee and year, joined with policy
      const balances = await prisma.leaveBalance.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId,
          leaveYear: year,
        },
        include: {
          policy: {
            select: {
              id: true,
              code: true,
              name: true,
              leaveTypeId: true,
              annualEntitlement: true,
              allowCarryForward: true,
              maxCarryForwardDays: true,
              allowEncashment: true,
              maxEncashmentDays: true,
            },
          },
        },
        orderBy: { policy: { name: 'asc' } },
      });

      // Count pending leave requests per policy for this employee
      const pendingRequests = await prisma.leaveRequest.groupBy({
        by: ['policyId'],
        where: {
          tenantId: user.tenantId,
          employeeId,
          status: 'PENDING',
          startDate: {
            gte: new Date(`${year}-01-01`),
          },
          endDate: {
            lte: new Date(`${year}-12-31`),
          },
        },
        _sum: { totalDays: true },
      });

      const pendingByPolicy = new Map(
        pendingRequests.map((p) => [p.policyId, Number(p._sum.totalDays ?? 0)])
      );

      // Build the response balances
      const balanceItems = balances.map((b) => {
        const pending = pendingByPolicy.get(b.policyId) ?? 0;
        return {
          leavePolicyId: b.policyId,
          leaveType: b.policy.name,
          leaveTypeCode: b.policy.code,
          annualEntitlement: Number(b.policy.annualEntitlement),
          accrued: Number(b.accrued),
          utilized: Number(b.taken),
          pending,
          carriedForward: Number(b.carriedForward),
          encashed: Number(b.encashed),
          lapsed: Number(b.lapsed),
          available: Number(b.currentBalance),
          maxCarryForward: b.policy.maxCarryForwardDays ? Number(b.policy.maxCarryForwardDays) : 0,
          canEncash: b.policy.allowEncashment,
          maxEncashment: b.policy.maxEncashmentDays ? Number(b.policy.maxEncashmentDays) : 0,
        };
      });

      // Build summary
      const summary = {
        totalEntitlement: balanceItems.reduce((sum, b) => sum + b.annualEntitlement, 0),
        totalAccrued: balanceItems.reduce((sum, b) => sum + b.accrued, 0),
        totalUtilized: balanceItems.reduce((sum, b) => sum + b.utilized, 0),
        totalPending: balanceItems.reduce((sum, b) => sum + b.pending, 0),
        totalAvailable: balanceItems.reduce((sum, b) => sum + b.available, 0),
        totalCarriedForward: balanceItems.reduce((sum, b) => sum + b.carriedForward, 0),
      };

      return NextResponse.json(
        {
          success: true,
          data: {
            employeeId: employee.id,
            employeeCode: employee.employeeCode,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            year,
            balances: balanceItems,
            summary,
            generatedAt: new Date().toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('[Leave Balance API] GET Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to fetch leave balance',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 500 }
      );
    }
  }
);
