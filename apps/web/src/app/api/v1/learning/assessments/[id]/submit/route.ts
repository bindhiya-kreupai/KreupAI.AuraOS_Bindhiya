import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const answers = body.answers || [];
  const totalQuestions = 20;
  const correctAnswers = 17;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= 70;

  const result = {
    submissionId: 'sub-' + Date.now(),
    assessmentId: id,
    userId: body.userId || 'user-001',
    submittedAt: new Date().toISOString(),
    timeSpent: body.timeSpent || 1450,
    results: {
      totalQuestions,
      answered: answers.length || totalQuestions,
      correct: correctAnswers,
      incorrect: totalQuestions - correctAnswers,
      skipped: 0,
      score,
      passingScore: 70,
      passed,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F',
    },
    breakdown: [
      { category: 'Leadership Theory', correct: 5, total: 6, percentage: 83 },
      { category: 'Practical Application', correct: 7, total: 8, percentage: 88 },
      { category: 'Case Studies', correct: 5, total: 6, percentage: 83 },
    ],
    feedback: passed
      ? 'Excellent work! You have demonstrated strong understanding of leadership concepts.'
      : 'You did not meet the passing score. Review the materials and try again.',
    attemptsRemaining: 2,
    certificateEligible: passed,
    nextSteps: passed
      ? { action: 'proceed', nextModule: 'mod-002', title: 'Effective Communication' }
      : { action: 'review', recommendedModules: ['mod-001'], retryAfter: '2026-01-24T00:00:00Z' },
  };

  return NextResponse.json({ success: true, data: result });
}
