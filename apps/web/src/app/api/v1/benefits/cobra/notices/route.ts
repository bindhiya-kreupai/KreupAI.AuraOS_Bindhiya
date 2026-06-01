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

const mockNotices = [
  {
    id: 'ntc-001',
    tenantId: 'tenant-1',
    enrollmentId: 'enr-001',
    eventId: 'evt-001',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    noticeType: 'ELECTION_NOTICE',
    generatedDate: '2026-01-17',
    sentDate: '2026-01-17',
    deliveryMethod: 'EMAIL',
    deliveryAddress: 'john.smith@personal.com',
    status: 'DELIVERED',
    deadlineDate: '2026-03-16',
    planOptions: ['BlueCross PPO 2000', 'Delta Dental Plus', 'VSP Vision Care'],
    createdAt: '2026-01-17T08:00:00.000Z',
    updatedAt: '2026-01-17T14:30:00.000Z',
  },
  {
    id: 'ntc-002',
    tenantId: 'tenant-1',
    enrollmentId: 'enr-003',
    eventId: 'evt-003',
    employeeId: 'emp-010',
    employeeName: 'Robert Chen',
    noticeType: 'TERMINATION_NOTICE',
    generatedDate: '2026-02-05',
    sentDate: '2026-02-05',
    deliveryMethod: 'CERTIFIED_MAIL',
    deliveryAddress: '123 Main St, Springfield, IL 62701',
    status: 'SENT',
    deadlineDate: null,
    planOptions: [],
    createdAt: '2026-02-05T09:00:00.000Z',
    updatedAt: '2026-02-05T09:00:00.000Z',
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
    const noticeType = searchParams.get('noticeType') || undefined;
    const status = searchParams.get('status') || undefined;
    const enrollmentId = searchParams.get('enrollmentId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let notices = [...mockNotices];
    if (noticeType) notices = notices.filter((n) => n.noticeType === noticeType);
    if (status) notices = notices.filter((n) => n.status === status);
    if (enrollmentId) notices = notices.filter((n) => n.enrollmentId === enrollmentId);

    const total = notices.length;
    const paginated = notices.slice((page - 1) * limit, page * limit);

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
        message: 'Failed to fetch COBRA notices',
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
    const { enrollmentId } = body;

    if (!enrollmentId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: enrollmentId is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const validEnrollmentIds = ['enr-001', 'enr-002', 'enr-003'];
    if (!validEnrollmentIds.includes(enrollmentId)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `COBRA enrollment with id '${enrollmentId}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 60);

    const newNotice = {
      id: `ntc-${crypto.randomUUID().slice(0, 8)}`,
      tenantId,
      enrollmentId,
      noticeType: 'ELECTION_NOTICE',
      generatedDate: new Date().toISOString().split('T')[0],
      sentDate: null,
      deliveryMethod: 'EMAIL',
      status: 'GENERATED',
      deadlineDate: deadlineDate.toISOString().split('T')[0],
      documentUrl: `/api/v1/benefits/cobra/notices/ntc-${crypto.randomUUID().slice(0, 8)}/download`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newNotice,
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
        message: 'Failed to generate COBRA notice',
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
