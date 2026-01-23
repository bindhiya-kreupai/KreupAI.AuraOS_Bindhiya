import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/integration-hub?error=slack_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
  }

  // Exchange code for access token
  // In production: call exchangeSlackCode(code) from slack/oauth.ts
  const tokenData = {
    access_token: 'xoxb-mock-token',
    team: { id: 'T12345', name: 'Mock Workspace' },
    scope: 'chat:write,channels:read,users:read',
  };

  // Store integration credentials
  // In production: save to database with tenant association

  return NextResponse.redirect(new URL('/dashboard/integration-hub?connected=slack', request.url));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, redirectUri } = body;

  if (!code) {
    return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
  }

  // Exchange code for token
  return NextResponse.json({
    success: true,
    data: {
      integration: 'slack',
      status: 'connected',
      workspace: 'Mock Workspace',
      connectedAt: new Date().toISOString(),
    },
  });
}
