import { NextRequest, NextResponse } from 'next/server';

let incidents = [
    { id: '1', type: 'Near Miss', severity: 'low', description: 'Slippery floor near Station 4', status: 'reported', date: '2024-03-10' },
    { id: '2', type: 'Equipment Failure', severity: 'medium', description: 'Overheating on Press 3', status: 'investigating', date: '2024-03-12' }
];

export async function GET(req: NextRequest) {
    return NextResponse.json(incidents);
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newIncident = { id: Math.random().toString(36).substr(2, 9), ...data, status: 'reported', date: new Date().toISOString() };
    incidents.push(newIncident);
    return NextResponse.json(newIncident);
}
