import type { HRAgentAction } from './hr-agent-types';

const MONTHS: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

function inferLeaveType(message: string): string | undefined {
  const lower = message.toLowerCase();
  if (/\b(annual|vacation|earned)\b/.test(lower)) return 'annual';
  if (/\b(sick|medical)\b/.test(lower)) return 'sick';
  if (/\b(casual|cl)\b/.test(lower)) return 'casual';
  if (/\b(maternity|paternity|parental)\b/.test(lower)) return 'parental';
  if (/\b(unpaid|lop)\b/.test(lower)) return 'unpaid';
  return undefined;
}

/** Parse ranges like "June 1-5", "from June 1 to June 5", "2026-06-01 to 2026-06-05". */
function inferLeaveDates(message: string): { startDate?: string; endDate?: string } {
  const iso = message.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-|–|until)\s*(\d{4}-\d{2}-\d{2})/i);
  if (iso) {
    return { startDate: iso[1], endDate: iso[2] };
  }

  const named = message.match(
    /(?:from\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|-|–)\s*(?:([A-Za-z]+)\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/i
  );
  if (named) {
    const startMonth = MONTHS[named[1].toLowerCase()];
    const endMonthName = named[3]?.toLowerCase();
    const endMonth =
      endMonthName && MONTHS[endMonthName] !== undefined ? MONTHS[endMonthName] : startMonth;
    if (startMonth !== undefined && endMonth !== undefined) {
      const year = named[5] ? Number(named[5]) : new Date().getFullYear();
      const start = new Date(Date.UTC(year, startMonth, Number(named[2])));
      const end = new Date(Date.UTC(year, endMonth, Number(named[4])));
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      };
    }
  }

  return {};
}

export function parseHRAgentFallbackIntent(message: string): {
  intent: HRAgentAction;
  params: Record<string, unknown>;
  confidence: number;
} {
  const lower = message.toLowerCase();

  if (lower.includes('leave balance') || lower.includes('check my leave')) {
    return { intent: 'GET_LEAVE_BALANCE', params: {}, confidence: 0.85 };
  }
  if (lower.includes('apply') && lower.includes('leave')) {
    const leaveType = inferLeaveType(message);
    const dates = inferLeaveDates(message);
    return {
      intent: 'APPLY_LEAVE',
      params: {
        reason: message,
        ...(leaveType ? { leaveType } : {}),
        ...dates,
      },
      confidence: leaveType && dates.startDate ? 0.85 : 0.7,
    };
  }
  if (lower.includes('leave request')) {
    return { intent: 'GET_LEAVE_REQUESTS', params: {}, confidence: 0.85 };
  }
  if (lower.includes('attendance today') || lower.includes('my attendance')) {
    return { intent: 'GET_ATTENDANCE', params: {}, confidence: 0.85 };
  }
  if (lower.includes('attendance summary')) {
    return { intent: 'GET_ATTENDANCE_SUMMARY', params: {}, confidence: 0.85 };
  }
  if (lower.includes('payslip') || lower.includes('pay slip')) {
    return { intent: 'GET_PAYSLIP', params: {}, confidence: 0.85 };
  }
  if (lower.includes('tax')) {
    return { intent: 'GET_TAX_DETAILS', params: {}, confidence: 0.8 };
  }
  if (lower.includes('salary structure')) {
    return { intent: 'GET_SALARY_STRUCTURE', params: {}, confidence: 0.8 };
  }
  if (lower.includes('search') && lower.includes('polic')) {
    const query = message.replace(/search|for|policy|policies/gi, '').trim();
    return {
      intent: 'SEARCH_POLICIES',
      params: { query: query || 'remote work' },
      confidence: 0.75,
    };
  }
  if (lower.includes('document') || lower.includes('certificate')) {
    return {
      intent: 'REQUEST_DOCUMENT',
      params: { documentType: 'experience_certificate' },
      confidence: 0.7,
    };
  }

  return { intent: 'GENERAL_QUERY', params: {}, confidence: 0.5 };
}

