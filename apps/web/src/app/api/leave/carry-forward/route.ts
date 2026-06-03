import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch carry forward data from database
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const employeeId = searchParams.get('employeeId');

    const tenantId = user.tenantId;
    const toYear = parseInt(year);

    const where: Record<string, unknown> = {
      tenantId,
      toYear,
    };
    if (employeeId) where.employeeId = employeeId;

    const carryForwards = await prisma.leaveCarryForward.findMany({
      where,
      orderBy: { processedAt: 'desc' },
    });

    // Build summary from real data
    const uniqueEmployees = new Set(carryForwards.map((cf) => cf.employeeId));
    const totalDaysCarried = carryForwards.reduce(
      (sum, cf) => sum + Number(cf.carryForwardApplied),
      0
    );
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringIn30Days = carryForwards.filter(
      (cf) => cf.expiryDate && !cf.isExpired && cf.expiryDate <= thirtyDaysFromNow
    ).length;

    const summary = {
      totalEmployees: uniqueEmployees.size,
      totalDaysCarried,
      averagePerEmployee: uniqueEmployees.size > 0 ? totalDaysCarried / uniqueEmployees.size : 0,
      expiringIn30Days,
    };

    return NextResponse.json({
      success: true,
      carryForwards,
      records: carryForwards,
      data: {
        year: toYear,
        summary,
        records: carryForwards,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching carry forward data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carry forward data' },
      { status: 500 }
    );
  }
});

// POST - Process carry forward
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { year, employeeIds } = body;
    const tenantId = user.tenantId;

    if (!year) {
      return NextResponse.json({ success: false, error: 'Year is required' }, { status: 400 });
    }

    const fromYear = parseInt(year);
    const toYear = fromYear + 1;

    // Get policies that allow carry forward
    const policies = await prisma.leavePolicy.findMany({
      where: {
        tenantId,
        isActive: true,
        allowCarryForward: true,
      },
    });

    // Get balances for the fromYear
    const balanceWhere: Record<string, unknown> = {
      tenantId,
      leaveYear: fromYear,
    };
    if (employeeIds && employeeIds.length > 0) {
      balanceWhere.employeeId = { in: employeeIds };
    }

    // tenant-ok: balanceWhere built above includes tenantId
    const balances = await prisma.leaveBalance.findMany({
      where: balanceWhere,
      include: { policy: true },
    });

    let processedCount = 0;
    let totalDaysCarried = 0;

    for (const balance of balances) {
      const policy = policies.find((p) => p.id === balance.policyId);
      if (!policy) continue;

      const currentBalance = Number(balance.currentBalance);
      if (currentBalance <= 0) continue;

      const maxCarryForward = policy.maxCarryForwardDays
        ? Number(policy.maxCarryForwardDays)
        : currentBalance;

      const carryForwardApplied = Math.min(currentBalance, maxCarryForward);
      const lapsed = currentBalance - carryForwardApplied;

      const expiryDate = policy.carryForwardExpiryMonths
        ? new Date(toYear, policy.carryForwardExpiryMonths - 1, 31)
        : null;

      await prisma.leaveCarryForward.upsert({
        where: {
          employeeId_policyId_fromYear_toYear: {
            employeeId: balance.employeeId,
            policyId: balance.policyId,
            fromYear,
            toYear,
          },
        },
        update: {
          previousYearBalance: currentBalance,
          carryForwardEligible: maxCarryForward,
          carryForwardApplied,
          lapsed,
          expiryDate,
          processedAt: new Date(),
        },
        create: {
          tenantId,
          employeeId: balance.employeeId,
          policyId: balance.policyId,
          fromYear,
          toYear,
          previousYearBalance: currentBalance,
          carryForwardEligible: maxCarryForward,
          carryForwardApplied,
          lapsed,
          expiryDate,
        },
      });

      totalDaysCarried += carryForwardApplied;
      processedCount++;
    }

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        resourceType: 'Leave - Carry Forward',
        metadata: {
          description: `Processed carry forward for year ${fromYear} -> ${toYear}: ${processedCount} balances, ${totalDaysCarried} days carried`,
        } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    const result = {
      fromYear,
      toYear,
      processedCount,
      totalDaysCarried,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
      carryForward: result,
    });
  } catch (error: any) {
    logger.error('Error processing carry forward:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process carry forward' },
      { status: 500 }
    );
  }
});
