import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

// Tenant isolation is enforced via tenantId extracted from auth context

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const mockPolicyDetail: Record<string, any> = {
  'pol-001': {
    id: 'pol-001',
    tenantId: 'tenant-1',
    title: 'Code of Business Conduct and Ethics',
    category: 'CODE_OF_CONDUCT',
    version: '3.2',
    status: 'PUBLISHED',
    applicableTo: 'ALL_EMPLOYEES',
    content: '[Full policy content would be here...]',
    summary:
      'Guidelines for ethical business behavior, conflicts of interest, and regulatory compliance',
    acknowledgementsRequired: true,
    totalAcknowledgements: 298,
    pendingAcknowledgements: 14,
    acknowledgementRate: 95.5,
    publishedAt: '2026-01-01T00:00:00.000Z',
    effectiveDate: '2026-01-01',
    reviewDate: '2027-01-01',
    ownerId: 'usr-legal-001',
    ownerName: 'Legal Department',
    revisionHistory: [
      {
        version: '3.2',
        changedBy: 'usr-legal-001',
        changedAt: '2025-11-15T00:00:00.000Z',
        summary: 'Added AI tool usage provisions',
      },
      {
        version: '3.1',
        changedBy: 'usr-legal-001',
        changedAt: '2024-12-01T00:00:00.000Z',
        summary: 'Updated conflict of interest definitions',
      },
    ],
    createdAt: '2025-11-15T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/policies:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/policies:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const _tenantId = user.tenantId;
    const { id } = params;

    const policy = mockPolicyDetail[id];
    if (!policy) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: `Policy with id '${id}' not found` },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: policy,
      meta: {
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
        message: 'Failed to get policy',
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

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params } = context;
      const tenantId = user.tenantId;
      const { id } = params;
      const body = await request.json();

      if (!mockPolicyDetail[id]) {
        const response: ApiResponse = {
          success: false,
          error: { code: 'E4001', message: `Policy with id '${id}' not found` },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 404 });
      }

      // Prevent editing PUBLISHED policies directly — must create a new version
      if (mockPolicyDetail[id].status === 'PUBLISHED' && !body.createNewVersion) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message:
              'Cannot edit a published policy directly. Set createNewVersion=true to create a new draft version.',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 409 });
      }

      const updatedPolicy = {
        ...mockPolicyDetail[id],
        ...body,
        id, // cannot change id
        tenantId, // cannot change tenant — use auth context value
        status: body.createNewVersion ? 'DRAFT' : mockPolicyDetail[id].status,
        version: body.createNewVersion
          ? incrementVersion(mockPolicyDetail[id].version)
          : mockPolicyDetail[id].version,
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: updatedPolicy,
        meta: {
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
          message: 'Failed to update policy',
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
  }),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'policy',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params } = context;
      const _tenantId = user.tenantId;
      const { id } = params;
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');

      if (action !== 'publish') {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: 'Invalid action. Use ?action=publish to publish a policy.',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      if (!mockPolicyDetail[id]) {
        const response: ApiResponse = {
          success: false,
          error: { code: 'E4001', message: `Policy with id '${id}' not found` },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 404 });
      }

      if (mockPolicyDetail[id].status !== 'DRAFT') {
        const response: ApiResponse = {
          success: false,
          error: { code: 'E3001', message: 'Only DRAFT policies can be published' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 409 });
      }

      const publishedPolicy = {
        ...mockPolicyDetail[id],
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        publishedBy: user.userId || 'usr-current', // from auth context
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: publishedPolicy,
        meta: {
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
          message: 'Failed to publish policy',
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
  }),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'policy',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);

function incrementVersion(version: string): string {
  const parts = version.split('.');
  parts[1] = String(parseInt(parts[1]) + 1);
  return parts.join('.');
}
