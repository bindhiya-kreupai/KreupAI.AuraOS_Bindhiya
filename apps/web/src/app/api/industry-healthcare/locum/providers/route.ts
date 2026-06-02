import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

// In-memory storage for locum providers
const locumProviders: any[] = [];

/**
 * GET /api/industry-healthcare/locum/providers
 * Get all locum providers
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            providers: locumProviders,
            count: locumProviders.length,
        });
    } catch (error: any) {
        console.error('Locum providers API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/industry-healthcare/locum/providers
 * Create a new locum provider
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newProvider = {
            id: `locum-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
        };

        locumProviders.push(newProvider);

        return NextResponse.json({
            provider: newProvider,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Locum providers API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
