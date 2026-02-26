import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    const { employeeId } = params;

    // Simulated employee lookup with tenant isolation
    const knownEmployees = ['emp-001', 'emp-002', 'emp-003', 'emp-010'];
    if (!knownEmployees.includes(employeeId)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Employee with id '${employeeId}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const fatigueAnalysis = {
      tenantId: 'tenant-1',
      employeeId,
      employeeName: 'John Smith',
      analysisDate: new Date().toISOString().split('T')[0],
      riskLevel: 'MEDIUM', // LOW, MEDIUM, HIGH, CRITICAL
      fatigueScore: 62, // 0-100, higher is more fatigued
      indicators: [
        {
          indicator: 'CONSECUTIVE_DAYS',
          value: 7,
          threshold: 6,
          status: 'EXCEEDED',
          description: 'Employee has worked 7 consecutive days (threshold: 6)',
          weight: 0.35,
        },
        {
          indicator: 'WEEKLY_HOURS',
          value: 48.5,
          threshold: 40,
          status: 'EXCEEDED',
          description: 'Hours worked this week: 48.5 (standard: 40)',
          weight: 0.3,
        },
        {
          indicator: 'NIGHT_SHIFTS_CONSECUTIVE',
          value: 2,
          threshold: 4,
          status: 'OK',
          description: '2 consecutive night shifts (threshold: 4)',
          weight: 0.2,
        },
        {
          indicator: 'REST_BETWEEN_SHIFTS',
          value: 11,
          threshold: 11,
          status: 'AT_LIMIT',
          description: 'Minimum rest between shifts: 11 hours (required: 11)',
          weight: 0.15,
        },
      ],
      recentSchedule: [
        { date: '2026-02-20', start: '08:00', end: '16:30', hours: 8.5, type: 'REGULAR' },
        { date: '2026-02-21', start: '08:00', end: '17:00', hours: 9.0, type: 'REGULAR' },
        { date: '2026-02-22', start: '08:00', end: '16:00', hours: 8.0, type: 'REGULAR' },
        { date: '2026-02-23', start: '09:00', end: '17:30', hours: 8.5, type: 'REGULAR' },
        { date: '2026-02-24', start: '08:00', end: '16:00', hours: 8.0, type: 'REGULAR' },
        { date: '2026-02-25', start: '10:00', end: '16:30', hours: 6.5, type: 'REGULAR' },
        { date: '2026-02-26', start: '08:00', end: '08:00', hours: 0, type: 'OFF' },
      ],
      recommendations: [
        {
          priority: 'HIGH',
          action: 'MANDATE_REST_DAY',
          description:
            'Employee should not be scheduled for the next 24 hours without at least 1 full rest day',
        },
        {
          priority: 'MEDIUM',
          action: 'LIMIT_OVERTIME',
          description: 'Avoid scheduling overtime for the next 5 days',
        },
      ],
      complianceFlags: [
        {
          regulation: 'OSHA Fatigue Guidelines',
          status: 'WARNING',
          message: 'Approaching recommended fatigue threshold for safety-sensitive roles',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: fatigueAnalysis,
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
        message: 'Failed to check employee fatigue risk',
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
