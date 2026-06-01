// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
/**
 * @module taskAggregatorService
 * @description ESS Task Aggregator — aggregates pending tasks from all HCM modules,
 *              priority sorting, module grouping, task completion, snooze, stats (Sec 17.8)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type TaskModule =
  | 'hr'
  | 'finance'
  | 'training'
  | 'compliance'
  | 'profile'
  | 'survey'
  | 'benefits';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'snoozed' | 'overdue';
export type TaskActionType = 'approve' | 'complete' | 'view' | 'submit' | 'update' | 'acknowledge';

export interface AggregatedTask {
  id: string;
  title: string;
  description: string;
  module: TaskModule;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  actionType: TaskActionType;
  actionLabel: string;
  actionUrl?: string;
  entityId?: string;
  entityType?: string;
  snoozedUntil?: string;
  completedAt?: string;
  metadata?: Record<string, string | number>;
}

export interface TaskStats {
  total: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completed: number;
  snoozed: number;
  byModule: Record<TaskModule, number>;
  byPriority: Record<TaskPriority, number>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const TODAY = '2025-02-25';
const YESTERDAY = '2025-02-24';
const TOMORROW = '2025-02-26';
const NEXT_WEEK = '2025-03-04';

const MOCK_TASKS: AggregatedTask[] = [
  // HR Module
  {
    id: 'task-001',
    title: 'Approve Leave Request — Khalid Al-Otaibi',
    description: 'Annual leave request for 5 days (March 10–14). Requires manager approval.',
    module: 'hr',
    priority: 'high',
    status: 'pending',
    dueDate: TODAY,
    createdAt: YESTERDAY,
    actionType: 'approve',
    actionLabel: 'Review & Approve',
    actionUrl: '/leave/approvals/lr-445',
    entityId: 'lr-445',
    entityType: 'leave_request',
    metadata: { requester: 'Khalid Al-Otaibi', days: 5, type: 'Annual Leave' },
  },
  {
    id: 'task-002',
    title: 'Approve Leave Request — Hana Al-Sayed',
    description: 'Sick leave request for 2 days (Feb 26–27). Medical certificate attached.',
    module: 'hr',
    priority: 'critical',
    status: 'overdue',
    dueDate: YESTERDAY,
    createdAt: '2025-02-23',
    actionType: 'approve',
    actionLabel: 'Review & Approve',
    actionUrl: '/leave/approvals/lr-446',
    entityId: 'lr-446',
    entityType: 'leave_request',
    metadata: { requester: 'Hana Al-Sayed', days: 2, type: 'Sick Leave' },
  },
  {
    id: 'task-003',
    title: 'Review Probation Evaluation — Omar Yusuf',
    description: "Complete Omar's 90-day probation evaluation. Assessment form must be submitted.",
    module: 'hr',
    priority: 'high',
    status: 'pending',
    dueDate: TOMORROW,
    createdAt: '2025-02-18',
    actionType: 'submit',
    actionLabel: 'Complete Evaluation',
    actionUrl: '/performance/probation/eval-789',
    entityId: 'eval-789',
    entityType: 'probation_evaluation',
    metadata: { employee: 'Omar Yusuf', startDate: '2024-11-26' },
  },

  // Finance Module
  {
    id: 'task-004',
    title: 'Approve Expense Report — Sara Al-Mansouri',
    description: 'SAR 4,850 expense report for business travel to Dubai. 12 receipts attached.',
    module: 'finance',
    priority: 'medium',
    status: 'pending',
    dueDate: TOMORROW,
    createdAt: TODAY,
    actionType: 'approve',
    actionLabel: 'Review Expenses',
    actionUrl: '/expenses/approvals/exp-2234',
    entityId: 'exp-2234',
    entityType: 'expense_report',
    metadata: { amount: 4850, currency: 'SAR', submitter: 'Sara Al-Mansouri' },
  },
  {
    id: 'task-005',
    title: 'Submit Timesheet — Week of Feb 17',
    description: 'Your timesheet for the week of Feb 17–21 is pending submission.',
    module: 'finance',
    priority: 'critical',
    status: 'overdue',
    dueDate: '2025-02-22',
    createdAt: '2025-02-22',
    actionType: 'submit',
    actionLabel: 'Submit Timesheet',
    actionUrl: '/timesheets/current',
    entityId: 'ts-week-8',
    entityType: 'timesheet',
    metadata: { week: 'Feb 17–21', hoursLogged: 32, requiredHours: 40 },
  },

  // Training Module
  {
    id: 'task-006',
    title: 'Complete Mandatory Safety Training',
    description: 'Annual workplace safety training must be completed. 45-minute online course.',
    module: 'training',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-02-28',
    createdAt: '2025-02-01',
    actionType: 'complete',
    actionLabel: 'Start Training',
    actionUrl: '/learning/courses/safety-2025',
    entityId: 'course-safety-2025',
    entityType: 'mandatory_training',
    metadata: { course: 'Workplace Safety 2025', duration: 45, completionRate: 0 },
  },
  {
    id: 'task-007',
    title: 'Complete Cybersecurity Awareness Module',
    description:
      'Quarterly cybersecurity awareness training. Covers phishing, data protection, and secure practices.',
    module: 'training',
    priority: 'medium',
    status: 'pending',
    dueDate: NEXT_WEEK,
    createdAt: '2025-02-15',
    actionType: 'complete',
    actionLabel: 'Continue Training',
    actionUrl: '/learning/courses/cybersec-q1-2025',
    entityId: 'course-cybersec-q1',
    entityType: 'mandatory_training',
    metadata: { course: 'Cybersecurity Q1 2025', duration: 30, completionRate: 50 },
  },
  {
    id: 'task-008',
    title: 'Rate Completed Training — Leadership Essentials',
    description: 'Please rate and review the Leadership Essentials course you completed last week.',
    module: 'training',
    priority: 'low',
    status: 'pending',
    dueDate: NEXT_WEEK,
    createdAt: TODAY,
    actionType: 'complete',
    actionLabel: 'Submit Rating',
    actionUrl: '/learning/courses/leadership-101/review',
    entityId: 'course-leadership-101',
    entityType: 'course_review',
    metadata: { course: 'Leadership Essentials' },
  },

  // Compliance Module
  {
    id: 'task-009',
    title: 'Passport Expiring — 30 Days',
    description:
      'Your passport expires on March 27, 2025. Update your passport details in HR records.',
    module: 'compliance',
    priority: 'critical',
    status: 'pending',
    dueDate: TODAY,
    createdAt: TODAY,
    actionType: 'update',
    actionLabel: 'Update Documents',
    actionUrl: '/profile/documents',
    entityId: 'doc-passport',
    entityType: 'document_expiry',
    metadata: { documentType: 'Passport', expiryDate: '2025-03-27', daysLeft: 30 },
  },
  {
    id: 'task-010',
    title: 'Acknowledge Updated Code of Conduct',
    description:
      'The company Code of Conduct has been updated. Review and acknowledge to confirm compliance.',
    module: 'compliance',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-02-28',
    createdAt: '2025-02-10',
    actionType: 'acknowledge',
    actionLabel: 'Review & Acknowledge',
    actionUrl: '/compliance/policies/code-of-conduct-2025',
    entityId: 'policy-coc-2025',
    entityType: 'policy_acknowledgment',
    metadata: { policyName: 'Code of Conduct 2025', version: '3.1' },
  },
  {
    id: 'task-011',
    title: 'Complete Annual Conflict of Interest Disclosure',
    description: 'Annual COI disclosure form must be completed by all employees.',
    module: 'compliance',
    priority: 'medium',
    status: 'pending',
    dueDate: '2025-03-15',
    createdAt: '2025-02-01',
    actionType: 'submit',
    actionLabel: 'Complete Disclosure',
    actionUrl: '/compliance/disclosures/coi-2025',
    entityId: 'coi-2025',
    entityType: 'compliance_form',
  },

  // Profile Module
  {
    id: 'task-012',
    title: 'Update Emergency Contact Information',
    description:
      'Your emergency contact details have not been updated in over a year. Please review and update.',
    module: 'profile',
    priority: 'medium',
    status: 'pending',
    dueDate: NEXT_WEEK,
    createdAt: TODAY,
    actionType: 'update',
    actionLabel: 'Update Profile',
    actionUrl: '/profile/emergency-contacts',
    entityId: 'profile-emergency',
    entityType: 'profile_update',
  },

  // Survey Module
  {
    id: 'task-013',
    title: 'Complete Q1 Engagement Survey',
    description:
      'Share your feedback in our quarterly employee engagement pulse survey. Takes 5 minutes.',
    module: 'survey',
    priority: 'medium',
    status: 'pending',
    dueDate: '2025-03-01',
    createdAt: '2025-02-20',
    actionType: 'complete',
    actionLabel: 'Take Survey',
    actionUrl: '/surveys/engagement-q1-2025',
    entityId: 'survey-engagement-q1-2025',
    entityType: 'pulse_survey',
    metadata: { estimatedMinutes: 5, anonymous: true },
  },

  // Benefits Module
  {
    id: 'task-014',
    title: 'Benefits Open Enrollment Closing Soon',
    description:
      'Medical insurance open enrollment period ends in 3 days. Review and confirm your selections.',
    module: 'benefits',
    priority: 'critical',
    status: 'pending',
    dueDate: '2025-02-28',
    createdAt: '2025-02-15',
    actionType: 'submit',
    actionLabel: 'Review Benefits',
    actionUrl: '/benefits/enrollment/2025',
    entityId: 'enrollment-2025',
    entityType: 'benefits_enrollment',
    metadata: { daysLeft: 3 },
  },
  {
    id: 'task-015',
    title: 'Submit HSA Claim — Medical Receipt',
    description: 'Reimburse SAR 680 for dental treatment. Submit receipt to HSA within 90 days.',
    module: 'benefits',
    priority: 'low',
    status: 'pending',
    dueDate: NEXT_WEEK,
    createdAt: '2025-02-18',
    actionType: 'submit',
    actionLabel: 'Submit Claim',
    actionUrl: '/benefits/hsa/claims/new',
    entityId: 'hsa-claim-new',
    entityType: 'hsa_claim',
    metadata: { amount: 680, currency: 'SAR', receiptDate: '2025-02-15' },
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class TaskAggregatorService {
  // ── Get My Tasks ───────────────────────────────────────────────────────────

  static async getMyTasks(_employeeId: string): Promise<AggregatedTask[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_TASKS.filter((t) => t.status !== 'completed');
  }

  // ── Get Tasks by Priority ──────────────────────────────────────────────────

  static async getTasksByPriority(): Promise<AggregatedTask[]> {
    await new Promise((r) => setTimeout(r, 150));
    const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return MOCK_TASKS.filter((t) => t.status !== 'completed').sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  // ── Get Tasks by Module ────────────────────────────────────────────────────

  static async getTasksByModule(): Promise<Record<TaskModule, AggregatedTask[]>> {
    await new Promise((r) => setTimeout(r, 150));
    const active = MOCK_TASKS.filter((t) => t.status !== 'completed');
    return active.reduce(
      (acc, task) => {
        if (!acc[task.module]) acc[task.module] = [];
        acc[task.module].push(task);
        return acc;
      },
      {} as Record<TaskModule, AggregatedTask[]>
    );
  }

  // ── Complete Task ──────────────────────────────────────────────────────────

  static async completeTask(taskId: string, _module: TaskModule): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 250));
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
    }
    return { success: true };
  }

  // ── Snooze Task ────────────────────────────────────────────────────────────

  static async snoozeTask(taskId: string, until: string): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 200));
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (task) {
      task.status = 'snoozed';
      task.snoozedUntil = until;
    }
    return { success: true };
  }

  // ── Get Task Stats ─────────────────────────────────────────────────────────

  static async getTaskStats(): Promise<TaskStats> {
    await new Promise((r) => setTimeout(r, 150));
    const today = TODAY;
    const weekEnd = NEXT_WEEK;

    const allActive = MOCK_TASKS.filter((t) => t.status !== 'completed');
    const overdue = allActive.filter((t) => t.dueDate < today && t.status !== 'snoozed');
    const dueToday = allActive.filter((t) => t.dueDate === today);
    const dueThisWeek = allActive.filter((t) => t.dueDate > today && t.dueDate <= weekEnd);
    const completed = MOCK_TASKS.filter((t) => t.status === 'completed');
    const snoozed = allActive.filter((t) => t.status === 'snoozed');

    const byModule = allActive.reduce(
      (acc, t) => {
        acc[t.module] = (acc[t.module] ?? 0) + 1;
        return acc;
      },
      {} as Record<TaskModule, number>
    );

    const byPriority = allActive.reduce(
      (acc, t) => {
        acc[t.priority] = (acc[t.priority] ?? 0) + 1;
        return acc;
      },
      {} as Record<TaskPriority, number>
    );

    return {
      total: allActive.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      dueThisWeek: dueThisWeek.length,
      completed: completed.length,
      snoozed: snoozed.length,
      byModule,
      byPriority,
    };
  }
}
