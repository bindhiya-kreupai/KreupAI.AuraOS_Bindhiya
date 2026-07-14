import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const rosters = await prisma.automotiveTechnicianRoster.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ rosters });
  } catch (error) {
    console.error('Automotive technician roster API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const roster = await prisma.automotiveTechnicianRoster.create({
      data: {
        bay: body.bay,
        tech: body.tech,
        job: body.job,
        time: body.time,
        status: body.status,
        skill: body.skill,
      },
    });

    return NextResponse.json({ roster }, { status: 201 });
  } catch (error) {
    console.error('Create automotive technician roster API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
