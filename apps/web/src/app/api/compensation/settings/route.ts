import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'compensation';

const DEFAULT_SETTINGS = {
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

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to read settings');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const userId = context.user.userId;
    const body = await request.json();
    // Strip server-managed fields so callers can't overwrite them.
    delete body.tenantId;
    delete body.updatedBy;
    delete body.updatedAt;
    await writeSettings(tenantId, MODULE, body, userId);
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to update settings');
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
