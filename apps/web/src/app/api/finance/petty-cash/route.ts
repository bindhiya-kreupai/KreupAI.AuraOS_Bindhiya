/**
 * Petty Cash API Routes
 * Finance Module - Petty Cash Management
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/finance/petty-cash
 * Get all petty cash funds
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    return NextResponse.json({
      success: true,
      funds: [],
      summary: {
        activeFunds: 0,
        totalBalance: 0,
        pendingReconciliations: 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch petty cash funds' }, { status: 500 });
  }
}

/**
 * POST /api/finance/petty-cash
 * Create new petty cash fund
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      fund: {
        id: `fund-${Date.now()}`,
        fundCode: `PCF-${Date.now()}`,
        ...body,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create petty cash fund' }, { status: 500 });
  }
}

/**
 * PUT /api/finance/petty-cash
 * Update petty cash fund
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Fund ID is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      fund: {
        id,
        ...body,
        lastModified: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update petty cash fund' }, { status: 500 });
  }
}
