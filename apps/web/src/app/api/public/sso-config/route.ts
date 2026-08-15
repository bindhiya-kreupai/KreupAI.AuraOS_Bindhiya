import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export const GET = async (_request: NextRequest) => {
  try {
    const config = await prisma.sSOConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config || !config.enabled) {
      return NextResponse.json({
        success: true,
        data: { enabled: false, provider: null, ssoUrl: null },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: config.enabled,
        provider: config.provider,
        ssoUrl: config.ssoUrl,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching public SSO config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check SSO configuration' },
      { status: 500 }
    );
  }
};
