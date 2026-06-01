import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import { withEnhancedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('performance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing performance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    // Fetch skill assessments with their competency details and results
    const assessments = await prisma.skillAssessment.findMany({
      where,
      include: {
        jobRole: {
          include: {
            competencyMappings: {
              include: {
                competency: {
                  include: { category: true },
                },
                requiredLevel: true,
              },
            },
          },
        },
        competencies: {
          include: {
            competency: {
              include: { category: true },
            },
          },
        },
        results: {
          include: { ratingLevel: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (assessments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          assessments: [],
          skillCategories: [],
          recommendations: [],
          teamAnalysis: null,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    // Build skills data by grouping competencies by category
    const categoryMap = new Map<
      string,
      {
        category: string;
        skills: { name: string; currentLevel: number; requiredLevel: number; gap: number }[];
      }
    >();

    for (const assessment of assessments) {
      // Build a map of competencyId -> latest rating level number
      const resultMap = new Map<string, number>();
      for (const result of assessment.results) {
        resultMap.set(result.competencyId, result.ratingLevel.levelNumber);
      }

      // Build a map of competencyId -> required level from job role mappings
      const requiredMap = new Map<string, number>();
      if (assessment.jobRole?.competencyMappings) {
        for (const mapping of assessment.jobRole.competencyMappings) {
          requiredMap.set(mapping.competencyId, mapping.requiredLevel.levelNumber);
        }
      }

      // Process each competency in the assessment
      for (const assessmentComp of assessment.competencies) {
        const comp = assessmentComp.competency;
        const categoryName = comp.category?.name || 'Uncategorized';
        const currentLevel = resultMap.get(comp.id) || 0;
        const requiredLevel = requiredMap.get(comp.id) || 0;
        const gap = Math.max(0, requiredLevel - currentLevel);

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { category: categoryName, skills: [] });
        }

        const existing = categoryMap.get(categoryName)!;
        // Avoid duplicates by competency name
        if (!existing.skills.find((s) => s.name === comp.name)) {
          existing.skills.push({
            name: comp.name,
            currentLevel,
            requiredLevel,
            gap,
          });
        }
      }
    }

    const skillCategories = Array.from(categoryMap.values());

    // Build recommendations from development resources for competencies with gaps
    const competencyIdsWithGaps = new Set<string>();
    for (const assessment of assessments) {
      const resultMap = new Map<string, number>();
      for (const result of assessment.results) {
        resultMap.set(result.competencyId, result.ratingLevel.levelNumber);
      }
      const requiredMap = new Map<string, number>();
      if (assessment.jobRole?.competencyMappings) {
        for (const mapping of assessment.jobRole.competencyMappings) {
          requiredMap.set(mapping.competencyId, mapping.requiredLevel.levelNumber);
        }
      }
      for (const assessmentComp of assessment.competencies) {
        const current = resultMap.get(assessmentComp.competencyId) || 0;
        const required = requiredMap.get(assessmentComp.competencyId) || 0;
        if (required > current) {
          competencyIdsWithGaps.add(assessmentComp.competencyId);
        }
      }
    }

    let recommendations: {
      skill: string;
      type: string;
      title: string;
      provider: string | null;
      estimatedHours: string | null;
    }[] = [];
    if (competencyIdsWithGaps.size > 0) {
      const resources = await prisma.competencyDevelopmentResource.findMany({
        where: {
          competencyId: { in: Array.from(competencyIdsWithGaps) },
        },
        include: { competency: true },
        take: 10,
      });
      recommendations = resources.map((r) => ({
        skill: r.competency.name,
        type: r.type,
        title: r.title,
        provider: r.provider,
        estimatedHours: r.duration,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        assessments: assessments.map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          type: a.type,
          status: a.status,
          employeeId: a.employeeId,
          jobRole: a.jobRole
            ? { id: a.jobRole.id, name: a.jobRole.name, code: a.jobRole.code }
            : null,
          completedAt: a.completedAt,
        })),
        skillCategories,
        recommendations,
        teamAnalysis: null,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    logger.error('Error fetching skills gap data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills gap data' },
      { status: 500 }
    );
  }
});
