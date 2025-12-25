import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const LeavePolicySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  rules: z.object({
    accrualType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONBOARDING']),
    carryForwardAllowed: z.boolean(),
    carryForwardLimit: z.number().optional(),
    encashmentAllowed: z.boolean(),
    maxConsecutiveDays: z.number().optional(),
    minServiceMonths: z.number().optional(),
    requiresApproval: z.boolean(),
  }),
});

// GET - Fetch leave policies
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockPolicies = [
        {
          id: '1',
          name: 'Standard Annual Leave Policy',
          description: 'Default annual leave policy for all employees',
          applicableTo: 'ALL',
          status: 'ACTIVE',
          rules: {
            accrualType: 'YEARLY',
            accrualAmount: 20,
            carryForwardAllowed: true,
            carryForwardLimit: 5,
            encashmentAllowed: true,
            maxConsecutiveDays: 15,
            minServiceMonths: 6,
            requiresApproval: true,
          },
          createdAt: new Date('2024-01-01').toISOString(),
        },
        {
          id: '2',
          name: 'Sick Leave Policy',
          description: 'Sick leave policy with medical certificate requirement',
          applicableTo: 'ALL',
          status: 'ACTIVE',
          rules: {
            accrualType: 'YEARLY',
            accrualAmount: 10,
            carryForwardAllowed: false,
            carryForwardLimit: 0,
            encashmentAllowed: false,
            maxConsecutiveDays: 5,
            minServiceMonths: 0,
            requiresApproval: true,
          },
          createdAt: new Date('2024-01-01').toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockPolicies,
        meta: { total: mockPolicies.length },
      });
    } catch (error) {
      logger.error('Error fetching leave policies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave policies' },
        { status: 500 }
      );
    }
  }
);

// POST - Create leave policy
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = LeavePolicySchema.parse(body);

      const newPolicy = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Leave - Policy',
          details: `Created leave policy: ${data.name}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newPolicy }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating leave policy:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create leave policy' },
        { status: 500 }
      );
    }
  }
);
