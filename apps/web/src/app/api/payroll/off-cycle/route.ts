import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const OffCyclePaymentSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['BONUS', 'COMMISSION', 'REIMBURSEMENT', 'ADVANCE', 'OTHER']),
  amount: z.number().positive(),
  paymentDate: z.string(),
  reason: z.string().min(1),
  description: z.string().optional(),
});

// GET - Fetch off-cycle payments
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');
      const type = searchParams.get('type');

      const mockPayments = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'Sarah Jenkins',
          type: 'BONUS',
          amount: 5000,
          paymentDate: '2024-08-15',
          reason: 'Project completion bonus',
          status: 'APPROVED',
          createdAt: new Date('2024-08-10').toISOString(),
          approvedBy: 'manager-1',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Mike Chen',
          type: 'ADVANCE',
          amount: 2000,
          paymentDate: '2024-08-20',
          reason: 'Salary advance request',
          status: 'PENDING',
          createdAt: new Date('2024-08-18').toISOString(),
        },
      ];

      let filteredData = mockPayments;
      if (employeeId) filteredData = filteredData.filter(p => p.employeeId === employeeId);
      if (status) filteredData = filteredData.filter(p => p.status === status);
      if (type) filteredData = filteredData.filter(p => p.type === type);

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching off-cycle payments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch off-cycle payments' },
        { status: 500 }
      );
    }
  }
);

// POST - Create off-cycle payment
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = OffCyclePaymentSchema.parse(body);

      const newPayment = {
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
          module: 'Payroll - Off-Cycle Payments',
          details: `Created off-cycle payment: ${data.type} - $${data.amount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newPayment }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating off-cycle payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create off-cycle payment' },
        { status: 500 }
      );
    }
  }
);

// PUT - Approve/Reject off-cycle payment
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, status } = body;

      if (!id || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: id, status' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Payroll - Off-Cycle Payments',
          details: `Updated off-cycle payment status to: ${status}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error updating off-cycle payment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update off-cycle payment' },
        { status: 500 }
      );
    }
  }
);
