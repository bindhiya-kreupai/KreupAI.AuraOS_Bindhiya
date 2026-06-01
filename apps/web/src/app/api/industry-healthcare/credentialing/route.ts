import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for mock data
let credentialingData: any[] = [];

/**
 * GET /api/industry-healthcare/credentialing
 * Get all healthcare providers for credentialing
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            providers: credentialingData,
            count: credentialingData.length,
        });
    } catch (error: any) {
        console.error('Healthcare credentialing API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/industry-healthcare/credentialing
 * Create a new healthcare provider
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newProvider = {
            id: `provider-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        credentialingData.push(newProvider);

        return NextResponse.json({
            provider: newProvider,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Healthcare credentialing API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
