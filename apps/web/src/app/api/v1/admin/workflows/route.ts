import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const workflows = [
    {
      id: 'wf-001',
      name: 'Employee Onboarding',
      description: 'Automated onboarding workflow for new hires',
      status: 'active',
      trigger: 'new_hire_created',
      steps: 12,
      avgCompletionTime: '5 days',
      executionsThisMonth: 18,
      successRate: 96.5,
      createdAt: '2025-04-10T10:00:00Z',
      updatedAt: '2025-12-15T14:00:00Z',
      createdBy: 'admin-001',
    },
    {
      id: 'wf-002',
      name: 'Leave Approval',
      description: 'Multi-level leave request approval chain',
      status: 'active',
      trigger: 'leave_request_submitted',
      steps: 5,
      avgCompletionTime: '1.2 days',
      executionsThisMonth: 47,
      successRate: 99.1,
      createdAt: '2025-03-01T08:00:00Z',
      updatedAt: '2025-11-20T09:30:00Z',
      createdBy: 'admin-001',
    },
    {
      id: 'wf-003',
      name: 'Performance Review Cycle',
      description: 'Annual performance review process automation',
      status: 'inactive',
      trigger: 'scheduled',
      steps: 8,
      avgCompletionTime: '14 days',
      executionsThisMonth: 0,
      successRate: 92.0,
      createdAt: '2025-05-20T12:00:00Z',
      updatedAt: '2025-10-30T16:00:00Z',
      createdBy: 'hr-admin-001',
    },
    {
      id: 'wf-004',
      name: 'Employee Offboarding',
      description: 'Systematic offboarding with asset recovery and access revocation',
      status: 'active',
      trigger: 'termination_initiated',
      steps: 15,
      avgCompletionTime: '3 days',
      executionsThisMonth: 11,
      successRate: 98.2,
      createdAt: '2025-04-15T14:00:00Z',
      updatedAt: '2025-12-01T11:00:00Z',
      createdBy: 'admin-001',
    },
    {
      id: 'wf-005',
      name: 'Expense Approval',
      description: 'Tiered expense approval based on amount thresholds',
      status: 'active',
      trigger: 'expense_submitted',
      steps: 4,
      avgCompletionTime: '0.8 days',
      executionsThisMonth: 89,
      successRate: 99.5,
      createdAt: '2025-06-01T09:00:00Z',
      updatedAt: '2025-11-10T10:15:00Z',
      createdBy: 'finance-admin-001',
    },
  ];

  return NextResponse.json({
    success: true,
    data: workflows,
    meta: { total: workflows.length, active: 4, inactive: 1 },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newWorkflow = {
    id: 'wf-006',
    name: body.name || 'New Workflow',
    description: body.description || 'A new automated workflow',
    status: 'draft',
    trigger: body.trigger || 'manual',
    steps: body.steps?.length || 0,
    stepDefinitions: body.steps || [],
    conditions: body.conditions || [],
    notifications: body.notifications || { email: true, inApp: true, slack: false },
    avgCompletionTime: null,
    executionsThisMonth: 0,
    successRate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin-001',
    version: 1,
  };

  return NextResponse.json(
    { success: true, data: newWorkflow, message: 'Workflow created successfully' },
    { status: 201 }
  );
}
