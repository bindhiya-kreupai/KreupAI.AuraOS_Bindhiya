import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { jobId } = body;

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'jobId is required' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      jobId,
      totalCandidates: 5,
      rankedCandidates: [
        {
          candidateId: 'cand-001',
          name: 'Alice Johnson',
          matchScore: 95,
          matchedSkills: ['TypeScript', 'React', 'Node.js'],
          experienceYears: 6,
          status: 'available',
        },
        {
          candidateId: 'cand-002',
          name: 'Bob Smith',
          matchScore: 88,
          matchedSkills: ['TypeScript', 'React'],
          experienceYears: 4,
          status: 'available',
        },
        {
          candidateId: 'cand-003',
          name: 'Carol Williams',
          matchScore: 82,
          matchedSkills: ['React', 'Node.js', 'Python'],
          experienceYears: 5,
          status: 'interviewing',
        },
        {
          candidateId: 'cand-004',
          name: 'David Brown',
          matchScore: 75,
          matchedSkills: ['TypeScript', 'AWS'],
          experienceYears: 3,
          status: 'available',
        },
        {
          candidateId: 'cand-005',
          name: 'Eva Martinez',
          matchScore: 70,
          matchedSkills: ['React', 'Docker'],
          experienceYears: 2,
          status: 'available',
        },
      ],
      matchedAt: new Date().toISOString(),
    },
  });
}
