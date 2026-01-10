import { NextRequest, NextResponse } from 'next/server';

let pilots = [
    { id: '1', name: 'Capt. Sully', rank: 'Captain', flightHours: 15000, status: 'active' },
    { id: '2', name: 'Maverick', rank: 'First Officer', flightHours: 2500, status: 'training' }
];

export async function GET(req: NextRequest) {
    const { pathname } = new URL(req.url);
    if (pathname.includes('/pilots')) {
        return NextResponse.json({ pilots });
    }
    return NextResponse.json({ pilots });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newPilot = { id: Math.random().toString(36).substr(2, 9), ...data };
    pilots.push(newPilot);
    return NextResponse.json({ pilot: newPilot });
}
