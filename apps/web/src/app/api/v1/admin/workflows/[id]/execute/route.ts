import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const execution = {
    executionId: 'exec-' + Date.now(),
    workflowId: id,
    workflowName: 'Employee Onboarding',
    status: 'running',
    triggeredAt: new Date().toISOString(),
    triggeredBy: body.triggeredBy || 'admin-001',
    triggerType: body.triggerType || 'manual',
    input: body.input || {
      employeeId: 'emp-new-001',
      employeeName: 'Jane Doe',
      department: 'Engineering',
      startDate: '2026-02-01',
      manager: 'mgr-042',
    },
    currentStep: {
      id: 'step-1',
      name: 'Send Welcome Email',
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    },
    completedSteps: [],
    remainingSteps: 11,
    estimatedCompletion: '2026-02-06T00:00:00Z',
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Workflow execution started' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Processing step 1: Send Welcome Email' },
    ],
  };

  return NextResponse.json(
    { success: true, data: execution, message: 'Workflow execution triggered successfully' },
    { status: 201 }
  );
}
