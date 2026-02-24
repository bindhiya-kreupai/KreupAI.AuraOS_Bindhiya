import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { accountId, accountType, contributionAmount, frequency, effectiveDate } = body;

    if (!accountId || contributionAmount == null) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4001',
            message: 'Fields accountId and contributionAmount are required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Fetch the account with tenant isolation
    const account = await prisma.hSAFSAAccount.findFirst({
      where: {
        id: accountId,
        tenantId: user.tenantId,
      },
    });

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4004',
            message: 'HSA/FSA account not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    if (account.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Account is ${account.status.toLowerCase()} and cannot accept contribution changes`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 422 }
      );
    }

    // Validate contribution limits
    const annualLimitNum = Number(account.annualLimit);
    const resolvedFrequency = frequency || account.contributionFrequency || 'MONTHLY';
    const periodsPerYear = resolvedFrequency.toUpperCase() === 'MONTHLY' ? 12 : 26; // monthly or per-paycheck (bi-weekly)
    const projectedAnnual = contributionAmount * periodsPerYear;

    if (projectedAnnual > annualLimitNum) {
      const maxPerPeriod = annualLimitNum / periodsPerYear;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4002',
            message: `${resolvedFrequency.toLowerCase()} contribution of $${contributionAmount.toFixed(2)} would exceed the annual limit of $${annualLimitNum.toFixed(2)} (max $${maxPerPeriod.toFixed(2)}/${resolvedFrequency.toLowerCase()})`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 422 }
      );
    }

    const previousContributionAmount = Number(account.contributionAmount);
    const previousFrequency = account.contributionFrequency;

    // Update the account contribution in a transaction
    const [updatedAccount, transaction] = await prisma.$transaction([
      prisma.hSAFSAAccount.update({
        where: { id: account.id },
        data: {
          contributionAmount: contributionAmount,
          contributionFrequency: resolvedFrequency.toUpperCase(),
        },
      }),
      prisma.hSAFSATransaction.create({
        data: {
          accountId: account.id,
          type: 'CONTRIBUTION',
          amount: contributionAmount,
          description: `Contribution change: $${previousContributionAmount.toFixed(2)} -> $${contributionAmount.toFixed(2)} (${resolvedFrequency.toLowerCase()})`,
          date: effectiveDate ? new Date(effectiveDate) : new Date(),
          status: 'COMPLETED',
        },
      }),
    ]);

    const ytdNum = Number(updatedAccount.yearToDateContributions);
    const updatedAnnualLimit = Number(updatedAccount.annualLimit);

    const data = {
      id: transaction.id,
      accountId: updatedAccount.id,
      accountType: updatedAccount.accountType,
      previousContribution: {
        amount: previousContributionAmount,
        frequency: previousFrequency.toLowerCase(),
        annualTotal: previousContributionAmount * (previousFrequency.toUpperCase() === 'MONTHLY' ? 12 : 26),
      },
      newContribution: {
        amount: contributionAmount,
        frequency: resolvedFrequency.toLowerCase(),
        annualTotal: projectedAnnual,
      },
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      annualLimit: updatedAnnualLimit,
      remainingRoom: Math.max(0, updatedAnnualLimit - ytdNum),
      confirmationNumber: `CONTRIB-${transaction.id.substring(0, 8).toUpperCase()}`,
      message: `Contribution updated successfully. New ${resolvedFrequency.toLowerCase()} contribution of $${contributionAmount.toFixed(2)} will take effect on ${effectiveDate || 'next billing cycle'}.`,
    };

    return NextResponse.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefits HSA/FSA Contribution API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to update contribution',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
