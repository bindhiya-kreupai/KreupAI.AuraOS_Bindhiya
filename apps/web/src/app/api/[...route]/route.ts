
import { NextRequest, NextResponse } from 'next/server';
import { getMockData } from '@/lib/mock-registry';

/**
 * Universal Mock Handler
 * Intercepts all unhandled API requests and attempts to serve data from the Mock Registry.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const routePath = params.route;
    const mockData = getMockData(routePath);

    if (mockData) {
        console.log(`[Mock API] Serving mock data for: /api/${routePath.join('/')}`);
        return NextResponse.json(mockData);
    }

    // Fallback for completely unknown routes
    console.warn(`[Mock API] No mock data found for: /api/${routePath.join('/')}`);
    return NextResponse.json(
        { error: `Mock endpoint not found: /api/${routePath.join('/')}`, valid: false },
        { status: 404 }
    );
}

export async function POST(
    request: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const routePath = params.route;
    const body = await request.json().catch(() => ({}));

    console.log(`[Mock API] POST received for: /api/${routePath.join('/')}`, body);

    // Generic success response for write operations
    return NextResponse.json(
        { success: true, message: 'Mock action completed', data: body },
        { status: 201 }
    );
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const routePath = params.route;
    const body = await request.json().catch(() => ({}));

    console.log(`[Mock API] PUT received for: /api/${routePath.join('/')}`, body);

    return NextResponse.json(
        { success: true, message: 'Mock update completed', data: body },
        { status: 200 }
    );
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const routePath = params.route;
    console.log(`[Mock API] DELETE received for: /api/${routePath.join('/')}`);

    return NextResponse.json(
        { success: true, message: 'Mock deletion completed' },
        { status: 200 }
    );
}
