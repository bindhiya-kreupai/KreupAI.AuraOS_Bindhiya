import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockMetrics = {
        totalRequests: 156,
        approvedRequests: 132,
        rejectedRequests: 12,
        totalTravelCost: 456000,
        averageTravelCost: 2923,
        travelByPurpose: [],
        travelByDepartment: [],
        topTravelers: [],
      };

      return NextResponse.json({ success: true, data: mockMetrics });
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
