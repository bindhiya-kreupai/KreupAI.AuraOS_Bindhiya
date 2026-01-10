import { NextRequest, NextResponse } from 'next/server';

let plans = [
    { id: '1', name: 'Standard Sales Plan', rate: 0.05, threshold: 5000, type: 'percentage' },
    { id: '2', name: 'High Performer Tier', rate: 0.08, threshold: 20000, type: 'tier' }
];

export async function GET(req: NextRequest) {
    return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newPlan = {
        id: Math.random().toString(36).substr(2, 9),
        ...data
    };
    plans.push(newPlan);
    return NextResponse.json({ plan: newPlan });
}
