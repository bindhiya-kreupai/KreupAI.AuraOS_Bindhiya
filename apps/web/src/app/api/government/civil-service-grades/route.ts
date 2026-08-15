import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const grades = await db.civilServiceGrade.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(grades);
  } catch (error) {
    console.error('Failed to fetch civil service grades:', error);
    return NextResponse.json({ error: 'Failed to fetch civil service grades' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Business logic for salary calculation
    const baseSalary = parseFloat(body.baseSalary) || 89033;
    const localityPayPercentage = 32.49;
    const totalAnnualSalary = baseSalary * (1 + localityPayPercentage / 100);
    const hourlyRate = totalAnnualSalary / 2080;

    const salaryInformation = body.salaryInformation || {
      annualBaseSalary: baseSalary,
      locality: 'Washington-Baltimore-Arlington, DC-MD-VA-WV-PA',
      localityPayPercentage,
      totalAnnualSalary: Math.round(totalAnnualSalary),
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      overtimeRate: Math.round(hourlyRate * 1.5 * 100) / 100,
      nightDifferential: Math.round(hourlyRate * 1.1 * 100) / 100,
    };

    const promotionEligibility = body.promotionEligibility || {};
    const performanceHistory = body.performanceHistory || [];
    const qualifications = body.qualifications || [];

    const grade = await db.civilServiceGrade.create({
      data: {
        gradeId: body.gradeId || `grade-${Date.now()}`,
        employeeId: body.employeeId || `emp-${Date.now()}`,
        employeeName: body.employeeName || 'New Employee',
        department: body.department || 'Department of Defense',
        position: body.position || 'Program Analyst',
        gradeLevel: body.gradeLevel || 'GS-12',
        step: parseInt(body.step) || 1,
        series: body.series || '0343',
        effectiveDate: new Date().toISOString(),
        salaryInformation,
        promotionEligibility,
        performanceHistory,
        qualifications,
        status: body.status || 'active',
      },
    });

    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    console.error('Failed to create civil service grade:', error);
    return NextResponse.json({ error: 'Failed to create civil service grade' }, { status: 500 });
  }
}
