import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const settings = {
        tenantId: user.tenantId,
        currency: 'USD',
        fiscalYearStart: '01-01',
        fiscalYearEnd: '12-31',
        defaultPayFrequency: 'monthly',
        incrementCycleFrequency: 'annual',
        incrementReviewMonth: 4,
        bonusReviewMonth: 12,
        enableMarketBenchmarking: true,
        enableStockGrants: true,
        enableLoans: true,
        enableCompensationManagement: true,
        enableIncrementCycles: true,
        enableBonusManagement: true,
        enableArrearsProcessing: true,
        enableBudgetSimulation: true,
        enableTotalRewardsStatements: true,
        enablePayEquityAnalysis: true,
        enableGradeBands: true,
        enableCompaRatioAnalysis: true,
        defaultIncrementPercentage: 8.0,
        maxIncrementPercentage: 25.0,
        requireApprovalForIncrements: true,
        incrementApprovalLevels: 2,
        targetCompaRatio: 100,
        compaRatioRange: { min: 80, max: 120 },
        autoNotifications: {
          incrementCycleStart: true,
          incrementProposalSubmitted: true,
          incrementApproved: true,
          bonusProcessed: true,
          stockGrantVested: true,
          loanDisbursed: true,
          emiDue: true,
          salaryRevisionDue: true,
        },
      };

      return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error('Error fetching settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, tenantId: user.tenantId } });
    } catch (error: any) {
      logger.error('Error updating settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
  }
);
