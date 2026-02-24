import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const importJob = {
    id: 'import-' + Date.now(),
    type: body.type || 'employees',
    status: 'processing',
    fileName: body.fileName || 'employees_bulk_import.csv',
    fileSize: body.fileSize || '2.4MB',
    format: body.format || 'csv',
    initiatedBy: 'admin-001',
    initiatedAt: new Date().toISOString(),
    options: {
      skipDuplicates: body.options?.skipDuplicates ?? true,
      updateExisting: body.options?.updateExisting ?? false,
      validateOnly: body.options?.validateOnly ?? false,
      notifyNewEmployees: body.options?.notifyNewEmployees ?? false,
      mapping: body.options?.mapping || {
        'First Name': 'firstName',
        'Last Name': 'lastName',
        'Email': 'email',
        'Department': 'department',
        'Position': 'position',
        'Start Date': 'startDate',
        'Salary': 'salary',
      },
    },
    preview: {
      totalRows: 150,
      validRows: 142,
      errorRows: 5,
      warningRows: 3,
      sampleErrors: [
        { row: 23, field: 'email', error: 'Invalid email format', value: 'john.doe@' },
        { row: 67, field: 'startDate', error: 'Date in past', value: '2020-01-01' },
        { row: 89, field: 'department', error: 'Unknown department', value: 'Innovations' },
      ],
      sampleWarnings: [
        { row: 12, field: 'salary', warning: 'Below range for position', value: '35000' },
        { row: 45, field: 'email', warning: 'Possible duplicate', value: 'jane.smith@company.com' },
      ],
    },
    estimatedDuration: '2-3 minutes',
    statusUrl: '/api/v1/admin/data-import/import-001/status',
  };

  return NextResponse.json(
    { success: true, data: importJob, message: 'Import job started successfully' },
    { status: 201 }
  );
}
