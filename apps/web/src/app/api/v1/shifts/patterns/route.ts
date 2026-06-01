import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_PATTERN_TYPES = ['FIXED', 'ROTATING', 'COMPRESSED', 'SPLIT', 'FLEXIBLE', 'ON_CALL'];

const mockShiftPatterns = [
  {
    id: 'ptn-001',
    tenantId: 'tenant-1',
    name: 'Standard 9-5 Fixed',
    type: 'FIXED',
    departmentId: 'dept-engineering',
    departmentName: 'Engineering',
    rotationDays: null,
    status: 'ACTIVE',
    shifts: [
      { day: 'MONDAY', startTime: '09:00', endTime: '17:00', hours: 8 },
      { day: 'TUESDAY', startTime: '09:00', endTime: '17:00', hours: 8 },
      { day: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', hours: 8 },
      { day: 'THURSDAY', startTime: '09:00', endTime: '17:00', hours: 8 },
      { day: 'FRIDAY', startTime: '09:00', endTime: '17:00', hours: 8 },
    ],
    weeklyHours: 40,
    employeesAssigned: 28,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'ptn-002',
    tenantId: 'tenant-1',
    name: '4x10 Compressed Workweek',
    type: 'COMPRESSED',
    departmentId: 'dept-operations',
    departmentName: 'Operations',
    rotationDays: null,
    status: 'ACTIVE',
    shifts: [
      { day: 'MONDAY', startTime: '07:00', endTime: '17:30', hours: 10 },
      { day: 'TUESDAY', startTime: '07:00', endTime: '17:30', hours: 10 },
      { day: 'WEDNESDAY', startTime: '07:00', endTime: '17:30', hours: 10 },
      { day: 'THURSDAY', startTime: '07:00', endTime: '17:30', hours: 10 },
    ],
    weeklyHours: 40,
    employeesAssigned: 15,
    createdAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2025-03-15T00:00:00.000Z',
  },
  {
    id: 'ptn-003',
    tenantId: 'tenant-1',
    name: '3-Week Rotating Continental',
    type: 'ROTATING',
    departmentId: 'dept-warehouse',
    departmentName: 'Warehouse',
    rotationDays: 21,
    status: 'ACTIVE',
    shifts: [
      {
        week: 1,
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        startTime: '06:00',
        endTime: '14:00',
        hours: 8,
      },
      {
        week: 2,
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        startTime: '14:00',
        endTime: '22:00',
        hours: 8,
      },
      { week: 3, days: ['MON', 'TUE', 'WED'], startTime: '22:00', endTime: '06:00', hours: 8 },
    ],
    weeklyHours: 40,
    employeesAssigned: 42,
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2025-09-10T00:00:00.000Z',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('shifts:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let patterns = [...mockShiftPatterns];
    if (departmentId) patterns = patterns.filter((p) => p.departmentId === departmentId);
    if (status) patterns = patterns.filter((p) => p.status === status);

    const total = patterns.length;
    const paginated = patterns.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to list shift patterns',
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

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
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
  try {
    const body = await request.json();
    const { name, type, rotationDays, shifts } = body;

    if (!name || !type || !shifts || !Array.isArray(shifts) || shifts.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: name, type, and shifts (non-empty array) are required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_PATTERN_TYPES.includes(type)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid type. Must be one of: ${VALID_PATTERN_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newPattern = {
      id: `ptn-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-1', // from auth context in production
      name,
      type,
      departmentId: body.departmentId || null,
      rotationDays: type === 'ROTATING' ? rotationDays : null,
      status: 'DRAFT',
      shifts,
      weeklyHours: shifts.reduce((sum: number, s: any) => sum + (s.hours || 0), 0),
      employeesAssigned: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newPattern,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create shift pattern',
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
