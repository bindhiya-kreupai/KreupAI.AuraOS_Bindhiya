import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const schedule = {
    id: 'sched-' + Date.now(),
    reportId: body.reportId || 'rpt-001',
    reportName: body.reportName || 'Monthly Headcount Summary',
    frequency: body.frequency || 'monthly',
    cronExpression: body.cronExpression || '0 6 1 * *',
    timezone: body.timezone || 'America/New_York',
    nextRun: '2026-02-01T06:00:00Z',
    recipients: body.recipients || [
      { email: 'hr-director@company.com', name: 'HR Director', format: 'pdf' },
      { email: 'ceo@company.com', name: 'CEO', format: 'xlsx' },
      { email: 'vp-people@company.com', name: 'VP People', format: 'pdf' },
    ],
    delivery: {
      method: body.deliveryMethod || 'email',
      includeAttachment: true,
      includeSummary: true,
      subject: body.subject || 'Scheduled Report: Monthly Headcount Summary',
    },
    filters: body.filters || { departments: ['all'], dateRange: 'last_month' },
    format: body.format || 'pdf',
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: 'admin-001',
    history: [
      { runDate: '2026-01-01T06:00:00Z', status: 'delivered', recipients: 3 },
      { runDate: '2025-12-01T06:00:00Z', status: 'delivered', recipients: 3 },
      { runDate: '2025-11-01T06:00:00Z', status: 'delivered', recipients: 3 },
    ],
  };

  return NextResponse.json(
    { success: true, data: schedule, message: 'Report schedule created successfully' },
    { status: 201 }
  );
}
