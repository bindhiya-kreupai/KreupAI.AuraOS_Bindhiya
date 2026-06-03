import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';
import { z } from 'zod';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    messageAr?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  jobProfileId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional().nullable(),
  addressId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  joiningDate: z.string().or(z.date()).optional(),
});

const employeeInclude = {
  company: true,
  department: true,
  location: true,
  jobProfile: true,
  grade: true,
  status: true,
  type: true,
  manager: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employeeCode: true,
    },
  },
};

/**
 * GET /api/v1/employees/:id
 * Get employee by ID — queries Prisma directly
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, params, permissions }: any) => {
    if (!permissions.includes('employees:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const tenantId = user.tenantId;
      const { id } = params;

      const employee = await prisma.employee.findFirst({
        where: { id, company: { tenantId } },
        include: employeeInclude,
      });

      if (!employee) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E3001', message: 'Employee not found', messageAr: 'الموظف غير موجود' },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          } satisfies ApiResponse,
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: { ...employee, name: `${employee.firstName} ${employee.lastName}` },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        } satisfies ApiResponse,
        { status: 200 }
      );
    } catch (error: any) {
      console.error('[Employee API] GET Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to fetch employee',
            messageAr: 'فشل في جلب الموظف',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/v1/employees/:id
 * Update employee by ID
 */
export const PUT = auditMiddleware.updateEmployee(
  withEnhancedAuth(async (request: NextRequest, { user, params, permissions }: any) => {
    if (!permissions.includes('employees:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const tenantId = user.tenantId;
      const { id } = params;
      const body = await request.json();

      const validationResult = updateEmployeeSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Validation failed',
              messageAr: 'فشل التحقق',
              details: { errors: validationResult.error.errors },
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          } satisfies ApiResponse,
          { status: 400 }
        );
      }

      // Verify employee exists and belongs to tenant
      const existing = await prisma.employee.findFirst({ where: { id, company: { tenantId } } });
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Employee not found',
              messageAr: 'الموظف غير موجود',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          } satisfies ApiResponse,
          { status: 404 }
        );
      }

      // Check email uniqueness if being updated — scoped to tenant so the
      // collision message can't be used to enumerate emails across tenants.
      const data = validationResult.data;
      if (data.email && data.email !== existing.email) {
        const emailTaken = await prisma.employee.findFirst({
          where: { email: data.email, company: { tenantId } },
        });
        if (emailTaken) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E3002',
                message: 'An employee with this email already exists',
                messageAr: 'يوجد موظف بهذا البريد الإلكتروني بالفعل',
              },
              meta: {
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
                apiVersion: 'v1',
              },
            } satisfies ApiResponse,
            { status: 409 }
          );
        }
      }

      const updateData: Record<string, unknown> = { ...data };
      if (updateData.joiningDate) {
        updateData.joiningDate = new Date(updateData.joiningDate as string);
      }

      // tenant-ok: id-based update preceded by tenant-scoped findFirst above
      const employee = await prisma.employee.update({
        where: { id },
        data: updateData,
        include: employeeInclude,
      });

      return NextResponse.json(
        {
          success: true,
          data: employee,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        } satisfies ApiResponse,
        { status: 200 }
      );
    } catch (error: any) {
      console.error('[Employee API] PUT Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to update employee',
            messageAr: 'فشل في تحديث الموظف',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }
  })
);

/**
 * DELETE /api/v1/employees/:id
 * Soft delete employee by updating status
 */
export const DELETE = auditMiddleware.deleteEmployee(
  withEnhancedAuth(async (request: NextRequest, { user, params, permissions }: any) => {
    if (!permissions.includes('employees:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const tenantId = user.tenantId;
      const { id } = params;
      const { searchParams } = new URL(request.url);
      const terminatedStatusId = searchParams.get('terminatedStatusId');

      if (!terminatedStatusId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'terminatedStatusId is required',
              messageAr: 'معرف حالة الإنهاء مطلوب',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          } satisfies ApiResponse,
          { status: 400 }
        );
      }

      const existing = await prisma.employee.findFirst({ where: { id, company: { tenantId } } });
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Employee not found',
              messageAr: 'الموظف غير موجود',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          } satisfies ApiResponse,
          { status: 404 }
        );
      }

      // tenant-ok: id-based update preceded by tenant-scoped findFirst above
      await prisma.employee.update({
        where: { id },
        data: { statusId: terminatedStatusId },
      });

      return NextResponse.json(
        {
          success: true,
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        } satisfies ApiResponse,
        { status: 200 }
      );
    } catch (error: any) {
      console.error('[Employee API] DELETE Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to delete employee',
            messageAr: 'فشل في حذف الموظف',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        } satisfies ApiResponse,
        { status: 500 }
      );
    }
  })
);
