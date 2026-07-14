import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

async function exchangeSlackCode(code: string, redirectUri: string) {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Slack OAuth credentials not configured');
  }
  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });
  const data: any = await res.json();
  if (!data.ok) throw new Error(data.error || 'slack_exchange_failed');
  return data;
}

async function persistSlackConnection(tenantId: string, userId: string | undefined, data: any) {
  await prisma.integrationConnection.upsert({
    where: { tenantId_integrationId: { tenantId, integrationId: 'int_slack' } },
    create: {
      tenantId,
      integrationId: 'int_slack',
      integrationName: 'Slack',
      provider: 'slack',
      category: 'COMMUNICATION',
      status: 'CONNECTED',
      configuration: {
        teamId: data.team?.id,
        teamName: data.team?.name,
      },
      credentials: {
        accessToken: data.access_token,
        scopes: typeof data.scope === 'string' ? data.scope.split(',') : [],
      },
      connectedAt: new Date(),
      connectedBy: userId,
      healthStatus: 'HEALTHY',
    },
    update: {
      status: 'CONNECTED',
      configuration: {
        teamId: data.team?.id,
        teamName: data.team?.name,
      },
      credentials: {
        accessToken: data.access_token,
        scopes: typeof data.scope === 'string' ? data.scope.split(',') : [],
      },
      connectedAt: new Date(),
    },
  });
}

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

  try {
    const stateRow = await prisma.oAuthState.findUnique({ where: { state } });
    if (!stateRow || stateRow.expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL('/dashboard/integration-hub?error=invalid_state', request.url)
      );
    }
    const data = await exchangeSlackCode(
      code,
      `${new URL(request.url).origin}/api/v1/integrations/slack/oauth/callback`
    );
    await persistSlackConnection(stateRow.tenantId, stateRow.userId, data);
    return NextResponse.redirect(
      new URL('/dashboard/integration-hub?connected=slack', request.url)
    );
  } catch (err: any) {
    logger.error({ err }, 'Slack OAuth callback failed');
    return NextResponse.redirect(
      new URL('/dashboard/integration-hub?error=slack_failed', request.url)
    );
  }
}

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
  const { code, redirectUri } = body;
  if (!code) return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });

  try {
    const data = await exchangeSlackCode(
      code,
      redirectUri || `${new URL(request.url).origin}/api/v1/integrations/slack/oauth/callback`
    );
    await persistSlackConnection(user.tenantId, user.userId, data);
    return NextResponse.json({
      success: true,
      data: {
        integration: 'slack',
        status: 'connected',
        workspace: data.team?.name,
        connectedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    logger.error({ err, tenantId: user.tenantId }, 'Slack code exchange failed');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5020',
          message: err.message || 'Slack exchange failed',
          messageAr: 'فشل تبادل سلاك',
        },
      },
      { status: 502 }
    );
  }
});
