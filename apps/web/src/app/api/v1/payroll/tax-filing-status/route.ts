/**
 * @api GET /api/v1/payroll/tax-filing-status
 * @description Get tax filing status for payroll tax obligations
 */

import { NextRequest, NextResponse } from 'next/server';

interface TaxFiling {
  id: string;
  filingType: string;
  jurisdiction: string;
  jurisdictionLevel: 'federal' | 'state' | 'local';
  period: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: 'filed' | 'pending' | 'overdue' | 'not_due' | 'extension_filed';
  amountDue: number;
  amountPaid: number;
  filedAt: string | null;
  confirmationNumber: string | null;
  penaltyAmount: number;
  notes: string | null;
}

interface TaxFilingStatusResponse {
  filings: TaxFiling[];
  summary: {
    totalFilings: number;
    filed: number;
    pending: number;
    overdue: number;
    totalAmountDue: number;
    totalAmountPaid: number;
    totalPenalties: number;
    nextDueDate: string | null;
  };
  upcomingDeadlines: Array<{
    filingType: string;
    jurisdiction: string;
    dueDate: string;
    daysUntilDue: number;
    estimatedAmount: number;
  }>;
}

const mockFilings: TaxFiling[] = [
  {
    id: 'filing-001',
    filingType: 'Form 941 (Quarterly)',
    jurisdiction: 'Federal',
    jurisdictionLevel: 'federal',
    period: 'Q4 2025',
    periodStart: '2025-10-01',
    periodEnd: '2025-12-31',
    dueDate: '2026-01-31',
    status: 'filed',
    amountDue: 245000,
    amountPaid: 245000,
    filedAt: '2026-01-15T10:00:00Z',
    confirmationNumber: 'IRS-941-2025Q4-001',
    penaltyAmount: 0,
    notes: null,
  },
  {
    id: 'filing-002',
    filingType: 'Form 940 (Annual FUTA)',
    jurisdiction: 'Federal',
    jurisdictionLevel: 'federal',
    period: '2025',
    periodStart: '2025-01-01',
    periodEnd: '2025-12-31',
    dueDate: '2026-01-31',
    status: 'filed',
    amountDue: 18900,
    amountPaid: 18900,
    filedAt: '2026-01-20T09:00:00Z',
    confirmationNumber: 'IRS-940-2025-001',
    penaltyAmount: 0,
    notes: null,
  },
  {
    id: 'filing-003',
    filingType: 'State Withholding (DE 9)',
    jurisdiction: 'California',
    jurisdictionLevel: 'state',
    period: 'Q4 2025',
    periodStart: '2025-10-01',
    periodEnd: '2025-12-31',
    dueDate: '2026-01-31',
    status: 'filed',
    amountDue: 89500,
    amountPaid: 89500,
    filedAt: '2026-01-18T14:00:00Z',
    confirmationNumber: 'CA-DE9-2025Q4-001',
    penaltyAmount: 0,
    notes: null,
  },
  {
    id: 'filing-004',
    filingType: 'State Unemployment (DE 6)',
    jurisdiction: 'California',
    jurisdictionLevel: 'state',
    period: 'Q4 2025',
    periodStart: '2025-10-01',
    periodEnd: '2025-12-31',
    dueDate: '2026-01-31',
    status: 'pending',
    amountDue: 34200,
    amountPaid: 0,
    filedAt: null,
    confirmationNumber: null,
    penaltyAmount: 0,
    notes: 'Awaiting final UI rate confirmation',
  },
  {
    id: 'filing-005',
    filingType: 'Form 941 (Quarterly)',
    jurisdiction: 'Federal',
    jurisdictionLevel: 'federal',
    period: 'Q1 2026',
    periodStart: '2026-01-01',
    periodEnd: '2026-03-31',
    dueDate: '2026-04-30',
    status: 'not_due',
    amountDue: 0,
    amountPaid: 0,
    filedAt: null,
    confirmationNumber: null,
    penaltyAmount: 0,
    notes: null,
  },
  {
    id: 'filing-006',
    filingType: 'Local Payroll Tax',
    jurisdiction: 'San Francisco',
    jurisdictionLevel: 'local',
    period: 'Q4 2025',
    periodStart: '2025-10-01',
    periodEnd: '2025-12-31',
    dueDate: '2026-01-15',
    status: 'overdue',
    amountDue: 12800,
    amountPaid: 0,
    filedAt: null,
    confirmationNumber: null,
    penaltyAmount: 640,
    notes: 'Filing delayed due to rate recalculation',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jurisdiction = searchParams.get('jurisdiction');
  const status = searchParams.get('status');
  const year = searchParams.get('year') || '2025';

  let filtered = [...mockFilings];

  if (jurisdiction) {
    filtered = filtered.filter((f) =>
      f.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((f) => f.status === status);
  }

  const now = new Date();
  const summary = {
    totalFilings: filtered.length,
    filed: filtered.filter((f) => f.status === 'filed').length,
    pending: filtered.filter((f) => f.status === 'pending').length,
    overdue: filtered.filter((f) => f.status === 'overdue').length,
    totalAmountDue: filtered.reduce((sum, f) => sum + f.amountDue, 0),
    totalAmountPaid: filtered.reduce((sum, f) => sum + f.amountPaid, 0),
    totalPenalties: filtered.reduce((sum, f) => sum + f.penaltyAmount, 0),
    nextDueDate: filtered
      .filter((f) => f.status === 'pending' || f.status === 'not_due')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || null,
  };

  const upcomingDeadlines = filtered
    .filter((f) => ['pending', 'not_due'].includes(f.status))
    .map((f) => ({
      filingType: f.filingType,
      jurisdiction: f.jurisdiction,
      dueDate: f.dueDate,
      daysUntilDue: Math.max(0, Math.ceil((new Date(f.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      estimatedAmount: f.amountDue || 25000,
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const response: TaxFilingStatusResponse = {
    filings: filtered,
    summary,
    upcomingDeadlines,
  };

  return NextResponse.json({ data: response });
}
