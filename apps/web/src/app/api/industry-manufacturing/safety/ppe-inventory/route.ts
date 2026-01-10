import { NextRequest, NextResponse } from 'next/server';
import { mockPPE } from '../../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockPPE);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body, { status: 201 });
}
