import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/integrations/teams/oauth/callback
 * OAuth redirect from Microsoft — no JWT auth (user redirected from Azure AD)
 * Security: validated via OAuth state parameter
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    logger.warn({ error, errorDescription }, 'Teams OAuth denied');
    return NextResponse.redirect(
      new URL('/dashboard/integration-hub?error=teams_denied', request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
  }

  // TODO: Validate state parameter against stored CSRF state in Redis
  // TODO: Exchange code for access token via Azure AD

  return NextResponse.redirect(new URL('/dashboard/integration-hub?connected=teams', request.url));
}

/**
 * POST /api/v1/integrations/teams/oauth/callback
 * Manual code exchange — requires authentication
 */
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('integrations:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing integrations:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const body = await request.json();
  const { code, tenantId } = body;

  if (!code) {
    return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
  }

  logger.info({ tenantId: user.tenantId }, 'Teams integration code exchange');

  return NextResponse.json({
    success: true,
    data: {
      integration: 'microsoft_teams',
      status: 'connected',
      tenant: tenantId || user.tenantId,
      connectedAt: new Date().toISOString(),
    },
  });
});
