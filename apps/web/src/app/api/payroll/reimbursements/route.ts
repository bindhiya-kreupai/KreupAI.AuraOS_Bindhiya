import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ReimbursementSchema = z.object({
  employeeId: z.string(),
  type: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional().default('PENDING'),
});

// GET - Fetch reimbursement claims
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const employeeId = searchParams.get('employeeId');

      const where: any = {};
      if (status) where.status = status;
      if (employeeId) where.employeeId = employeeId;

      // Mock data for now - replace with actual database query
      const mockData = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'Sarah Connor',
          type: 'Travel',
          amount: 450,
          description: 'Flight to NYC for client meeting',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Mike Ross',
          type: 'Internet',
          amount: 50,
          description: 'Monthly reimbursement',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          employeeId: 'emp-3',
          employeeName: 'Jessica Pearson',
          type: 'Team Lunch',
          amount: 200,
          description: 'Q3 Team Lunch',
          date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          employeeId: 'emp-4',
          employeeName: 'Harvey Specter',
          type: 'Software',
          amount: 120,
          description: 'Adobe Creative Cloud License',
          date: new Date().toISOString(),
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
      ];

      let filteredData = mockData;
      if (status) {
        filteredData = mockData.filter(item => item.status === status);
      }
      if (employeeId) {
        filteredData = filteredData.filter(item => item.employeeId === employeeId);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch {
      logger.error('Error fetching reimbursements:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reimbursements' },
        { status: 500 }
      );
    }
  }
);

// POST - Create reimbursement claim
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = ReimbursementSchema.parse(body);

      // Mock creation - replace with actual database insert
      const newClaim = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Reimbursements',
          details: `Created reimbursement claim: ${data.type} - $${data.amount}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newClaim }, { status: 201 });
    } catch {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating reimbursement:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create reimbursement' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update reimbursement status
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

      // Mock update - replace with actual database update
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
          module: 'Payroll - Reimbursements',
          details: `Updated reimbursement claim status to: ${status}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch {
      logger.error('Error updating reimbursement:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update reimbursement' },
        { status: 500 }
      );
    }
  }
);
