import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pathId = searchParams.get('pathId');

  const assessments = [
    {
      id: 'asmt-001',
      title: 'Leadership Styles Assessment',
      pathId: 'lp-001',
      moduleId: 'mod-001',
      type: 'quiz',
      questionsCount: 20,
      passingScore: 70,
      timeLimit: 30,
      attempts: 3,
      status: 'available',
      difficulty: 'intermediate',
      createdAt: '2025-06-20T10:00:00Z',
    },
    {
      id: 'asmt-002',
      title: 'Communication Skills Evaluation',
      pathId: 'lp-001',
      moduleId: 'mod-002',
      type: 'practical',
      questionsCount: 15,
      passingScore: 75,
      timeLimit: 45,
      attempts: 2,
      status: 'available',
      difficulty: 'intermediate',
      createdAt: '2025-07-10T08:00:00Z',
    },
    {
      id: 'asmt-003',
      title: 'Data Analysis Final Exam',
      pathId: 'lp-002',
      moduleId: 'mod-006',
      type: 'comprehensive',
      questionsCount: 40,
      passingScore: 80,
      timeLimit: 90,
      attempts: 2,
      status: 'locked',
      difficulty: 'advanced',
      createdAt: '2025-08-01T12:00:00Z',
    },
    {
      id: 'asmt-004',
      title: 'Compliance Knowledge Check',
      pathId: 'lp-003',
      moduleId: 'mod-004',
      type: 'quiz',
      questionsCount: 25,
      passingScore: 85,
      timeLimit: 40,
      attempts: 5,
      status: 'completed',
      difficulty: 'beginner',
      createdAt: '2025-04-15T14:00:00Z',
    },
  ];

  let filtered = assessments;
  if (pathId) {
    filtered = filtered.filter((a) => a.pathId === pathId);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    meta: { total: filtered.length },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newAssessment = {
    id: 'asmt-005',
    title: body.title || 'New Assessment',
    pathId: body.pathId || 'lp-001',
    moduleId: body.moduleId || 'mod-001',
    type: body.type || 'quiz',
    questionsCount: body.questions?.length || 0,
    passingScore: body.passingScore || 70,
    timeLimit: body.timeLimit || 30,
    attempts: body.attempts || 3,
    status: 'draft',
    difficulty: body.difficulty || 'intermediate',
    questions: body.questions || [],
    createdAt: new Date().toISOString(),
    createdBy: 'admin-001',
  };

  return NextResponse.json(
    { success: true, data: newAssessment, message: 'Assessment created successfully' },
    { status: 201 }
  );
}
