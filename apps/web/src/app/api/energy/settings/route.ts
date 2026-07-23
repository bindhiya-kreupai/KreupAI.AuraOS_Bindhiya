import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    settings: {
      settingsId: 'energy-settings-1',
      organizationId: 'org-1',
      smartGridSettings: {
        pollingInterval: 15,
        peakDemandThreshold: 1000,
        enableAutoLoadShedding: true,
      },
      waterSettings: {
        leakDetectionSensitivity: 'medium',
        autoShutoffEnabled: false,
        conservationGoalPercentage: 15,
      },
      billingSettings: {
        defaultCurrency: 'USD',
        autoPayEnabled: false,
        alertOnBudgetExceeded: true,
      },
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json(body);
}
