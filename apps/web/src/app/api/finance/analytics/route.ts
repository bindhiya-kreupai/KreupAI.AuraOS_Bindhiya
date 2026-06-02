import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    const [totalAssets, assets] = await Promise.all([
      prisma.asset.count({ where: { tenantId: user.tenantId } }),
      prisma.asset.findMany({
        where: { tenantId: user.tenantId },
        select: {
          purchasePrice: true,
          currentValue: true,
          status: true,
        },
      }),
    ]);

    const totalAssetValue = assets.reduce(
      (sum, a) => sum + (typeof a.purchasePrice === 'number' ? a.purchasePrice : Number(a.purchasePrice || 0)),
      0
    );
    const totalDepreciation = assets.reduce(
      (sum, a) => {
        const purchase = typeof a.purchasePrice === 'number' ? a.purchasePrice : Number(a.purchasePrice || 0);
        const current = typeof a.currentValue === 'number' ? a.currentValue : Number(a.currentValue || 0);
        return sum + (purchase - current);
      },
      0
    );
    const assetsUnderMaintenance = assets.filter(a => a.status === 'IN_REPAIR').length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalBudgets: 0,
        activeBudgets: 0,
        totalBudgetAmount: 0,
        totalSpent: 0,
        totalRemaining: 0,
        averageUtilization: 0,

        favorableVariances: 0,
        unfavorableVariances: 0,
        criticalVariances: 0,
        averageVariancePercentage: 0,

        totalVendors: 0,
        activeVendors: 0,
        totalVendorSpend: 0,
        averageVendorRating: 0,
        vendorsAwaitingApproval: 0,

        activeContracts: 0,
        totalContractValue: 0,
        contractsExpiringSoon: 0,
        averageContractUtilization: 0,

        activePettyCashFunds: 0,
        totalPettyCashBalance: 0,
        pendingReconciliations: 0,
        pettyCashUtilization: 0,

        totalAssets,
        totalAssetValue,
        totalDepreciation,
        assetsUnderMaintenance,

        budgetTrends: [],
        spendingTrends: [],

        tenantId: user.tenantId,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
});
