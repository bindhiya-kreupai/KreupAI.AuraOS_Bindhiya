import { NextRequest, NextResponse } from 'next/server';
import { mockEquipment } from '../data';

export async function GET(request: NextRequest) {
    return NextResponse.json({ equipment: mockEquipment });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json({ equipment: body }, { status: 201 });
}
