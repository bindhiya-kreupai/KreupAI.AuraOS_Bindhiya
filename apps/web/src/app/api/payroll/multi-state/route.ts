import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch multi-state payroll configuration
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const state = searchParams.get('state');

      const mockStateConfig = {
        states: [
          {
            code: 'CA',
            name: 'California',
            taxRates: { state: 9.3, sdi: 1.2, sui: 3.4 },
            minWage: 16.0,
            employeeCount: 15,
          },
          {
            code: 'NY',
            name: 'New York',
            taxRates: { state: 6.85, sdi: 0.5, sui: 4.1 },
            minWage: 15.0,
            employeeCount: 20,
          },
          {
            code: 'TX',
            name: 'Texas',
            taxRates: { state: 0, sdi: 0, sui: 2.7 },
            minWage: 7.25,
            employeeCount: 15,
          },
        ],
        summary: {
          totalStates: 3,
          totalEmployees: 50,
          complianceStatus: 'COMPLIANT',
          lastUpdated: new Date().toISOString(),
        },
      };

      if (state) {
        const stateData = mockStateConfig.states.find(s => s.code === state);
        return NextResponse.json({
          success: true,
          data: stateData || null,
        });
      }

      return NextResponse.json({
        success: true,
        data: mockStateConfig,
      });
    } catch (error) {
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

      const body = await request.json();
      const { month, states } = body;

      if (!month || !states) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: month, states' },
          { status: 400 }
        );
      }

      const result = {
        month,
        calculations: states.map((state: string) => ({
          state,
          employeeCount: 10,
          totalGross: 85000,
          totalTax: 7900,
          totalNet: 77100,
        })),
        totalGross: 255000,
        totalTax: 23700,
        totalNet: 231300,
        calculatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error calculating multi-state payroll:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate multi-state payroll' },
        { status: 500 }
      );
    }
  }
);
