import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const certificate = {
    id: 'cert-' + Date.now(),
    userId: body.userId || 'user-001',
    pathId: body.pathId || 'lp-001',
    recipientName: body.recipientName || 'John Smith',
    pathTitle: 'Leadership Essentials',
    issueDate: new Date().toISOString(),
    expiryDate: '2028-01-23T00:00:00Z',
    credentialId: 'CRED-2026-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    verificationUrl: 'https://auraos.kreupai.com/verify/CRED-2026-ABC123',
    score: body.score || 87,
    completionDate: body.completionDate || new Date().toISOString(),
    hoursCompleted: 40,
    skills: ['communication', 'decision-making', 'team-management'],
    issuedBy: {
      organization: 'KreupAI Technologies',
      signatoryName: 'Dr. Sarah Chen',
      signatoryTitle: 'Director of Learning & Development',
    },
    pdf: {
      url: '/api/v1/learning/certificates/cert-001/download',
      size: '245KB',
      format: 'A4',
      generated: true,
    },
    shareableLinks: {
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=...',
      public: 'https://auraos.kreupai.com/certificates/public/cert-001',
    },
    blockchain: {
      verified: true,
      transactionHash: '0x1a2b3c4d5e6f...',
      network: 'polygon',
    },
  };

  return NextResponse.json(
    { success: true, data: certificate, message: 'Certificate generated successfully' },
    { status: 201 }
  );
}
