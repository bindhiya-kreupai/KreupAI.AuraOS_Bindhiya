import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      referrals: [
        {
          id: 'ref-001',
          referrerName: 'Jane Smith',
          referrerId: 'emp-101',
          candidateName: 'Mike Johnson',
          candidateEmail: 'mike.j@example.com',
          jobId: 'job-001',
          jobTitle: 'Frontend Developer',
          status: 'under_review',
          bonusAmount: 2000,
          submittedAt: '2026-01-15T09:00:00Z',
        },
        {
          id: 'ref-002',
          referrerName: 'Tom Brown',
          referrerId: 'emp-102',
          candidateName: 'Lisa Davis',
          candidateEmail: 'lisa.d@example.com',
          jobId: 'job-003',
          jobTitle: 'Backend Engineer',
          status: 'hired',
          bonusAmount: 3000,
          submittedAt: '2026-01-10T11:00:00Z',
        },
        {
          id: 'ref-003',
          referrerName: 'Jane Smith',
          referrerId: 'emp-101',
          candidateName: 'Chris Wilson',
          candidateEmail: 'chris.w@example.com',
          jobId: 'job-002',
          jobTitle: 'DevOps Engineer',
          status: 'pending',
          bonusAmount: 2500,
          submittedAt: '2026-01-22T14:00:00Z',
        },
      ],
      total: 3,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'ref-004',
      referrerId: body.referrerId || 'emp-101',
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      candidatePhone: body.candidatePhone,
      jobId: body.jobId,
      relationship: body.relationship || 'former_colleague',
      notes: body.notes || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    },
  });
}
