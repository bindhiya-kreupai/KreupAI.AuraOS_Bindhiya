import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    settings: {
      settingsId: 'auto-settings-1',
      organizationId: 'org-1',
      rosteringSettings: {
        maxHoursPerWeek: 40,
        minRestHours: 12,
        allowShiftSwaps: true,
        requireManagerApprovalForSwaps: true,
      },
      commissionSettings: {
        paymentFrequency: 'monthly',
        calculationMethod: 'tiered',
        includeBonusesInBase: false,
        minimumSalesThreshold: 50000,
      },
      inventorySettings: {
        autoReorderEnabled: true,
        defaultReorderQuantity: 10,
        lowStockAlertThreshold: 20,
        trackPartLocations: true,
      },
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ settings: body });
}
