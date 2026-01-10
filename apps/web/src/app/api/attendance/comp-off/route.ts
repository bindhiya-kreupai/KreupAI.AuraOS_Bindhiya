import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const CompOffSchema = z.object({
  employeeId: z.string(),
  workDate: z.string(),
  workHours: z.number(),
  reason: z.string().min(1),
  approvedBy: z.string().optional(),
  expiryDate: z.string().optional(),
});

// GET - Fetch comp-off records
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const status = searchParams.get('status');

      const mockCompOffs = [
        {
          id: '1',
          employeeId,
          employeeName: 'John Doe',
          workDate: '2024-08-17',
          workHours: 8,
          reason: 'Worked on weekend for urgent project delivery',
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approvedAt: '2024-08-18T10:00:00',
          earnedDate: '2024-08-18',
          expiryDate: '2024-11-18',
          balance: 1,
          used: 0,
        },
        {
          id: '2',
          employeeId,
          employeeName: 'John Doe',
          workDate: '2024-08-24',
          workHours: 4,
          reason: 'Public holiday work - system maintenance',
          status: 'PENDING',
          requestedAt: '2024-08-25T09:00:00',
          balance: 0.5,
          used: 0,
        },
        {
          id: '3',
          employeeId,
          employeeName: 'John Doe',
          workDate: '2024-07-15',
          workHours: 8,
          reason: 'Weekend deployment',
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approvedAt: '2024-07-16T09:00:00',
          earnedDate: '2024-07-16',
          expiryDate: '2024-10-16',
          balance: 0,
          used: 1,
          usedOn: '2024-08-10',
        },
      ];

      let filteredData = mockCompOffs.filter(c => c.employeeId === employeeId);
      if (status) filteredData = filteredData.filter(c => c.status === status);

      const summary = {
        total: filteredData.reduce((sum, c) => sum + c.balance, 0),
        earned: filteredData.filter(c => c.status === 'APPROVED').length,
        used: filteredData.reduce((sum, c) => sum + c.used, 0),
        pending: filteredData.filter(c => c.status === 'PENDING').length,
        expiring: filteredData.filter(
          c => c.expiryDate && new Date(c.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ).length,
      };

      return NextResponse.json({
        success: true,
        data: { compOffs: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching comp-off records:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comp-off records' },
        { status: 500 }
      );
    }
  }
);

// POST - Request comp-off
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = CompOffSchema.parse(body);

      // Calculate expiry (90 days from approval)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);

      const newCompOff = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        expiryDate: data.expiryDate || expiryDate.toISOString().split('T')[0],
        balance: data.workHours / 8, // Convert hours to days
        used: 0,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Comp-off',
          details: `Requested comp-off for work on ${data.workDate}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newCompOff }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating comp-off request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create comp-off request' },
        { status: 500 }
      );
    }
  }
);

// PUT - Approve/Reject comp-off
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, status, remarks } = body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        status,
        remarks,
        approvedBy: user.userId,
        approvedAt: new Date().toISOString(),
        earnedDate: status === 'APPROVED' ? new Date().toISOString().split('T')[0] : undefined,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Attendance - Comp-off',
          details: `${status} comp-off request: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error updating comp-off request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update comp-off request' },
        { status: 500 }
      );
    }
  }
);
