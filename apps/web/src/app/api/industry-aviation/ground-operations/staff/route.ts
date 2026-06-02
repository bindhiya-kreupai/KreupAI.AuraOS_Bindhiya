import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { mockGroundStaff } from '../data';

export async function GET(request: NextRequest) {
    return NextResponse.json({ groundStaff: mockGroundStaff });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    return NextResponse.json({ groundStaff: body }, { status: 201 });
}
