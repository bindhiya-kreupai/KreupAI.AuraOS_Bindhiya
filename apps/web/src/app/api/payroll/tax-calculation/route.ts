import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const TaxDeclarationSchema = z.object({
  employeeId: z.string(),
  regime: z.enum(['OLD', 'NEW']),
  declarations: z.record(z.number()),
  fiscalYear: z.string(),
});

// GET - Fetch tax declarations
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const fiscalYear = searchParams.get('fiscalYear') || new Date().getFullYear().toString();

      // Mock data - replace with actual database query
      const mockDeclarations = {
        employeeId: employeeId || user.userId,
        regime: 'OLD',
        fiscalYear,
        grossIncome: 2400000,
        declarations: {
          '80c': 150000,
          'hra': 180000,
          '80d': 15000,
          'lta': 0,
        },
        verified: {
          '80c': 120000,
          'hra': 150000,
          '80d': 15000,
          'lta': 0,
        },
        taxCalculation: {
          taxableIncome: 2055000,
          taxPayable: 513750,
          regime: 'OLD',
        },
      };

      return NextResponse.json({
        success: true,
        data: mockDeclarations,
      });
    } catch (error) {
      logger.error('Error fetching tax declarations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tax declarations' },
        { status: 500 }
      );
    }
  }
);

// POST - Calculate tax
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = TaxDeclarationSchema.parse(body);

      // Simple tax calculation logic (India example)
      const grossIncome = 2400000;
      let totalDeductions = 0;

      if (data.regime === 'OLD') {
        totalDeductions = Object.values(data.declarations).reduce((sum, val) => sum + val, 0);
      } else {
        totalDeductions = 50000; // Standard deduction only for new regime
      }

      const taxableIncome = grossIncome - totalDeductions;

      // Simplified tax calculation
      let taxPayable = 0;
      if (data.regime === 'OLD') {
        taxPayable = taxableIncome * 0.25; // Simplified average rate
      } else {
        taxPayable = taxableIncome * 0.18; // Simplified average rate
      }

      const result = {
        employeeId: data.employeeId,
        regime: data.regime,
        grossIncome,
        totalDeductions,
        taxableIncome,
        taxPayable,
        calculatedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Tax Calculation',
          details: `Calculated tax: ${data.regime} regime - Tax: $${taxPayable.toFixed(2)}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error calculating tax:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate tax' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update tax declarations
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = TaxDeclarationSchema.parse(body);

      // Mock update - replace with actual database update
      const updated = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Payroll - Tax Calculation',
          details: `Updated tax declarations for employee: ${data.employeeId}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error updating tax declarations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update tax declarations' },
        { status: 500 }
      );
    }
  }
);
