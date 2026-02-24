import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    const employees = await prisma.employee.findMany({
      where: {
        company: { tenantId: user.tenantId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        departmentId: true,
        jobProfileId: true,
        positionId: true,
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: {
        positions: [],
        pools: [],
        developmentPlans: [],
        talentReviews: [],
        careerPaths: [],
        emergencyPlans: [],
        employees,
        tenantId: user.tenantId,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch succession plans' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const plan = {
      ...body,
      id: `plan-${Date.now()}`,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create succession plan' },
      { status: 500 }
    );
  }
});
