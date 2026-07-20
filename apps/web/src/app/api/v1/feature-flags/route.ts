/**
 * GET /api/v1/feature-flags
 * Public (authenticated session) feature-flag list for FeatureFlagProvider.
 * Uses in-memory defaults — Prisma FeatureFlag model is not in schema yet.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { MOCK_FLAGS } from '@/services/featureFlagService';

export const dynamic = 'force-dynamic';

function withStatus(flags: typeof MOCK_FLAGS) {
  return flags.map((flag) => {
    if (!flag.isEnabled) return { ...flag, status: 'disabled' as const };
    const t = flag.targeting;
    const partial =
      (t.percentageRollout && t.percentageRollout.percentage < 100) ||
      (t.tenantWhitelist && t.tenantWhitelist.length > 0) ||
      (t.userWhitelist && t.userWhitelist.length > 0) ||
      (t.roleWhitelist && t.roleWhitelist.length > 0);
    return { ...flag, status: (partial ? 'partial' : 'enabled') as const };
  });
}

export async function GET(_request: NextRequest) {
  try {
    const flags = withStatus(MOCK_FLAGS);
    return NextResponse.json({
      success: true,
      data: flags,
      meta: {
        total: flags.length,
        enabled: flags.filter((f) => f.isEnabled).length,
        disabled: flags.filter((f) => !f.isEnabled).length,
        source: 'defaults',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[feature-flags] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to fetch feature flags' },
      },
      { status: 500 }
    );
  }
}
