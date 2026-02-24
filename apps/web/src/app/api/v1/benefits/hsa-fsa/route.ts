import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const accountType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const employeeId = searchParams.get('employeeId') || context.employeeId;

    const skip = (page - 1) * limit;

    // Build where clause with tenant isolation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accountWhere: any = { tenantId: user.tenantId };
    if (accountType) {
      accountWhere.accountType = accountType.toUpperCase();
    }
    if (employeeId) {
      accountWhere.employeeId = employeeId;
    }

    const [accounts, totalAccounts] = await Promise.all([
      prisma.hSAFSAAccount.findMany({
        where: accountWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      }),
      prisma.hSAFSAAccount.count({ where: accountWhere }),
    ]);

    // Fetch recent transactions for all returned accounts
    const accountIds = accounts.map((a) => a.id);
    const recentTransactions = accountIds.length > 0
      ? await prisma.hSAFSATransaction.findMany({
          where: {
            accountId: { in: accountIds },
          },
          orderBy: { date: 'desc' },
          take: 20,
        })
      : [];

    // Map accounts to API response shape
    const mappedAccounts = accounts.map((account) => {
      const balanceNum = Number(account.balance);
      const ytdNum = Number(account.yearToDateContributions);
      const annualLimitNum = Number(account.annualLimit);
      const investmentNum = Number(account.investmentBalance);
      const cashNum = Number(account.cashBalance);
      const contributionNum = Number(account.contributionAmount);

      return {
        id: account.id,
        type: account.accountType,
        status: account.status.toLowerCase(),
        balance: balanceNum,
        yearToDateContributions: {
          employee: ytdNum,
          employer: 0,
          total: ytdNum,
        },
        annualLimit: annualLimitNum,
        remainingContributionRoom: Math.max(0, annualLimitNum - ytdNum),
        investmentBalance: investmentNum,
        cashBalance: cashNum,
        planYear: account.planYear,
        contributionAmount: contributionNum,
        contributionFrequency: account.contributionFrequency.toLowerCase(),
        employeeName: account.employee
          ? `${account.employee.firstName} ${account.employee.lastName}`.trim()
          : null,
        employeeCode: account.employee?.employeeCode ?? null,
        lastUpdated: account.updatedAt.toISOString(),
      };
    });

    // Map transactions to API response shape
    const mappedTransactions = recentTransactions.map((txn) => {
      const amountNum = Number(txn.amount);
      return {
        id: txn.id,
        accountId: txn.accountId,
        accountType: accounts.find((a) => a.id === txn.accountId)?.accountType ?? null,
        type: txn.type.toLowerCase(),
        amount: amountNum,
        description: txn.description,
        date: txn.date.toISOString(),
        status: txn.status.toLowerCase(),
      };
    });

    const data = {
      accounts: mappedAccounts,
      recentTransactions: mappedTransactions,
      pagination: {
        page,
        limit,
        total: totalAccounts,
        totalPages: Math.ceil(totalAccounts / limit),
      },
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
    console.error('[Benefits HSA/FSA API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch HSA/FSA accounts',
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
