import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const grades = await db.civilServiceGrade.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Failed to fetch civil service grades:', error);
    return NextResponse.json({ error: 'Failed to fetch civil service grades' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const grade = await db.civilServiceGrade.create({
      data: {
        gradeId: body.gradeId || `grade-${Date.now()}`,
        employeeId: body.employeeId,
        employeeName: body.employeeName || 'Unknown Employee',
        department: body.department,
        position: body.position,
        gradeLevel: body.gradeLevel,
        step: body.step || 1,
        series: body.series,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
        salaryInformation: body.salaryInformation || {},
        promotionEligibility: body.promotionEligibility || {},
        performanceHistory: body.performanceHistory || [],
        qualifications: body.qualifications || [],
        status: body.status || 'active',
      },
    });
    return NextResponse.json({ grade }, { status: 201 });
  } catch (error) {
    console.error('Failed to create civil service grade:', error);
    return NextResponse.json({ error: 'Failed to create civil service grade' }, { status: 500 });
  }
}
