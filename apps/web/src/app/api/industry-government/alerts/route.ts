import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ alerts: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    {
      alert: {
        ...body,
        alertId: body.alertId || `alt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}
