import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = await db.rosterTemplate.create({
      data: {
        templateId: body.templateId || `tmpl-${Date.now()}`,
        name: body.name,
        description: body.description || '',
        department: body.department,
        weeks: body.weeks || [],
      },
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Failed to create roster template:', error);
    return NextResponse.json({ error: 'Failed to create roster template' }, { status: 500 });
  }
}
