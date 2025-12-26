import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
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
const createLeavePolicySchema = z.object({
  tenantId: z.string().uuid(),
  companyId: z.string().uuid().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  code: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  leaveTypeId: z.string().uuid(),
  employmentTypes: z.array(z.string()).optional().nullable(),
  minServiceMonths: z.number().int().min(0).default(0),
  annualEntitlement: z.number().min(0),
  accrualType: z.enum(['ANNUAL', 'MONTHLY', 'QUARTERLY', 'TENURE']).default('MONTHLY'),
  accrualRate: z.number().optional().nullable(),
  allowCarryForward: z.boolean().default(true),
  maxCarryForwardDays: z.number().optional().nullable(),
  carryForwardExpiryMonths: z.number().int().optional().nullable(),
  allowEncashment: z.boolean().default(false),
  maxEncashmentDays: z.number().optional().nullable(),
  encashmentRate: z.number().min(0).max(200).default(100),
});

/**
 * GET /api/v1/leave/policies
 * List leave policies with filtering and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: searchParams.get('tenantId'),
      companyId: searchParams.get('companyId'),
      countryCode: searchParams.get('countryCode'),
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    };

    if (!filter.tenantId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'tenantId is required in query parameters',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // TODO: Implement actual database query
    const mockPolicies = [
      {
        id: crypto.randomUUID(),
        code: 'ANNUAL_LEAVE',
        name: 'Annual Leave',
        nameAr: 'الإجازة السنوية',
        leaveType: {
          id: crypto.randomUUID(),
          code: 'AL',
          name: 'Annual Leave',
          isPaid: true,
        },
        annualEntitlement: 21,
        accrualType: 'MONTHLY',
        accrualRate: 1.75,
        allowCarryForward: true,
        maxCarryForwardDays: 5,
        allowEncashment: true,
        maxEncashmentDays: 10,
        encashmentRate: 100,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        code: 'SICK_LEAVE',
        name: 'Sick Leave',
        nameAr: 'الإجازة المرضية',
        leaveType: {
          id: crypto.randomUUID(),
          code: 'SL',
          name: 'Sick Leave',
          isPaid: true,
        },
        annualEntitlement: 12,
        accrualType: 'MONTHLY',
        accrualRate: 1,
        allowCarryForward: false,
        allowEncashment: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const response: ApiResponse = {
      success: true,
      data: mockPolicies,
      meta: {
        pagination: {
          page: 1,
          limit: filter.limit,
          total: mockPolicies.length,
          totalPages: 1,
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Leave Policies API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch leave policies',
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
 * POST /api/v1/leave/policies
 * Create a new leave policy
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createLeavePolicySchema.safeParse(body);
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

    // TODO: Implement actual database creation
    const mockPolicy = {
      id: crypto.randomUUID(),
      ...validationResult.data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockPolicy,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Leave Policies API] POST Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create leave policy',
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
