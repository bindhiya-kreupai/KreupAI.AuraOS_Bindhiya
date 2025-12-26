import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

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

/**
 * GET /api/v1/payroll/history
 * Get payroll history for a company
 *
 * Query Parameters:
 * - tenantId (required): Tenant ID
 * - companyId (optional): Filter by company
 * - limit (optional): Number of records (default: 12, max: 24)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const companyId = searchParams.get('companyId');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '12'),
      24
    );

    if (!tenantId) {
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
    const mockHistory = Array.from({ length: Math.min(limit, 12) }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().slice(0, 7);

      return {
        id: crypto.randomUUID(),
        month,
        status: i === 0 ? 'CALCULATED' : 'PAID',
        totalEmployees: 150 + Math.floor(Math.random() * 20),
        totalGross: 750000 + Math.floor(Math.random() * 50000),
        totalNet: 660000 + Math.floor(Math.random() * 40000),
        currency: 'AED',
        processedAt: new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: i === 0 ? null : new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: i === 0 ? null : new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });

    const response: ApiResponse = {
      success: true,
      data: mockHistory,
      meta: {
        pagination: {
          page: 1,
          limit,
          total: 12,
          totalPages: 1,
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Payroll History API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch payroll history',
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
