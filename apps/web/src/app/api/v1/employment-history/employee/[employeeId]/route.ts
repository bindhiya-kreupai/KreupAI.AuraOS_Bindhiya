/**
 * @api /api/v1/employment-history/employee/:employeeId
 * @description Get employment timeline for specific employee
 * @project AURA HCM Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { EmploymentHistoryService } from '@/lib/services/employment-history.service';

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
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/employment-history/employee/:employeeId
 * Get employment timeline for employee
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: any) => {
    try {
      const { employeeId } = context.params;
      const { user } = context;

      const timeline = await EmploymentHistoryService.getEmployeeTimeline(employeeId, user.tenantId);

      const response: ApiResponse = {
        success: true,
        data: timeline,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Employment History Timeline API] GET Error:', error);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch employee timeline',
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
