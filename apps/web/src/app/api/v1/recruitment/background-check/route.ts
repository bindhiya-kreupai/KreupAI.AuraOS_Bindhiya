import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'bgcheck-001',
      candidateId: body.candidateId,
      candidateName: body.candidateName || 'John Doe',
      checkTypes: body.checkTypes || ['criminal', 'employment', 'education'],
      provider: 'VerifyPro',
      status: 'pending',
      estimatedCompletionDate: '2026-01-30',
      initiatedAt: new Date().toISOString(),
    },
  });
}
