/**
 * @module WorkflowTemplatesSeed
 * @description Enterprise workflow templates for approval processes, onboarding,
 *   offboarding, and HR operations — stored as SystemSetting JSON payloads.
 *   WorkflowDefinition is the runtime model; templates provide blueprint data.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 1
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface WorkflowStepApprover {
  role: string;
  label?: string;
  escalateAfterHours?: number;
}

export interface WorkflowStep {
  id: string;
  type: 'approval' | 'action' | 'validation' | 'notification';
  label: string;
  approvers?: WorkflowStepApprover[];
  actions?: string[];
  checks?: string[];
  slaHours?: number;
  escalationRules?: {
    escalateAfterHours: number;
    escalateTo: string;
    notifyOn: string[];
  };
  conditions?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface WorkflowTemplate {
  name: string;
  code: string;
  description: string;
  trigger: string;
  module: string;
  version: string;
  steps: WorkflowStep[];
  slaHours: number;
  escalationRules: {
    firstReminderHours: number;
    secondReminderHours: number;
    autoEscalateHours: number;
    notifyHR: boolean;
  };
  conditions?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 1. Leave Approval (2-level: Manager → HR)
// ---------------------------------------------------------------------------

const leaveApprovalTemplate: WorkflowTemplate = {
  name: 'Leave Approval',
  code: 'WF_LEAVE_APPROVAL',
  description: 'Standard 2-level leave approval: direct manager followed by HR manager',
  trigger: 'leave.requested',
  module: 'leave',
  version: '2.0',
  slaHours: 48,
  escalationRules: {
    firstReminderHours: 24,
    secondReminderHours: 36,
    autoEscalateHours: 48,
    notifyHR: true,
  },
  steps: [
    {
      id: 'lv-validate',
      type: 'validation',
      label: 'Validate Leave Request',
      checks: [
        'sufficient_balance',
        'no_date_overlap',
        'blackout_dates_check',
        'min_notice_period_check',
        'max_consecutive_days_check',
      ],
      config: { autoRejectOnFailure: true },
    },
    {
      id: 'lv-manager',
      type: 'approval',
      label: 'Manager Approval (Level 1)',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 24 },
      ],
      slaHours: 24,
      escalationRules: {
        escalateAfterHours: 24,
        escalateTo: 'skip_level_manager',
        notifyOn: ['approved', 'rejected', 'escalated'],
      },
    },
    {
      id: 'lv-hr',
      type: 'approval',
      label: 'HR Approval (Level 2)',
      approvers: [
        { role: 'hr_manager', label: 'HR Manager', escalateAfterHours: 24 },
      ],
      slaHours: 24,
      conditions: {
        triggerConditions: [
          'leaveType IN [HAJJ, STUDY, MATERNITY, PATERNITY, UNPAID]',
          'duration > 14',
        ],
      },
      escalationRules: {
        escalateAfterHours: 24,
        escalateTo: 'hr_director',
        notifyOn: ['approved', 'rejected', 'escalated'],
      },
    },
    {
      id: 'lv-notify',
      type: 'action',
      label: 'Process and Notify',
      actions: [
        'update_leave_balance',
        'update_team_calendar',
        'notify_employee',
        'set_out_of_office',
        'notify_team_members',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. Expense Approval (3-level: Manager → Finance → CFO for >$5000)
// ---------------------------------------------------------------------------

const expenseApprovalTemplate: WorkflowTemplate = {
  name: 'Expense Claim Approval',
  code: 'WF_EXPENSE_APPROVAL',
  description: 'Threshold-based expense approval: manager for <$500, finance for <$5000, CFO for >$5000',
  trigger: 'expense.submitted',
  module: 'expense',
  version: '2.0',
  slaHours: 72,
  escalationRules: {
    firstReminderHours: 36,
    secondReminderHours: 60,
    autoEscalateHours: 72,
    notifyHR: false,
  },
  steps: [
    {
      id: 'exp-validate',
      type: 'validation',
      label: 'Policy & Receipt Validation',
      checks: [
        'receipt_attached',
        'within_daily_limit',
        'valid_expense_category',
        'not_duplicate_claim',
        'expense_date_within_policy',
      ],
      config: { autoRejectOnFailure: false, flagForManualReview: true },
    },
    {
      id: 'exp-manager',
      type: 'approval',
      label: 'Manager Approval (Level 1)',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 48 },
      ],
      slaHours: 48,
      conditions: { threshold: { min: 0, max: 999999 } },
      escalationRules: {
        escalateAfterHours: 48,
        escalateTo: 'department_head',
        notifyOn: ['approved', 'rejected'],
      },
    },
    {
      id: 'exp-finance',
      type: 'approval',
      label: 'Finance Controller Approval (Level 2)',
      approvers: [
        { role: 'finance_controller', label: 'Finance Controller', escalateAfterHours: 48 },
      ],
      slaHours: 48,
      conditions: {
        triggerConditions: ['amount >= 500'],
      },
      escalationRules: {
        escalateAfterHours: 48,
        escalateTo: 'finance_director',
        notifyOn: ['approved', 'rejected'],
      },
    },
    {
      id: 'exp-cfo',
      type: 'approval',
      label: 'CFO Approval (Level 3)',
      approvers: [
        { role: 'cfo', label: 'Chief Financial Officer', escalateAfterHours: 72 },
      ],
      slaHours: 72,
      conditions: {
        triggerConditions: ['amount >= 5000'],
      },
      escalationRules: {
        escalateAfterHours: 72,
        escalateTo: 'ceo',
        notifyOn: ['approved', 'rejected'],
      },
    },
    {
      id: 'exp-process',
      type: 'action',
      label: 'Process Reimbursement',
      actions: [
        'generate_reimbursement_voucher',
        'update_cost_center_budget',
        'notify_employee',
        'schedule_bank_transfer',
        'update_expense_report',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. Employee Onboarding (5-step checklist)
// ---------------------------------------------------------------------------

const employeeOnboardingTemplate: WorkflowTemplate = {
  name: 'Employee Onboarding',
  code: 'WF_EMPLOYEE_ONBOARDING',
  description: '5-step employee onboarding workflow covering IT, facilities, HR, training, and manager check-in',
  trigger: 'employee.created',
  module: 'onboarding',
  version: '2.0',
  slaHours: 168,
  escalationRules: {
    firstReminderHours: 24,
    secondReminderHours: 72,
    autoEscalateHours: 120,
    notifyHR: true,
  },
  steps: [
    {
      id: 'onb-it',
      type: 'action',
      label: 'Step 1: IT Provisioning',
      actions: [
        'create_email_account',
        'create_slack_workspace',
        'provision_laptop_request',
        'assign_access_badge',
        'setup_vpn_credentials',
        'grant_system_accesses',
      ],
      slaHours: 24,
      config: { assignee: 'it_team', priority: 'high' },
      escalationRules: {
        escalateAfterHours: 24,
        escalateTo: 'it_manager',
        notifyOn: ['overdue'],
      },
    },
    {
      id: 'onb-facilities',
      type: 'action',
      label: 'Step 2: Workspace & Equipment',
      actions: [
        'assign_desk_workstation',
        'order_office_supplies',
        'prepare_welcome_kit',
        'setup_parking_permit',
      ],
      slaHours: 48,
      config: { assignee: 'facilities_team', priority: 'medium' },
    },
    {
      id: 'onb-hr',
      type: 'action',
      label: 'Step 3: HR Documentation & Welcome',
      actions: [
        'send_welcome_email',
        'distribute_employee_handbook',
        'assign_buddy_mentor',
        'schedule_orientation_sessions',
        'collect_bank_details',
        'initiate_document_collection',
        'enroll_benefits',
      ],
      slaHours: 24,
      config: {
        assignee: 'hr_team',
        emailTemplate: 'welcome-new-hire',
        requiredDocuments: [
          'national_id',
          'passport',
          'educational_certificates',
          'offer_letter_signed',
          'bank_details',
        ],
      },
    },
    {
      id: 'onb-training',
      type: 'action',
      label: 'Step 4: Training & Compliance',
      actions: [
        'assign_mandatory_training',
        'enroll_compliance_courses',
        'assign_role_specific_training',
        'schedule_product_overview',
      ],
      slaHours: 48,
      config: {
        assignee: 'learning_team',
        mandatoryCourses: [
          'code_of_conduct',
          'data_privacy_gdpr',
          'information_security_awareness',
          'anti_harassment_policy',
          'health_safety_environment',
        ],
        deadlineDays: 30,
      },
    },
    {
      id: 'onb-manager',
      type: 'approval',
      label: 'Step 5: Manager 30-Day Check-in',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 168 },
      ],
      actions: [
        'schedule_30_day_checkin',
        'set_probation_goals',
        'confirm_onboarding_complete',
        'update_onboarding_status',
      ],
      slaHours: 168,
      config: { checklistRequired: true },
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Employee Offboarding (4-step clearance)
// ---------------------------------------------------------------------------

const employeeOffboardingTemplate: WorkflowTemplate = {
  name: 'Employee Offboarding',
  code: 'WF_EMPLOYEE_OFFBOARDING',
  description: '4-step offboarding clearance covering exit process, IT revocation, final settlement, and archive',
  trigger: 'employee.terminated',
  module: 'offboarding',
  version: '2.0',
  slaHours: 336,
  escalationRules: {
    firstReminderHours: 48,
    secondReminderHours: 120,
    autoEscalateHours: 240,
    notifyHR: true,
  },
  steps: [
    {
      id: 'off-initiate',
      type: 'action',
      label: 'Step 1: Initiate Exit Process',
      actions: [
        'schedule_exit_interview',
        'calculate_final_settlement',
        'notify_stakeholders',
        'initiate_knowledge_transfer',
        'update_org_chart',
        'notify_client_accounts',
      ],
      slaHours: 24,
      config: { assignee: 'hr_team', priority: 'urgent' },
    },
    {
      id: 'off-it-clearance',
      type: 'action',
      label: 'Step 2: IT & Asset Clearance',
      actions: [
        'revoke_email_access',
        'revoke_system_accesses',
        'collect_laptop_equipment',
        'collect_access_badge',
        'revoke_vpn_credentials',
        'backup_work_files',
        'transfer_data_ownership',
      ],
      slaHours: 72,
      config: {
        assignee: 'it_team',
        deadline: 'last_working_day',
        clearanceCertificateRequired: true,
      },
    },
    {
      id: 'off-settlement',
      type: 'action',
      label: 'Step 3: Final Settlement Processing',
      actions: [
        'calculate_leave_encashment',
        'process_final_salary',
        'calculate_eosb_gratuity',
        'generate_tax_forms',
        'issue_experience_letter',
        'issue_relieving_letter',
        'update_statutory_records',
      ],
      slaHours: 168,
      config: {
        assignee: 'payroll_team',
        deadline: '7_days_after_last_working_day',
        requiresFinanceApproval: true,
      },
    },
    {
      id: 'off-close',
      type: 'action',
      label: 'Step 4: Exit Interview & Archive',
      actions: [
        'conduct_exit_interview',
        'collect_exit_survey',
        'archive_employee_records',
        'remove_from_distribution_lists',
        'close_payroll_profile',
        'terminate_benefits',
      ],
      slaHours: 72,
      config: {
        assignee: 'hr_team',
        exitInterviewMandatory: true,
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// 5. Profile Change Approval
// ---------------------------------------------------------------------------

const profileChangeApprovalTemplate: WorkflowTemplate = {
  name: 'Profile Change Approval',
  code: 'WF_PROFILE_CHANGE',
  description: 'Approval workflow for sensitive employee profile changes requiring manager and HR sign-off',
  trigger: 'employee.profile_change_requested',
  module: 'employee',
  version: '2.0',
  slaHours: 72,
  escalationRules: {
    firstReminderHours: 24,
    secondReminderHours: 48,
    autoEscalateHours: 72,
    notifyHR: true,
  },
  steps: [
    {
      id: 'pc-validate',
      type: 'validation',
      label: 'Validate Profile Change Request',
      checks: [
        'supporting_documents_attached',
        'change_within_policy',
        'no_duplicate_request',
      ],
      config: { autoRejectOnFailure: false },
    },
    {
      id: 'pc-manager',
      type: 'approval',
      label: 'Manager Approval',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 48 },
      ],
      slaHours: 48,
      conditions: {
        sensitiveFields: [
          'designation',
          'department',
          'location',
          'salary_grade',
          'reporting_manager',
        ],
      },
    },
    {
      id: 'pc-hr',
      type: 'approval',
      label: 'HR Approval',
      approvers: [
        { role: 'hr_business_partner', label: 'HR Business Partner', escalateAfterHours: 24 },
      ],
      slaHours: 24,
      conditions: {
        triggerConditions: [
          'field IN [designation, department, salary_grade, employment_type]',
        ],
      },
    },
    {
      id: 'pc-apply',
      type: 'action',
      label: 'Apply Profile Changes',
      actions: [
        'update_employee_profile',
        'update_payroll_records',
        'update_org_chart',
        'notify_employee',
        'send_confirmation_letter',
        'log_audit_trail',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 6. Loan / Salary Advance Request
// ---------------------------------------------------------------------------

const loanAdvanceTemplate: WorkflowTemplate = {
  name: 'Loan and Salary Advance Request',
  code: 'WF_LOAN_ADVANCE',
  description: 'Approval workflow for employee loan and salary advance requests with eligibility checks',
  trigger: 'loan.requested',
  module: 'payroll',
  version: '2.0',
  slaHours: 120,
  escalationRules: {
    firstReminderHours: 48,
    secondReminderHours: 72,
    autoEscalateHours: 120,
    notifyHR: false,
  },
  steps: [
    {
      id: 'loan-eligibility',
      type: 'validation',
      label: 'Eligibility Check',
      checks: [
        'min_service_period_6_months',
        'no_existing_active_loan',
        'within_max_loan_amount_policy',
        'credit_history_internal',
        'probation_completed',
      ],
      config: { autoRejectOnFailure: true },
    },
    {
      id: 'loan-manager',
      type: 'approval',
      label: 'Manager Approval',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 48 },
      ],
      slaHours: 48,
    },
    {
      id: 'loan-hr',
      type: 'approval',
      label: 'HR Approval',
      approvers: [
        { role: 'hr_manager', label: 'HR Manager', escalateAfterHours: 48 },
      ],
      slaHours: 48,
    },
    {
      id: 'loan-finance',
      type: 'approval',
      label: 'Finance Approval',
      approvers: [
        { role: 'finance_controller', label: 'Finance Controller', escalateAfterHours: 24 },
      ],
      slaHours: 24,
      conditions: {
        triggerConditions: ['amount > 5000'],
      },
    },
    {
      id: 'loan-disburse',
      type: 'action',
      label: 'Disburse Loan',
      actions: [
        'create_loan_account',
        'setup_monthly_deduction_schedule',
        'process_disbursement',
        'notify_employee',
        'generate_loan_agreement',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 7. Training Enrollment Approval
// ---------------------------------------------------------------------------

const trainingEnrollmentTemplate: WorkflowTemplate = {
  name: 'Training Enrollment Approval',
  code: 'WF_TRAINING_ENROLLMENT',
  description: 'Approval workflow for employee training enrollment with budget and manager sign-off',
  trigger: 'training.enrollment_requested',
  module: 'learning',
  version: '2.0',
  slaHours: 96,
  escalationRules: {
    firstReminderHours: 48,
    secondReminderHours: 72,
    autoEscalateHours: 96,
    notifyHR: false,
  },
  steps: [
    {
      id: 'trn-validate',
      type: 'validation',
      label: 'Training Request Validation',
      checks: [
        'course_within_approved_catalog',
        'training_budget_available',
        'no_conflicting_schedule',
        'employee_meets_prerequisites',
      ],
      config: { autoRejectOnFailure: false },
    },
    {
      id: 'trn-manager',
      type: 'approval',
      label: 'Manager Approval',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 48 },
      ],
      slaHours: 48,
      config: { reviewWorkloadImpact: true },
    },
    {
      id: 'trn-l-and-d',
      type: 'approval',
      label: 'L&D Team Approval',
      approvers: [
        { role: 'learning_development_team', label: 'L&D Team', escalateAfterHours: 24 },
      ],
      slaHours: 24,
      conditions: {
        triggerConditions: ['trainingCost > 500 OR externalVendor == true'],
      },
    },
    {
      id: 'trn-finance',
      type: 'approval',
      label: 'Finance Budget Approval',
      approvers: [
        { role: 'finance_business_partner', label: 'Finance Business Partner', escalateAfterHours: 24 },
      ],
      slaHours: 24,
      conditions: {
        triggerConditions: ['trainingCost > 2000'],
      },
    },
    {
      id: 'trn-enroll',
      type: 'action',
      label: 'Complete Enrollment',
      actions: [
        'confirm_enrollment',
        'send_calendar_invite',
        'book_training_seat',
        'notify_employee',
        'update_development_plan',
        'raise_purchase_order_if_external',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 8. Overtime Approval
// ---------------------------------------------------------------------------

const overtimeApprovalTemplate: WorkflowTemplate = {
  name: 'Overtime Approval',
  code: 'WF_OVERTIME_APPROVAL',
  description: 'Approval workflow for employee overtime requests with statutory compliance checks',
  trigger: 'overtime.requested',
  module: 'attendance',
  version: '2.0',
  slaHours: 24,
  escalationRules: {
    firstReminderHours: 8,
    secondReminderHours: 16,
    autoEscalateHours: 24,
    notifyHR: false,
  },
  steps: [
    {
      id: 'ot-validate',
      type: 'validation',
      label: 'Overtime Eligibility Validation',
      checks: [
        'max_weekly_overtime_not_exceeded',
        'max_monthly_overtime_not_exceeded',
        'cooling_off_period_check',
        'statutory_overtime_cap_check',
        'employee_not_on_leave',
      ],
      config: { autoRejectOnFailure: true, jurisdictionAware: true },
    },
    {
      id: 'ot-manager',
      type: 'approval',
      label: 'Manager Approval',
      approvers: [
        { role: 'direct_manager', label: 'Direct Manager', escalateAfterHours: 8 },
      ],
      slaHours: 8,
      escalationRules: {
        escalateAfterHours: 8,
        escalateTo: 'department_head',
        notifyOn: ['approved', 'rejected', 'escalated'],
      },
    },
    {
      id: 'ot-record',
      type: 'action',
      label: 'Record Overtime',
      actions: [
        'update_attendance_record',
        'calculate_overtime_pay',
        'update_comp_off_balance',
        'notify_payroll_team',
        'notify_employee',
      ],
      config: { applyJurisdictionRates: true },
    },
  ],
};

// ---------------------------------------------------------------------------
// Aggregated export
// ---------------------------------------------------------------------------

export const workflowTemplates: WorkflowTemplate[] = [
  leaveApprovalTemplate,
  expenseApprovalTemplate,
  employeeOnboardingTemplate,
  employeeOffboardingTemplate,
  profileChangeApprovalTemplate,
  loanAdvanceTemplate,
  trainingEnrollmentTemplate,
  overtimeApprovalTemplate,
];

/**
 * Seed workflow templates into SystemSetting (key-value store).
 * Uses the `workflow_templates` group for namespace isolation.
 * Idempotent — safe to run multiple times.
 */
export async function seedWorkflowTemplates(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding workflow templates...');
  let count = 0;

  for (const template of workflowTemplates) {
    const key = `workflow_template.${template.code.toLowerCase()}`;

    await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: JSON.stringify(template),
        description: `Workflow template v${template.version}: ${template.name} — ${template.description}`,
      },
      create: {
        key,
        value: JSON.stringify(template),
        group: 'workflow_templates',
        description: `Workflow template v${template.version}: ${template.name} — ${template.description}`,
      },
    });

    count++;
  }

  console.log(`  ✓ Workflow templates: ${count} templates seeded (${workflowTemplates.map(t => t.code).join(', ')})`);
}

// Legacy named export for backward compatibility
export { seedWorkflowTemplates as seed };
