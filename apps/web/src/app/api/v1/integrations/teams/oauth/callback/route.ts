import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[Teams OAuth] Error:', error, errorDescription);
    return NextResponse.redirect(new URL('/dashboard/integration-hub?error=teams_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
  }

  // Exchange code for access token via Azure AD
  // In production: call exchangeTeamsCode(code) from teams/oauth.ts
  const tokenData = {
    access_token: 'eyJ0-mock-teams-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    scope: 'User.Read Chat.ReadWrite Team.ReadBasic.All',
  };

  // Store integration credentials
  // In production: save to database with tenant association

  return NextResponse.redirect(new URL('/dashboard/integration-hub?connected=teams', request.url));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, tenantId } = body;

  if (!code) {
    return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      integration: 'microsoft_teams',
      status: 'connected',
      tenant: tenantId || 'default',
      connectedAt: new Date().toISOString(),
    },
  });
}
