/**
 * HR Agent API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { chatWithHRAgent } from '@/lib/ai/hr-agent-ai';
import { HRAgentService } from '@/lib/services/agentic-ai';

export async function GET(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    const err = agentError('Unauthorized', 'غير مصرح');
    return NextResponse.json(err, { status: 401 });
  }

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
  } catch {
    const err = agentError('Failed to fetch HR agent', 'فشل تحميل وكيل الموارد البشرية');
    return NextResponse.json(err, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    const err = agentError('Unauthorized', 'غير مصرح');
    return NextResponse.json(err, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, message, sessionId, employeeId, tenantId: _t, params } = body;

    if (action === 'chat') {
      if (!message?.trim()) {
        const err = agentError('Message is required', 'الرسالة مطلوبة');
        return NextResponse.json(err, { status: 400 });
      }
      const result = await chatWithHRAgent(auth, String(message), sessionId);
      return NextResponse.json({ success: true, data: result });
    }

    const eid = auth.employeeId || employeeId;
    if (!eid) {
      const err = agentError('Employee profile not found', 'لم يتم العثور على ملف الموظف');
      return NextResponse.json(err, { status: 400 });
    }

    let result: unknown;
    switch (action) {
      case 'GET_LEAVE_BALANCE':
        result = await HRAgentService.getLeaveBalance(eid, auth.tenantId, params?.leaveType);
        break;
      case 'APPLY_LEAVE':
        if (!auth.canWrite) {
          const err = agentError('Permission denied', 'تم رفض الإذن');
          return NextResponse.json(err, { status: 403 });
        }
        result = await HRAgentService.applyLeave(eid, auth.tenantId, {
          leaveType: params.leaveType,
          startDate: new Date(params.startDate),
          endDate: new Date(params.endDate),
          reason: params.reason,
          halfDay: params.halfDay,
        });
        break;
      case 'GET_LEAVE_REQUESTS':
        result = await HRAgentService.getLeaveRequests(eid, auth.tenantId, params);
        break;
      case 'GET_ATTENDANCE':
        result = await HRAgentService.getTodayAttendance(eid, auth.tenantId);
        break;
      case 'GET_ATTENDANCE_SUMMARY': {
        const now = new Date();
        result = await HRAgentService.getAttendanceSummary(
          eid,
          auth.tenantId,
          params?.month || now.getMonth() + 1,
          params?.year || now.getFullYear()
        );
        break;
      }
      case 'GET_PAYSLIP': {
        const now = new Date();
        result = await HRAgentService.getPayslip(
          eid,
          auth.tenantId,
          params?.month || now.getMonth() + 1,
          params?.year || now.getFullYear()
        );
        break;
      }
      case 'GET_TAX_DETAILS':
        result = await HRAgentService.getTaxDetails(
          eid,
          auth.tenantId,
          params?.financialYear || '2024-25'
        );
        break;
      case 'GET_SALARY_STRUCTURE':
        result = await HRAgentService.getSalaryStructure(eid, auth.tenantId);
        break;
      case 'SEARCH_POLICIES':
        result = await HRAgentService.searchPolicies(auth.tenantId, params?.query || '');
        break;
      case 'REQUEST_DOCUMENT':
        result = await HRAgentService.requestDocument(
          eid,
          auth.tenantId,
          params?.documentType,
          params?.options
        );
        break;
      default:
        return NextResponse.json(agentError(`Unknown action: ${action}`, 'إجراء غير معروف'), {
          status: 400,
        });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to execute action';
    return NextResponse.json(agentError(msg, 'فشل تنفيذ الإجراء'), { status: 500 });
  }
}
