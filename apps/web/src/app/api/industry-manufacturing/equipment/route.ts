import { NextRequest, NextResponse } from 'next/server';
import { mockEquipment } from '../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockEquipment);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body, { status: 201 });
}
