import { NextRequest, NextResponse } from 'next/server';

let lines = [
    { id: '1', name: 'Line A - Chassis', status: 'running', currentProduct: 'Model X', efficiency: 94 },
    { id: '2', name: 'Line B - Electronics', status: 'stopped', currentProduct: 'Controller V2', efficiency: 0 }
];

export async function GET(req: NextRequest) {
    return NextResponse.json(lines);
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const newLine = { id: Math.random().toString(36).substr(2, 9), ...data };
    lines.push(newLine);
    return NextResponse.json(newLine);
}
