/**
 * @module ApprovalChainsSeed
 * @description Enterprise approval matrices for all HCM modules with threshold-based
 *   routing, delegation rules, escalation timeouts, and SoD conflict definitions.
 *   All data is stored as SystemSetting JSON payloads.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 7
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface ApprovalStep {
  stepNumber: number;
  role: string;
  label: string;
  slaHours: number;
  escalateAfterHours: number;
  escalateTo: string;
  canDelegate: boolean;
  canReject: boolean;
  autoApproveConditions?: string[];
}

export interface ThresholdMatrix {
  currency: string;
  tiers: {
    label: string;
    minAmount: number;
    maxAmount: number;
    approvalSteps: string[];
    autoApprove: boolean;
  }[];
}

export interface SoDRule {
  ruleCode: string;
  name: string;
  description: string;
  conflictingRoles: string[];
  conflictingModules: string[];
  severity: 'critical' | 'high' | 'medium';
  mitigationControl: string;
}

export interface ApprovalChainDef {
  type: string;
  module: string;
  name: string;
  description: string;
  steps: ApprovalStep[];
  thresholdMatrix?: ThresholdMatrix;
  delegationRules: {
    maxDelegationDays: number;
    requiresHRApproval: boolean;
    canDelegateToSkipLevel: boolean;
    notificationOnDelegation: boolean;
  };
  escalationPolicy: {
    sendReminderHours: number[];
    autoEscalateAfterHours: number;
    notifyHROnEscalation: boolean;
    maxEscalationLevels: number;
  };
}

// ---------------------------------------------------------------------------
// Module: Leave
// ---------------------------------------------------------------------------

const leaveApprovalChain: ApprovalChainDef = {
  type: 'leave_standard',
  module: 'leave',
  name: 'Leave Approval — Standard',
  description: 'Standard 2-level leave approval chain with manager and HR sign-off for extended leave',
  steps: [
    {
      stepNumber: 1,
      role: 'direct_manager',
      label: 'Direct Manager',
      slaHours: 24,
      escalateAfterHours: 24,
      escalateTo: 'skip_level_manager',
      canDelegate: true,
      canReject: true,
      autoApproveConditions: ['leaveType == COMP_OFF AND duration <= 2'],
    },
    {
      stepNumber: 2,
      role: 'hr_manager',
      label: 'HR Manager',
      slaHours: 24,
      escalateAfterHours: 24,
      escalateTo: 'hr_director',
      canDelegate: false,
      canReject: true,
      autoApproveConditions: [],
    },
  ],
  thresholdMatrix: {
    currency: 'N/A',
    tiers: [
      { label: 'Short Leave (≤3 days)', minAmount: 0, maxAmount: 3, approvalSteps: ['direct_manager'], autoApprove: false },
      { label: 'Extended Leave (4–14 days)', minAmount: 4, maxAmount: 14, approvalSteps: ['direct_manager', 'hr_manager'], autoApprove: false },
      { label: 'Long Leave (>14 days)', minAmount: 15, maxAmount: 999, approvalSteps: ['direct_manager', 'hr_manager', 'department_head'], autoApprove: false },
    ],
  },
  delegationRules: {
    maxDelegationDays: 30,
    requiresHRApproval: false,
    canDelegateToSkipLevel: true,
    notificationOnDelegation: true,
  },
  escalationPolicy: {
    sendReminderHours: [12, 20],
    autoEscalateAfterHours: 24,
    notifyHROnEscalation: true,
    maxEscalationLevels: 2,
  },
};

// ---------------------------------------------------------------------------
// Module: Expense
// ---------------------------------------------------------------------------

const expenseApprovalChain: ApprovalChainDef = {
  type: 'expense_claim',
  module: 'expense',
  name: 'Expense Claim Approval — Threshold-Based',
  description: 'Three-tier expense approval: manager for <$500, finance for $500–$5000, CFO for >$5000',
  steps: [
    {
      stepNumber: 1,
      role: 'direct_manager',
      label: 'Direct Manager',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'department_head',
      canDelegate: true,
      canReject: true,
      autoApproveConditions: ['amount < 100 AND category IN [stationery, meals]'],
    },
    {
      stepNumber: 2,
      role: 'finance_controller',
      label: 'Finance Controller',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'finance_director',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 3,
      role: 'cfo',
      label: 'CFO',
      slaHours: 72,
      escalateAfterHours: 72,
      escalateTo: 'ceo',
      canDelegate: false,
      canReject: true,
    },
  ],
  thresholdMatrix: {
    currency: 'USD',
    tiers: [
      { label: 'Petty Expense (<$100)', minAmount: 0, maxAmount: 99, approvalSteps: ['direct_manager'], autoApprove: false },
      { label: 'Standard Expense ($100–$499)', minAmount: 100, maxAmount: 499, approvalSteps: ['direct_manager'], autoApprove: false },
      { label: 'Medium Expense ($500–$4999)', minAmount: 500, maxAmount: 4999, approvalSteps: ['direct_manager', 'finance_controller'], autoApprove: false },
      { label: 'High Expense ($5000+)', minAmount: 5000, maxAmount: 9999999, approvalSteps: ['direct_manager', 'finance_controller', 'cfo'], autoApprove: false },
    ],
  },
  delegationRules: {
    maxDelegationDays: 14,
    requiresHRApproval: false,
    canDelegateToSkipLevel: false,
    notificationOnDelegation: true,
  },
  escalationPolicy: {
    sendReminderHours: [24, 36],
    autoEscalateAfterHours: 48,
    notifyHROnEscalation: false,
    maxEscalationLevels: 2,
  },
};

// ---------------------------------------------------------------------------
// Module: Payroll
// ---------------------------------------------------------------------------

const payrollApprovalChain: ApprovalChainDef = {
  type: 'payroll_run',
  module: 'payroll',
  name: 'Payroll Run Approval',
  description: 'Payroll run approval chain with HR, Finance, and CFO sign-off before processing',
  steps: [
    {
      stepNumber: 1,
      role: 'hr_manager',
      label: 'HR Manager',
      slaHours: 24,
      escalateAfterHours: 24,
      escalateTo: 'hr_director',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 2,
      role: 'finance_controller',
      label: 'Finance Controller',
      slaHours: 24,
      escalateAfterHours: 24,
      escalateTo: 'finance_director',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 3,
      role: 'cfo',
      label: 'CFO',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'ceo',
      canDelegate: false,
      canReject: true,
    },
  ],
  thresholdMatrix: {
    currency: 'N/A',
    tiers: [
      { label: 'Regular Payroll', minAmount: 0, maxAmount: 9999999, approvalSteps: ['hr_manager', 'finance_controller', 'cfo'], autoApprove: false },
    ],
  },
  delegationRules: {
    maxDelegationDays: 0,
    requiresHRApproval: true,
    canDelegateToSkipLevel: false,
    notificationOnDelegation: true,
  },
  escalationPolicy: {
    sendReminderHours: [12, 20],
    autoEscalateAfterHours: 24,
    notifyHROnEscalation: true,
    maxEscalationLevels: 1,
  },
};

// ---------------------------------------------------------------------------
// Module: Hiring (Job Requisition)
// ---------------------------------------------------------------------------

const hiringApprovalChain: ApprovalChainDef = {
  type: 'job_requisition',
  module: 'recruitment',
  name: 'Job Requisition Approval',
  description: 'Multi-stage hiring approval: department head, HR/Finance, and CEO for new headcount',
  steps: [
    {
      stepNumber: 1,
      role: 'department_head',
      label: 'Department Head',
      slaHours: 72,
      escalateAfterHours: 72,
      escalateTo: 'vp',
      canDelegate: true,
      canReject: true,
    },
    {
      stepNumber: 2,
      role: 'hr_business_partner',
      label: 'HR Business Partner',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'hr_director',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 3,
      role: 'finance_business_partner',
      label: 'Finance Business Partner',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'cfo',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 4,
      role: 'ceo',
      label: 'CEO',
      slaHours: 120,
      escalateAfterHours: 120,
      escalateTo: 'board_chair',
      canDelegate: false,
      canReject: true,
    },
  ],
  thresholdMatrix: {
    currency: 'N/A',
    tiers: [
      { label: 'Backfill (Replacement)', minAmount: 0, maxAmount: 0, approvalSteps: ['department_head', 'hr_business_partner', 'finance_business_partner'], autoApprove: false },
      { label: 'New Headcount (IC)', minAmount: 0, maxAmount: 0, approvalSteps: ['department_head', 'hr_business_partner', 'finance_business_partner', 'ceo'], autoApprove: false },
      { label: 'New Headcount (Manager+)', minAmount: 0, maxAmount: 0, approvalSteps: ['department_head', 'vp', 'hr_business_partner', 'finance_business_partner', 'ceo'], autoApprove: false },
    ],
  },
  delegationRules: {
    maxDelegationDays: 30,
    requiresHRApproval: true,
    canDelegateToSkipLevel: false,
    notificationOnDelegation: true,
  },
  escalationPolicy: {
    sendReminderHours: [48, 60],
    autoEscalateAfterHours: 72,
    notifyHROnEscalation: true,
    maxEscalationLevels: 2,
  },
};

// ---------------------------------------------------------------------------
// Module: Termination
// ---------------------------------------------------------------------------

const terminationApprovalChain: ApprovalChainDef = {
  type: 'termination_approval',
  module: 'offboarding',
  name: 'Termination Approval',
  description: 'Sensitive 3-level termination approval requiring HR, Legal, and executive sign-off',
  steps: [
    {
      stepNumber: 1,
      role: 'hr_business_partner',
      label: 'HR Business Partner',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'hr_director',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 2,
      role: 'legal_counsel',
      label: 'Legal Counsel',
      slaHours: 48,
      escalateAfterHours: 48,
      escalateTo: 'chief_legal_officer',
      canDelegate: false,
      canReject: true,
    },
    {
      stepNumber: 3,
      role: 'chro',
      label: 'CHRO',
      slaHours: 72,
      escalateAfterHours: 72,
      escalateTo: 'ceo',
      canDelegate: false,
      canReject: true,
    },
  ],
  thresholdMatrix: {
    currency: 'N/A',
    tiers: [
      { label: 'All Terminations', minAmount: 0, maxAmount: 9999999, approvalSteps: ['hr_business_partner', 'legal_counsel', 'chro'], autoApprove: false },
    ],
  },
  delegationRules: {
    maxDelegationDays: 0,
    requiresHRApproval: true,
    canDelegateToSkipLevel: false,
    notificationOnDelegation: true,
  },
  escalationPolicy: {
    sendReminderHours: [24, 36],
    autoEscalateAfterHours: 48,
    notifyHROnEscalation: true,
    maxEscalationLevels: 1,
  },
};

// ---------------------------------------------------------------------------
// Additional approval chains
// ---------------------------------------------------------------------------

const promotionApprovalChain: ApprovalChainDef = {
  type: 'promotion_approval',
  module: 'compensation',
  name: 'Promotion Approval',
  description: 'Three-level promotion approval with skip-level, HR, and compensation committee review',
  steps: [
    { stepNumber: 1, role: 'skip_level_manager', label: 'Skip-Level Manager', slaHours: 120, escalateAfterHours: 120, escalateTo: 'vp', canDelegate: false, canReject: true },
    { stepNumber: 2, role: 'hr_business_partner', label: 'HR Business Partner', slaHours: 120, escalateAfterHours: 120, escalateTo: 'hr_director', canDelegate: false, canReject: true },
    { stepNumber: 3, role: 'compensation_committee', label: 'Compensation Committee', slaHours: 168, escalateAfterHours: 168, escalateTo: 'ceo', canDelegate: false, canReject: true },
  ],
  thresholdMatrix: { currency: 'N/A', tiers: [{ label: 'All Promotions', minAmount: 0, maxAmount: 9999999, approvalSteps: ['skip_level_manager', 'hr_business_partner', 'compensation_committee'], autoApprove: false }] },
  delegationRules: { maxDelegationDays: 0, requiresHRApproval: true, canDelegateToSkipLevel: false, notificationOnDelegation: true },
  escalationPolicy: { sendReminderHours: [72, 96], autoEscalateAfterHours: 120, notifyHROnEscalation: true, maxEscalationLevels: 1 },
};

const salaryAdjustmentChain: ApprovalChainDef = {
  type: 'salary_adjustment',
  module: 'compensation',
  name: 'Salary Adjustment Approval',
  description: 'Department head, HR, and Finance sign-off for out-of-cycle salary changes',
  steps: [
    { stepNumber: 1, role: 'department_head', label: 'Department Head', slaHours: 72, escalateAfterHours: 72, escalateTo: 'vp', canDelegate: true, canReject: true },
    { stepNumber: 2, role: 'hr_business_partner', label: 'HR Business Partner', slaHours: 72, escalateAfterHours: 72, escalateTo: 'hr_director', canDelegate: false, canReject: true },
    { stepNumber: 3, role: 'compensation_team', label: 'Compensation Team', slaHours: 120, escalateAfterHours: 120, escalateTo: 'chro', canDelegate: false, canReject: true },
  ],
  thresholdMatrix: {
    currency: 'USD',
    tiers: [
      { label: '<5% adjustment', minAmount: 0, maxAmount: 4, approvalSteps: ['department_head', 'hr_business_partner'], autoApprove: false },
      { label: '5–10% adjustment', minAmount: 5, maxAmount: 10, approvalSteps: ['department_head', 'hr_business_partner', 'compensation_team'], autoApprove: false },
      { label: '>10% adjustment', minAmount: 11, maxAmount: 100, approvalSteps: ['department_head', 'hr_business_partner', 'compensation_team', 'chro'], autoApprove: false },
    ],
  },
  delegationRules: { maxDelegationDays: 14, requiresHRApproval: true, canDelegateToSkipLevel: false, notificationOnDelegation: true },
  escalationPolicy: { sendReminderHours: [48, 60], autoEscalateAfterHours: 72, notifyHROnEscalation: true, maxEscalationLevels: 2 },
};

// ---------------------------------------------------------------------------
// SoD (Separation of Duties) conflict rules
// ---------------------------------------------------------------------------

export const sodRules: SoDRule[] = [
  {
    ruleCode: 'SOD_PAYROLL_01',
    name: 'Payroll Preparer / Approver Conflict',
    description: 'No individual can both prepare and approve a payroll run',
    conflictingRoles: ['payroll_preparer', 'payroll_approver'],
    conflictingModules: ['payroll'],
    severity: 'critical',
    mitigationControl: 'Dual control: payroll run must be processed by one user and approved by a different user',
  },
  {
    ruleCode: 'SOD_EXPENSE_01',
    name: 'Expense Submitter / Approver Conflict',
    description: 'No manager can approve their own expense claims',
    conflictingRoles: ['expense_submitter', 'direct_manager'],
    conflictingModules: ['expense'],
    severity: 'critical',
    mitigationControl: 'Auto-route manager expense claims to skip-level manager for approval',
  },
  {
    ruleCode: 'SOD_RECRUIT_01',
    name: 'Hiring Manager / Interviewer Conflict for Senior Roles',
    description: 'Hiring manager should not be the sole interviewer for Director+ roles to prevent bias',
    conflictingRoles: ['hiring_manager', 'interview_panel_sole'],
    conflictingModules: ['recruitment'],
    severity: 'high',
    mitigationControl: 'Require minimum 2 independent interviewers for Director+ role hiring decisions',
  },
  {
    ruleCode: 'SOD_TERM_01',
    name: 'Termination Initiator / Approver Conflict',
    description: 'Direct manager cannot be the final approver for their own direct report termination',
    conflictingRoles: ['termination_initiator', 'termination_final_approver'],
    conflictingModules: ['offboarding'],
    severity: 'critical',
    mitigationControl: 'Skip-level + HR + Legal must be involved in all termination approvals',
  },
  {
    ruleCode: 'SOD_ACCESS_01',
    name: 'Access Provisioner / Deprovisioner Conflict',
    description: 'Same IT admin cannot provision and deprovision access for the same user',
    conflictingRoles: ['it_access_provisioner', 'it_access_deprovisioner'],
    conflictingModules: ['it_provisioning'],
    severity: 'high',
    mitigationControl: 'Require second IT admin to confirm deprovisioning; automated logging required',
  },
  {
    ruleCode: 'SOD_COMP_01',
    name: 'Compensation Band Setter / Employee Pay Setter Conflict',
    description: 'Compensation team member who sets bands should not individually assign specific salaries',
    conflictingRoles: ['compensation_band_setter', 'individual_salary_setter'],
    conflictingModules: ['compensation'],
    severity: 'high',
    mitigationControl: 'HR Business Partner must validate individual salary assignments against approved bands',
  },
];

// ---------------------------------------------------------------------------
// Aggregated approval chains
// ---------------------------------------------------------------------------

export const approvalChains: ApprovalChainDef[] = [
  leaveApprovalChain,
  expenseApprovalChain,
  payrollApprovalChain,
  hiringApprovalChain,
  terminationApprovalChain,
  promotionApprovalChain,
  salaryAdjustmentChain,
];

/**
 * Seed approval chains and SoD rules into SystemSetting.
 * Idempotent — safe to run multiple times.
 */
export async function seedApprovalChains(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding approval chains and SoD rules...');
  let chainCount = 0;
  let sodCount = 0;

  for (const chain of approvalChains) {
    const key = `approval_chain.${chain.type}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(chain), description: chain.description },
      create: {
        key,
        value: JSON.stringify(chain),
        group: 'approval_chains',
        description: chain.description,
      },
    });
    chainCount++;
  }

  for (const rule of sodRules) {
    const key = `sod_rule.${rule.ruleCode.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(rule), description: rule.description },
      create: {
        key,
        value: JSON.stringify(rule),
        group: 'sod_rules',
        description: `SoD Rule ${rule.ruleCode} [${rule.severity.toUpperCase()}]: ${rule.description}`,
      },
    });
    sodCount++;
  }

  console.log(`  ✓ Approval chains: ${chainCount} chains seeded`);
  console.log(`  ✓ SoD rules: ${sodCount} separation-of-duties rules seeded`);
}

// Legacy named export for backward compatibility
export { seedApprovalChains as seed };
