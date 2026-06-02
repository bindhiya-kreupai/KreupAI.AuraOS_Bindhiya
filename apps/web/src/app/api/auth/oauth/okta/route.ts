import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

// Okta OAuth redirect: 302 to Okta authorize endpoint with state + PKCE.
export async function GET(request: NextRequest) {
  const oktaDomain = process.env.OKTA_DOMAIN;
  const clientId = process.env.OKTA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/okta/callback`;
  if (!oktaDomain || !clientId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5510',
          message: 'Okta OAuth is not configured (set OKTA_DOMAIN + OKTA_CLIENT_ID).',
        },
      },
      { status: 503 }
    );
  }
  const state = crypto.randomUUID();
  const url = new URL(`https://${oktaDomain}/oauth2/v1/authorize`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return NextResponse.redirect(url.toString());
}
