import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const savedReports = [
    {
      id: 'rpt-001',
      name: 'Monthly Headcount Summary',
      description: 'Departmental headcount with YoY comparison',
      type: 'headcount',
      createdBy: 'admin-001',
      createdAt: '2025-08-15T10:00:00Z',
      lastRun: '2026-01-01T06:00:00Z',
      schedule: 'monthly',
      format: 'xlsx',
      filters: { departments: ['all'], dateRange: 'last_12_months' },
      columns: ['department', 'headcount', 'new_hires', 'separations', 'net_change'],
    },
    {
      id: 'rpt-002',
      name: 'Diversity Quarterly Report',
      description: 'DEI metrics across all dimensions',
      type: 'diversity',
      createdBy: 'hr-director-001',
      createdAt: '2025-06-01T12:00:00Z',
      lastRun: '2025-12-31T06:00:00Z',
      schedule: 'quarterly',
      format: 'pdf',
      filters: { departments: ['all'], locations: ['all'] },
      columns: ['gender', 'ethnicity', 'age_group', 'level', 'department'],
    },
    {
      id: 'rpt-003',
      name: 'Compensation Equity Analysis',
      description: 'Pay equity analysis by gender and ethnicity',
      type: 'compensation',
      createdBy: 'comp-analyst-001',
      createdAt: '2025-09-20T14:00:00Z',
      lastRun: '2025-12-15T08:00:00Z',
      schedule: 'on-demand',
      format: 'xlsx',
      filters: { departments: ['Engineering', 'Product', 'Sales'], levels: ['all'] },
      columns: ['role', 'level', 'gender', 'ethnicity', 'salary', 'comp_ratio', 'market_position'],
    },
    {
      id: 'rpt-004',
      name: 'Attrition Risk Dashboard',
      description: 'High-risk employees with recommended interventions',
      type: 'predictive',
      createdBy: 'hr-bp-001',
      createdAt: '2025-11-10T09:00:00Z',
      lastRun: '2026-01-22T06:00:00Z',
      schedule: 'weekly',
      format: 'csv',
      filters: { riskLevel: ['high', 'medium'], departments: ['all'] },
      columns: ['employee_id', 'department', 'tenure', 'risk_score', 'factors', 'recommended_actions'],
    },
  ];

  return NextResponse.json({
    success: true,
    data: savedReports,
    meta: { total: savedReports.length },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const reportResult = {
    executionId: 'exec-' + Date.now(),
    reportName: body.name || 'Custom Report',
    type: body.type || 'custom',
    status: 'completed',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    duration: '2.4s',
    rowCount: 156,
    filters: body.filters || {},
    columns: body.columns || [],
    data: [
      { department: 'Engineering', headcount: 342, avgTenure: 2.8, avgSalary: 145000, turnoverRate: 12.5 },
      { department: 'Sales', headcount: 215, avgTenure: 2.1, avgSalary: 118000, turnoverRate: 18.6 },
      { department: 'Marketing', headcount: 128, avgTenure: 3.2, avgSalary: 108000, turnoverRate: 11.7 },
      { department: 'Product', headcount: 95, avgTenure: 2.5, avgSalary: 140000, turnoverRate: 10.2 },
      { department: 'Finance', headcount: 104, avgTenure: 4.1, avgSalary: 125000, turnoverRate: 8.6 },
    ],
    exportUrl: '/api/v1/analytics/reports/custom/exec-001/download',
    format: body.format || 'json',
  };

  return NextResponse.json({ success: true, data: reportResult });
}
