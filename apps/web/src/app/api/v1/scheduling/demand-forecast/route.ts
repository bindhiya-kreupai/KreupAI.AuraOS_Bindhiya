import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('scheduling:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing scheduling:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const period = searchParams.get('period') || '2026-Q2';

    if (!departmentId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: departmentId query parameter is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const forecast = {
      tenantId: 'tenant-1',
      departmentId,
      period,
      forecastModel: 'AuraOS-Demand-v1.3',
      confidenceLevel: 87.4,
      generatedAt: new Date().toISOString(),
      weeklyForecast: [
        {
          weekOf: '2026-04-06',
          predictedDemandHours: 320,
          recommendedStaffCount: 40,
          peakDays: ['Monday', 'Wednesday', 'Friday'],
          peakHours: ['09:00-11:00', '14:00-16:00'],
          drivers: ['Quarter-end reporting', 'Product launch'],
        },
        {
          weekOf: '2026-04-13',
          predictedDemandHours: 290,
          recommendedStaffCount: 37,
          peakDays: ['Tuesday', 'Thursday'],
          peakHours: ['10:00-12:00'],
          drivers: ['Normal operations'],
        },
        {
          weekOf: '2026-04-20',
          predictedDemandHours: 265,
          recommendedStaffCount: 34,
          peakDays: ['Wednesday'],
          peakHours: ['09:00-11:00'],
          drivers: ['Spring break absences expected'],
        },
      ],
      hourlyPattern: {
        monday: [
          { hour: '08:00', demandIndex: 0.72 },
          { hour: '09:00', demandIndex: 0.95 },
          { hour: '10:00', demandIndex: 1.0 },
          { hour: '11:00', demandIndex: 0.98 },
          { hour: '12:00', demandIndex: 0.6 },
          { hour: '13:00', demandIndex: 0.75 },
          { hour: '14:00', demandIndex: 0.92 },
          { hour: '15:00', demandIndex: 0.88 },
          { hour: '16:00', demandIndex: 0.78 },
          { hour: '17:00', demandIndex: 0.45 },
        ],
      },
      staffingRisks: [
        {
          risk: 'UNDERSTAFFING',
          severity: 'MEDIUM',
          weeks: ['2026-04-06'],
          description: 'Demand projection exceeds current scheduled capacity by 12%',
          recommendation:
            'Schedule 3 additional employees or pre-approve overtime for week of Apr 6',
        },
      ],
    };

    const response: ApiResponse = {
      success: true,
      data: forecast,
      meta: {
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
        message: 'Failed to get demand forecast',
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
