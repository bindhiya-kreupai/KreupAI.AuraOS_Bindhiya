import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for healthcare settings
let healthcareSettings: any = null;

/**
 * GET /api/industry-healthcare/settings
 * Get healthcare module settings
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            settings: healthcareSettings,
        });
    } catch (error) {
        console.error('Healthcare settings API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/industry-healthcare/settings
 * Update healthcare module settings
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        healthcareSettings = {
            ...healthcareSettings,
            ...body,
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({
            settings: healthcareSettings,
        });
    } catch (error) {
        console.error('Healthcare settings API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
