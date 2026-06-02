import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { mockAlerts } from '../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockAlerts);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body, { status: 201 });
}
