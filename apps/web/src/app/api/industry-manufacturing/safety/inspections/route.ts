import { NextRequest, NextResponse } from 'next/server';
import { mockSafetyInspections } from '../../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockSafetyInspections);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body, { status: 201 });
}
