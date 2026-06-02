/**
 * Leave Encashment API Routes
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const EncashmentSchema = z.object({
  employeeId: z.string().min(1),
  leaveTypeId: z.string().min(1),
  policyId: z.string().min(1),
  requestedDays: z.coerce.number().positive(),
  eligibleDays: z.coerce.number(),
  calculationBasis: z.enum(['BASIC', 'GROSS']),
  dailyRate: z.coerce.number(),
  totalAmount: z.coerce.number(),
  encashmentRate: z.coerce.number().default(100),
  trigger: z.enum(['YEAR_END', 'ON_RESIGNATION', 'ON_TERMINATION', 'ON_REQUEST']),
  reason: z.string().optional(),
});

/**
 * GET /api/leave/encashment
 * Get encashment requests from database
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');

      const tenantId = user.tenantId;

      const where: Record<string, unknown> = { tenantId };
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;

      const encashments = await prisma.leaveEncashment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const summary = {
        totalAmount: encashments.reduce((sum, e) => sum + Number(e.totalAmount), 0),
        totalDays: encashments.reduce((sum, e) => sum + Number(e.requestedDays), 0),
        pendingCount: encashments.filter(e => e.status === 'PENDING').length,
      };

      return NextResponse.json({
        success: true,
        encashments,
        leaveEncashments: encashments,
        data: {
          encashments,
          summary,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching encashment requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch encashment requests', errorAr: 'فشل في جلب طلبات صرف الإجازات' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/leave/encashment
 * Submit leave encashment request
 */
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = EncashmentSchema.parse(body);
      const tenantId = user.tenantId;

      const encashment = await prisma.leaveEncashment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          policyId: data.policyId,
          requestedDays: data.requestedDays,
          eligibleDays: data.eligibleDays,
          calculationBasis: data.calculationBasis,
          dailyRate: data.dailyRate,
          totalAmount: data.totalAmount,
          encashmentRate: data.encashmentRate,
          trigger: data.trigger,
          reason: data.reason || null,
          status: 'PENDING',
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Leave - Encashment',
          metadata: { description: `Created encashment request for ${data.requestedDays} days, amount: ${data.totalAmount}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: encashment,
        encashment,
        leaveEncashment: encashment,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating encashment request:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to process encashment',
          errorAr: 'فشل في معالجة صرف الإجازات',
        },
        { status: 500 }
      );
    }
  }
);
