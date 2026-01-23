import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountType = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const mockHsaFsaData = {
    accounts: [
      {
        id: 'hsa-001',
        type: 'HSA',
        status: 'active',
        balance: 8450.75,
        yearToDateContributions: {
          employee: 3200.0,
          employer: 1500.0,
          total: 4700.0,
        },
        annualLimit: 4150.0,
        remainingContributionRoom: 950.0,
        investmentBalance: 5200.0,
        cashBalance: 3250.75,
        provider: 'Fidelity',
        accountNumber: '****4567',
        lastUpdated: '2024-11-15T00:00:00Z',
      },
      {
        id: 'fsa-001',
        type: 'Healthcare FSA',
        status: 'active',
        balance: 1250.0,
        yearToDateContributions: {
          employee: 2750.0,
          employer: 0,
          total: 2750.0,
        },
        annualElection: 3050.0,
        remainingElection: 300.0,
        ytdReimbursements: 1800.0,
        runoutDate: '2025-03-31',
        gracePeriodEnd: '2025-03-15',
        provider: 'WageWorks',
        accountNumber: '****8901',
        lastUpdated: '2024-11-15T00:00:00Z',
      },
      {
        id: 'fsa-002',
        type: 'Dependent Care FSA',
        status: 'active',
        balance: 2100.0,
        yearToDateContributions: {
          employee: 4500.0,
          employer: 0,
          total: 4500.0,
        },
        annualElection: 5000.0,
        remainingElection: 500.0,
        ytdReimbursements: 2400.0,
        runoutDate: '2025-03-31',
        provider: 'WageWorks',
        accountNumber: '****2345',
        lastUpdated: '2024-11-15T00:00:00Z',
      },
    ],
    recentTransactions: [
      {
        id: 'txn-001',
        accountId: 'hsa-001',
        accountType: 'HSA',
        type: 'expense',
        amount: -125.0,
        description: 'Dr. Martinez - Office Visit Copay',
        category: 'medical',
        date: '2024-11-10T14:30:00Z',
        status: 'settled',
        merchant: 'Bay Area Medical Group',
      },
      {
        id: 'txn-002',
        accountId: 'hsa-001',
        accountType: 'HSA',
        type: 'contribution',
        amount: 400.0,
        description: 'Payroll Contribution',
        category: 'contribution',
        date: '2024-11-01T00:00:00Z',
        status: 'settled',
        source: 'payroll',
      },
      {
        id: 'txn-003',
        accountId: 'fsa-001',
        accountType: 'Healthcare FSA',
        type: 'reimbursement',
        amount: -250.0,
        description: 'Prescription - CVS Pharmacy',
        category: 'pharmacy',
        date: '2024-11-08T16:45:00Z',
        status: 'settled',
        merchant: 'CVS Pharmacy',
      },
      {
        id: 'txn-004',
        accountId: 'fsa-002',
        accountType: 'Dependent Care FSA',
        type: 'reimbursement',
        amount: -600.0,
        description: 'Sunshine Daycare - November',
        category: 'daycare',
        date: '2024-11-05T09:00:00Z',
        status: 'pending',
        merchant: 'Sunshine Daycare Center',
      },
      {
        id: 'txn-005',
        accountId: 'hsa-001',
        accountType: 'HSA',
        type: 'expense',
        amount: -45.0,
        description: 'Prescription - Generic Medication',
        category: 'pharmacy',
        date: '2024-10-28T11:20:00Z',
        status: 'settled',
        merchant: 'Walgreens',
      },
    ],
    pagination: {
      page,
      limit,
      total: 5,
      totalPages: 1,
    },
  };

  return NextResponse.json({ data: mockHsaFsaData });
}
