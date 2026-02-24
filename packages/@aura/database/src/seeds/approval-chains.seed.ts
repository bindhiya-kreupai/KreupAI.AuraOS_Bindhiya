import { PrismaClient } from '@prisma/client';

export interface ApprovalStep {
  role: string;
  escalateAfterHours?: number;
}

export interface ApprovalChain {
  type: string;
  steps: ApprovalStep[];
}

export const approvalChains: ApprovalChain[] = [
  {
    type: 'leave_standard',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
      { role: 'department_head', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'leave_extended',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
      { role: 'department_head', escalateAfterHours: 48 },
      { role: 'hr_manager', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'leave_medical',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 24 },
      { role: 'hr_manager', escalateAfterHours: 48 },
    ],
  },
  {
    type: 'expense_low',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'expense_medium',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
      { role: 'finance_controller', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'expense_high',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
      { role: 'department_head', escalateAfterHours: 48 },
      { role: 'finance_controller', escalateAfterHours: 48 },
      { role: 'cfo', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'requisition_backfill',
    steps: [
      { role: 'department_head', escalateAfterHours: 72 },
      { role: 'hr_business_partner', escalateAfterHours: 48 },
      { role: 'finance_business_partner', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'requisition_new_headcount',
    steps: [
      { role: 'department_head', escalateAfterHours: 72 },
      { role: 'vp', escalateAfterHours: 72 },
      { role: 'hr_business_partner', escalateAfterHours: 48 },
      { role: 'finance_business_partner', escalateAfterHours: 48 },
      { role: 'ceo', escalateAfterHours: 120 },
    ],
  },
  {
    type: 'promotion',
    steps: [
      { role: 'skip_level_manager', escalateAfterHours: 120 },
      { role: 'hr_business_partner', escalateAfterHours: 120 },
      { role: 'compensation_committee', escalateAfterHours: 168 },
    ],
  },
  {
    type: 'salary_adjustment',
    steps: [
      { role: 'department_head', escalateAfterHours: 72 },
      { role: 'hr_business_partner', escalateAfterHours: 72 },
      { role: 'compensation_team', escalateAfterHours: 120 },
    ],
  },
  {
    type: 'travel_domestic',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
    ],
  },
  {
    type: 'travel_international',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
      { role: 'department_head', escalateAfterHours: 72 },
      { role: 'finance_controller', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'equipment_purchase',
    steps: [
      { role: 'direct_manager', escalateAfterHours: 48 },
      { role: 'it_manager', escalateAfterHours: 72 },
      { role: 'procurement_team', escalateAfterHours: 72 },
    ],
  },
  {
    type: 'policy_exception',
    steps: [
      { role: 'hr_manager', escalateAfterHours: 72 },
      { role: 'hr_director', escalateAfterHours: 120 },
      { role: 'chro', escalateAfterHours: 168 },
    ],
  },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding approval chains...');

  for (const chain of approvalChains) {
    await prisma.approvalChain.upsert({
      where: { type: chain.type },
      update: {
        steps: JSON.stringify(chain.steps),
      },
      create: {
        type: chain.type,
        steps: JSON.stringify(chain.steps),
      },
    });
  }

  console.log(`Seeded ${approvalChains.length} approval chains.`);
}
