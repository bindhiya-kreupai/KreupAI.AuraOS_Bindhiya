import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest, { params }: { params: { grantId: string } }) {
  try {
    const grant = await prisma.educationResearchGrant.findUnique({
      where: { id: params.grantId },
    });
    if (!grant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(grant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { grantId: string } }) {
  try {
    const data = await request.json();
    const grant = await prisma.educationResearchGrant.update({
      where: { id: params.grantId },
      data,
    });
    return NextResponse.json(grant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { grantId: string } }) {
  try {
    const grant = await prisma.educationResearchGrant.delete({
      where: { id: params.grantId },
    });
    return NextResponse.json(grant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
