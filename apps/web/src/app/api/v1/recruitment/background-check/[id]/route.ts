import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    success: true,
    data: {
      id,
      candidateId: 'cand-001',
      candidateName: 'John Doe',
      status: 'pending',
      checks: [
        {
          type: 'criminal',
          status: 'passed',
          completedAt: '2026-01-22T08:00:00Z',
          notes: 'No records found',
        },
        {
          type: 'employment',
          status: 'pending',
          completedAt: null,
          notes: 'Awaiting employer verification',
        },
        {
          type: 'education',
          status: 'passed',
          completedAt: '2026-01-21T16:00:00Z',
          notes: 'Degree verified',
        },
      ],
      overallResult: null,
      initiatedAt: '2026-01-20T10:00:00Z',
      estimatedCompletionDate: '2026-01-30',
    },
  });
}
