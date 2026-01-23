import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { accountId, accountType, contributionAmount, frequency, effectiveDate } = body;

  if (\!accountId || \!contributionAmount) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: 'Fields accountId and contributionAmount are required',
      },
      { status: 400 }
    );
  }

  // Validate contribution limits
  const annualLimit = accountType === 'HSA' ? 4150.0 : 3050.0;
  const monthlyLimit = annualLimit / 12;

  if (contributionAmount > monthlyLimit && frequency === 'monthly') {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: `Monthly contribution of $${contributionAmount} exceeds the maximum allowed ($${monthlyLimit.toFixed(2)}/month for ${accountType || 'this account type'})`,
      },
      { status: 422 }
    );
  }

  const mockContributionUpdate = {
    id: 'contrib-' + Date.now(),
    accountId,
    accountType: accountType || 'HSA',
    previousContribution: {
      amount: 300.0,
      frequency: 'monthly',
      annualTotal: 3600.0,
    },
    newContribution: {
      amount: contributionAmount,
      frequency: frequency || 'monthly',
      annualTotal: (contributionAmount || 0) * 12,
    },
    effectiveDate: effectiveDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'approved',
    approvedAt: new Date().toISOString(),
    annualLimit,
    remainingRoom: annualLimit - ((contributionAmount || 0) * 12),
    nextPayrollDate: '2024-12-01',
    confirmationNumber: 'CONTRIB-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    message: `Contribution updated successfully. New ${frequency || 'monthly'} contribution of $${contributionAmount} will take effect on ${effectiveDate || 'next billing cycle'}.`,
  };

  return NextResponse.json({ data: mockContributionUpdate }, { status: 200 });
}
