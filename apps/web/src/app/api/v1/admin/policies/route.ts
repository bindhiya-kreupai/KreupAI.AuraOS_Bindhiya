import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_CATEGORIES = [
  'HR',
  'IT',
  'SECURITY',
  'FINANCE',
  'HEALTH_SAFETY',
  'CODE_OF_CONDUCT',
  'LEAVE',
  'BENEFITS',
  'COMPENSATION',
  'PERFORMANCE',
  'TRAVEL',
  'EXPENSE',
];

const mockPolicies = [
  {
    id: 'pol-001',
    tenantId: 'tenant-1',
    title: 'Code of Business Conduct and Ethics',
    category: 'CODE_OF_CONDUCT',
    version: '3.2',
    status: 'PUBLISHED',
    applicableTo: 'ALL_EMPLOYEES',
    summary:
      'Guidelines for ethical business behavior, conflicts of interest, and regulatory compliance',
    contentLength: 12450,
    acknowledgementsRequired: true,
    totalAcknowledgements: 298,
    pendingAcknowledgements: 14,
    acknowledgementRate: 95.5,
    publishedAt: '2026-01-01T00:00:00.000Z',
    effectiveDate: '2026-01-01',
    reviewDate: '2027-01-01',
    ownerId: 'usr-legal-001',
    ownerName: 'Legal Department',
    createdAt: '2025-11-15T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'pol-002',
    tenantId: 'tenant-1',
    title: 'Remote Work Policy',
    category: 'HR',
    version: '2.0',
    status: 'PUBLISHED',
    applicableTo: 'ELIGIBLE_EMPLOYEES',
    summary:
      'Guidelines for remote work eligibility, equipment, security, and availability requirements',
    contentLength: 5820,
    acknowledgementsRequired: true,
    totalAcknowledgements: 245,
    pendingAcknowledgements: 8,
    acknowledgementRate: 96.8,
    publishedAt: '2025-07-01T00:00:00.000Z',
    effectiveDate: '2025-07-01',
    reviewDate: '2026-07-01',
    ownerId: 'usr-hr-001',
    ownerName: 'Human Resources',
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-07-01T00:00:00.000Z',
  },
  {
    id: 'pol-003',
    tenantId: 'tenant-1',
    title: 'Information Security Policy',
    category: 'SECURITY',
    version: '4.1',
    status: 'DRAFT',
    applicableTo: 'ALL_EMPLOYEES',
    summary: 'Updated information security policy incorporating new AI tool usage guidelines',
    contentLength: 8940,
    acknowledgementsRequired: true,
    totalAcknowledgements: 0,
    pendingAcknowledgements: 0,
    acknowledgementRate: 0,
    publishedAt: null,
    effectiveDate: '2026-04-01',
    reviewDate: '2027-04-01',
    ownerId: 'usr-it-001',
    ownerName: 'IT Security',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let policies = [...mockPolicies];
    if (category) policies = policies.filter((p) => p.category === category.toUpperCase());
    if (status) policies = policies.filter((p) => p.status === status.toUpperCase());
    if (search) {
      const lq = search.toLowerCase();
      policies = policies.filter(
        (p) => p.title.toLowerCase().includes(lq) || p.summary.toLowerCase().includes(lq)
      );
    }

    const total = policies.length;
    const paginated = policies.slice((page - 1) * limit, page * limit);

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
        message: 'Failed to list policies',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, content, applicableTo } = body;

    if (!title || !category || !content || !applicableTo) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: title, category, content, and applicableTo are required',
          details: {
            missingFields: ['title', 'category', 'content', 'applicableTo'].filter((f) => !body[f]),
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

    if (!VALID_CATEGORIES.includes(category.toUpperCase())) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newPolicy = {
      id: `pol-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-1', // from auth context in production
      title,
      category: category.toUpperCase(),
      version: '1.0',
      status: 'DRAFT',
      applicableTo,
      summary: body.summary || null,
      contentLength: content.length,
      acknowledgementsRequired: body.acknowledgementsRequired !== false,
      totalAcknowledgements: 0,
      pendingAcknowledgements: 0,
      acknowledgementRate: 0,
      publishedAt: null,
      effectiveDate: body.effectiveDate || null,
      reviewDate: body.reviewDate || null,
      ownerId: 'usr-current', // from auth context in production
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newPolicy,
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
        message: 'Failed to create policy',
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
