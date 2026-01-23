import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const submission = {
    submissionId: 'sub-' + Date.now(),
    formId: id,
    formName: 'Leave Request Form',
    submittedBy: body.userId || 'user-001',
    submittedAt: new Date().toISOString(),
    status: 'pending_approval',
    data: body.data || {
      leaveType: 'annual',
      startDate: '2026-02-10',
      endDate: '2026-02-14',
      halfDay: false,
      reason: 'Family vacation planned for mid-February',
      handoverNotes: 'All tasks assigned to team backup. Sprint deliverables on track.',
      emergencyContact: '+1-555-0123',
    },
    validation: {
      valid: true,
      errors: [],
    },
    approval: {
      workflowId: 'wf-002',
      currentApprover: {
        id: 'mgr-042',
        name: 'Michael Brown',
        role: 'Direct Manager',
      },
      steps: [
        { approver: 'Direct Manager', status: 'pending' },
        { approver: 'HR Review', status: 'waiting' },
      ],
    },
    leaveBalance: {
      type: 'annual',
      available: 12,
      requested: 5,
      remaining: 7,
    },
    notifications: [
      { recipient: 'mgr-042', type: 'email', status: 'sent' },
      { recipient: 'user-001', type: 'in-app', status: 'sent' },
    ],
  };

  return NextResponse.json(
    { success: true, data: submission, message: 'Form submitted successfully' },
    { status: 201 }
  );
}
