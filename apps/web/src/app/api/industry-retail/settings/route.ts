import { NextRequest, NextResponse } from 'next/server';

let settings = {
    organizationId: 'aura-retail-001',
    commissionAutoApproval: false,
    seasonalHiringWindow: { start: '2024-10-01', end: '2025-01-31' },
    storePerformanceAlertsThreshold: 0.85
};

export async function GET(req: NextRequest) {
    return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
    const updates = await req.json();
    settings = { ...settings, ...updates };
    return NextResponse.json({ settings });
}
