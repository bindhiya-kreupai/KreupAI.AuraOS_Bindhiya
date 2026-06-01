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
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const asOf = searchParams.get('asOf') || new Date().toISOString().split('T')[0];

    // Mock COBRA compliance audit result
    const auditResult = {
      tenantId,
      auditDate: new Date().toISOString(),
      asOfDate: asOf,
      overallStatus: 'COMPLIANT_WITH_WARNINGS',
      score: 87,
      summary: {
        totalQualifyingEvents: 15,
        eventsNotified: 14,
        eventsOverdue: 1,
        totalEnrollments: 22,
        activeEnrollments: 18,
        lapsedEnrollments: 4,
        pendingNotices: 2,
        overduePremiums: 3,
      },
      findings: [
        {
          id: 'finding-001',
          severity: 'WARNING',
          category: 'NOTICE_TIMELINESS',
          description: '1 qualifying event has a notification deadline within the next 3 days',
          affectedRecords: ['evt-002'],
          recommendedAction: 'Send COBRA election notice immediately to avoid DOL violation',
          deadline: '2026-02-15',
        },
        {
          id: 'finding-002',
          severity: 'INFO',
          category: 'PREMIUM_GRACE_PERIOD',
          description: '3 enrollments have premiums within the 30-day grace period',
          affectedRecords: ['enr-005', 'enr-011', 'enr-019'],
          recommendedAction: 'Monitor for payment; send payment reminder notices',
          deadline: null,
        },
        {
          id: 'finding-003',
          severity: 'CRITICAL',
          category: 'NOTICE_OVERDUE',
          description:
            '1 qualifying event did not receive notice within the 14-day employer notification window',
          affectedRecords: ['evt-007'],
          recommendedAction:
            'Consult legal counsel; consider corrective action and retroactive notice',
          deadline: null,
        },
      ],
      regulatoryDeadlines: [
        {
          type: 'EMPLOYER_NOTIFICATION',
          description: 'Notify COBRA administrator within 30 days of qualifying event',
          nextDeadline: '2026-03-01',
          status: 'ON_TRACK',
        },
        {
          type: 'ELECTION_NOTICE',
          description: 'Send election notice within 14 days of administrator notification',
          nextDeadline: '2026-02-14',
          status: 'AT_RISK',
        },
        {
          type: 'ANNUAL_OPEN_ENROLLMENT',
          description:
            'COBRA participants must be offered same open enrollment as active employees',
          nextDeadline: '2026-11-01',
          status: 'FUTURE',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: auditResult,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to run COBRA compliance audit',
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
