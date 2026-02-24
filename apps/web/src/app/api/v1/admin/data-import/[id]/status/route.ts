import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const importStatus = {
    id,
    type: 'employees',
    status: 'completed',
    progress: 100,
    fileName: 'employees_bulk_import.csv',
    initiatedBy: 'admin-001',
    initiatedAt: '2026-01-23T10:00:00Z',
    completedAt: '2026-01-23T10:02:34Z',
    duration: '2m 34s',
    results: {
      totalRows: 150,
      processed: 150,
      successful: 142,
      failed: 5,
      skipped: 3,
      created: 138,
      updated: 4,
    },
    errors: [
      { row: 23, field: 'email', error: 'Invalid email format', value: 'john.doe@', action: 'skipped' },
      { row: 67, field: 'startDate', error: 'Date format invalid', value: '01/32/2026', action: 'skipped' },
      { row: 89, field: 'department', error: 'Unknown department code', value: 'INNOV', action: 'skipped' },
      { row: 112, field: 'salary', error: 'Non-numeric value', value: 'TBD', action: 'skipped' },
      { row: 134, field: 'email', error: 'Duplicate entry', value: 'existing@company.com', action: 'skipped' },
    ],
    summary: {
      newDepartmentsCreated: 0,
      newPositionsCreated: 2,
      notificationsSent: 0,
    },
    downloadUrl: '/api/v1/admin/data-import/' + id + '/report',
    rollbackAvailable: true,
    rollbackDeadline: '2026-01-24T10:02:34Z',
  };

  return NextResponse.json({ success: true, data: importStatus });
}
