export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

interface CostForecastEntry {
  period: string;
  regularHours: number;
  overtimeHours: number;
  regularCost: number;
  overtimeCost: number;
  benefitsCost: number;
  totalCost: number;
  headcount: number;
}

/**
 * GET /api/v1/attendance/labor-cost/forecast
 * Compute labor cost forecast from AttendanceRecord data
 *
 * Query Parameters:
 * - startDate (optional): Start date (YYYY-MM-DD), defaults to start of current quarter
 * - endDate (optional): End date (YYYY-MM-DD), defaults to end of current quarter
 * - currency (optional): Currency code, defaults to USD
 * - hourlyRate (optional): Average hourly rate for estimation, defaults to 40
 * - overtimeMultiplier (optional): Overtime rate multiplier, defaults to 1.5
 * - benefitsRate (optional): Benefits as percentage of regular cost, defaults to 0.25
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = context.user.tenantId;

    // Parse parameters with defaults
    const now = new Date();
    const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const currentQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);

    const startDateStr = searchParams.get('startDate') || currentQuarterStart.toISOString().split('T')[0];
    const endDateStr = searchParams.get('endDate') || currentQuarterEnd.toISOString().split('T')[0];
    const currency = searchParams.get('currency') || 'USD';
    const hourlyRate = parseFloat(searchParams.get('hourlyRate') || '40');
    const overtimeMultiplier = parseFloat(searchParams.get('overtimeMultiplier') || '1.5');
    const benefitsRate = parseFloat(searchParams.get('benefitsRate') || '0.25');

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Fetch all attendance records in the date range
    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        employeeId: true,
        date: true,
        workHours: true,
        overtimeHours: true,
      },
    });

    // Group records by month (YYYY-MM)
    const monthlyGroups = new Map<string, typeof records>();
    for (const record of records) {
      const period = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyGroups.get(period) || [];
      existing.push(record);
      monthlyGroups.set(period, existing);
    }

    // Get all months in the range (even if no data)
    const entries: CostForecastEntry[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= endMonth) {
      const period = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      const monthRecords = monthlyGroups.get(period) || [];

      const regularHours = parseFloat(
        monthRecords.reduce((sum, r) => sum + r.workHours, 0).toFixed(2)
      );
      const overtimeHours = parseFloat(
        monthRecords.reduce((sum, r) => sum + r.overtimeHours, 0).toFixed(2)
      );
      const uniqueEmployees = new Set(monthRecords.map((r) => r.employeeId)).size;

      const regularCost = parseFloat((regularHours * hourlyRate).toFixed(2));
      const overtimeCost = parseFloat((overtimeHours * hourlyRate * overtimeMultiplier).toFixed(2));
      const benefitsCost = parseFloat((regularCost * benefitsRate).toFixed(2));
      const totalCost = parseFloat((regularCost + overtimeCost + benefitsCost).toFixed(2));

      entries.push({
        period,
        regularHours,
        overtimeHours,
        regularCost,
        overtimeCost,
        benefitsCost,
        totalCost,
        headcount: uniqueEmployees,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    const totalForecastCost = parseFloat(entries.reduce((sum, e) => sum + e.totalCost, 0).toFixed(2));
    const totalHeadcount = Math.max(...entries.map((e) => e.headcount), 0);
    const averageCostPerEmployee = totalHeadcount > 0
      ? parseFloat((totalForecastCost / totalHeadcount).toFixed(2))
      : 0;

    // Calculate comparison with previous period of same length
    const periodLengthMs = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - periodLengthMs - 86400000); // day before
    const prevEnd = new Date(startDate.getTime() - 86400000);

    const prevRecords = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        date: { gte: prevStart, lte: prevEnd },
      },
      select: { workHours: true, overtimeHours: true },
    });

    let comparedToPreviousPeriod = 0;
    if (prevRecords.length > 0) {
      const prevRegularHours = prevRecords.reduce((sum, r) => sum + r.workHours, 0);
      const prevOvertimeHours = prevRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
      const prevRegularCost = prevRegularHours * hourlyRate;
      const prevOvertimeCost = prevOvertimeHours * hourlyRate * overtimeMultiplier;
      const prevBenefitsCost = prevRegularCost * benefitsRate;
      const prevTotalCost = prevRegularCost + prevOvertimeCost + prevBenefitsCost;

      if (prevTotalCost > 0) {
        comparedToPreviousPeriod = parseFloat(
          (((totalForecastCost - prevTotalCost) / prevTotalCost) * 100).toFixed(1)
        );
      }
    }

    const forecastData = {
      startDate: startDateStr,
      endDate: endDateStr,
      currency,
      entries,
      totalForecastCost,
      averageCostPerEmployee,
      comparedToPreviousPeriod,
    };

    const response: ApiResponse = {
      success: true,
      data: forecastData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Labor Cost Forecast API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to compute labor cost forecast',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
