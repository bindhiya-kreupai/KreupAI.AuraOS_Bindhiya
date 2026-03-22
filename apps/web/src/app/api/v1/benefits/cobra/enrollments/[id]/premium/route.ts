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

const VALID_PAYMENT_METHODS = ['ACH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'MONEY_ORDER'];

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { id } = context.params as { id: string };
    const body = await request.json();
    const { amount, paymentMethod, paymentDate } = body;

    if (!amount || !paymentMethod || !paymentDate) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: amount, paymentMethod, and paymentDate are required',
          details: {
            missingFields: ['amount', 'paymentMethod', 'paymentDate'].filter((f) => !body[f]),
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

    if (typeof amount !== 'number' || amount <= 0) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: amount must be a positive number',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid paymentMethod. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Simulated enrollment lookup — in production would query DB with tenant isolation
    const mockEnrollmentIds = ['enr-001', 'enr-002', 'enr-003'];
    if (!mockEnrollmentIds.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `COBRA enrollment with id '${id}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const payment = {
      id: `pmt-${crypto.randomUUID().slice(0, 8)}`,
      enrollmentId: id,
      tenantId,
      amount,
      paymentMethod,
      paymentDate,
      transactionId: `TXN-${Date.now()}`,
      status: 'PROCESSED',
      gracePeriodExtendedTo: null,
      receiptNumber: `RCP-${Math.floor(Math.random() * 900000) + 100000}`,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: payment,
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
        message: 'Failed to process COBRA premium payment',
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
