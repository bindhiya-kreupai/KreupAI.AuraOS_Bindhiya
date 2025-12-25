import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const CompOffSchema = z.object({
  employeeId: z.string(),
  workedDate: z.string(),
  hours: z.number().positive(),
  reason: z.string().min(1),
  approverNotes: z.string().optional(),
});

// GET - Fetch comp-off tracking data
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const status = searchParams.get('status');

      const mockCompOffs = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          workedDate: '2024-08-15',
          hours: 8,
          reason: 'Weekend deployment',
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approvedAt: '2024-08-16',
          expiryDate: '2024-11-15',
          isUsed: false,
          createdAt: '2024-08-15',
        },
        {
          id: '2',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          workedDate: '2024-07-20',
          hours: 10,
          reason: 'Holiday critical support',
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approvedAt: '2024-07-21',
          expiryDate: '2024-10-20',
          isUsed: true,
          usedOn: '2024-09-05',
          createdAt: '2024-07-20',
        },
        {
          id: '3',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          workedDate: '2024-08-25',
          hours: 8,
          reason: 'Project deadline work',
          status: 'PENDING',
          expiryDate: null,
          isUsed: false,
          createdAt: '2024-08-25',
        },
      ];

      let filteredData = mockCompOffs.filter(co => co.employeeId === employeeId);
      if (status) {
        filteredData = filteredData.filter(co => co.status === status);
      }

      const summary = {
        total: filteredData.length,
        available: filteredData.filter(co => !co.isUsed && co.status === 'APPROVED').length,
        used: filteredData.filter(co => co.isUsed).length,
        pending: filteredData.filter(co => co.status === 'PENDING').length,
      };

      return NextResponse.json({
        success: true,
        data: { compOffs: filteredData, summary },
      });
    } catch (error) {
      logger.error('Error fetching comp-off data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comp-off data' },
        { status: 500 }
      );
    }
  }
);

// POST - Request comp-off
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = CompOffSchema.parse(body);

      const newCompOff = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        isUsed: false,
        createdAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Leave - Comp-off',
          details: `Requested comp-off for ${data.workedDate} - ${data.hours} hours`,
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
      logger.error('Error creating comp-off:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create comp-off' },
        { status: 500 }
      );
    }
  }
);

// PUT - Approve/Reject comp-off
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, status, approverNotes } = body;

      if (!id || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: id, status' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        status,
        approverNotes,
        approvedBy: user.userId,
        approvedAt: new Date().toISOString(),
        expiryDate: status === 'APPROVED' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Leave - Comp-off',
          details: `${status} comp-off request: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error updating comp-off:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update comp-off' },
        { status: 500 }
      );
    }
  }
);
