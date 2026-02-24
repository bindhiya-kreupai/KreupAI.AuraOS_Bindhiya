import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const recommendations = [
    {
      pathId: 'lp-002',
      title: 'Data Analytics Fundamentals',
      matchScore: 95,
      reason: 'Based on your role as Product Manager, data analytics skills will enhance your decision-making capabilities',
      skillGaps: ['data-analysis', 'visualization'],
      estimatedImpact: 'high',
      priority: 1,
      peerEnrollment: '34% of similar roles enrolled',
    },
    {
      pathId: 'lp-001',
      title: 'Leadership Essentials',
      matchScore: 88,
      reason: 'Your career trajectory suggests upcoming management responsibilities',
      skillGaps: ['team-management', 'strategic-thinking'],
      estimatedImpact: 'high',
      priority: 2,
      peerEnrollment: '56% of similar roles enrolled',
    },
    {
      pathId: 'lp-004',
      title: 'Advanced Project Management',
      matchScore: 82,
      reason: 'Complements your existing project coordination experience with advanced methodologies',
      skillGaps: ['agile', 'risk-management'],
      estimatedImpact: 'medium',
      priority: 3,
      peerEnrollment: '28% of similar roles enrolled',
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      recommendations,
      basedOn: {
        currentSkills: body.skills || ['communication', 'project-coordination', 'stakeholder-management'],
        role: body.role || 'Product Manager',
        department: body.department || 'Product',
        careerGoals: body.careerGoals || ['senior-management', 'data-driven-leadership'],
      },
      generatedAt: new Date().toISOString(),
    },
  });
}
