import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    success: true,
    data: {
      offerId: id,
      status: 'pending',
      candidateName: 'John Doe',
      documentTitle: 'Employment Offer Letter',
      sentAt: '2026-01-20T10:00:00Z',
      viewedAt: '2026-01-20T14:30:00Z',
      signedAt: null,
      declinedAt: null,
      expiresAt: '2026-02-03T23:59:59Z',
      lastActivity: '2026-01-20T14:30:00Z',
    },
  });
}
