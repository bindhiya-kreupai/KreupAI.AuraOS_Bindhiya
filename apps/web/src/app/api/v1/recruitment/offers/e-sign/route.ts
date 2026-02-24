import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.candidateId || !body.offerId) {
    return NextResponse.json(
      { success: false, error: 'candidateId and offerId are required' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      signatureRequestId: 'esign-001',
      candidateId: body.candidateId,
      offerId: body.offerId,
      documentUrl: 'https://docs.example.com/offers/esign-001',
      signingUrl: 'https://esign.example.com/sign/esign-001',
      expiresAt: '2026-02-06T23:59:59Z',
      status: 'pending',
      initiatedAt: new Date().toISOString(),
    },
  });
}
