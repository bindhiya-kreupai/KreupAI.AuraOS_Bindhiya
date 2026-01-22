/**
 * Okta OAuth2 Callback
 * Handles callback from Okta OAuth2 using @aura/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOktaProvider } from '@aura/auth';
import { oauth2StateService } from '@/lib/auth/oauth-state.service';
import { userProvisioningService } from '@/lib/auth/user-provisioning.service';
import { sessionService } from '@/lib/auth/session.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/callback/okta
 * Handle callback from Okta OAuth2
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get authorization code and state
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for errors
    if (error) {
      logger.error({ error, errorDescription }, 'Okta OAuth2 error');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_error&provider=okta`
      );
    }

    if (!code) {
      logger.error('No authorization code received from Okta');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code&provider=okta`
      );
    }

    if (!state) {
      logger.error('No state parameter received from Okta');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_state&provider=okta`
      );
    }

    // Verify state for CSRF protection
    const stateData = await oauth2StateService.verifyState(state, 'okta');
    if (!stateData) {
      logger.error({ state }, 'Invalid or expired OAuth2 state');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state&provider=okta`
      );
    }

    // Create Okta OAuth2 provider
    const provider = createOktaProvider();

    // Exchange code for tokens
    const tokens = await provider.exchangeCodeForTokens(code);

    // Get user info
    const userInfo = await provider.getUserInfo(tokens.accessToken);

    logger.info({ email: userInfo.email }, 'Okta OAuth2 login successful');

    // Find or create user (auto-provisioning)
    const tenantId = stateData.tenantId || 'default';
    const user = await userProvisioningService.findOrCreateUserFromOAuth(
      userInfo,
      'okta',
      tenantId
    );

    if (user.isNewUser) {
      logger.info({ userId: user.id, email: user.email }, 'New user auto-provisioned');
    }

    // Create session
    const sessionTokens = await sessionService.createSession({
      userId: user.id,
      email: user.email,
      tenantId,
    });

    // Get redirect URL from state data
    const redirectUrl = stateData.redirectUrl || '/dashboard';

    // Create response with redirect
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}`
    );

    // Set session cookies
    response.cookies.set('accessToken', sessionTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTokens.expiresIn,
      path: '/',
    });

    response.cookies.set('refreshToken', sessionTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error({ error }, 'Error in Okta OAuth2 callback');

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=callback_error&provider=okta`
    );
  }
}
