import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';
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
const createDepartmentSchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
  code: z.string().min(1, 'Department code is required'),
  name: z.string().min(1, 'Department name is required'),
  parentId: z.string().uuid().optional().nullable(),
  costCenterId: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/v1/departments
 * List departments with filtering and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('departments:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing departments:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filter = {
      companyId: searchParams.get('companyId') || undefined,
      parentId: searchParams.get('parentId') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    };

    // Fetch departments from microservice
    const result = await ServiceProxy.get('employee', '/departments', filter);

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
    console.error('[Departments API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch departments',
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
 * POST /api/v1/departments
 * Create a new department
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('departments:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing departments:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createDepartmentSchema.safeParse(body);
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

    // Create department via microservice
    const department = await ServiceProxy.post('employee', '/departments', validationResult.data);

    const response: ApiResponse = {
      success: true,
      data: department,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Departments API] POST Error:', error);

    // Check for duplicate or business logic errors
    if (
      error instanceof Error &&
      (error.message.includes('already exists') ||
        error.message.includes('not found') ||
        error.message.includes('same company'))
    ) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: error.message.includes('already exists') ? 'E3002' : 'E4001',
          message: error.message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, {
        status: error.message.includes('already exists') ? 409 : 400,
      });
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create department',
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
