import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockMetrics = {
        totalEmployees: 1250,
        totalCompensationCost: 150000000,
        averageCompensation: 120000,
        medianCompensation: 110000,
        payEquityMetrics: {
          genderPayGap: 2.3,
          compaRatioDistribution: {
            belowRange: 5,
            lowerQuartile: 20,
            midRange: 50,
            upperQuartile: 20,
            aboveRange: 5,
          },
        },
        incrementMetrics: {
          totalIncrements: 340,
          averageIncrementPercentage: 7.5,
        },
        bonusMetrics: {
          totalBonuses: 520,
          totalBonusAmount: 5200000,
          averageBonusPercentage: 15.2,
        },
      };

      return NextResponse.json({ success: true, data: mockMetrics });
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
