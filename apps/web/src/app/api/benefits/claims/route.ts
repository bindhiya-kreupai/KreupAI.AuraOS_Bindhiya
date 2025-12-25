import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;

      const mockClaims = [
        {
          id: 'claim-1',
          employeeId,
          benefitPlanId: 'plan-1',
          claimNumber: 'CLM-2024-001',
          claimType: 'medical',
          status: 'approved',
          serviceDate: '2024-01-15',
          claimedAmount: 1500,
          approvedAmount: 1200,
          paidAmount: 1000,
          patientResponsibility: 500,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockClaims });
    } catch (error) {
      logger.error('Error fetching claims:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newClaim = {
        ...body,
        id: `claim-${Date.now()}`,
        claimNumber: `CLM-${Date.now()}`,
        status: 'submitted',
        submittedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newClaim }, { status: 201 });
    } catch (error) {
      logger.error('Error creating claim:', error);
      return NextResponse.json({ success: false, error: 'Failed to create claim' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, updatedAt: new Date().toISOString() } });
    } catch (error) {
      logger.error('Error updating claim:', error);
      return NextResponse.json({ success: false, error: 'Failed to update claim' }, { status: 500 });
    }
  }
);
