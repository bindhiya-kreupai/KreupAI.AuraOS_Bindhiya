import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

// GET - Fetch skill gap analyses for the learning module
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (employeeId) {
      where.targetType = 'Employee';
      where.targetId = employeeId;
    }

    const gapAnalyses = await prisma.gapAnalysis.findMany({
      where,
      include: {
        items: {
          include: {
            competency: {
              include: {
                category: true,
                developmentResources: true,
              },
            },
            currentLevel: true,
            targetLevel: true,
          },
          orderBy: [{ priority: 'asc' }, { gapScore: 'desc' }],
        },
      },
      orderBy: { analysisDate: 'desc' },
    });

    // Transform into the format expected by the learning skill-gap-analysis page:
    // { id, employeeName, jobRoleTitle, skills: [{ skillName, gap }], recommendedCourses }
    const transformed = gapAnalyses.map((analysis) => {
      const skills = analysis.items.map((item) => ({
        skillId: item.competencyId,
        skillName: item.competency?.name || 'Unknown Skill',
        requiredLevel: item.targetLevel?.name?.toLowerCase() || 'intermediate',
        currentLevel: item.currentLevel?.name?.toLowerCase() || 'beginner',
        gap: item.gapScore,
        priority: item.priority?.toLowerCase() || 'medium',
      }));

      // Gather recommended courses from development resources on each competency
      const recommendedCourses: string[] = [];
      for (const item of analysis.items) {
        const resources = item.competency?.developmentResources || [];
        for (const resource of resources) {
          if (resource.type === 'Course' && !recommendedCourses.includes(resource.title)) {
            recommendedCourses.push(resource.title);
          }
        }
      }

      return {
        id: analysis.id,
        employeeId: analysis.targetType === 'Employee' ? analysis.targetId : null,
        employeeName: analysis.targetType === 'Employee' ? analysis.name : null,
        jobRoleId: null,
        jobRoleTitle: analysis.name,
        assessmentDate: analysis.analysisDate.toISOString(),
        skills,
        recommendedCourses,
        developmentPlan: null,
        status: analysis.status?.toLowerCase() || 'completed',
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error('Error fetching skill gap analyses:', error);
    return NextResponse.json([]);
  }
}

// POST - Create a new skill gap analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeName, jobRoleTitle, skills = [], createdBy = 'system' } = body;

    const code = `SGA-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    const gapAnalysis = await prisma.gapAnalysis.create({
      data: {
        code,
        name: employeeName || jobRoleTitle || 'Skill Gap Analysis',
        type: 'Individual',
        targetType: 'Employee',
        targetId: body.employeeId || null,
        createdBy,
        items: {
          create: skills
            .filter((s: any) => s.competencyId && s.currentLevelId && s.targetLevelId)
            .map((skill: any) => ({
              competencyId: skill.competencyId,
              currentLevelId: skill.currentLevelId,
              targetLevelId: skill.targetLevelId,
              gapScore: skill.gap || 0,
              priority: skill.priority || 'Medium',
              notes: skill.notes,
            })),
        },
      },
      include: {
        items: {
          include: {
            competency: true,
            currentLevel: true,
            targetLevel: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: gapAnalysis.id,
      employeeName: gapAnalysis.name,
      jobRoleTitle: gapAnalysis.name,
      skills: gapAnalysis.items.map((item) => ({
        skillId: item.competencyId,
        skillName: item.competency?.name || 'Unknown',
        gap: item.gapScore,
        priority: item.priority?.toLowerCase() || 'medium',
      })),
      recommendedCourses: [],
      status: gapAnalysis.status?.toLowerCase() || 'active',
      createdAt: gapAnalysis.createdAt.toISOString(),
      updatedAt: gapAnalysis.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creating skill gap analysis:', error);
    return NextResponse.json({ error: 'Failed to create skill gap analysis' }, { status: 500 });
  }
}
