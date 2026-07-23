import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    settingsId: 'fin-settings-1',
    organizationId: 'org-1',
    bankingSettings: {
      overdraftProtection: true,
      minimumBalanceAlerts: true,
      fraudMonitoring: true,
      transactionLimits: { daily: 10000, weekly: 50000, monthly: 200000 },
    },
    insuranceSettings: {
      claimAutoAssignment: true,
      fraudDetectionEnabled: true,
      claimApprovalThreshold: 5000,
      investigationThreshold: 20000,
    },
    wealthSettings: {
      autoRebalancing: false,
      riskToleranceAlerts: true,
      taxLossHarvesting: true,
      tradeApprovalThreshold: 50000,
    },
    complianceSettings: {
      automatedScreening: true,
      screeningFrequency: 'daily',
      kycRefreshPeriod: 12, // months
      sarFilingThreshold: 10000,
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json(body);
}
