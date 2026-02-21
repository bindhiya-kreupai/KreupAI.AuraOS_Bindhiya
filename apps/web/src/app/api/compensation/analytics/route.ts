import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;

      // Aggregate salary structure data
      const salaryStructures = await prisma.employeeSalaryStructure.findMany({
        where: { tenantId, isActive: true },
        select: {
          employeeId: true,
          ctc: true,
          grossSalary: true,
          basicSalary: true,
        },
      });

      const totalEmployees = salaryStructures.length;
      const ctcValues = salaryStructures.map((s) => Number(s.ctc));
      const totalCompensationCost = ctcValues.reduce((sum, v) => sum + v, 0);
      const averageCompensation = totalEmployees > 0 ? totalCompensationCost / totalEmployees : 0;

      // Calculate median
      const sorted = [...ctcValues].sort((a, b) => a - b);
      const medianCompensation = totalEmployees > 0
        ? totalEmployees % 2 === 0
          ? (sorted[totalEmployees / 2 - 1] + sorted[totalEmployees / 2]) / 2
          : sorted[Math.floor(totalEmployees / 2)]
        : 0;

      // Bonus metrics from PayrollAdjustment
      let bonusMetrics = {
        totalBonuses: 0,
        totalBonusAmount: 0,
        averageBonusPercentage: 0,
      };

      try {
        const bonuses = await prisma.payrollAdjustment.findMany({
          where: {
            tenantId,
            category: 'BONUS',
          },
          select: {
            amount: true,
          },
        });

        bonusMetrics = {
          totalBonuses: bonuses.length,
          totalBonusAmount: bonuses.reduce((sum, b) => sum + Number(b.amount), 0),
          averageBonusPercentage: totalEmployees > 0 && bonuses.length > 0
            ? (bonuses.reduce((sum, b) => sum + Number(b.amount), 0) / totalCompensationCost) * 100
            : 0,
        };
      } catch {
        // PayrollAdjustment aggregation failed
      }

      // Increment metrics from PayrollAdjustment (arrears/adjustments)
      let incrementMetrics = {
        totalIncrements: 0,
        averageIncrementPercentage: 0,
      };

      try {
        const increments = await prisma.payrollAdjustment.findMany({
          where: {
            tenantId,
            category: 'ARREAR',
          },
        });

        incrementMetrics = {
          totalIncrements: increments.length,
          averageIncrementPercentage: 0,
        };
      } catch {
        // Increment aggregation failed
      }

      const metrics = {
        totalEmployees,
        totalCompensationCost: Math.round(totalCompensationCost),
        averageCompensation: Math.round(averageCompensation),
        medianCompensation: Math.round(medianCompensation),
        payEquityMetrics: {
          genderPayGap: 0,
          compaRatioDistribution: {
            belowRange: 0,
            lowerQuartile: 0,
            midRange: totalEmployees,
            upperQuartile: 0,
            aboveRange: 0,
          },
        },
        incrementMetrics,
        bonusMetrics,
      };

      return NextResponse.json({ success: true, data: metrics });
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
