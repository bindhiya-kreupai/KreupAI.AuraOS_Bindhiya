import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const WFHSchema = z.object({
  employeeId: z.string(),
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
      const employeeId = searchParams.get('employeeId') || user.userId;
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
    } catch {
      logger.error('Error fetching WFH requests:', error);
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
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = WFHSchema.parse(body);

      const newWFH = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Work From Home',
          details: `Requested WFH from ${data.startDate} to ${data.endDate}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newWFH }, { status: 201 });
    } catch {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating WFH request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create WFH request' },
        { status: 500 }
      );
    }
  }
);
