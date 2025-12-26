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

// Validation schema
const createShiftSchema = z.object({
  tenantId: z.string().uuid(),
  companyId: z.string().uuid(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  nameAr: z.string().optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  breakDurationMinutes: z.number().int().min(0).default(0),
  graceTimeMinutes: z.number().int().min(0).default(0),
  isNightShift: z.boolean().default(false),
  workingDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])),
  colorCode: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

/**
 * GET /api/v1/shifts
 * List all shifts with filtering and pagination
 *
 * Query Parameters:
 * - companyId (required): Company ID
 * - search (optional): Search by shift code or name
 * - isActive (optional): Filter by active status
 * - page (optional): Page number (default: 1)
 * - limit (optional): Records per page (default: 20, max: 100)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!companyId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'companyId is required in query parameters',
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
    const mockShifts = [
      {
        id: crypto.randomUUID(),
        code: 'GEN',
        name: 'General Shift',
        nameAr: 'الوردية العامة',
        startTime: '09:00:00',
        endTime: '18:00:00',
        breakDurationMinutes: 60,
        graceTimeMinutes: 15,
        isNightShift: false,
        workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        colorCode: '#3B82F6',
        assignedEmployees: 120,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        code: 'NIGHT',
        name: 'Night Shift',
        nameAr: 'الوردية الليلية',
        startTime: '22:00:00',
        endTime: '06:00:00',
        breakDurationMinutes: 30,
        graceTimeMinutes: 10,
        isNightShift: true,
        workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        colorCode: '#6366F1',
        assignedEmployees: 35,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        code: 'FLEX',
        name: 'Flexible Shift',
        nameAr: 'الوردية المرنة',
        startTime: '10:00:00',
        endTime: '19:00:00',
        breakDurationMinutes: 60,
        graceTimeMinutes: 30,
        isNightShift: false,
        workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        colorCode: '#10B981',
        assignedEmployees: 45,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const response: ApiResponse = {
      success: true,
      data: mockShifts,
      meta: {
        pagination: {
          page,
          limit,
          total: mockShifts.length,
          totalPages: 1,
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Shifts API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch shifts',
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
 * POST /api/v1/shifts
 * Create a new shift
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createShiftSchema.safeParse(body);
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

    const data = validationResult.data;

    // TODO: Implement actual shift creation
    // 1. Check for duplicate shift code
    // 2. Validate time ranges
    // 3. Calculate total work hours
    // 4. Create shift record

    const mockShift = {
      id: crypto.randomUUID(),
      ...data,
      totalWorkHours: 9, // Calculate from start/end time minus break
      assignedEmployees: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockShift,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Shifts API] POST Error:', error);

    if (error instanceof Error && error.message.includes('duplicate')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3002',
          message: 'Shift with this code already exists',
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
        message: 'Failed to create shift',
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
