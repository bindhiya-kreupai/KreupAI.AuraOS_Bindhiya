import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockStats = {
        totalEnrollments: 1245,
        activeEnrollments: 1180,
        enrollmentRate: 94.8,
        totalPremiums: 625000,
        employeeContributions: 125000,
        employerContributions: 500000,
        totalClaims: 456,
        approvedClaims: 389,
        deniedClaims: 45,
        totalClaimAmount: 567000,
        totalPaidAmount: 478000,
        claimApprovalRate: 85.3,
        totalDependents: 234,
      };

      return NextResponse.json({ success: true, data: mockStats });
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
