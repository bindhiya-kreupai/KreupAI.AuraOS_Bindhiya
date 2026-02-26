/**
 * @module query-keys
 * @description Centralized React Query key factory for all AuraOS modules.
 *              Pattern: queryKeys.<module>.all | lists(filters) | detail(id) | <specific>
 * @project AURA HCM Platform
 *
 * @example
 * queryKeys.employees.all              // ['employees']
 * queryKeys.employees.lists()          // ['employees', 'list']
 * queryKeys.employees.list({ dept: 'Engineering' })  // ['employees', 'list', { dept: 'Engineering' }]
 * queryKeys.employees.detail('emp-001') // ['employees', 'detail', 'emp-001']
 * queryKeys.employees.profile('emp-001') // ['employees', 'profile', 'emp-001']
 */

// ── Shared Types ───────────────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc';

export interface BaseListFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
}

// ── Employees ─────────────────────────────────────────────────────────────────

export interface EmployeeFilters extends BaseListFilters {
  departmentId?: string;
  locationId?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  role?: string;
  managerId?: string;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern';
  hiredAfter?: string;
  hiredBefore?: string;
}

// ── Leaves ────────────────────────────────────────────────────────────────────

export interface LeaveFilters extends BaseListFilters {
  employeeId?: string;
  departmentId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  type?: string;
  startDate?: string;
  endDate?: string;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceFilters extends BaseListFilters {
  employeeId?: string;
  departmentId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'wfh';
}

// ── Payroll ───────────────────────────────────────────────────────────────────

export interface PayrollFilters extends BaseListFilters {
  employeeId?: string;
  departmentId?: string;
  period?: string;
  status?: 'draft' | 'processing' | 'approved' | 'paid';
  year?: number;
  month?: number;
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export interface ExpenseFilters extends BaseListFilters {
  employeeId?: string;
  departmentId?: string;
  status?:
    | 'draft'
    | 'submitted'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'paid'
    | 'cancelled';
  startDate?: string;
  endDate?: string;
  type?: string;
}

// ── Compliance ────────────────────────────────────────────────────────────────

export interface ComplianceFilters extends BaseListFilters {
  status?: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
  category?: string;
  dueAfter?: string;
  dueBefore?: string;
  assignedTo?: string;
}

// ── Recruitment ───────────────────────────────────────────────────────────────

export interface RecruitmentFilters extends BaseListFilters {
  status?: 'open' | 'closed' | 'draft' | 'archived';
  departmentId?: string;
  locationId?: string;
  type?: 'full_time' | 'part_time' | 'contract' | 'intern';
  postedAfter?: string;
}

// ── Training ──────────────────────────────────────────────────────────────────

export interface TrainingFilters extends BaseListFilters {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  assignedTo?: string;
  completedBy?: string;
  mandatory?: boolean;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationFilters extends BaseListFilters {
  read?: boolean;
  type?: string;
  module?: string;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface SettingsFilters extends BaseListFilters {
  module?: string;
  category?: string;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface ReportFilters extends BaseListFilters {
  category?: string;
  format?: 'pdf' | 'excel' | 'csv';
  status?: 'queued' | 'generating' | 'ready' | 'failed';
}

// ── Query Key Factory ─────────────────────────────────────────────────────────

export const queryKeys = {
  // ── Employees ───────────────────────────────────────────────────────────────
  employees: {
    all: ['employees'] as const,
    lists: () => ['employees', 'list'] as const,
    list: (filters: EmployeeFilters) => ['employees', 'list', filters] as const,
    details: () => ['employees', 'detail'] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    profile: (id: string) => ['employees', 'profile', id] as const,
    documents: (id: string) => ['employees', 'documents', id] as const,
    dependents: (id: string) => ['employees', 'dependents', id] as const,
    benefits: (id: string) => ['employees', 'benefits', id] as const,
    payslips: (id: string) => ['employees', 'payslips', id] as const,
    leaves: (id: string) => ['employees', 'leaves', id] as const,
    orgChart: () => ['employees', 'org-chart'] as const,
    headcount: (filters?: Record<string, unknown>) =>
      ['employees', 'headcount', filters ?? {}] as const,
  },

  // ── Leaves ──────────────────────────────────────────────────────────────────
  leaves: {
    all: ['leaves'] as const,
    lists: () => ['leaves', 'list'] as const,
    list: (filters: LeaveFilters) => ['leaves', 'list', filters] as const,
    details: () => ['leaves', 'detail'] as const,
    detail: (id: string) => ['leaves', 'detail', id] as const,
    balance: (employeeId: string) => ['leaves', 'balance', employeeId] as const,
    calendar: (filters?: Record<string, unknown>) => ['leaves', 'calendar', filters ?? {}] as const,
    types: () => ['leaves', 'types'] as const,
    policies: () => ['leaves', 'policies'] as const,
  },

  // ── Attendance ──────────────────────────────────────────────────────────────
  attendance: {
    all: ['attendance'] as const,
    lists: () => ['attendance', 'list'] as const,
    list: (filters: AttendanceFilters) => ['attendance', 'list', filters] as const,
    details: () => ['attendance', 'detail'] as const,
    detail: (id: string) => ['attendance', 'detail', id] as const,
    summary: (employeeId: string, period: string) =>
      ['attendance', 'summary', employeeId, period] as const,
    shifts: (filters?: Record<string, unknown>) => ['attendance', 'shifts', filters ?? {}] as const,
    shiftDetail: (id: string) => ['attendance', 'shifts', 'detail', id] as const,
    geofences: () => ['attendance', 'geofences'] as const,
    analytics: (filters?: Record<string, unknown>) =>
      ['attendance', 'analytics', filters ?? {}] as const,
  },

  // ── Payroll ─────────────────────────────────────────────────────────────────
  payroll: {
    all: ['payroll'] as const,
    lists: () => ['payroll', 'list'] as const,
    list: (filters: PayrollFilters) => ['payroll', 'list', filters] as const,
    details: () => ['payroll', 'detail'] as const,
    detail: (id: string) => ['payroll', 'detail', id] as const,
    payslip: (employeeId: string, period: string) =>
      ['payroll', 'payslip', employeeId, period] as const,
    runs: (filters?: Record<string, unknown>) => ['payroll', 'runs', filters ?? {}] as const,
    runDetail: (id: string) => ['payroll', 'runs', 'detail', id] as const,
    analytics: (filters?: Record<string, unknown>) =>
      ['payroll', 'analytics', filters ?? {}] as const,
    taxDocuments: (employeeId: string) => ['payroll', 'tax-documents', employeeId] as const,
  },

  // ── Expenses ────────────────────────────────────────────────────────────────
  expenses: {
    all: ['expenses'] as const,
    lists: () => ['expenses', 'list'] as const,
    list: (filters: ExpenseFilters) => ['expenses', 'list', filters] as const,
    details: () => ['expenses', 'detail'] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const,
    policies: () => ['expenses', 'policies'] as const,
    policyDetail: (id: string) => ['expenses', 'policies', 'detail', id] as const,
    analytics: (filters?: Record<string, unknown>) =>
      ['expenses', 'analytics', filters ?? {}] as const,
    categories: () => ['expenses', 'categories'] as const,
  },

  // ── Compliance ──────────────────────────────────────────────────────────────
  compliance: {
    all: ['compliance'] as const,
    lists: () => ['compliance', 'list'] as const,
    list: (filters: ComplianceFilters) => ['compliance', 'list', filters] as const,
    details: () => ['compliance', 'detail'] as const,
    detail: (id: string) => ['compliance', 'detail', id] as const,
    dashboard: () => ['compliance', 'dashboard'] as const,
    regulations: (filters?: Record<string, unknown>) =>
      ['compliance', 'regulations', filters ?? {}] as const,
    training: (filters?: Record<string, unknown>) =>
      ['compliance', 'training', filters ?? {}] as const,
    riskMatrix: () => ['compliance', 'risk-matrix'] as const,
  },

  // ── Recruitment ─────────────────────────────────────────────────────────────
  recruitment: {
    all: ['recruitment'] as const,
    lists: () => ['recruitment', 'list'] as const,
    list: (filters: RecruitmentFilters) => ['recruitment', 'list', filters] as const,
    details: () => ['recruitment', 'detail'] as const,
    detail: (id: string) => ['recruitment', 'detail', id] as const,
    candidates: (jobId: string, filters?: Record<string, unknown>) =>
      ['recruitment', 'candidates', jobId, filters ?? {}] as const,
    candidateDetail: (id: string) => ['recruitment', 'candidates', 'detail', id] as const,
    interviews: (filters?: Record<string, unknown>) =>
      ['recruitment', 'interviews', filters ?? {}] as const,
    pipeline: (jobId: string) => ['recruitment', 'pipeline', jobId] as const,
    analytics: () => ['recruitment', 'analytics'] as const,
  },

  // ── Training / L&D ──────────────────────────────────────────────────────────
  training: {
    all: ['training'] as const,
    lists: () => ['training', 'list'] as const,
    list: (filters: TrainingFilters) => ['training', 'list', filters] as const,
    details: () => ['training', 'detail'] as const,
    detail: (id: string) => ['training', 'detail', id] as const,
    enrollments: (employeeId: string) => ['training', 'enrollments', employeeId] as const,
    progress: (courseId: string, employeeId: string) =>
      ['training', 'progress', courseId, employeeId] as const,
    catalog: (filters?: Record<string, unknown>) => ['training', 'catalog', filters ?? {}] as const,
    analytics: () => ['training', 'analytics'] as const,
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications: {
    all: ['notifications'] as const,
    lists: () => ['notifications', 'list'] as const,
    list: (filters: NotificationFilters) => ['notifications', 'list', filters] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
    preferences: () => ['notifications', 'preferences'] as const,
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: {
    all: ['settings'] as const,
    lists: () => ['settings', 'list'] as const,
    list: (filters: SettingsFilters) => ['settings', 'list', filters] as const,
    detail: (key: string) => ['settings', 'detail', key] as const,
    modules: () => ['settings', 'modules'] as const,
    integrations: () => ['settings', 'integrations'] as const,
    integrationDetail: (id: string) => ['settings', 'integrations', 'detail', id] as const,
    roles: () => ['settings', 'roles'] as const,
    roleDetail: (id: string) => ['settings', 'roles', 'detail', id] as const,
    permissions: () => ['settings', 'permissions'] as const,
    featureFlags: () => ['settings', 'feature-flags'] as const,
  },

  // ── Reports ─────────────────────────────────────────────────────────────────
  reports: {
    all: ['reports'] as const,
    available: (filters?: ReportFilters) => ['reports', 'available', filters ?? {}] as const,
    history: () => ['reports', 'history'] as const,
    historyItem: (id: string) => ['reports', 'history', id] as const,
    scheduled: () => ['reports', 'scheduled'] as const,
    scheduledDetail: (id: string) => ['reports', 'scheduled', id] as const,
    generated: (id: string) => ['reports', 'generated', id] as const,
    favorites: () => ['reports', 'favorites'] as const,
  },

  // ── Security ─────────────────────────────────────────────────────────────────
  security: {
    all: ['security'] as const,
    sessions: () => ['security', 'sessions'] as const,
    loginHistory: (limit?: number) => ['security', 'login-history', limit ?? 20] as const,
    mfaStatus: () => ['security', 'mfa-status'] as const,
    securityScore: () => ['security', 'score'] as const,
  },

  // ── Governance (GDPR/CCPA) ────────────────────────────────────────────────
  governance: {
    all: ['governance'] as const,
    dsarRequests: (filters?: Record<string, unknown>) =>
      ['governance', 'dsar', filters ?? {}] as const,
    dsarDetail: (id: string) => ['governance', 'dsar', 'detail', id] as const,
    consentRecords: (employeeId: string) => ['governance', 'consent', employeeId] as const,
    retentionPolicies: () => ['governance', 'retention-policies'] as const,
    dataMap: () => ['governance', 'data-map'] as const,
    privacyReport: (employeeId: string) => ['governance', 'privacy-report', employeeId] as const,
  },

  // ── Search ───────────────────────────────────────────────────────────────────
  search: {
    all: ['search'] as const,
    results: (query: string, filters?: Record<string, unknown>) =>
      ['search', 'results', query, filters ?? {}] as const,
    suggestions: (query: string) => ['search', 'suggestions', query] as const,
    recent: () => ['search', 'recent'] as const,
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    widgets: () => ['dashboard', 'widgets'] as const,
    metrics: (filters?: Record<string, unknown>) =>
      ['dashboard', 'metrics', filters ?? {}] as const,
    announcements: () => ['dashboard', 'announcements'] as const,
    birthdays: (month?: number) => ['dashboard', 'birthdays', month ?? 0] as const,
    quickStats: () => ['dashboard', 'quick-stats'] as const,
  },
} as const;

export default queryKeys;
