import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for alerts
let alertsData: any[] = [];

/**
 * GET /api/industry-healthcare/alerts
 * Get all healthcare alerts
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            alerts: alertsData,
            count: alertsData.length,
        });
    } catch (error) {
        console.error('Healthcare alerts API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/industry-healthcare/alerts
 * Create a new healthcare alert
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newAlert = {
            id: `alert-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
        };

        alertsData.push(newAlert);

        return NextResponse.json({
            alert: newAlert,
        }, { status: 201 });
    } catch (error) {
        console.error('Healthcare alerts API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
