import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { employeeService } from '@/lib/services/employee';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
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
  joiningDate: z.string().datetime('Valid joining date is required'),
  managerId: z.string().uuid().optional(),
  addressId: z.string().uuid().optional(),
});

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
  managerId: z.string().uuid().optional(),
  addressId: z.string().uuid().optional(),
});

/**
 * GET /api/v1/employees
 * List employees with filtering and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filter = {
      companyId: searchParams.get('companyId') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      statusId: searchParams.get('statusId') || undefined,
      managerId: searchParams.get('managerId') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100 per page
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Fetch employees
    const result = await employeeService.findAll(filter);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Employees API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch employees',
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
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate request body
    const validationResult = createEmployeeSchema.safeParse(body);
    if (!validationResult.success) {
      const response: ApiResponse = {
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
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Create employee
    const employee = await employeeService.create({
      ...validationResult.data,
      joiningDate: new Date(validationResult.data.joiningDate),
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
  } catch (error) {
    console.error('[Employees API] POST Error:', error);

    // Check for duplicate errors
    if (error instanceof Error && error.message.includes('already exists')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3002',
          message: error.message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 409 });
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create employee',
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
