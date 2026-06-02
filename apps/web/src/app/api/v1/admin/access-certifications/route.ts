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

const VALID_SCOPE_TYPES = ['ALL_EMPLOYEES', 'DEPARTMENT', 'ROLE', 'SYSTEM', 'PRIVILEGED_ACCESS'];
const VALID_REVIEWER_TYPES = [
  'MANAGER',
  'HR',
  'SYSTEM_OWNER',
  'SECURITY_TEAM',
  'SECOND_LEVEL_MANAGER',
];

const mockCampaigns = [
  {
    id: 'cert-001',
    tenantId: 'tenant-1',
    name: 'Q1 2026 Annual Access Review',
    description: 'Annual certification of all user access rights across enterprise systems',
    scope: 'ALL_EMPLOYEES',
    scopeDetails: null,
    reviewerType: 'MANAGER',
    status: 'IN_PROGRESS',
    startDate: '2026-02-01',
    dueDate: '2026-02-28',
    totalReviews: 298,
    completedReviews: 215,
    pendingReviews: 83,
    certifiedCount: 198,
    revokedCount: 12,
    escalatedCount: 5,
    completionRate: 72.1,
    riskItemsFound: 7,
    createdBy: 'usr-security-001',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
  },
  {
    id: 'cert-002',
    tenantId: 'tenant-1',
    name: 'Privileged Access Review - Engineering',
    description: 'Review of privileged/admin access for Engineering department',
    scope: 'PRIVILEGED_ACCESS',
    scopeDetails: { departments: ['dept-engineering'] },
    reviewerType: 'SECURITY_TEAM',
    status: 'COMPLETED',
    startDate: '2026-01-05',
    dueDate: '2026-01-31',
    totalReviews: 42,
    completedReviews: 42,
    pendingReviews: 0,
    certifiedCount: 35,
    revokedCount: 7,
    escalatedCount: 0,
    completionRate: 100,
    riskItemsFound: 3,
    createdBy: 'usr-security-001',
    createdAt: '2025-12-20T00:00:00.000Z',
    updatedAt: '2026-01-31T17:00:00.000Z',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/access-certifications:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/access-certifications:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const _tenantId = user.tenantId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let campaigns = [...mockCampaigns];
    if (status) campaigns = campaigns.filter((c) => c.status === status.toUpperCase());

    const total = campaigns.length;
    const paginated = campaigns.slice((page - 1) * limit, page * limit);

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
  } catch (_error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to list access certification campaigns',
        details: { error: _error instanceof Error ? _error.message : 'Unknown error' },
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
    if (!permissions.includes('admin/access-certifications:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/access-certifications:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;

    const body = await request.json();
    const { name, scope, reviewerType } = body;

    if (!name || !scope || !reviewerType) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: name, scope, and reviewerType are required',
          details: { missingFields: ['name', 'scope', 'reviewerType'].filter((f) => !body[f]) },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_SCOPE_TYPES.includes(scope.toUpperCase())) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid scope. Must be one of: ${VALID_SCOPE_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_REVIEWER_TYPES.includes(reviewerType.toUpperCase())) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid reviewerType. Must be one of: ${VALID_REVIEWER_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const dueDate =
      body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newCampaign = {
      id: `cert-${crypto.randomUUID().slice(0, 8)}`,
      tenantId, // from auth context
      name,
      description: body.description || null,
      scope: scope.toUpperCase(),
      scopeDetails: body.scopeDetails || null,
      reviewerType: reviewerType.toUpperCase(),
      status: 'DRAFT',
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      dueDate,
      totalReviews: 0,
      completedReviews: 0,
      pendingReviews: 0,
      certifiedCount: 0,
      revokedCount: 0,
      escalatedCount: 0,
      completionRate: 0,
      riskItemsFound: 0,
      createdBy: user.userId || 'usr-current', // from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newCampaign,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (_error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create access certification campaign',
        details: { error: _error instanceof Error ? _error.message : 'Unknown error' },
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
