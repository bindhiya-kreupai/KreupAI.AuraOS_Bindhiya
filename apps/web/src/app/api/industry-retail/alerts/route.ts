import { NextRequest, NextResponse } from 'next/server';

let alerts = [
    { id: '1', type: 'performance', severity: 'high', title: 'Low Inventory', message: 'Store 1 is below threshold for key items.', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', type: 'hiring', severity: 'medium', title: 'Hiring Target', message: 'Store 2 is 20% behind on seasonal hiring.', status: 'active', createdAt: new Date().toISOString() }
];

export async function GET(req: NextRequest) {
    return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newAlert = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    alerts.push(newAlert);
    return NextResponse.json({ alert: newAlert });
}
