import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/feature-flags/[key]/evaluate
 * Evaluate a feature flag for a given context and return raw boolean
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    if (!user?.tenantId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { key } = context.params;
    const body = await request.json();
    const evalContext = body.context;

    const flag = await prisma.featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (!flag) {
      return NextResponse.json(false);
    }

    if (!flag.isEnabled) {
      return NextResponse.json(false);
    }

    // Role check
    if (flag.enabledForRoles && flag.enabledForRoles.length > 0) {
      const role = evalContext?.role || user?.role;
      if (!role || !flag.enabledForRoles.includes(role)) {
        return NextResponse.json(false);
      }
    }

    // Rollout percentage check
    if (flag.rolloutPercentage < 100) {
      const userId = evalContext?.userId || user?.id || 'anonymous';
      let hash = 0;
      for (let i = 0; i < userId.length; i++) {
        hash = (hash << 5) - hash + userId.charCodeAt(i);
        hash |= 0;
      }
      const isAllowed = Math.abs(hash) % 100 < flag.rolloutPercentage;
      if (!isAllowed) {
        return NextResponse.json(false);
      }
    }

    return NextResponse.json(true);
  } catch (_error: any) {
    console.error('[Feature Flags API] Evaluate Error:', _error);
    return NextResponse.json(false);
  }
});
