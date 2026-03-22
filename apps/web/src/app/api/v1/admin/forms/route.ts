import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  const tenantId = user.tenantId;

  const forms = [
    {
      id: 'form-001',
      name: 'Employee Information Update',
      description: 'Form for employees to update their personal information',
      category: 'hr',
      status: 'published',
      fieldsCount: 15,
      submissions: 342,
      lastSubmission: '2026-01-22T16:30:00Z',
      createdAt: '2025-03-15T10:00:00Z',
      updatedAt: '2025-11-20T14:00:00Z',
      createdBy: 'admin-001',
    },
    {
      id: 'form-002',
      name: 'Leave Request Form',
      description: 'Standard leave request with manager approval',
      category: 'leave',
      status: 'published',
      fieldsCount: 8,
      submissions: 1256,
      lastSubmission: '2026-01-23T09:15:00Z',
      createdAt: '2025-02-01T08:00:00Z',
      updatedAt: '2025-10-05T11:00:00Z',
      createdBy: 'admin-001',
    },
    {
      id: 'form-003',
      name: 'Expense Reimbursement',
      description: 'Submit expenses for reimbursement with receipt uploads',
      category: 'finance',
      status: 'published',
      fieldsCount: 12,
      submissions: 890,
      lastSubmission: '2026-01-23T10:45:00Z',
      createdAt: '2025-04-10T12:00:00Z',
      updatedAt: '2025-12-01T09:00:00Z',
      createdBy: 'finance-admin-001',
    },
    {
      id: 'form-004',
      name: 'Exit Interview Questionnaire',
      description: 'Comprehensive exit interview form for departing employees',
      category: 'hr',
      status: 'published',
      fieldsCount: 22,
      submissions: 67,
      lastSubmission: '2026-01-20T14:00:00Z',
      createdAt: '2025-05-20T14:00:00Z',
      updatedAt: '2025-09-15T16:30:00Z',
      createdBy: 'hr-admin-001',
    },
    {
      id: 'form-005',
      name: 'New Position Request',
      description: 'Request to open a new position or role',
      category: 'recruitment',
      status: 'draft',
      fieldsCount: 18,
      submissions: 0,
      lastSubmission: null,
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-01-20T11:00:00Z',
      createdBy: 'admin-001',
    },
  ];

  return NextResponse.json({
    success: true,
    data: forms,
    meta: { total: forms.length, published: 4, draft: 1 },
  });
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  const tenantId = user.tenantId;

  const body = await request.json();

  const newForm = {
    id: 'form-006',
    name: body.name || 'New Form',
    description: body.description || 'A new custom form',
    category: body.category || 'general',
    status: 'draft',
    fields: body.fields || [],
    fieldsCount: body.fields?.length || 0,
    settings: {
      allowMultipleSubmissions: body.settings?.allowMultipleSubmissions || false,
      requireAuthentication: body.settings?.requireAuthentication ?? true,
      notifyOnSubmission: body.settings?.notifyOnSubmission || ['admin-001'],
      approvalWorkflow: body.settings?.approvalWorkflow || null,
    },
    submissions: 0,
    lastSubmission: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin-001',
  };

  return NextResponse.json(
    { success: true, data: newForm, message: 'Form created successfully' },
    { status: 201 }
  );
});