export function formatHRActionResult(
  intent: HRAgentAction,
  data: unknown,
  opts?: { availablePolicies?: Array<{ title: string; category: string }> }
): string {
  switch (intent) {
    case 'GET_LEAVE_BALANCE':
      if (Array.isArray(data) && data.length) {
        return `Here's your leave balance *(live as of now)*:\n\n${data
          .map(
            (leave: {
              leaveTypeName?: string;
              leaveType?: string;
              balance?: number;
              used?: number;
              pending?: number;
            }) =>
              `**${leave.leaveTypeName || 'Leave'}**${leave.leaveType ? ` (${leave.leaveType})` : ''}: ${leave.balance ?? 0} days available (${leave.used ?? 0} used, ${leave.pending ?? 0} pending)`
          )
          .join('\n')}`;
      }
      if (opts?.availablePolicies?.length) {
        return (
          'No personal leave balance records were found for your account yet.\n\n' +
          'Your organization offers these leave types (you can still apply — requests go for approval):\n' +
          opts.availablePolicies.map((p) => `- **${p.title}** (${p.category})`).join('\n')
        );
      }
      return 'No leave balance records found for your account. Please contact HR to initialize your leave balances.';
    case 'APPLY_LEAVE': {
      const req = data as {
        id?: string;
        leaveType?: string;
        startDate?: Date | string;
        endDate?: Date | string;
        duration?: number;
        status?: string;
      } | null;
      if (req?.id) {
        const start = req.startDate ? new Date(req.startDate).toLocaleDateString() : '';
        const end = req.endDate ? new Date(req.endDate).toLocaleDateString() : '';
        return (
          `✅ Leave request submitted successfully *(live)*\n\n` +
          `- **Request ID:** ${req.id}\n` +
          `- **Type:** ${req.leaveType || 'Leave'}\n` +
          `- **Dates:** ${start} – ${end}\n` +
          `- **Duration:** ${req.duration ?? '?'} day(s)\n` +
          `- **Status:** ${req.status || 'PENDING'} (awaiting manager approval)`
        );
      }
      return 'Leave request could not be created.';
    }
    case 'GET_LEAVE_REQUESTS':
      if (Array.isArray(data) && data.length) {
        return `You have ${data.length} leave request(s) *(live)*:\n\n${data
          .map(
            (req: {
              leaveType?: string;
              startDate: Date | string;
              endDate: Date | string;
              status: string;
            }) =>
              `${req.leaveType || 'Leave'} - ${new Date(req.startDate).toLocaleDateString()} to ${new Date(req.endDate).toLocaleDateString()} (${req.status})`
          )
          .join('\n')}`;
      }
      return 'No leave requests found.';
    case 'GET_ATTENDANCE': {
      const att = data as { checkIn?: string; checkOut?: string; status?: string };
      return `Today's attendance *(live)*:\nCheck-in: ${att.checkIn || 'Not yet'}\nCheck-out: ${att.checkOut || 'Not yet'}\nStatus: ${att.status || 'Unknown'}`;
    }
    case 'GET_PAYSLIP': {
      const slip = data as {
        month?: number;
        year?: number;
        grossSalary?: number;
        netPay?: number;
        totalDeductions?: number;
      };
      return `Your payslip for ${slip.month}/${slip.year} *(live)*:\nGross: ${slip.grossSalary}\nDeductions: ${slip.totalDeductions}\nNet Pay: ${slip.netPay}`;
    }
    case 'SEARCH_POLICIES':
      if (Array.isArray(data) && data.length) {
        return `Found ${data.length} policy document(s):\n\n${data
          .map((p: { title?: string; category?: string }) => `${p.title} - ${p.category}`)
          .join('\n')}`;
      }
      return 'No policies found matching your query.';
    case 'REQUEST_DOCUMENT': {
      const doc = data as {
        id?: string;
        requestId?: string;
        type?: string;
        documentType?: string;
        status?: string;
      } | null;
      const id = doc?.id || doc?.requestId;
      if (id) {
        return `Document request submitted *(live)*:\n- ID: ${id}\n- Type: ${doc?.type || doc?.documentType || 'Document'}\n- Status: ${doc?.status || 'PENDING'}`;
      }
      return typeof data === 'string' ? data : 'Document request submitted.';
    }
    case 'GENERAL_QUERY':
      return "I'm your HR assistant. I can help with leave balance, attendance, payslips, policies, and document requests. What would you like to know?";
    default:
      return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }
}

export const HR_SUGGESTED_ACTIONS = [
  'Check my leave balance',
  'Show my attendance today',
  'View my latest payslip',
  'Search remote work policy',
];
