import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const COBRA_EVENT_TYPES = [
  'TERMINATION',
  'REDUCTION_HOURS',
  'DIVORCE',
  'DEPENDENT_AGE_OUT',
  'MEDICARE_ENTITLEMENT',
  'DEATH',
];

const mockCobraEvents = [
  {
    id: 'evt-001',
    tenantId: 'tenant-1',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    eventType: 'TERMINATION',
    qualifyingEventDate: '2026-01-15',
    notificationDeadline: '2026-01-29',
    enrollmentDeadline: '2026-03-16',
    status: 'ACTIVE',
    beneficiaries: [
      { name: 'Jane Smith', relationship: 'SPOUSE', dob: '1985-03-20' },
      { name: 'Alex Smith', relationship: 'CHILD', dob: '2015-07-10' },
    ],
    createdAt: '2026-01-16T09:00:00.000Z',
    updatedAt: '2026-01-16T09:00:00.000Z',
  },
  {
    id: 'evt-002',
    tenantId: 'tenant-1',
    employeeId: 'emp-002',
    employeeName: 'Maria Garcia',
    eventType: 'REDUCTION_HOURS',
    qualifyingEventDate: '2026-02-01',
    notificationDeadline: '2026-02-15',
    enrollmentDeadline: '2026-04-01',
    status: 'PENDING_NOTICE',
    beneficiaries: [],
    createdAt: '2026-02-02T10:30:00.000Z',
    updatedAt: '2026-02-02T10:30:00.000Z',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/cobra:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/cobra:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const _tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const eventType = searchParams.get('eventType') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let events = [...mockCobraEvents];
    if (status) events = events.filter((e) => e.status === status);
    if (eventType) events = events.filter((e) => e.eventType === eventType);

    const total = events.length;
    const paginated = events.slice((page - 1) * limit, page * limit);

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
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch COBRA qualifying events',
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

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/cobra:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/cobra:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const body = await request.json();
    const { employeeId, eventType, qualifyingEventDate, beneficiaries } = body;

    if (!employeeId || !eventType || !qualifyingEventDate) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: employeeId, eventType, and qualifyingEventDate are required',
          details: {
            missingFields: ['employeeId', 'eventType', 'qualifyingEventDate'].filter(
              (f) => !body[f]
            ),
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!COBRA_EVENT_TYPES.includes(eventType)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid eventType. Must be one of: ${COBRA_EVENT_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const qualDate = new Date(qualifyingEventDate);
    const notificationDeadline = new Date(qualDate);
    notificationDeadline.setDate(notificationDeadline.getDate() + 14);
    const enrollmentDeadline = new Date(qualDate);
    enrollmentDeadline.setDate(enrollmentDeadline.getDate() + 60);

    const newEvent = {
      id: `evt-${crypto.randomUUID().slice(0, 8)}`,
      tenantId,
      employeeId,
      eventType,
      qualifyingEventDate,
      notificationDeadline: notificationDeadline.toISOString().split('T')[0],
      enrollmentDeadline: enrollmentDeadline.toISOString().split('T')[0],
      status: 'PENDING_NOTICE',
      beneficiaries: beneficiaries || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newEvent,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to initiate COBRA qualifying event',
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
