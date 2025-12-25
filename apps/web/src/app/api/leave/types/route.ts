import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const LeaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  isPaid: z.boolean().default(true),
  requiresApproval: z.boolean().default(true),
  requiresDocument: z.boolean().default(false),
  color: z.string().optional(),
  icon: z.string().optional(),
});

// GET - Fetch leave types
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const mockLeaveTypes = [
        {
          id: '1',
          name: 'Annual Leave',
          code: 'AL',
          description: 'Paid annual vacation leave',
          isPaid: true,
          requiresApproval: true,
          requiresDocument: false,
          color: '#3b82f6',
          icon: 'calendar',
          status: 'ACTIVE',
          defaultDays: 20,
        },
        {
          id: '2',
          name: 'Sick Leave',
          code: 'SL',
          description: 'Paid sick leave with medical certificate',
          isPaid: true,
          requiresApproval: true,
          requiresDocument: true,
          color: '#ef4444',
          icon: 'heart-pulse',
          status: 'ACTIVE',
          defaultDays: 10,
        },
        {
          id: '3',
          name: 'Casual Leave',
          code: 'CL',
          description: 'Short-term casual leave',
          isPaid: true,
          requiresApproval: true,
          requiresDocument: false,
          color: '#f59e0b',
          icon: 'coffee',
          status: 'ACTIVE',
          defaultDays: 7,
        },
        {
          id: '4',
          name: 'Maternity Leave',
          code: 'ML',
          description: 'Maternity leave for female employees',
          isPaid: true,
          requiresApproval: true,
          requiresDocument: true,
          color: '#ec4899',
          icon: 'baby',
          status: 'ACTIVE',
          defaultDays: 90,
        },
        {
          id: '5',
          name: 'Paternity Leave',
          code: 'PL',
          description: 'Paternity leave for male employees',
          isPaid: true,
          requiresApproval: true,
          requiresDocument: true,
          color: '#6366f1',
          icon: 'user',
          status: 'ACTIVE',
          defaultDays: 5,
        },
        {
          id: '6',
          name: 'Loss of Pay',
          code: 'LOP',
          description: 'Unpaid leave',
          isPaid: false,
          requiresApproval: true,
          requiresDocument: false,
          color: '#64748b',
          icon: 'x-circle',
          status: 'ACTIVE',
          defaultDays: 0,
        },
        {
          id: '7',
          name: 'Comp-off',
          code: 'CO',
          description: 'Compensatory off for overtime work',
          isPaid: true,
          requiresApproval: true,
          requiresDocument: false,
          color: '#10b981',
          icon: 'refresh-cw',
          status: 'ACTIVE',
          defaultDays: 0,
        },
      ];

      let filteredData = mockLeaveTypes;
      if (status) {
        filteredData = mockLeaveTypes.filter(lt => lt.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching leave types:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave types' },
        { status: 500 }
      );
    }
  }
);

// POST - Create leave type
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = LeaveTypeSchema.parse(body);

      const newLeaveType = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'ACTIVE',
        defaultDays: 0,
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Leave - Types',
          details: `Created leave type: ${data.name} (${data.code})`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newLeaveType }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating leave type:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create leave type' },
        { status: 500 }
      );
    }
  }
);
