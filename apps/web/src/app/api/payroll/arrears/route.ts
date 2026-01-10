import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ArrearSchema = z.object({
  employeeId: z.string(),
  type: z.string().min(1),
  amount: z.number(),
  effectiveMonth: z.string(),
  reason: z.string().optional(),
});

// GET - Fetch arrears
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');

      // Mock data
      const mockArrears = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'Sarah Jenkins',
          type: 'Salary Revision Backpay',
          amount: 5000,
          effectiveMonth: '2024-01',
          status: 'PENDING',
          reason: 'Annual increment retroactive payment',
          createdAt: new Date('2024-08-01').toISOString(),
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Mike Chen',
          type: 'Overtime Adjustment',
          amount: 1200,
          effectiveMonth: '2024-07',
          status: 'PROCESSED',
          reason: 'Overtime hours correction',
          createdAt: new Date('2024-07-28').toISOString(),
          processedAt: new Date('2024-08-01').toISOString(),
        },
      ];

      let filteredData = mockArrears;
      if (employeeId) {
        filteredData = mockArrears.filter(arr => arr.employeeId === employeeId);
      }
      if (status) {
        filteredData = filteredData.filter(arr => arr.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching arrears:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch arrears' },
        { status: 500 }
      );
    }
  }
);

// POST - Create arrear
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = ArrearSchema.parse(body);

      const newArrear = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Arrears Management',
          details: `Created arrear: ${data.type} - $${data.amount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newArrear }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating arrear:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create arrear' },
        { status: 500 }
      );
    }
  }
);
