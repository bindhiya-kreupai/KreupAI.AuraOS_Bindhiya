import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const LeavePolicySchema = z.object({
  companyId: z.string().optional(),
  countryCode: z.string().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  leaveTypeId: z.string().min(1),
  employmentTypes: z.any().optional(),
  minServiceMonths: z.number().default(0),
  annualEntitlement: z.coerce.number(),
  accrualType: z.enum(['ANNUAL', 'MONTHLY', 'QUARTERLY', 'TENURE']).default('MONTHLY'),
  accrualRate: z.coerce.number().optional(),
  allowCarryForward: z.boolean().default(true),
  maxCarryForwardDays: z.coerce.number().optional(),
  carryForwardExpiryMonths: z.number().optional(),
  allowEncashment: z.boolean().default(false),
  maxEncashmentDays: z.coerce.number().optional(),
  encashmentRate: z.coerce.number().default(100),
  allowNegativeBalance: z.boolean().default(false),
  maxNegativeDays: z.coerce.number().optional(),
  minConsecutiveDays: z.number().optional(),
  maxConsecutiveDays: z.number().optional(),
  advanceNoticeDays: z.number().default(0),
  requiresApproval: z.boolean().default(true),
  requiresDocument: z.boolean().default(false),
  proRataOnJoining: z.boolean().default(true),
  proRataOnExit: z.boolean().default(true),
});

// GET - Fetch leave policies from database
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get('isActive');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      const tenantId = user.tenantId;

      const where: Record<string, unknown> = { tenantId };
      if (isActive !== null && isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }

      const [total, policies] = await Promise.all([
        prisma.leavePolicy.count({ where }),
        prisma.leavePolicy.findMany({
          where,
          include: { balances: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return NextResponse.json({
        success: true,
        policies,
        leavePolicies: policies,
        data: policies,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error('Error fetching leave policies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave policies' },
        { status: 500 }
      );
    }
  }
);

// POST - Create leave policy in database
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = LeavePolicySchema.parse(body);
      const tenantId = user.tenantId;

      const newPolicy = await prisma.leavePolicy.create({
        data: {
          tenantId,
          companyId: data.companyId || null,
          countryCode: data.countryCode || null,
          code: data.code,
          name: data.name,
          nameAr: data.nameAr || null,
          leaveTypeId: data.leaveTypeId,
          employmentTypes: data.employmentTypes || null,
          minServiceMonths: data.minServiceMonths,
          annualEntitlement: data.annualEntitlement,
          accrualType: data.accrualType,
          accrualRate: data.accrualRate || null,
          allowCarryForward: data.allowCarryForward,
          maxCarryForwardDays: data.maxCarryForwardDays || null,
          carryForwardExpiryMonths: data.carryForwardExpiryMonths || null,
          allowEncashment: data.allowEncashment,
          maxEncashmentDays: data.maxEncashmentDays || null,
          encashmentRate: data.encashmentRate,
          allowNegativeBalance: data.allowNegativeBalance,
          maxNegativeDays: data.maxNegativeDays || null,
          minConsecutiveDays: data.minConsecutiveDays || null,
          maxConsecutiveDays: data.maxConsecutiveDays || null,
          advanceNoticeDays: data.advanceNoticeDays,
          requiresApproval: data.requiresApproval,
          requiresDocument: data.requiresDocument,
          proRataOnJoining: data.proRataOnJoining,
          proRataOnExit: data.proRataOnExit,
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Leave - Policy',
          metadata: { description: `Created leave policy: ${data.name} (${data.code})` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json(
        { success: true, data: newPolicy, policy: newPolicy, leavePolicy: newPolicy },
        { status: 201 }
      );
    } catch (error: any) {
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
