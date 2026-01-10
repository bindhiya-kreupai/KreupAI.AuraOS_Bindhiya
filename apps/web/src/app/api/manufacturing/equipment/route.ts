import { NextRequest, NextResponse } from 'next/server';

let equipment = [
    { id: '1', name: 'CNC Machine Alpha', type: 'Milling', status: 'operational', lastMaintenance: '2024-01-15' },
    { id: '2', name: 'Robotic Arm 7', type: 'Assembly', status: 'warning', lastMaintenance: '2024-02-20' }
];

export async function GET(req: NextRequest) {
    return NextResponse.json(equipment); // Manufacturing service expects raw array
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newItem = { id: Math.random().toString(36).substr(2, 9), ...data };
    equipment.push(newItem);
    return NextResponse.json(newItem);
}
