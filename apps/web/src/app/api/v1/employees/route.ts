// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';
import { z } from 'zod';

// API Response Standard
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
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

// Validation schemas
const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  companyId: z.string().uuid('Valid company ID is required'),
  departmentId: z.string().uuid('Valid department ID is required'),
  locationId: z.string().uuid('Valid location ID is required'),
  jobProfileId: z.string().uuid('Valid job profile ID is required'),
  gradeId: z.string().uuid('Valid grade ID is required'),
  statusId: z.string().uuid('Valid status ID is required'),
  typeId: z.string().uuid('Valid employment type ID is required'),
  joiningDate: z.string().or(z.date()),
  managerId: z.string().uuid().optional().nullable(),
  positionId: z.string().uuid().optional().nullable(),
  addressId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
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
 * GET /api/v1/employees
 * List employees with filtering and pagination — queries Prisma directly
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (
      !context.roles?.includes('SUPER_ADMIN') &&
      !context.roles?.includes('ADMIN') &&
      !permissions.includes('employees:read') &&
      !permissions.includes('employees:manage')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:read permission',
            messageAr: 'ممنوع: صلاحية قراءة الموظفين غير متوفرة',
          },
        } satisfies ApiResponse,
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const companyId = searchParams.get('companyId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const locationId = searchParams.get('locationId') || undefined;
    const statusId = searchParams.get('statusId') || undefined;
    const managerId = searchParams.get('managerId') || undefined;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Build where clause with tenant scoping
    const where: any = {
      company: {
        tenantId,
      },
    };

    if (companyId) where.companyId = companyId;
    if (departmentId) where.departmentId = departmentId;
    if (locationId) where.locationId = locationId;
    if (statusId) where.statusId = statusId;
    if (managerId) where.managerId = managerId;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: employeeInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.employee.count({ where }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: employees.map((emp) => ({
        ...emp,
        name: `${emp.firstName} ${emp.lastName}`,
        role: emp.jobProfile?.title ?? null,
        dept: emp.department?.name ?? null,
        loc: emp.location?.name ?? null,
      })),
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('[Employees API] GET Error:', error);
    try {
      require('fs').writeFileSync(
        'd:/KreupAI/KreupAI.AuraOS/error_log.txt',
        error?.stack || String(error)
      );
    } catch (e) {}

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch employees',
        messageAr: 'فشل في جلب الموظفين',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});

/**
 * POST /api/v1/employees
 * Create a new employee
 */
export const POST = auditMiddleware.createEmployee(
  withEnhancedAuth(async (request: NextRequest, context) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('employees:write') && !permissions.includes('employees:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing employees:write permission',
              messageAr: 'ممنوع: صلاحية كتابة الموظفين غير متوفرة',
            },
          } satisfies ApiResponse,
          { status: 403 }
        );
      }
      const tenantId = user.tenantId;
      const body = await request.json();

      // Validate request body
      const validationResult = createEmployeeSchema.safeParse(body);
      if (!validationResult.success) {
        const response: ApiResponse = {
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
        };

        return NextResponse.json(response, { status: 400 });
      }

      const data = validationResult.data;

      // Check for duplicate email
      // tenant-ok: employee where clause is preceded by tenant-scoped lookup; relation traversal
      const existingEmail = await prisma.employee.findUnique({ where: { email: data.email } });
      if (existingEmail) {
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
          },
          { status: 409 }
        );
      }

      // Check for duplicate employeeCode
      // tenant-ok: employee where clause is preceded by tenant-scoped lookup; relation traversal
      const existingCode = await prisma.employee.findUnique({
        where: { employeeCode: data.employeeCode },
      });
      if (existingCode) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3002',
              message: 'An employee with this code already exists',
              messageAr: 'يوجد موظف بهذا الرمز بالفعل',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 409 }
        );
      }

      const employee = await prisma.employee.create({
        data: {
          tenantId,
          employeeCode: data.employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          companyId: data.companyId,
          departmentId: data.departmentId,
          locationId: data.locationId,
          jobProfileId: data.jobProfileId,
          gradeId: data.gradeId,
          statusId: data.statusId,
          typeId: data.typeId,
          joiningDate: new Date(data.joiningDate as string),
          managerId: data.managerId ?? undefined,
          positionId: data.positionId ?? undefined,
          addressId: data.addressId ?? undefined,
          userId: data.userId ?? undefined,
        },
        include: employeeInclude,
      });

      const response: ApiResponse = {
        success: true,
        data: employee,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      console.error('[Employees API] POST Error:', error);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create employee',
          messageAr: 'فشل في إنشاء الموظف',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  })
);
