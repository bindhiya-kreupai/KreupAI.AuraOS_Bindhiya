import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const revokedKey = {
    id,
    status: 'revoked',
    revokedAt: new Date().toISOString(),
    revokedBy: 'admin-001',
    revokeReason: 'Manually revoked by administrator',
    previousStatus: 'active',
    affectedIntegrations: [
      { name: 'Connected Service', lastActivity: '2026-01-22T18:00:00Z' },
    ],
    warning: 'Any services using this key will immediately lose access.',
  };

  return NextResponse.json({
    success: true,
    data: revokedKey,
    message: 'API key revoked successfully',
  });
}
