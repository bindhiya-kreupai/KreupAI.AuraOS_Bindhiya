import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Mock data' });
}

export async function POST() {
    return NextResponse.json({ success: true, id: 'mock-id' });
}

export async function PUT() {
    return NextResponse.json({ success: true });
}

export async function DELETE() {
    return NextResponse.json({ success: true });
}
