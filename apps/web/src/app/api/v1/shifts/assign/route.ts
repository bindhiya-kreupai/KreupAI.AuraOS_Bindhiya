import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema
const assignShiftSchema = z
  .object({
    shiftId: z.string().uuid(),
    employeeIds: z.array(z.string().uuid()).min(1),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    effectiveTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    isPermanent: z.boolean().default(true),
    notes: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.effectiveTo) {
        return new Date(data.effectiveFrom) <= new Date(data.effectiveTo);
      }
      return true;
    },
    {
      message: 'Effective to date must be after effective from date',
      path: ['effectiveTo'],
    }
  );

/**
 * POST /api/v1/shifts/assign
 * Assign shift to employees
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('shifts:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      // Validate request body
      const validationResult = assignShiftSchema.safeParse(body);
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

      // Validate shift exists and is active for this tenant
      const shift = await prisma.shift.findFirst({
        where: {
          id: data.shiftId,
          tenantId: user.tenantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
      });

      if (!shift) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Shift not found or inactive',
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

      // Validate all employees exist and belong to this tenant
      const employees = await prisma.employee.findMany({
        where: {
          id: { in: data.employeeIds },
          company: { tenantId: user.tenantId },
        },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
        },
      });

      const foundEmployeeIds = new Set(employees.map((e) => e.id));
      const missingEmployeeIds = data.employeeIds.filter((id) => !foundEmployeeIds.has(id));

      if (missingEmployeeIds.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'One or more employees not found',
              details: { missingEmployeeIds },
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

      const effectiveFrom = new Date(data.effectiveFrom);
      const effectiveTo = data.effectiveTo ? new Date(data.effectiveTo) : null;

      // Check for overlapping active shift assignments
      const overlapping = await prisma.shiftAssignment.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: data.employeeIds },
          isActive: true,
          effectiveFrom: { lte: effectiveTo || new Date('9999-12-31') },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
        },
        select: {
          employeeId: true,
          shiftId: true,
          effectiveFrom: true,
          effectiveTo: true,
        },
      });

      if (overlapping.length > 0) {
        // Deactivate overlapping assignments
        await prisma.shiftAssignment.updateMany({
          where: {
            id: { in: overlapping.map((o) => o.employeeId) },
            tenantId: user.tenantId,
            employeeId: { in: data.employeeIds },
            isActive: true,
            effectiveFrom: { lte: effectiveTo || new Date('9999-12-31') },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
          },
          data: {
            isActive: false,
            effectiveTo: new Date(new Date(data.effectiveFrom).getTime() - 86400000), // day before new assignment
          },
        });
      }

      // Create new shift assignments for all employees
      // Cast: the `shift` relation is not declared on ShiftAssignment in schema.prisma
      const assignments = await prisma.$transaction(
        data.employeeIds.map((employeeId) =>
          (prisma as any).shiftAssignment.create({
            data: {
              tenantId: user.tenantId,
              employeeId,
              shiftId: data.shiftId,
              effectiveFrom,
              effectiveTo,
              isActive: true,
              assignedBy: user.userId,
              reason: data.notes || null,
            },
            include: {
              shift: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          })
        )
      );

      const employeeMap = new Map(employees.map((e) => [e.id, e]));

      const assignmentResult = {
        shiftId: data.shiftId,
        shiftName: shift.name,
        shiftCode: shift.code,
        totalEmployees: data.employeeIds.length,
        successfulAssignments: assignments.length,
        failedAssignments: 0,
        assignments: assignments.map((a) => {
          const emp = employeeMap.get(a.employeeId);
          return {
            id: a.id,
            employeeId: a.employeeId,
            employeeCode: emp?.employeeCode || '',
            employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
            status: 'ASSIGNED',
            effectiveFrom: a.effectiveFrom.toISOString().split('T')[0],
            effectiveTo: a.effectiveTo?.toISOString().split('T')[0] || null,
            isPermanent: data.isPermanent,
          };
        }),
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || null,
        isPermanent: data.isPermanent,
        notes: data.notes || null,
        assignedAt: new Date().toISOString(),
        assignedBy: user.userId,
      };

      return NextResponse.json(
        {
          success: true,
          data: assignmentResult,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[Shift Assignment API] POST Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Shift or employee not found',
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

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to assign shift',
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
    resourceType: 'shift_assignment',
    captureRequestBody: true,
  }
);
