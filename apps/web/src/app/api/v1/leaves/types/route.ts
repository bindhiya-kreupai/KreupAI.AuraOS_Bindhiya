import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
export const dynamic = 'force-dynamic';
/**
 * GET /api/v1/leaves/types
 * Get all available leave types
 */
export const GET = withEnhancedAuth(async (request: NextRequest) => {
  const { permissions } = context;
  if (!permissions.includes('leaves:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing leaves:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'Active';

    const leaveTypes = await prisma.leaveType.findMany({
      where: { status },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: leaveTypes,
      meta: {
        total: leaveTypes.length,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Leave Types API] GET Error:', _error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch leave types' } },
      { status: 500 }
    );
  }
});
