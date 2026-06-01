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

const mockAcknowledgements = [
  {
    id: 'ack-001',
    policyId: 'pol-001',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    acknowledgedAt: '2026-01-05T09:15:00.000Z',
    method: 'ELECTRONIC',
    ipAddress: '10.0.0.1',
    version: '3.2',
  },
  {
    id: 'ack-002',
    policyId: 'pol-001',
    employeeId: 'emp-002',
    employeeName: 'Maria Garcia',
    acknowledgedAt: '2026-01-06T14:30:00.000Z',
    method: 'ELECTRONIC',
    ipAddress: '10.0.0.2',
    version: '3.2',
  },
  {
    id: 'ack-003',
    policyId: 'pol-001',
    employeeId: 'emp-003',
    employeeName: 'David Lee',
    acknowledgedAt: '2026-01-04T11:00:00.000Z',
    method: 'ELECTRONIC',
    ipAddress: '10.0.0.3',
    version: '3.2',
  },
];

export const GET = withEnhancedAuth(
  async (request: NextRequest, { _user, params, permissions }: any) => {
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
    try {
      const { id } = params;
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || 'ALL'; // ALL, ACKNOWLEDGED, PENDING
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

      // Simulated policy lookup with tenant isolation
      const knownPolicies = ['pol-001', 'pol-002', 'pol-003'];
      if (!knownPolicies.includes(id)) {
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

      const allEligibleEmployees = [
        { employeeId: 'emp-001', name: 'John Smith' },
        { employeeId: 'emp-002', name: 'Maria Garcia' },
        { employeeId: 'emp-003', name: 'David Lee' },
        { employeeId: 'emp-004', name: 'Sarah Johnson' },
      ];

      const acknowledgedIds = mockAcknowledgements
        .filter((a) => a.policyId === id)
        .map((a) => a.employeeId);

      let records;
      if (status === 'ACKNOWLEDGED') {
        records = mockAcknowledgements.filter((a) => a.policyId === id);
      } else if (status === 'PENDING') {
        records = allEligibleEmployees
          .filter((e) => !acknowledgedIds.includes(e.employeeId))
          .map((e) => ({
            employeeId: e.employeeId,
            employeeName: e.name,
            status: 'PENDING',
            acknowledgedAt: null,
          }));
      } else {
        const acknowledged = mockAcknowledgements
          .filter((a) => a.policyId === id)
          .map((a) => ({ ...a, status: 'ACKNOWLEDGED' }));
        const pending = allEligibleEmployees
          .filter((e) => !acknowledgedIds.includes(e.employeeId))
          .map((e) => ({
            employeeId: e.employeeId,
            employeeName: e.name,
            status: 'PENDING',
            acknowledgedAt: null,
          }));
        records = [...acknowledged, ...pending];
      }

      const total = records.length;
      const paginated = records.slice((page - 1) * limit, page * limit);

      const response: ApiResponse = {
        success: true,
        data: paginated,
        meta: {
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
          summary: {
            totalEligible: allEligibleEmployees.length,
            acknowledged: acknowledgedIds.length,
            pending: allEligibleEmployees.length - acknowledgedIds.length,
            acknowledgementRate:
              Math.round((acknowledgedIds.length / allEligibleEmployees.length) * 1000) / 10,
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
          message: 'Failed to get acknowledgement status',
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
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { _user, params, permissions }: any) => {
    if (!permissions.includes('admin/policies:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/policies:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const { id } = params;
      const body = await request.json();
      const { employeeId } = body;

      if (!employeeId) {
        const response: ApiResponse = {
          success: false,
          error: { code: 'E2001', message: 'Validation failed: employeeId is required' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      const knownPolicies = ['pol-001', 'pol-002', 'pol-003'];
      if (!knownPolicies.includes(id)) {
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

      // Check for duplicate acknowledgement
      const existing = mockAcknowledgements.find(
        (a) => a.policyId === id && a.employeeId === employeeId
      );
      if (existing) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee has already acknowledged this policy version',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 409 });
      }

      const acknowledgement = {
        id: `ack-${crypto.randomUUID().slice(0, 8)}`,
        policyId: id,
        tenantId: 'tenant-1', // from auth context in production
        employeeId,
        acknowledgedAt: new Date().toISOString(),
        method: body.method || 'ELECTRONIC',
        version: body.policyVersion || '1.0',
        signature: body.signature || null,
      };

      const response: ApiResponse = {
        success: true,
        data: acknowledgement,
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
          message: 'Failed to record acknowledgement',
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
);
