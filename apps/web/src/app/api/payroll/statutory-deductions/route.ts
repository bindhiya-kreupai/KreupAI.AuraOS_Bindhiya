import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch statutory deductions
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
      const employeeId = searchParams.get('employeeId');

      // Mock data - replace with actual database query
      const mockDeductions = {
        month,
        summary: {
          totalEmployees: 50,
          totalPF: 18000,
          totalESI: 3750,
          totalPT: 1000,
          totalTDS: 12500,
        },
        deductions: [
          {
            employeeId: 'emp-1',
            employeeName: 'Sarah Jenkins',
            pf: { employee: 360, employer: 360 },
            esi: { employee: 75, employer: 75 },
            pt: 20,
            tds: 620,
          },
          {
            employeeId: 'emp-2',
            employeeName: 'Mike Chen',
            pf: { employee: 300, employer: 300 },
            esi: { employee: 60, employer: 60 },
            pt: 20,
            tds: 480,
          },
        ],
      };

      return NextResponse.json({
        success: true,
        data: employeeId
          ? mockDeductions.deductions.find(d => d.employeeId === employeeId)
          : mockDeductions,
      });
    } catch {
      logger.error('Error fetching statutory deductions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch statutory deductions' },
        { status: 500 }
      );
    }
  }
);

// POST - Calculate statutory deductions
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { employeeId, basicSalary, month } = body;

      if (!employeeId || !basicSalary || !month) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: employeeId, basicSalary, month' },
          { status: 400 }
        );
      }

      // Simple statutory calculation (India example)
      const pf = {
        employee: Math.min(basicSalary * 0.12, 1800), // 12% capped at 15000 basic
        employer: Math.min(basicSalary * 0.12, 1800),
      };

      const esi = basicSalary <= 21000 ? {
        employee: basicSalary * 0.0075, // 0.75%
        employer: basicSalary * 0.0325, // 3.25%
      } : { employee: 0, employer: 0 };

      const pt = basicSalary > 10000 ? 20 : 0; // Professional tax

      const result = {
        employeeId,
        month,
        basicSalary,
        deductions: {
          pf,
          esi,
          pt,
          total: pf.employee + esi.employee + pt,
        },
        employerContribution: {
          pf: pf.employer,
          esi: esi.employer,
          total: pf.employer + esi.employer,
        },
        calculatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch {
      logger.error('Error calculating statutory deductions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate statutory deductions' },
        { status: 500 }
      );
    }
  }
);
