import { PrismaClient } from '@prisma/client';

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface WorkflowTemplate {
  name: string;
  trigger: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    name: 'Employee Onboarding',
    trigger: 'employee.created',
    nodes: [
      {
        id: 'onb-1',
        type: 'action',
        label: 'Create Accounts & Provision Access',
        config: {
          actions: ['create_email', 'create_slack', 'provision_laptop', 'assign_badge'],
          assignee: 'it_team',
          sla: '24h',
        },
      },
      {
        id: 'onb-2',
        type: 'action',
        label: 'Prepare Workspace & Equipment',
        config: {
          actions: ['assign_desk', 'order_equipment', 'prepare_welcome_kit'],
          assignee: 'facilities_team',
          sla: '48h',
        },
      },
      {
        id: 'onb-3',
        type: 'action',
        label: 'Send Welcome Package & Documents',
        config: {
          actions: ['send_welcome_email', 'send_handbook', 'assign_buddy', 'schedule_orientation'],
          assignee: 'hr_team',
          sla: '24h',
          emailTemplate: 'welcome-new-hire',
        },
      },
      {
        id: 'onb-4',
        type: 'action',
        label: 'Assign Training & Compliance Courses',
        config: {
          actions: ['assign_mandatory_training', 'assign_compliance_courses', 'assign_role_training'],
          assignee: 'learning_team',
          sla: '48h',
          mandatoryCourses: ['code_of_conduct', 'data_privacy', 'security_awareness', 'anti_harassment'],
        },
      },
      {
        id: 'onb-5',
        type: 'approval',
        label: 'Manager Check-in & Probation Goals',
        config: {
          actions: ['schedule_30_day_checkin', 'set_probation_goals', 'confirm_onboarding_complete'],
          assignee: 'direct_manager',
          sla: '7d',
        },
      },
    ],
    edges: [
      { from: 'onb-1', to: 'onb-2' },
      { from: 'onb-1', to: 'onb-3' },
      { from: 'onb-2', to: 'onb-4' },
      { from: 'onb-3', to: 'onb-4' },
      { from: 'onb-4', to: 'onb-5' },
    ],
  },
  {
    name: 'Employee Offboarding',
    trigger: 'employee.terminated',
    nodes: [
      {
        id: 'off-1',
        type: 'action',
        label: 'Initiate Exit Process',
        config: {
          actions: ['schedule_exit_interview', 'calculate_fnf', 'notify_stakeholders', 'initiate_knowledge_transfer'],
          assignee: 'hr_team',
          sla: '24h',
        },
      },
      {
        id: 'off-2',
        type: 'action',
        label: 'Revoke Access & Collect Assets',
        config: {
          actions: ['revoke_email', 'revoke_systems', 'collect_laptop', 'collect_badge', 'revoke_vpn'],
          assignee: 'it_team',
          sla: 'last_working_day',
        },
      },
      {
        id: 'off-3',
        type: 'action',
        label: 'Process Final Settlement',
        config: {
          actions: ['calculate_leave_encashment', 'process_final_pay', 'generate_form16', 'issue_experience_letter'],
          assignee: 'payroll_team',
          sla: '7d_after_lwd',
        },
      },
      {
        id: 'off-4',
        type: 'action',
        label: 'Complete Exit & Archive',
        config: {
          actions: ['conduct_exit_interview', 'archive_records', 'update_org_chart', 'remove_from_distribution_lists'],
          assignee: 'hr_team',
          sla: '14d_after_lwd',
        },
      },
    ],
    edges: [
      { from: 'off-1', to: 'off-2' },
      { from: 'off-1', to: 'off-3', condition: 'lastWorkingDay reached' },
      { from: 'off-2', to: 'off-4' },
      { from: 'off-3', to: 'off-4' },
    ],
  },
  {
    name: 'Leave Approval',
    trigger: 'leave.requested',
    nodes: [
      {
        id: 'lv-1',
        type: 'validation',
        label: 'Validate Leave Request',
        config: {
          checks: ['sufficient_balance', 'no_overlap', 'blackout_dates', 'min_notice_period'],
          autoReject: true,
        },
      },
      {
        id: 'lv-2',
        type: 'approval',
        label: 'Manager Approval',
        config: {
          approver: 'direct_manager',
          sla: '48h',
          escalateTo: 'skip_level_manager',
          emailTemplate: 'leave-request-notification',
        },
      },
      {
        id: 'lv-3',
        type: 'action',
        label: 'Process & Notify',
        config: {
          actions: ['update_leave_balance', 'update_calendar', 'notify_team', 'set_out_of_office'],
          emailTemplateApproved: 'leave-approved',
          emailTemplateRejected: 'leave-rejected',
        },
      },
    ],
    edges: [
      { from: 'lv-1', to: 'lv-2', condition: 'validation_passed' },
      { from: 'lv-2', to: 'lv-3' },
    ],
  },
  {
    name: 'Expense Approval',
    trigger: 'expense.submitted',
    nodes: [
      {
        id: 'exp-1',
        type: 'validation',
        label: 'Validate Expense Claim',
        config: {
          checks: ['receipt_attached', 'within_policy_limits', 'valid_category', 'not_duplicate'],
          autoReject: false,
        },
      },
      {
        id: 'exp-2',
        type: 'approval',
        label: 'Manager Approval',
        config: {
          approver: 'direct_manager',
          sla: '72h',
          thresholdForNextLevel: 5000,
          currency: 'USD',
        },
      },
      {
        id: 'exp-3',
        type: 'approval',
        label: 'Finance Review & Processing',
        config: {
          approver: 'finance_team',
          sla: '48h',
          actions: ['verify_receipts', 'check_budget', 'process_reimbursement'],
          condition: 'amount > 1000 OR category == travel',
        },
      },
    ],
    edges: [
      { from: 'exp-1', to: 'exp-2', condition: 'validation_passed' },
      { from: 'exp-2', to: 'exp-3', condition: 'approved AND (amount > 1000 OR requiresFinanceReview)' },
    ],
  },
  {
    name: 'Job Requisition',
    trigger: 'requisition.created',
    nodes: [
      {
        id: 'req-1',
        type: 'action',
        label: 'Draft Requisition & Job Description',
        config: {
          requiredFields: ['title', 'department', 'level', 'budget', 'justification', 'headcount'],
          assignee: 'hiring_manager',
        },
      },
      {
        id: 'req-2',
        type: 'approval',
        label: 'Department Head Approval',
        config: {
          approver: 'department_head',
          sla: '72h',
          escalateTo: 'vp',
        },
      },
      {
        id: 'req-3',
        type: 'approval',
        label: 'Finance & Budget Approval',
        config: {
          approver: 'finance_bp',
          sla: '48h',
          checks: ['budget_available', 'within_headcount_plan'],
        },
      },
      {
        id: 'req-4',
        type: 'action',
        label: 'Publish & Source Candidates',
        config: {
          actions: ['post_internal', 'post_external', 'notify_recruiters', 'create_sourcing_plan'],
          assignee: 'talent_acquisition',
          channels: ['linkedin', 'indeed', 'company_careers', 'referrals'],
        },
      },
    ],
    edges: [
      { from: 'req-1', to: 'req-2' },
      { from: 'req-2', to: 'req-3', condition: 'approved' },
      { from: 'req-3', to: 'req-4', condition: 'approved' },
    ],
  },
  {
    name: 'Promotion Process',
    trigger: 'promotion.initiated',
    nodes: [
      {
        id: 'promo-1',
        type: 'action',
        label: 'Prepare Promotion Case',
        config: {
          requiredDocs: ['performance_history', 'peer_feedback', 'business_case', 'competency_assessment'],
          assignee: 'direct_manager',
          sla: '7d',
        },
      },
      {
        id: 'promo-2',
        type: 'approval',
        label: 'Skip-Level Manager Review',
        config: {
          approver: 'skip_level_manager',
          sla: '5d',
          requiredReview: ['performance_ratings', 'compensation_data', 'team_equity'],
        },
      },
      {
        id: 'promo-3',
        type: 'approval',
        label: 'Calibration & HR Review',
        config: {
          approver: 'hr_business_partner',
          sla: '5d',
          checks: ['pay_equity', 'band_alignment', 'budget_impact', 'diversity_impact'],
        },
      },
      {
        id: 'promo-4',
        type: 'action',
        label: 'Process & Communicate',
        config: {
          actions: ['update_title', 'update_compensation', 'update_grade', 'send_letter', 'announce'],
          assignee: 'hr_team',
          effectiveDate: 'next_pay_cycle',
        },
      },
    ],
    edges: [
      { from: 'promo-1', to: 'promo-2' },
      { from: 'promo-2', to: 'promo-3', condition: 'approved' },
      { from: 'promo-3', to: 'promo-4', condition: 'approved' },
    ],
  },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding workflow templates...');

  for (const workflow of workflowTemplates) {
    await prisma.workflowTemplate.upsert({
      where: { name: workflow.name },
      update: {
        trigger: workflow.trigger,
        nodes: JSON.stringify(workflow.nodes),
        edges: JSON.stringify(workflow.edges),
      },
      create: {
        name: workflow.name,
        trigger: workflow.trigger,
        nodes: JSON.stringify(workflow.nodes),
        edges: JSON.stringify(workflow.edges),
      },
    });
  }

  console.log(`Seeded ${workflowTemplates.length} workflow templates.`);
}
