export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createGarnishmentSchema = z.object({
  employeeId: z.string().uuid('Valid employee ID is required'),
  type: z.enum(['CHILD_SUPPORT', 'TAX_LEVY', 'CREDITOR', 'STUDENT_LOAN', 'BANKRUPTCY']),
  caseNumber: z.string().optional(),
  courtOrder: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  amountType: z.enum(['FIXED', 'PERCENTAGE']),
  maxAmount: z.number().positive().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  priority: z.number().int().min(1).optional(),
  payeeInfo: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      accountNumber: z.string().optional(),
    })
    .optional(),
});

/**
 * GET /api/v1/payroll/garnishments
 * List all garnishments for the tenant
 *
 * Query Parameters:
 * - employeeId (optional): Filter by employee
 * - status (optional): Filter by status (ACTIVE, PAUSED, COMPLETED, CANCELLED)
 * - type (optional): Filter by garnishment type
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('payroll:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing payroll:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Build where clause
    const where: Record<string, unknown> = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status.toUpperCase();
    if (type) where.type = type.toUpperCase();

    const garnishments = await prisma.garnishment.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const data = garnishments.map((g) => ({
      id: g.id,
      employeeId: g.employeeId,
      employeeName: `${g.employee.firstName} ${g.employee.lastName}`,
      employeeCode: g.employee.employeeCode,
      type: g.type.toLowerCase(),
      caseNumber: g.caseNumber,
      courtOrder: g.courtOrder,
      amount: Number(g.amount),
      amountType: g.amountType.toLowerCase(),
      maxAmount: g.maxAmount ? Number(g.maxAmount) : null,
      startDate: g.startDate.toISOString().split('T')[0],
      endDate: g.endDate ? g.endDate.toISOString().split('T')[0] : null,
      totalDeducted: Number(g.totalDeducted),
      status: g.status.toLowerCase(),
      priority: g.priority,
      payeeInfo: g.payeeInfo,
    }));

    // Compute summary
    const activeGarnishments = data.filter((g) => g.status === 'active');
    const totalMonthlyDeductions = activeGarnishments
      .filter((g) => g.amountType === 'fixed')
      .reduce((sum, g) => sum + g.amount, 0);
    const affectedEmployeeIds = new Set(activeGarnishments.map((g) => g.employeeId));

    return NextResponse.json(
      {
        success: true,
        data: {
          garnishments: data,
          total: data.length,
          summary: {
            activeCount: activeGarnishments.length,
            totalMonthlyDeductions,
            affectedEmployees: affectedEmployeeIds.size,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Garnishments API] GET Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch garnishments',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/payroll/garnishments
 * Create a new garnishment
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('payroll:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing payroll:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const tenantId = user.tenantId;
      const body = await request.json();

      // Validate request body
      const validationResult = createGarnishmentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Validation failed',
              details: { errors: validationResult.error.errors },
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 400 }
        );
      }

      const data = validationResult.data;

      // Verify employee belongs to this tenant
      const employee = await prisma.employee.findFirst({
        where: { id: data.employeeId, tenantId },
        select: { id: true, firstName: true, lastName: true, employeeCode: true },
      });

      if (!employee) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Employee not found in this tenant',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 404 }
        );
      }

      const garnishment = await prisma.garnishment.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          type: data.type,
          caseNumber: data.caseNumber || null,
          courtOrder: data.courtOrder || null,
          amount: data.amount,
          amountType: data.amountType,
          maxAmount: data.maxAmount || null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          status: 'ACTIVE',
          priority: data.priority || 1,
          totalDeducted: 0,
          payeeInfo: data.payeeInfo || null,
          createdBy: user.userId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: garnishment.id,
            employeeId: garnishment.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: garnishment.type.toLowerCase(),
            caseNumber: garnishment.caseNumber,
            amount: Number(garnishment.amount),
            amountType: garnishment.amountType.toLowerCase(),
            startDate: garnishment.startDate.toISOString().split('T')[0],
            endDate: garnishment.endDate ? garnishment.endDate.toISOString().split('T')[0] : null,
            totalDeducted: 0,
            status: garnishment.status.toLowerCase(),
            priority: garnishment.priority,
            createdAt: garnishment.createdAt.toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[Garnishments API] POST Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to create garnishment',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'garnishment',
    captureRequestBody: true,
  }
);
