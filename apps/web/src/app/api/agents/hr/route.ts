/**
 * HR Agent API Routes
 * Phase 4 Sprint 31-32: HR Agent Endpoints
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { HRAgentService } from '@/lib/services/agentic-ai';

/**
 * GET /api/agents/hr
 * Get HR Agent capabilities and status
 */
export async function GET(request: NextRequest) {
  try {
    const definition = HRAgentService.getDefinition();

    return NextResponse.json({
      success: true,
      data: {
        id: definition.id,
        type: definition.type,
        name: definition.name,
        description: definition.description,
        capabilities: definition.capabilities,
        isActive: definition.isActive,
      },
    });
  } catch (error) {
        return NextResponse.json(
      { success: false, error: 'Failed to fetch HR agent' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/hr
 * Execute HR Agent action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeId, tenantId, params } = body;

    if (!action || !employeeId || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, employeeId, tenantId' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'GET_LEAVE_BALANCE':
        result = await HRAgentService.getLeaveBalance(
          employeeId,
          tenantId,
          params?.leaveType
        );
        break;

      case 'APPLY_LEAVE':
        if (!params?.leaveType || !params?.startDate || !params?.endDate || !params?.reason) {
          return NextResponse.json(
            { success: false, error: 'Missing leave application params' },
            { status: 400 }
          );
        }
        result = await HRAgentService.applyLeave(employeeId, tenantId, {
          leaveType: params.leaveType,
          startDate: new Date(params.startDate),
          endDate: new Date(params.endDate),
          reason: params.reason,
          halfDay: params.halfDay,
          halfDayPeriod: params.halfDayPeriod,
        });
        break;

      case 'GET_LEAVE_REQUESTS':
        result = await HRAgentService.getLeaveRequests(
          employeeId,
          tenantId,
          params
        );
        break;

      case 'GET_ATTENDANCE':
        result = await HRAgentService.getTodayAttendance(employeeId, tenantId);
        break;

      case 'GET_ATTENDANCE_SUMMARY':
        const now = new Date();
        result = await HRAgentService.getAttendanceSummary(
          employeeId,
          tenantId,
          params?.month || now.getMonth() + 1,
          params?.year || now.getFullYear()
        );
        break;

      case 'GET_PAYSLIP':
        const currentDate = new Date();
        result = await HRAgentService.getPayslip(
          employeeId,
          tenantId,
          params?.month || currentDate.getMonth() + 1,
          params?.year || currentDate.getFullYear()
        );
        break;

      case 'GET_TAX_DETAILS':
        result = await HRAgentService.getTaxDetails(
          employeeId,
          tenantId,
          params?.financialYear || '2024-25'
        );
        break;

      case 'GET_SALARY_STRUCTURE':
        result = await HRAgentService.getSalaryStructure(employeeId, tenantId);
        break;

      case 'SEARCH_POLICIES':
        if (!params?.query) {
          return NextResponse.json(
            { success: false, error: 'Query parameter required for policy search' },
            { status: 400 }
          );
        }
        result = await HRAgentService.searchPolicies(tenantId, params.query);
        break;

      case 'REQUEST_DOCUMENT':
        if (!params?.documentType) {
          return NextResponse.json(
            { success: false, error: 'Document type required' },
            { status: 400 }
          );
        }
        result = await HRAgentService.requestDocument(
          employeeId,
          tenantId,
          params.documentType,
          params.options
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
        return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute action'
      },
      { status: 500 }
    );
  }
}
