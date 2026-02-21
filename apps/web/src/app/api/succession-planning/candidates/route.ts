import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    let candidates: any[] = [];

    try {
      const employees = await prisma.employee.findMany({
        where: { tenantId: user.tenantId },
        take: 20,
      });

      candidates = employees.map((emp: any, index: number) => ({
        id: `cand-${emp.id}`,
        candidateId: emp.id,
        candidateName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Candidate ${index + 1}`,
        currentPositionId: emp.positionId || '',
        currentPositionTitle: emp.jobTitle || 'Staff',
        targetPositionId: '',
        targetPositionTitle: '',
        successorType: 'backup',
        readinessLevel: 'ready_2_3_years',
        status: 'in_development',
        performanceRating: 'solid',
        potentialRating: 'medium',
        talentCategory: 'core_contributor',
        currentExperience: 0,
        gapAnalysis: [],
        strengths: [],
        developmentNeeds: [],
        riskFactors: [],
        mobilityWillingness: 'medium',
        relocationWillingness: false,
        retentionRisk: 'low',
        nominatedBy: 'System',
        nominatedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tenantId: user.tenantId,
      }));
    } catch {
      candidates = [];
    }

    return NextResponse.json(
      { success: true, data: { candidates } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching succession candidates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const candidate = {
      ...body,
      id: `cand-${Date.now()}`,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: { candidate } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
