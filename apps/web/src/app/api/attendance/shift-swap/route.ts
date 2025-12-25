import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ShiftSwapSchema = z.object({
  requestorId: z.string(),
  targetEmployeeId: z.string(),
  requestorDate: z.string(),
  targetDate: z.string(),
  reason: z.string().min(1),
});

// GET - Fetch shift swap requests
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const mockSwaps = [
        {
          id: '1',
          requestorId: 'emp-1',
          requestorName: 'John Doe',
          targetEmployeeId: 'emp-2',
          targetEmployeeName: 'Jane Smith',
          requestorDate: '2024-08-25',
          targetDate: '2024-08-26',
          reason: 'Personal emergency',
          status: 'PENDING',
          requestedAt: '2024-08-20',
        },
        {
          id: '2',
          requestorId: 'emp-3',
          requestorName: 'Mike Ross',
          targetEmployeeId: 'emp-1',
          targetEmployeeName: 'John Doe',
          requestorDate: '2024-08-30',
          targetDate: '2024-08-31',
          reason: 'Medical appointment',
          status: 'APPROVED',
          requestedAt: '2024-08-28',
          approvedAt: '2024-08-29',
          approvedBy: 'manager-1',
        },
      ];

      let filteredData = mockSwaps;
      if (status) {
        filteredData = mockSwaps.filter(s => s.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch {
      logger.error('Error fetching shift swaps:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch shift swaps' },
        { status: 500 }
      );
    }
  }
);

// POST - Request shift swap
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = ShiftSwapSchema.parse(body);

      const newSwap = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Shift Swapping',
          details: `Requested shift swap for ${data.requestorDate}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newSwap }, { status: 201 });
    } catch {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating shift swap:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create shift swap' },
        { status: 500 }
      );
    }
  }
);

// PUT - Approve/Reject shift swap
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, status } = body;

      const updated = {
        id,
        status,
        approvedBy: user.userId,
        approvedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Attendance - Shift Swapping',
          details: `${status} shift swap request: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch {
      logger.error('Error updating shift swap:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update shift swap' },
        { status: 500 }
      );
    }
  }
);
