/**
 * Finance Settings API Routes
 * Finance Module - Settings Management
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/finance/settings
 * Get finance settings
 */
export async function GET(request: NextRequest) {
  try {
    const defaultSettings = {
      defaultCurrency: 'USD',
      fiscalYearStart: '01-01',
      budgetPeriod: 'annual',

      requireBudgetApproval: true,
      budgetVarianceThreshold: 10,
      allowOverspending: false,
      overspendingApprovalRequired: true,

      requireVendorApproval: true,
      vendorBackgroundCheckRequired: true,
      minimumInsuranceCoverage: 1000000,
      contractRenewalNoticeDays: 60,

      defaultPettyCashLimit: 5000,
      defaultTransactionLimit: 500,
      requirePettyCashReceipt: true,
      pettyCashApprovalThreshold: 200,
      reconciliationFrequency: 'monthly',

      defaultDepreciationMethod: 'straight_line',
      defaultUsefulLife: 5,
      assetCapitalizationThreshold: 5000,
      requireAssetTag: true,

      enableNotifications: true,
      notifyBudgetThreshold: true,
      notifyContractExpiry: true,
      notifyVendorDocExpiry: true,
      notifyPettyCashLow: true,

      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/finance/settings
 * Update finance settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      settings: {
        ...body,
        lastModified: new Date().toISOString(),
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
