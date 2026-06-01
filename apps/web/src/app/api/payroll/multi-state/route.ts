import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch multi-state/multi-country payroll configuration
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const countryCode = searchParams.get('state') || searchParams.get('countryCode');

      const where: Record<string, unknown> = { tenantId };
      if (countryCode) where.countryCode = countryCode;

      const configs = await prisma.payrollConfiguration.findMany({
        where,
        orderBy: { countryCode: 'asc' },
      });

      if (countryCode && configs.length === 1) {
        return NextResponse.json({
          success: true,
          data: configs[0],
        });
      }

      // Count employees per config by looking at payroll runs
      const configsWithCounts = await Promise.all(
        configs.map(async (config) => {
          const latestRun = await prisma.payrollRun.findFirst({
            where: { configId: config.id },
            orderBy: { payrollMonth: 'desc' },
            select: { totalEmployees: true },
          });
          return {
            ...config,
            employeeCount: latestRun?.totalEmployees || 0,
          };
        })
      );

      const summary = {
        totalConfigs: configs.length,
        totalEmployees: configsWithCounts.reduce((sum, c) => sum + c.employeeCount, 0),
        countries: configs.map((c) => c.countryCode),
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: {
          states: configsWithCounts,
          configs: configsWithCounts,
          summary,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching multi-state config:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch multi-state configuration' },
        { status: 500 }
      );
    }
  }
);

// POST - Calculate multi-state payroll
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { month, states } = body;

      if (!month || !states) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: month, states' },
          { status: 400 }
        );
      }

      // Aggregate actual payroll data per country/state
      const calculations = await Promise.all(
        (states as string[]).map(async (countryCode: string) => {
          const config = await prisma.payrollConfiguration.findFirst({
            where: { tenantId, countryCode },
          });

          if (!config) {
            return {
              state: countryCode,
              employeeCount: 0,
              totalGross: 0,
              totalDeductions: 0,
              totalNet: 0,
              configFound: false,
            };
          }

          const run = await prisma.payrollRun.findFirst({
            where: { configId: config.id, payrollMonth: month },
          });

          return {
            state: countryCode,
            configId: config.id,
            employeeCount: run?.totalEmployees || 0,
            totalGross: Number(run?.totalGrossSalary || 0),
            totalDeductions: Number(run?.totalDeductions || 0),
            totalNet: Number(run?.totalNetSalary || 0),
            totalEmployerCost: Number(run?.totalEmployerCost || 0),
            status: run?.status || 'NOT_PROCESSED',
            configFound: true,
          };
        })
      );

      const result = {
        month,
        calculations,
        totalGross: calculations.reduce((sum, c) => sum + c.totalGross, 0),
        totalDeductions: calculations.reduce((sum, c) => sum + c.totalDeductions, 0),
        totalNet: calculations.reduce((sum, c) => sum + c.totalNet, 0),
        calculatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Error calculating multi-state payroll:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate multi-state payroll' },
        { status: 500 }
      );
    }
  }
);
