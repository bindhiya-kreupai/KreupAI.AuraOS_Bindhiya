import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const LeaveTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  isPaid: z.boolean().default(true),
  status: z.string().default('Active'),
});

// GET - Fetch leave types from database
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const where: Record<string, unknown> = {};
      if (status) {
        where.status = status;
      }

      const leaveTypes = await prisma.leaveType.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({
        success: true,
        types: leaveTypes,
        leaveTypes: leaveTypes,
        data: leaveTypes,
        meta: { total: leaveTypes.length },
      });
    } catch (error: any) {
      logger.error('Error fetching leave types:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave types' },
        { status: 500 }
      );
    }
  }
);

// POST - Create leave type in database
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = LeaveTypeSchema.parse(body);

      const newLeaveType = await prisma.leaveType.create({
        data: {
          code: data.code,
          name: data.name,
          isPaid: data.isPaid,
          status: data.status,
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Leave - Types',
          metadata: { description: `Created leave type: ${data.name} (${data.code})` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json(
        { success: true, data: newLeaveType, type: newLeaveType, leaveType: newLeaveType },
        { status: 201 }
      );
    } catch (error: any) {
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
