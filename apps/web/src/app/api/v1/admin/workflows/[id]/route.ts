import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const workflow = {
    id,
    name: 'Employee Onboarding',
    description: 'Automated onboarding workflow for new hires',
    status: 'active',
    trigger: 'new_hire_created',
    version: 3,
    steps: [
      { id: 'step-1', name: 'Send Welcome Email', type: 'email', order: 1, config: { template: 'welcome-email', delay: '0' } },
      { id: 'step-2', name: 'Create IT Accounts', type: 'integration', order: 2, config: { system: 'active-directory', action: 'create_user' } },
      { id: 'step-3', name: 'Assign Equipment', type: 'task', order: 3, config: { assignee: 'it-team', dueIn: '2 days' } },
      { id: 'step-4', name: 'Schedule Orientation', type: 'calendar', order: 4, config: { event: 'new-hire-orientation', dueIn: '3 days' } },
      { id: 'step-5', name: 'Assign Buddy', type: 'task', order: 5, config: { assignee: 'hr-team', dueIn: '1 day' } },
      { id: 'step-6', name: 'Complete I-9 Form', type: 'form', order: 6, config: { formId: 'form-i9', dueIn: '3 days' } },
      { id: 'step-7', name: 'Benefits Enrollment', type: 'task', order: 7, config: { assignee: 'employee', dueIn: '30 days' } },
      { id: 'step-8', name: 'First Week Check-in', type: 'notification', order: 8, config: { recipient: 'manager', triggerAfter: '5 days' } },
      { id: 'step-9', name: 'Complete Training Modules', type: 'learning', order: 9, config: { pathId: 'lp-003', dueIn: '14 days' } },
      { id: 'step-10', name: '30-Day Survey', type: 'form', order: 10, config: { formId: 'form-30day', triggerAfter: '30 days' } },
      { id: 'step-11', name: 'Probation Review', type: 'task', order: 11, config: { assignee: 'manager', triggerAfter: '90 days' } },
      { id: 'step-12', name: 'Complete Onboarding', type: 'status_update', order: 12, config: { newStatus: 'fully_onboarded' } },
    ],
    conditions: [
      { id: 'cond-1', step: 'step-3', type: 'department', value: 'Engineering', action: 'include_dev_tools' },
      { id: 'cond-2', step: 'step-6', type: 'country', value: 'US', action: 'required' },
    ],
    analytics: {
      totalExecutions: 156,
      successRate: 96.5,
      avgCompletionTime: '5 days',
      activeInstances: 4,
    },
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2025-12-15T14:00:00Z',
    createdBy: 'admin-001',
  };

  return NextResponse.json({ success: true, data: workflow });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const updatedWorkflow = {
    id,
    name: body.name || 'Employee Onboarding',
    description: body.description || 'Updated workflow',
    status: body.status || 'active',
    trigger: body.trigger || 'new_hire_created',
    steps: body.steps || [],
    conditions: body.conditions || [],
    version: 4,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin-001',
  };

  return NextResponse.json({ success: true, data: updatedWorkflow, message: 'Workflow updated successfully' });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  return NextResponse.json({
    success: true,
    data: { id, deletedAt: new Date().toISOString() },
    message: 'Workflow deleted successfully',
  });
}
