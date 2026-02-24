import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const formSchema = {
    id,
    name: 'Leave Request Form',
    description: 'Standard leave request with manager approval',
    category: 'leave',
    status: 'published',
    version: 3,
    fields: [
      {
        id: 'field-001',
        name: 'leaveType',
        label: 'Leave Type',
        type: 'select',
        required: true,
        order: 1,
        options: [
          { value: 'annual', label: 'Annual Leave' },
          { value: 'sick', label: 'Sick Leave' },
          { value: 'personal', label: 'Personal Leave' },
          { value: 'parental', label: 'Parental Leave' },
          { value: 'bereavement', label: 'Bereavement Leave' },
          { value: 'unpaid', label: 'Unpaid Leave' },
        ],
        validation: { required: true },
      },
      {
        id: 'field-002',
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
        order: 2,
        validation: { required: true, minDate: 'today' },
      },
      {
        id: 'field-003',
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true,
        order: 3,
        validation: { required: true, minDate: 'field:startDate' },
      },
      {
        id: 'field-004',
        name: 'halfDay',
        label: 'Half Day',
        type: 'checkbox',
        required: false,
        order: 4,
        conditionalOn: { field: 'startDate', equals: 'endDate' },
      },
      {
        id: 'field-005',
        name: 'reason',
        label: 'Reason',
        type: 'textarea',
        required: true,
        order: 5,
        validation: { required: true, minLength: 10, maxLength: 500 },
        placeholder: 'Please provide a reason for your leave request',
      },
      {
        id: 'field-006',
        name: 'handoverNotes',
        label: 'Handover Notes',
        type: 'textarea',
        required: false,
        order: 6,
        validation: { maxLength: 1000 },
        placeholder: 'Notes for team coverage during your absence',
      },
      {
        id: 'field-007',
        name: 'emergencyContact',
        label: 'Emergency Contact',
        type: 'text',
        required: false,
        order: 7,
        validation: { pattern: '^[+]?[0-9\\s-]+$' },
      },
      {
        id: 'field-008',
        name: 'attachments',
        label: 'Supporting Documents',
        type: 'file',
        required: false,
        order: 8,
        validation: { maxFiles: 3, maxSize: '5MB', acceptedTypes: ['pdf', 'jpg', 'png'] },
        conditionalOn: { field: 'leaveType', in: ['sick', 'bereavement'] },
      },
    ],
    settings: {
      allowMultipleSubmissions: true,
      requireAuthentication: true,
      notifyOnSubmission: ['manager', 'hr-team'],
      approvalWorkflow: 'wf-002',
      showBalanceInfo: true,
    },
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-10-05T11:00:00Z',
  };

  return NextResponse.json({ success: true, data: formSchema });
}
