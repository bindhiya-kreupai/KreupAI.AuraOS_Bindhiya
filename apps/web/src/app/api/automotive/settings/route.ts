import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
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
});

export const PUT = createProtectedRoute(async (request: Request) => {
  const body = await request.json();
  return NextResponse.json({ settings: body });
});
