import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { alertId: string } }) {
  const body = await request.json();
  return NextResponse.json({
    alert: {
      ...body,
      alertId: params.alertId,
    },
  });
}
