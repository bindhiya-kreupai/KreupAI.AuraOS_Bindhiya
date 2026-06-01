import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { costCenterService } from '@/lib/services/organization';
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
const createCostCenterSchema = z.object({
  code: z.string().min(1, 'Cost center code is required'),
  name: z.string().min(1, 'Cost center name is required'),
});

/**
 * GET /api/v1/cost-centers
 * List cost centers with filtering and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('cost-centers:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing cost-centers:read permission',
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
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    };

    // Fetch cost centers
    const result = await costCenterService.findAll(filter);

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
    console.error('[Cost Centers API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch cost centers',
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
 * POST /api/v1/cost-centers
 * Create a new cost center
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('cost-centers:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing cost-centers:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createCostCenterSchema.safeParse(body);
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

    // Create cost center
    const costCenter = await costCenterService.create(validationResult.data);

    const response: ApiResponse = {
      success: true,
      data: costCenter,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Cost Centers API] POST Error:', error);

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
        message: 'Failed to create cost center',
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
