import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockSettings = {
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
      };

      return NextResponse.json({ success: true, data: mockSettings });
    } catch (error) {
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
      return NextResponse.json({ success: true, data: body });
    } catch (error) {
      logger.error('Error updating settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
  }
);
