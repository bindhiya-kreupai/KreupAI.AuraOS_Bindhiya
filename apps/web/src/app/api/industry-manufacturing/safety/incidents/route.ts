import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { mockSafetyIncidents } from '../../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockSafetyIncidents);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body, { status: 201 });
}
