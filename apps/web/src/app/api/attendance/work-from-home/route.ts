import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const WFHSchema = z.object({
  employeeId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.number()).optional(),
});

// GET - Fetch WFH requests
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const requestedEmployeeId = searchParams.get('employeeId');
      const employeeId =
        !requestedEmployeeId || ['current-user', 'current-user-id'].includes(requestedEmployeeId)
          ? user.employeeId || user.userId
          : requestedEmployeeId;
      const status = searchParams.get('status');

      const mockWFH = [
        {
          id: '1',
          employeeId,
          employeeName: 'John Doe',
          startDate: '2024-08-26',
          endDate: '2024-08-26',
          reason: 'Remote work request',
          isRecurring: false,
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approvedAt: '2024-08-25',
          requestedAt: '2024-08-24',
        },
        {
          id: '2',
          employeeId,
          employeeName: 'John Doe',
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          reason: 'Monthly WFH - Mondays',
          isRecurring: true,
          recurringDays: [1],
          status: 'PENDING',
          requestedAt: '2024-08-25',
        },
      ];

      let filteredData = mockWFH.filter(w => w.employeeId === employeeId);
      if (status) {
        filteredData = filteredData.filter(w => w.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch WFH requests' },
        { status: 500 }
      );
    }
  }
);

// POST - Request WFH
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const body = await request.json();
      const action = body.action || 'submit';
      const requiredAction = action === 'submit' ? Action.CREATE : Action.UPDATE;
      const permissionError = requirePermission(Resource.ATTENDANCE, requiredAction, permissions);
      if (permissionError) return permissionError;

      if (action === 'approve' || action === 'reject') {
        if (!body.id || !body.approverId) {
          return NextResponse.json(
            { success: false, error: 'id and approverId are required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            id: body.id,
            employeeId: user.employeeId || user.userId,
            employeeName: 'John Doe',
            startDate: body.startDate || new Date().toISOString().split('T')[0],
            endDate: body.endDate || body.startDate || new Date().toISOString().split('T')[0],
            reason: body.reason || body.comments || 'WFH request updated',
            isRecurring: false,
            status: action === 'approve' ? 'APPROVED' : 'REJECTED',
            approvedBy: body.approverId,
            approvedAt: new Date().toISOString(),
            requestedAt: new Date().toISOString(),
          },
        });
      }

      const data = WFHSchema.parse({
        employeeId: body.employeeId,
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason,
        isRecurring: body.isRecurring,
        recurringDays: body.recurringDays,
      });
      const employeeId =
        !data.employeeId || ['current-user', 'current-user-id'].includes(data.employeeId)
          ? user.employeeId || user.userId
          : data.employeeId;

      const newWFH = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        employeeId,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Work From Home',
          details: `Requested WFH from ${data.startDate} to ${data.endDate}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newWFH }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to create WFH request' },
        { status: 500 }
      );
    }
  }
);
