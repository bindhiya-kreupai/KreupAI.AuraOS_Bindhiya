import { NextRequest, NextResponse } from 'next/server';

const mockAlerts = [];

export async function GET(request: NextRequest) {
    return NextResponse.json({ alerts: mockAlerts });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json({ alert: body }, { status: 201 });
}
