import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const app = await prisma.educationTenureApplication.findUnique({
      where: { id: params.applicationId },
    });
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { applicationId: string } }) {
  try {
    const data = await request.json();
    const app = await prisma.educationTenureApplication.update({
      where: { id: params.applicationId },
      data,
    });
    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
