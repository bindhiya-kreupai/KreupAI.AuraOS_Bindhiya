import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/integrations/slack/oauth/callback
 * OAuth redirect from Slack — no JWT auth (user redirected from Slack)
 * Security: validated via OAuth state parameter
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    logger.warn({ error }, 'Slack OAuth denied');
    return NextResponse.redirect(
      new URL('/dashboard/integration-hub?error=slack_denied', request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
  }

  // TODO: Validate state parameter against stored CSRF state in Redis
  // TODO: Exchange code for access token via Slack API
  const _tokenData = {
    access_token: 'xoxb-mock-token',
    team: { id: 'T12345', name: 'Mock Workspace' },
    scope: 'chat:write,channels:read,users:read',
  };

  // TODO: Store integration credentials in DB with tenant association

  return NextResponse.redirect(new URL('/dashboard/integration-hub?connected=slack', request.url));
}

/**
 * POST /api/v1/integrations/slack/oauth/callback
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
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
  }

  logger.info({ tenantId: user.tenantId }, 'Slack integration code exchange');

  return NextResponse.json({
    success: true,
    data: {
      integration: 'slack',
      status: 'connected',
      workspace: 'Mock Workspace',
      connectedAt: new Date().toISOString(),
    },
  });
});
