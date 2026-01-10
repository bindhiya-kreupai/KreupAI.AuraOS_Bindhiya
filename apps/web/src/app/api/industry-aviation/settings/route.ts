import { NextRequest, NextResponse } from 'next/server';

const mockSettings = { settingsId: 'SET-001', airlineCode: 'KAI' };

export async function GET(request: NextRequest) {
    return NextResponse.json({ settings: mockSettings });
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json({ settings: body });
}
