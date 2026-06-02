import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { mockSchedules } from '../../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockSchedules);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body, { status: 201 });
}
