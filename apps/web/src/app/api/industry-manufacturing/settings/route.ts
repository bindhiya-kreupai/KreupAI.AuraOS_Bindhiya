import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { mockSettings } from '../data';

export async function GET(request: NextRequest) {
    return NextResponse.json(mockSettings);
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json(body);
}
