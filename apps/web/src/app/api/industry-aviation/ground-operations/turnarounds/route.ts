import { NextRequest, NextResponse } from 'next/server';
import { mockTurnarounds } from '../data';

export async function GET(request: NextRequest) {
    return NextResponse.json({ turnarounds: mockTurnarounds });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json({ turnaround: body }, { status: 201 });
}
