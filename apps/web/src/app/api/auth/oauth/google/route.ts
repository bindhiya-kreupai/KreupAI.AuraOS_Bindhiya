/**
 * Google OAuth2 Authentication
 * Initiates Google OAuth2 flow using @aura/auth
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { createGoogleProvider } from '@aura/auth';
import { oauth2StateService } from '@/lib/auth/oauth-state.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/oauth/google
 * Redirect user to Google OAuth2 authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Create Google OAuth2 provider
    const provider = createGoogleProvider();

    // Generate and store state for CSRF protection
    const state = await oauth2StateService.generateState('google', redirectUrl);

    // Get authorization URL
    const authUrl = provider.getAuthorizationUrl(state);

    logger.info('Redirecting to Google OAuth2 authorization');

    // Redirect to Google
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    logger.error({ error }, 'Error initiating Google OAuth2 flow');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Google authentication',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
