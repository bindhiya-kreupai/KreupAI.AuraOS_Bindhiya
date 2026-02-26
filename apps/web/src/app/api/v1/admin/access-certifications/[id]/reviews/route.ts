import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_DECISIONS = ['CERTIFY', 'REVOKE', 'ESCALATE', 'REQUEST_INFO'];

const mockReviews = [
  {
    id: 'rev-001',
    campaignId: 'cert-001',
    tenantId: 'tenant-1',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    employeeTitle: 'Senior Software Engineer',
    reviewerId: 'mgr-001',
    reviewerName: 'Robert Chen',
    accessItems: [
      {
        system: 'GitHub Enterprise',
        role: 'Admin',
        lastUsed: '2026-02-25',
        riskLevel: 'HIGH',
        recommendation: 'REVIEW',
      },
      {
        system: 'AWS Production',
        role: 'PowerUser',
        lastUsed: '2026-02-20',
        riskLevel: 'HIGH',
        recommendation: 'REVIEW',
      },
      {
        system: 'Jira',
        role: 'Project Lead',
        lastUsed: '2026-02-26',
        riskLevel: 'LOW',
        recommendation: 'CERTIFY',
      },
      {
        system: 'Confluence',
        role: 'Space Admin',
        lastUsed: '2026-02-15',
        riskLevel: 'LOW',
        recommendation: 'CERTIFY',
      },
    ],
    status: 'PENDING',
    decision: null,
    justification: null,
    riskScore: 72,
    dueDate: '2026-02-28',
    completedAt: null,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'rev-002',
    campaignId: 'cert-001',
    tenantId: 'tenant-1',
    employeeId: 'emp-002',
    employeeName: 'Maria Garcia',
    employeeTitle: 'Software Engineer',
    reviewerId: 'mgr-001',
    reviewerName: 'Robert Chen',
    accessItems: [
      {
        system: 'GitHub Enterprise',
        role: 'Member',
        lastUsed: '2026-02-24',
        riskLevel: 'LOW',
        recommendation: 'CERTIFY',
      },
      {
        system: 'Jira',
        role: 'Developer',
        lastUsed: '2026-02-26',
        riskLevel: 'LOW',
        recommendation: 'CERTIFY',
      },
    ],
    status: 'COMPLETED',
    decision: 'CERTIFY',
    justification: 'Access is appropriate for role and actively used',
    riskScore: 25,
    dueDate: '2026-02-28',
    completedAt: '2026-02-10T14:30:00.000Z',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-10T14:30:00.000Z',
  },
];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const reviewerId = searchParams.get('reviewerId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Simulated campaign lookup with tenant isolation
    const knownCampaigns = ['cert-001', 'cert-002'];
    if (!knownCampaigns.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Access certification campaign with id '${id}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    let reviews = mockReviews.filter((r) => r.campaignId === id);
    if (status) reviews = reviews.filter((r) => r.status === status.toUpperCase());
    if (reviewerId) reviews = reviews.filter((r) => r.reviewerId === reviewerId);

    const total = reviews.length;
    const paginated = reviews.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        campaignSummary: {
          total: reviews.length,
          pending: reviews.filter((r) => r.status === 'PENDING').length,
          completed: reviews.filter((r) => r.status === 'COMPLETED').length,
        },
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
        message: 'Failed to get certification reviews',
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
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { reviewId, decision, justification } = body;

    if (!reviewId || !decision) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: reviewId and decision are required',
          details: { missingFields: ['reviewId', 'decision'].filter((f) => !body[f]) },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_DECISIONS.includes(decision.toUpperCase())) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid decision. Must be one of: ${VALID_DECISIONS.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (['REVOKE', 'ESCALATE'].includes(decision.toUpperCase()) && !justification) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Justification is required when decision is ${decision.toUpperCase()}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Simulated campaign lookup
    const knownCampaigns = ['cert-001', 'cert-002'];
    if (!knownCampaigns.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Access certification campaign with id '${id}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const reviewDecision = {
      reviewId,
      campaignId: id,
      tenantId: 'tenant-1',
      decision: decision.toUpperCase(),
      justification: justification || null,
      decidedBy: 'usr-current', // from auth context in production
      decidedAt: new Date().toISOString(),
      accessItemDecisions: body.accessItemDecisions || [],
      followUpActions:
        decision.toUpperCase() === 'REVOKE'
          ? [
              {
                action: 'REVOKE_ACCESS',
                system: 'all',
                scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              },
            ]
          : [],
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: reviewDecision,
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
        message: 'Failed to submit review decision',
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
}
