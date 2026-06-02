/**
 * L&D Recommendation API Routes
 * Phase 3: Intelligence Layer - Learning & Development
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'recommend';

    switch (action) {
      case 'recommend':
        if (!body.employeeId) {
          return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            recommendations: [
              {
                id: 'rec-1',
                type: 'COURSE',
                title: 'Advanced Leadership Strategies',
                provider: 'LinkedIn Learning',
                duration: '4 hours',
                relevance: 0.95,
                skills: ['Leadership', 'Strategy', 'Team Management'],
                reason: 'Based on your role as Team Lead and recent 360 feedback',
                priority: 'HIGH',
              },
              {
                id: 'rec-2',
                type: 'CERTIFICATION',
                title: 'AWS Solutions Architect',
                provider: 'AWS Training',
                duration: '40 hours',
                relevance: 0.88,
                skills: ['Cloud Computing', 'Architecture', 'AWS'],
                reason: 'Aligns with company cloud migration goals',
                priority: 'MEDIUM',
              },
              {
                id: 'rec-3',
                type: 'WORKSHOP',
                title: 'Effective Communication Skills',
                provider: 'Internal Training',
                duration: '2 days',
                relevance: 0.82,
                skills: ['Communication', 'Presentation', 'Influence'],
                reason: 'Recommended by your manager',
                priority: 'MEDIUM',
              },
            ],
            skillGaps: [
              { skill: 'Cloud Architecture', currentLevel: 2, targetLevel: 4, gap: 2 },
              { skill: 'Team Leadership', currentLevel: 3, targetLevel: 4, gap: 1 },
              { skill: 'Strategic Planning', currentLevel: 2, targetLevel: 4, gap: 2 },
            ],
            learningPath: {
              totalCourses: 8,
              estimatedDuration: '3 months',
              completionRate: 0.35,
              nextMilestone: 'Complete Cloud Architecture certification',
            },
          },
        });

      case 'analyze':
        return NextResponse.json({
          success: true,
          data: {
            skillProfile: {
              technical: 75,
              leadership: 68,
              communication: 82,
              domain: 70,
            },
            topSkills: ['JavaScript', 'React', 'Team Collaboration', 'Problem Solving'],
            developmentAreas: ['Cloud Architecture', 'Strategic Thinking', 'Public Speaking'],
            careerProgression: {
              currentLevel: 'Senior Developer',
              nextLevel: 'Technical Lead',
              readiness: 0.72,
              timeToPromotion: '6-9 months',
            },
          },
        });

      case 'enroll':
        return NextResponse.json({
          success: true,
          data: {
            enrollmentId: `enr_${Date.now()}`,
            courseId: body.courseId,
            status: 'ENROLLED',
            startDate: new Date().toISOString(),
            message: 'Successfully enrolled in course',
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
        return NextResponse.json({ error: 'Failed to process learning recommendation' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    return NextResponse.json({
      success: true,
      data: {
        activeCourses: 3,
        completedCourses: 12,
        totalLearningHours: 85,
        certificationsEarned: 4,
        skillsAcquired: 18,
        recentActivity: [
          { course: 'Leadership Fundamentals', progress: 75, lastAccessed: '2024-12-20' },
          { course: 'Cloud Architecture', progress: 45, lastAccessed: '2024-12-18' },
          { course: 'Agile Methodologies', progress: 100, completedDate: '2024-12-15' },
        ],
      },
    });
  } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch learning data' }, { status: 500 });
  }
}
