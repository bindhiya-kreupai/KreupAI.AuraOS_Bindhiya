export type HRAgentAction =
  | 'GET_LEAVE_BALANCE'
  | 'APPLY_LEAVE'
  | 'GET_LEAVE_REQUESTS'
  | 'GET_ATTENDANCE'
  | 'GET_ATTENDANCE_SUMMARY'
  | 'GET_PAYSLIP'
  | 'GET_TAX_DETAILS'
  | 'GET_SALARY_STRUCTURE'
  | 'SEARCH_POLICIES'
  | 'REQUEST_DOCUMENT'
  | 'GENERAL_QUERY';

export const HR_AGENT_ACTIONS: HRAgentAction[] = [
  'GET_LEAVE_BALANCE',
  'APPLY_LEAVE',
  'GET_LEAVE_REQUESTS',
  'GET_ATTENDANCE',
  'GET_ATTENDANCE_SUMMARY',
  'GET_PAYSLIP',
  'GET_TAX_DETAILS',
  'GET_SALARY_STRUCTURE',
  'SEARCH_POLICIES',
  'REQUEST_DOCUMENT',
  'GENERAL_QUERY',
];

export type HRRetrievalContext = {
  employee?: { id: string; name: string; department?: string; jobTitle?: string };
  leaveBalances?: Array<{
    type: string;
    code?: string;
    balance: number;
    used: number;
    pending: number;
  }>;
  recentLeaveRequests?: Array<{ id: string; status: string; startDate: string; endDate: string }>;
  policies?: Array<{ title: string; category: string }>;
};
