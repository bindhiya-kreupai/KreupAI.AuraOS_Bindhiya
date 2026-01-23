import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      userId: 'emp-101',
      userName: 'Jane Smith',
      role: 'Senior Software Engineer',
      department: 'Engineering',
      analysis: {
        overallReadiness: 72,
        targetRole: 'Staff Engineer',
        skillCategories: [
          {
            category: 'Technical Skills',
            skills: [
              { name: 'System Design', currentLevel: 3, requiredLevel: 5, gap: 2 },
              { name: 'TypeScript', currentLevel: 4, requiredLevel: 5, gap: 1 },
              { name: 'Cloud Architecture', currentLevel: 2, requiredLevel: 4, gap: 2 },
              { name: 'Performance Optimization', currentLevel: 3, requiredLevel: 4, gap: 1 },
              { name: 'Security Best Practices', currentLevel: 2, requiredLevel: 3, gap: 1 },
            ],
          },
          {
            category: 'Leadership Skills',
            skills: [
              { name: 'Technical Mentorship', currentLevel: 3, requiredLevel: 5, gap: 2 },
              { name: 'Cross-team Collaboration', currentLevel: 4, requiredLevel: 5, gap: 1 },
              { name: 'Technical Decision Making', currentLevel: 3, requiredLevel: 5, gap: 2 },
              { name: 'Project Planning', currentLevel: 3, requiredLevel: 4, gap: 1 },
            ],
          },
          {
            category: 'Soft Skills',
            skills: [
              { name: 'Communication', currentLevel: 4, requiredLevel: 5, gap: 1 },
              { name: 'Conflict Resolution', currentLevel: 3, requiredLevel: 4, gap: 1 },
              { name: 'Stakeholder Management', currentLevel: 2, requiredLevel: 4, gap: 2 },
            ],
          },
        ],
        recommendations: [
          {
            skill: 'System Design',
            type: 'course',
            title: 'Advanced System Design Patterns',
            provider: 'Internal L&D',
            estimatedHours: 20,
          },
          {
            skill: 'Cloud Architecture',
            type: 'certification',
            title: 'AWS Solutions Architect Professional',
            provider: 'AWS',
            estimatedHours: 40,
          },
          {
            skill: 'Technical Mentorship',
            type: 'assignment',
            title: 'Mentor 2 junior engineers for Q1',
            provider: 'Internal',
            estimatedHours: 10,
          },
        ],
      },
      teamAnalysis: {
        teamSize: 8,
        averageReadiness: 65,
        topGaps: ['Cloud Architecture', 'System Design', 'Security Best Practices'],
        strongAreas: ['TypeScript', 'React', 'Agile Practices'],
      },
      generatedAt: new Date().toISOString(),
    },
  });
}
